import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, File, FileText, Loader2, CheckCircle, AlertTriangle, ChevronRight, X, ShieldCheck, Zap, Activity } from 'lucide-react';

const DocumentInvestigation = () => {
    const [file, setFile] = useState<File | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<any>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const droppedFile = e.dataTransfer.files[0];
            const validTypes = ['application/pdf', 'image/jpeg', 'image/png'];
            if (validTypes.includes(droppedFile.type)) {
                processFile(droppedFile);
            } else {
                alert("Please upload a PDF, JPG, or PNG file.");
            }
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            processFile(e.target.files[0]);
        }
    };

    const processFile = async (selectedFile: File) => {
        setFile(selectedFile);
        setIsAnalyzing(true);
        setAnalysisResult(null);

        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            const response = await fetch('http://localhost:8000/api/analyze-claim', {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                const data = await response.json();
                setAnalysisResult({
                    patientId: data.patient_id,
                    hospitalId: data.hospital_id,
                    procedureCode: data.procedure_code,
                    claimedAmount: data.claimed_amount,
                    riskScore: data.risk_score,
                    confidence: data.confidence,
                    flags: data.flags
                });
            } else {
                console.error("Analysis failed");
            }
        } catch (error) {
            console.error("Error connecting to backend:", error);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const resetUpload = () => {
        setFile(null);
        setAnalysisResult(null);
        setIsAnalyzing(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    return (
        <div className="w-full">
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="flex justify-between items-center mb-10"
            >
                <h2 className="text-3xl font-black text-slate-900 flex items-center gap-3">
                    Neural Document Analysis
                    <div className="h-px bg-brand-border/50 flex-1 w-32 ml-4" />
                </h2>
                <div className="flex items-center gap-2 text-[10px] font-bold text-brand-indigo bg-brand-indigo/10 px-4 py-2 rounded-full border border-brand-indigo/20 uppercase tracking-widest">
                    <Zap className="w-3.5 h-3.5" />
                    OCR Engine Live
                </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* Upload Column */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="glass-card p-1 bg-slate-50 group overflow-hidden"
                >
                    <div className="p-8 h-full flex flex-col min-h-[450px]">
                        <h3 className="text-xs font-black text-brand-slate uppercase tracking-[0.2em] mb-8">Source Ingestion</h3>

                        <AnimatePresence mode="wait">
                            {!file ? (
                                <motion.div
                                    key="dropzone"
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.98 }}
                                    onDragOver={handleDragOver}
                                    onDrop={handleDrop}
                                    onClick={() => fileInputRef.current?.click()}
                                    className="flex-1 border-2 border-dashed border-brand-border hover:border-brand-indigo hover:bg-brand-indigo/5 transition-all rounded-2xl flex flex-col items-center justify-center cursor-pointer p-8 group relative overflow-hidden"
                                >
                                    <div className="bg-brand-indigo/10 p-5 rounded-2xl mb-6 group-hover:scale-110 group-hover:bg-brand-indigo transition-all duration-500 group-hover:text-slate-900 text-brand-indigo">
                                        <UploadCloud className="w-10 h-10" />
                                    </div>
                                    <p className="text-xl font-black text-slate-900 mb-2 tracking-tight">Deploy Claim Document</p>
                                    <p className="text-xs text-brand-slate mb-8 max-w-[240px] text-center leading-relaxed font-semibold uppercase tracking-wider">PDFs and Images (JPG, PNG) accepted.</p>

                                    <div className="bg-brand-indigo text-white px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest shadow-sm group-hover:shadow-md transition-all">
                                        Initialize Upload
                                    </div>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileChange}
                                        accept=".pdf,.jpg,.jpeg,.png"
                                        className="hidden"
                                    />

                                    {/* Animated corner accents */}
                                    <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-brand-indigo/0 group-hover:border-brand-indigo/40 transition-all duration-500" />
                                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-brand-indigo/0 group-hover:border-brand-indigo/40 transition-all duration-500" />
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="file-preview"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex-1 flex flex-col justify-center"
                                >
                                    <div className="bg-white border border-brand-border/50 p-8 rounded-2xl relative">
                                        <button
                                            onClick={resetUpload}
                                            className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center rounded-full bg-brand-border/30 text-brand-slate hover:bg-brand-rose hover:text-slate-900 transition-all z-10"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>

                                        <div className="flex items-center gap-6 mb-8">
                                            <div className="bg-brand-indigo/20 p-4 rounded-xl ring-1 ring-brand-indigo/30">
                                                <FileText className="w-10 h-10 text-brand-indigo" />
                                            </div>
                                            <div className="overflow-hidden">
                                                <p className="text-slate-900 font-black truncate text-lg tracking-tight">{file.name}</p>
                                                <p className="text-[10px] font-black text-brand-slate uppercase tracking-widest">{(file.size / 1024 / 1024).toFixed(2)} MB • SYSTEM INGESTED</p>
                                            </div>
                                        </div>

                                        {isAnalyzing ? (
                                            <div className="bg-brand-indigo/5 rounded-xl p-6 flex flex-col gap-4 border border-brand-indigo/40">
                                                <div className="flex items-center gap-4">
                                                    <Loader2 className="w-6 h-6 text-brand-indigo animate-spin" />
                                                    <p className="text-xs font-black text-brand-indigo uppercase tracking-[0.2em]">Neural Extraction Active</p>
                                                </div>
                                                <div className="w-full bg-brand-border/50 h-1 rounded-full overflow-hidden">
                                                    <motion.div
                                                        className="h-full bg-brand-indigo"
                                                        initial={{ width: "0%" }}
                                                        animate={{ width: "100%" }}
                                                        transition={{ duration: 2, repeat: Infinity }}
                                                    />
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="bg-brand-emerald/10 rounded-xl p-6 flex items-center gap-4 border border-brand-emerald/30">
                                                <div className="w-10 h-10 rounded-full bg-brand-emerald/20 flex items-center justify-center text-brand-emerald">
                                                    <ShieldCheck className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-black text-brand-emerald uppercase tracking-[0.2em] mb-0.5 text-glow">Verification Complete</p>
                                                    <p className="text-[10px] text-brand-emerald/60 font-bold uppercase tracking-widest">Vector mapping successful</p>
                                                </div>
                                            </div>
                                        )}

                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>

                {/* Results Column */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="glass-card p-1 bg-slate-50 overflow-hidden relative"
                >
                    <div className="p-8 h-full min-h-[450px] flex flex-col z-10 relative">
                        <div className="flex justify-between items-start mb-8">
                            <h3 className="text-xs font-black text-brand-slate uppercase tracking-[0.2em]">Model Extraction</h3>
                            {analysisResult && (
                                <div className="text-[10px] font-black bg-brand-indigo/20 text-brand-indigo px-3 py-1.5 rounded-lg border border-brand-indigo/20 uppercase tracking-widest">
                                    Trust Vector: {analysisResult.confidence}%
                                </div>
                            )}
                        </div>

                        {!file || isAnalyzing ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-brand-slate/30">
                                <Activity className="w-16 h-16 mb-6 opacity-20 animate-pulse-slow" />
                                <p className="text-[10px] font-black uppercase tracking-[0.3em]">Awaiting Binary Stream</p>
                            </div>
                        ) : analysisResult && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex-1 flex flex-col"
                            >
                                <div className="grid grid-cols-2 gap-4 mb-8">
                                    {[
                                        { label: "Patient Signature", value: analysisResult.patientId, color: "text-slate-900" },
                                        { label: "Entity ID", value: analysisResult.hospitalId, color: "text-brand-indigo" },
                                        { label: "Value Assessment", value: analysisResult.claimedAmount, color: "text-slate-900" },
                                        { label: "Protocol Mapping", value: analysisResult.procedureCode, color: "text-slate-900" }
                                    ].map((field, idx) => (
                                        <div key={idx} className="bg-white/40 p-4 rounded-xl border border-brand-border/50 group hover:border-brand-indigo/40 transition-all">
                                            <span className="text-[9px] font-black text-brand-slate block mb-2 uppercase tracking-widest leading-none">{field.label}</span>
                                            <span className={`text-sm font-black tracking-tight ${field.color}`}>{field.value}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="mb-8 flex items-center justify-between bg-white/90 p-6 rounded-2xl border border-brand-rose/30 relative overflow-hidden group">
                                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-brand-rose shadow-[0_0_15px_rgba(244,63,94,0.5)]" />
                                    <div>
                                        <span className="text-[10px] text-brand-slate block mb-2 uppercase tracking-[0.2em] font-black leading-none">Risk Threshold Violation</span>
                                        <div className="flex items-end gap-2">
                                            <span className="text-4xl font-black text-brand-rose tracking-tighter text-glow">{analysisResult.riskScore}</span>
                                            <span className="text-xs font-black text-brand-slate mb-2 opacity-50">/ 100</span>
                                        </div>
                                    </div>
                                    <div className="bg-brand-rose/10 p-4 rounded-2xl border border-brand-rose/20 group-hover:scale-110 transition-transform duration-500">
                                        <AlertTriangle className="w-8 h-8 text-brand-rose" />
                                    </div>
                                </div>

                                <div className="flex-1">
                                    <h4 className="text-[10px] font-black text-brand-slate mb-4 flex items-center gap-2 uppercase tracking-widest">
                                        Anomalous Flags Detected
                                    </h4>
                                    <div className="space-y-2">
                                        {analysisResult.flags.length > 0 ? analysisResult.flags.map((flag: string, i: number) => (
                                            <motion.div
                                                key={i}
                                                initial={{ opacity: 0, x: 10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: i * 0.1 }}
                                                className="text-[11px] text-slate-700 font-bold flex items-center gap-3 bg-slate-50 hover:bg-slate-100 p-3 rounded-xl border border-brand-border/40 transition-all"
                                            >
                                                <div className="w-1.5 h-1.5 rounded-full bg-brand-rose shadow-[0_0_8px_rgba(244,63,94,0.5)]" />
                                                {flag}
                                            </motion.div>
                                        )) : (
                                            <div className="text-[11px] text-brand-emerald font-black flex items-center gap-3 bg-brand-emerald/5 p-4 rounded-xl border border-brand-emerald/20 uppercase tracking-widest">
                                                <ShieldCheck className="w-4 h-4" />
                                                No Protocol Violations Found
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Results decorative glow */}
                                {analysisResult.riskScore > 60 && (
                                    <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-brand-rose/20 rounded-full blur-[80px] pointer-events-none animate-pulse-slow" />
                                )}
                            </motion.div>
                        )}
                    </div>
                </motion.div>

            </div>
        </div>
    );
};

export default DocumentInvestigation;
