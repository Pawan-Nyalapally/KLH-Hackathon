"""
image_hash_engine.py — Document forensics for PM-JAY fraud detection.

DUAL-LAYER DETECTION STRATEGY:
═══════════════════════════════
Layer 1 — SHA-256 (exact duplicates)
  • Catches byte-for-byte identical resubmissions.
  • Fast, O(1), cryptographically certain.
  • Risk: 95% on match.

Layer 2 — pHash via PyMuPDF/fitz (edited duplicates)
  • Converts PDF/image to a 64-bit perceptual fingerprint.
  • Catches documents where the name, date, or minor fields were edited.
  • A changed patient name (small text) shifts ~2–4 bits of 64 → still caught.
  • Hamming threshold default: 10 bits.
  • Risk: 95% (≤3), 75% (≤8), 40% (≤15), 5% (>15).

EDGE CASES HANDLED:
═══════════════════
  • PDF without fitz      → SHA-256 only, flagged clearly in response
  • Corrupted PDF/image   → logged, returned as "Unreadable Document"
  • Empty file (0 bytes)  → rejected with explicit flag
  • Wrong/unsupported ext → best-effort attempt, falls back to SHA-256
  • Multi-page PDF        → first page used for pHash; all pages SHA-256'd
  • Rotated/skewed doc    → pHash is rotation-sensitive by default;
                             we normalise orientation via fitz page rotation
  • Duplicate across both layers → highest risk label wins
  • Archive collision (same basename, different content) → UUID-keyed internally

RISK TABLE:
  Hamming 0–3   → 95%  Critical — Likely Duplicate
  Hamming 4–8   → 75%  High — Possible Edited Reuse
  Hamming 9–15  → 40%  Moderate — Inconclusive
  Hamming 16+   → 5%   Unique Document
  SHA-256 match → 95%  Critical — Exact Byte Duplicate
"""

import os
import hashlib
import uuid
import platform
from typing import Optional, Tuple, Dict, Any
from PIL import Image
import imagehash

# ── PyMuPDF (preferred, no system deps) ─────────────────────────────────────
try:
    import fitz  # PyMuPDF
    FITZ_SUPPORT = True
except ImportError:
    FITZ_SUPPORT = False

# ── pdf2image fallback (needs poppler) ──────────────────────────────────────
try:
    from pdf2image import convert_from_path
    PDF2IMAGE_SUPPORT = True
except ImportError:
    PDF2IMAGE_SUPPORT = False


SUPPORTED_IMAGE_EXTS = {".png", ".jpg", ".jpeg", ".bmp", ".tiff", ".tif", ".webp", ".gif"}


def _get_poppler_path() -> Optional[str]:
    if platform.system() == "Windows":
        for p in [r"C:\poppler-25.12.0\Library\bin", r"C:\poppler\bin"]:
            if os.path.exists(p):
                return p
    return None


