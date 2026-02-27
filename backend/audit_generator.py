"""
audit_generator.py — LLM-powered audit narrative generator.
Uses Google Gemini API for intelligent, context-aware audit summaries.
Falls back to structured template if API key is not configured.
"""
import os

def generate_audit_summary(hospital_id: str, hospital_stats: dict) -> str:
    """
    Generates an AI-powered audit summary for a hospital.
    Uses Gemini API when GEMINI_API_KEY is set; structured template otherwise.
    """
    duplicate_count  = hospital_stats.get('duplicate_count', 0)
    image_reuse_count = hospital_stats.get('image_reuse_count', 0)
    concurrent_count = hospital_stats.get('concurrent_count', 0)
    ghost_count      = hospital_stats.get('ghost_count', 0)
    deviation        = round(hospital_stats.get('avg_claim_deviation', 0.0), 2)
    risk_category    = hospital_stats.get('risk_category', 'Unknown')
    avg_risk         = round(hospital_stats.get('avg_risk_score', 0.0), 1)
    state            = hospital_stats.get('state', 'Unknown')
    total_claims     = hospital_stats.get('total_claims', 0)

    # ─── Try Gemini LLM ───────────────────────────────────────────────────────
    api_key = os.environ.get("GEMINI_API_KEY", "")
    if api_key:
        try:
            import google.generativeai as genai
            genai.configure(api_key=api_key)
            model = genai.GenerativeModel("gemini-1.5-flash")

            prompt = f"""You are a senior healthcare fraud analyst reviewing a PM-JAY (Ayushman Bharat) hospital audit.
Write a concise 3–4 sentence professional audit summary for the following hospital profile.
Be specific about the fraud patterns and recommend next steps.

Hospital: {hospital_id}
State: {state}
Total Claims: {total_claims}
Avg Risk Score: {avg_risk}/100
Risk Category: {risk_category}
Duplicate Claims: {duplicate_count}
Image Reuse Cases: {image_reuse_count}
Concurrent Fraud Cases: {concurrent_count}
Ghost Beneficiary Flags: {ghost_count}
Avg Claim Deviation from Baseline: {deviation}%

Write the summary in formal audit language. Do not use bullet points."""

            response = model.generate_content(prompt)
            return response.text.strip()

        except Exception as e:
            print(f"[LLM] Gemini API call failed: {e}. Falling back to template.")

    # ─── Fallback: structured template ───────────────────────────────────────
    fraud_types = []
    if duplicate_count > 0:
        fraud_types.append(f"{duplicate_count} duplicate billing instances")
    if image_reuse_count > 0:
        fraud_types.append(f"{image_reuse_count} diagnostic image reuse cases")
    if concurrent_count > 0:
        fraud_types.append(f"{concurrent_count} concurrent claim conflicts")
    if ghost_count > 0:
        fraud_types.append(f"{ghost_count} ghost beneficiary flags")

    fraud_summary = (
        ", ".join(fraud_types) if fraud_types
        else "no specific fraud flags, though claim deviation warrants review"
    )

    summary = (
        f"Audit Review for {hospital_id} ({state}): "
        f"Analysis of {total_claims} submitted PM-JAY claims reveals {fraud_summary}. "
        f"Average claim deviation from procedure baseline stands at {deviation}%, "
        f"with a composite risk score of {avg_risk}/100 — classified as {risk_category}. "
        f"This hospital is recommended for secondary audit and cross-referencing of "
        f"patient records against the PMJAY central beneficiary database."
    )
    return summary