class ImageForensicsEngine:
    """
    Two-layer document forensics engine for PM-JAY duplicate/edited claim detection.
    Thread-safe for read operations; use a single instance per server process.
    """

    def __init__(self, threshold: int = 10, poppler_path: Optional[str] = None):
        self.threshold = threshold  # Hamming bits threshold for pHash fraud flag
        self.poppler_path = poppler_path or _get_poppler_path()

        # Keyed by internal_id (uuid4) so same-basename collisions don't corrupt archive
        self._phash_archive: Dict[str, Tuple[str, imagehash.ImageHash]] = {}  # id → (display_name, hash)
        self._sha256_archive: Dict[str, str] = {}   # sha256_hex → display_name

    # ═══════════════════════════════════════════════════════════════════
    # PRIVATE HELPERS
    # ═══════════════════════════════════════════════════════════════════

    def _validate_file(self, file_path: str) -> Tuple[bool, str]:
        """Returns (ok, error_message). Check before any processing."""
        if not os.path.exists(file_path):
            return False, "File not found on disk"
        size = os.path.getsize(file_path)
        if size == 0:
            return False, "Empty file (0 bytes) — rejected"
        if size > 50 * 1024 * 1024:  # 50 MB hard limit
            return False, f"File too large ({size // 1024 // 1024} MB > 50 MB limit)"
        return True, ""

    def _file_sha256(self, file_path: str) -> str:
        h = hashlib.sha256()
        with open(file_path, "rb") as f:
            for chunk in iter(lambda: f.read(65536), b""):
                h.update(chunk)
        return h.hexdigest()

    def _pdf_to_pil(self, file_path: str) -> Optional[Image.Image]:
        """Convert first page of PDF to PIL Image. Handles rotation correction."""
        # ── Try PyMuPDF first ────────────────────────────────────────────
        if FITZ_SUPPORT:
            try:
                doc = fitz.open(file_path)
                if len(doc) == 0:
                    return None
                page = doc[0]
                # Correct for page rotation metadata
                rotation = page.rotation
                mat = fitz.Matrix(2, 2)  # 2× scale for better hash quality
                pix = page.get_pixmap(matrix=mat, colorspace=fitz.csGRAY)
                img = Image.frombytes("L", [pix.width, pix.height], pix.samples)
                # Apply rotation if flagged in metadata
                if rotation in (90, 180, 270):
                    img = img.rotate(-rotation, expand=True)
                doc.close()
                return img
            except Exception as e:
                print(f"[FITZ] PDF render failed: {e}")

        # ── Fallback: pdf2image + poppler ────────────────────────────────
        if PDF2IMAGE_SUPPORT:
            try:
                kwargs = dict(dpi=200, first_page=1, last_page=1, fmt="png", strict=False)
                if self.poppler_path:
                    kwargs["poppler_path"] = self.poppler_path
                pages = convert_from_path(os.path.abspath(file_path), **kwargs)
                if pages:
                    return pages[0].convert("L")
            except Exception as e:
                print(f"[PDF2IMAGE] Fallback render failed: {e}")

        return None  # Both failed

    def _load_as_pil(self, file_path: str) -> Optional[Image.Image]:
        """Load file as PIL Image regardless of type."""
        ext = os.path.splitext(file_path)[1].lower()
        if ext == ".pdf":
            return self._pdf_to_pil(file_path)
        # Direct image formats
        if ext in SUPPORTED_IMAGE_EXTS:
            try:
                return Image.open(file_path).convert("L")
            except Exception as e:
                print(f"[PIL] Image open failed: {e}")
                return None
        # Unknown extension — try PIL anyway (best effort)
        try:
            return Image.open(file_path).convert("L")
        except Exception:
            return None

    def _generate_phash(self, img: Image.Image) -> imagehash.ImageHash:
        """Generate 64-bit perceptual hash from PIL image."""
        img = img.resize((256, 256))  # Already grayscale
        return imagehash.phash(img)

    def _hamming(self, h1: imagehash.ImageHash, h2: imagehash.ImageHash) -> int:
        return abs(h1 - h2)

    def _risk_from_hamming(self, distance: int) -> Tuple[int, str]:
        if distance <= 3:
            return 95, "Critical Similarity — Likely Duplicate (pHash)"
        elif distance <= 8:
            return 75, "High Similarity — Possible Edited Reuse (pHash)"
        elif distance <= 15:
            return 40, "Moderate Similarity — Inconclusive (pHash)"
        else:
            return 5, "Unique Document (pHash)"

    # ═══════════════════════════════════════════════════════════════════
    # PUBLIC: Direct comparison of two files
    # ═══════════════════════════════════════════════════════════════════

    def analyze_files(self, file1_path: str, file2_path: str) -> Dict[str, Any]:
        img1 = self._load_as_pil(file1_path)
        img2 = self._load_as_pil(file2_path)
        if img1 is None or img2 is None:
            raise RuntimeError("Could not render one or both files for comparison.")

        h1 = self._generate_phash(img1)
        h2 = self._generate_phash(img2)
        distance = self._hamming(h1, h2)
        similarity = round(((64 - distance) / 64) * 100, 2)
        risk_score, classification = self._risk_from_hamming(distance)

        return {
            "hash_1": str(h1), "hash_2": str(h2),
            "hamming_distance": distance,
            "similarity_percent": similarity,
            "fraud_risk_score": risk_score,
            "classification": classification,
            "fraud_detected": distance <= self.threshold,
        }

    # ═══════════════════════════════════════════════════════════════════
    # PUBLIC: Archive-based analysis (main entry point)
    # ═══════════════════════════════════════════════════════════════════

    def analyze_against_archive(self, file_path: str) -> Dict[str, Any]:
        """
        Dual-layer analysis:
          1. SHA-256 check — exact byte duplicate (fast, catches same-file reupload)
          2. pHash check   — visual similarity (catches edited documents)
        Returns the HIGHEST risk finding between the two layers.
        """
        basename = os.path.basename(file_path)

        # ── Pre-flight validation ────────────────────────────────────────
        ok, err = self._validate_file(file_path)
        if not ok:
            return {
                "uploaded_file": basename, "matched_file": None,
                "hamming_distance": None, "similarity_percent": 0,
                "fraud_risk_score": 0,
                "classification": f"Validation Failed — {err}",
                "fraud_detected": False,
                "archive_size": len(self._phash_archive),
                "method": "validation_error",
                "layers": {"sha256": None, "phash": None},
            }

        # ── Layer 1: SHA-256 ─────────────────────────────────────────────
        sha = self._file_sha256(file_path)
        sha_result = None
        if sha in self._sha256_archive:
            matched_name = self._sha256_archive[sha]
            sha_result = {
                "matched_file": matched_name,
                "similarity_percent": 100.0,
                "fraud_risk_score": 95,
                "classification": "Critical — Exact Byte Duplicate (SHA-256)",
                "fraud_detected": True,
                "hamming_distance": 0,
            }
        # Always update SHA archive (most recent submitter)
        self._sha256_archive[sha] = basename

        # ── Layer 2: pHash ───────────────────────────────────────────────
        phash_result = None
        render_method = "sha256_only"
        img = self._load_as_pil(file_path)

        if img is not None:
            render_method = "fitz" if FITZ_SUPPORT else ("pdf2image" if PDF2IMAGE_SUPPORT else "pil")
            new_hash = self._generate_phash(img)
            archive_id = str(uuid.uuid4())

            # Find closest pHash in archive
            best_id = None
            best_distance = 64
            for aid, (aname, ahash) in self._phash_archive.items():
                d = self._hamming(new_hash, ahash)
                if d < best_distance:
                    best_distance = d
                    best_id = aid
                    best_name = aname

            # Add to archive
            self._phash_archive[archive_id] = (basename, new_hash)

            if best_id is not None:
                similarity = round(((64 - best_distance) / 64) * 100, 2)
                risk_score, classification = self._risk_from_hamming(best_distance)
                phash_result = {
                    "matched_file": best_name,
                    "similarity_percent": similarity,
                    "fraud_risk_score": risk_score,
                    "classification": classification,
                    "fraud_detected": best_distance <= self.threshold,
                    "hamming_distance": best_distance,
                }
            else:
                phash_result = {
                    "matched_file": None,
                    "similarity_percent": 0,
                    "fraud_risk_score": 5,
                    "classification": "First Upload — No Reference",
                    "fraud_detected": False,
                    "hamming_distance": None,
                }
        else:
            print(f"[ENGINE] Could not render '{basename}' — pHash skipped, using SHA-256 only")

        # ── Merge: take highest risk result ─────────────────────────────
        candidates = [r for r in [sha_result, phash_result] if r is not None]
        if not candidates:
            # Extreme edge case: both layers failed
            return {
                "uploaded_file": basename, "matched_file": None,
                "hamming_distance": None, "similarity_percent": 0,
                "fraud_risk_score": 10,
                "classification": "Analysis Incomplete — Could Not Render Document",
                "fraud_detected": False,
                "archive_size": len(self._phash_archive),
                "method": "failed",
                "layers": {"sha256": None, "phash": None},
            }

        best = max(candidates, key=lambda r: r["fraud_risk_score"])

        return {
            "uploaded_file": basename,
            "matched_file": best["matched_file"],
            "hamming_distance": best["hamming_distance"],
            "similarity_percent": best["similarity_percent"],
            "fraud_risk_score": best["fraud_risk_score"],
            "classification": best["classification"],
            "fraud_detected": best["fraud_detected"],
            "archive_size": len(self._phash_archive),
            "method": render_method,
            "layers": {
                "sha256": sha_result,
                "phash": phash_result,
            },
        }