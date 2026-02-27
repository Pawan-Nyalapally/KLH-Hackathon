import React, { useState, useEffect } from 'react';
import { Download, Loader2, Hospital as HospitalIcon, MapPin, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Hospital {
    hospital_id: string;
    state: string;
    total_claims: number;
    avg_claim_amount: number;
    avg_risk_score: number;
    image_reuse_count: number;
    duplicate_count: number;
    concurrent_count: number;
    upcoding_count: number;
    avg_upcoding_deviation: number;
}

const PAGE_SIZE_OPTIONS = [10, 25, 50, 75];

const ProviderRanking = () => {
    const [hospitals, setHospitals] = useState<Hospital[]>([]);
    const [loading, setLoading] = useState(true);
    const [generatingReport, setGeneratingReport] = useState<string | null>(null);
    const [pageSize, setPageSize] = useState(10);
    const [selectorOpen, setSelectorOpen] = useState(false);

    useEffect(() => {
        fetch('http://localhost:8000/api/hospitals')
            .then(res => res.json())
            .then(data => { setHospitals(data); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    const handleDownloadReport = async (hospitalId: string) => {
        setGeneratingReport(hospitalId);
        try {
            const response = await fetch(`http://localhost:8000/api/generate-report/${hospitalId}`, { method: 'POST' });
            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `Audit_Report_${hospitalId}.pdf`;
                document.body.appendChild(a);
                a.click();
                a.remove();
            }
        } catch (error) {
            console.error('Report error:', error);
        } finally {
            setGeneratingReport(null);
        }
    };

    const visible = pageSize === 0 ? hospitals : hospitals.slice(0, pageSize);

    return (
        <div className="w-full">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="flex justify-between items-center mb-6"
            >
                <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Provider Risk Index</h2>
                    <p className="text-[10px] font-semibold text-brand-slate uppercase tracking-widest mt-0.5">
                        Real-time anomaly detection stream
                    </p>
                </div>

                {/* Rows per page selector */}
                <div className="relative">
                    <button
                        onClick={() => setSelectorOpen(p => !p)}
                        className="flex items-center gap-2 text-[11px] font-bold text-brand-slate bg-white border border-brand-border/40 px-4 py-2 rounded-lg hover:border-brand-indigo/50 hover:text-slate-900 transition-all duration-200"
                    >
                        Show {pageSize === 0 ? 'All' : pageSize}
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${selectorOpen ? 'rotate-180' : ''}`} />
                    </button>

                    <AnimatePresence>
                        {selectorOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: -6, scale: 0.97 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -6, scale: 0.97 }}
                                transition={{ duration: 0.15 }}
                                className="absolute right-0 top-full mt-1.5 bg-white border border-brand-border/50 rounded-xl shadow-2xl overflow-hidden z-20 min-w-[110px]"
                            >
                                {PAGE_SIZE_OPTIONS.map(n => (
                                    <button
                                        key={n}
                                        onClick={() => { setPageSize(n); setSelectorOpen(false); }}
                                        className={`w-full text-left px-4 py-2.5 text-[11px] font-bold transition-colors
                                            ${pageSize === n
                                                ? 'bg-brand-indigo/20 text-brand-indigo'
                                                : 'text-brand-slate hover:bg-slate-100 hover:text-slate-900'
                                            }`}
                                    >
                                        Show {n}
                                    </button>
                                ))}
                                <button
                                    onClick={() => { setPageSize(0); setSelectorOpen(false); }}
                                    className={`w-full text-left px-4 py-2.5 text-[11px] font-bold transition-colors border-t border-brand-border/30
                                        ${pageSize === 0
                                            ? 'bg-brand-indigo/20 text-brand-indigo'
                                            : 'text-brand-slate hover:bg-slate-100 hover:text-slate-900'
                                        }`}
                                >
                                    Show All
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>

            {/* Table */}
            <div className="glass-card bg-slate-50 overflow-hidden border-brand-border/30">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-brand-border/40 bg-slate-50/60">
                                <th className="px-6 py-4 text-[9px] font-black text-brand-slate uppercase tracking-widest">Provider</th>
                                <th className="px-6 py-4 text-[9px] font-black text-brand-slate uppercase tracking-widest">State</th>
                                <th className="px-6 py-4 text-[9px] font-black text-brand-slate uppercase tracking-widest text-right">Claims</th>
                                <th className="px-6 py-4 text-[9px] font-black text-brand-slate uppercase tracking-widest text-right">Avg Value</th>
                                <th className="px-6 py-4 text-[9px] font-black text-brand-rose uppercase tracking-widest text-right">Reuse</th>
                                <th className="px-6 py-4 text-[9px] font-black text-amber-400 uppercase tracking-widest text-right">Upcoding</th>
                                <th className="px-6 py-4 text-[9px] font-black text-brand-indigo uppercase tracking-widest text-right">Concurrent</th>
                                <th className="px-6 py-4 text-[9px] font-black text-brand-slate uppercase tracking-widest text-right">Risk</th>
                                <th className="px-6 py-4 text-[9px] font-black text-brand-slate uppercase tracking-widest text-center">Audit</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-brand-border/20">
                            {loading ? (
                                <tr>
                                    <td colSpan={9} className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <Loader2 className="w-8 h-8 animate-spin text-brand-indigo" />
                                            <span className="text-brand-slate text-xs uppercase tracking-widest">Loading providers...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : visible.map((provider, i) => (
                                <motion.tr
                                    key={provider.hospital_id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: Math.min(i * 0.03, 0.3) }}
                                    className="hover:bg-slate-50 transition-colors group"
                                >
                                    {/* Provider ID */}
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-7 h-7 rounded-md bg-brand-indigo/10 flex items-center justify-center group-hover:bg-brand-indigo/20 transition-colors text-brand-indigo shrink-0">
                                                <HospitalIcon className="w-3.5 h-3.5" />
                                            </div>
                                            <span className="font-mono text-[13px] font-bold text-slate-900">{provider.hospital_id}</span>
                                        </div>
                                    </td>

                                    {/* State */}
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1.5 text-brand-slate text-xs">
                                            <MapPin className="w-3 h-3 opacity-40 shrink-0" />
                                            {provider.state}
                                        </div>
                                    </td>

                                    {/* Claims */}
                                    <td className="px-6 py-4 text-right text-sm font-bold text-slate-900">
                                        {provider.total_claims.toLocaleString()}
                                    </td>

                                    {/* Avg value */}
                                    <td className="px-6 py-4 text-right text-xs text-brand-slate font-medium">
                                        ₹{Math.round(provider.avg_claim_amount).toLocaleString()}
                                    </td>

                                    {/* Reuse */}
                                    <td className="px-6 py-4 text-right">
                                        <Badge count={provider.image_reuse_count} label="REUSE" color="rose" />
                                    </td>

                                    {/* Upcoding */}
                                    <td className="px-6 py-4 text-right">
                                        <Badge count={provider.upcoding_count} label="UP" color="amber" />
                                    </td>

                                    {/* Concurrent */}
                                    <td className="px-6 py-4 text-right">
                                        <Badge count={provider.concurrent_count} label="CONC" color="indigo" />
                                    </td>

                                    {/* Risk bar */}
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <div className="w-16 h-1 bg-brand-border/40 rounded-full overflow-hidden hidden sm:block">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    whileInView={{ width: `${provider.avg_risk_score}%` }}
                                                    viewport={{ once: true }}
                                                    transition={{ delay: Math.min(i * 0.03, 0.3) + 0.2, duration: 0.8 }}
                                                    className={`h-full rounded-full ${provider.avg_risk_score >= 75 ? 'bg-brand-rose' : provider.avg_risk_score >= 55 ? 'bg-brand-violet' : 'bg-brand-emerald'}`}
                                                />
                                            </div>
                                            <span className={`font-mono text-sm font-black ${provider.avg_risk_score >= 75 ? 'text-brand-rose' : provider.avg_risk_score >= 55 ? 'text-brand-violet' : 'text-brand-emerald'}`}>
                                                {provider.avg_risk_score.toFixed(1)}%
                                            </span>
                                        </div>
                                    </td>

                                    {/* Audit button */}
                                    <td className="px-6 py-4 text-center">
                                        <button
                                            onClick={() => handleDownloadReport(provider.hospital_id)}
                                            disabled={generatingReport === provider.hospital_id}
                                            className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest bg-transparent border border-brand-border/40 text-brand-slate hover:border-brand-indigo/60 hover:text-slate-900 px-3 py-1.5 rounded-lg transition-all duration-200 disabled:opacity-40"
                                        >
                                            {generatingReport === provider.hospital_id
                                                ? <Loader2 className="w-3 h-3 animate-spin" />
                                                : <Download className="w-3 h-3" />
                                            }
                                            Audit
                                        </button>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Footer */}
                {!loading && (
                    <div className="px-6 py-3 border-t border-brand-border/20 flex items-center justify-between">
                        <span className="text-[10px] font-semibold text-brand-slate uppercase tracking-widest">
                            Showing {visible.length} of {hospitals.length} providers
                        </span>
                        {pageSize !== 0 && hospitals.length > pageSize && (
                            <button
                                onClick={() => {
                                    const idx = PAGE_SIZE_OPTIONS.indexOf(pageSize);
                                    const next = PAGE_SIZE_OPTIONS[idx + 1];
                                    setPageSize(next ?? 0);
                                }}
                                className="text-[10px] font-bold text-brand-indigo uppercase tracking-widest hover:underline transition-all"
                            >
                                Load more →
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

// Minimal badge component
const Badge = ({ count, label, color }: { count: number; label: string; color: 'rose' | 'amber' | 'indigo' }) => {
    if (count === 0) return <span className="text-brand-slate/20 text-[10px] font-bold">—</span>;
    const styles: Record<string, string> = {
        rose: 'bg-brand-rose/10 text-brand-rose ring-brand-rose/20',
        amber: 'bg-amber-400/10 text-amber-400 ring-amber-400/20',
        indigo: 'bg-brand-indigo/10 text-brand-indigo ring-brand-indigo/20',
    };
    return (
        <span className={`px-2 py-0.5 rounded text-[10px] font-black ring-1 ${styles[color]}`}>
            {count.toString().padStart(2, '0')} {label}
        </span>
    );
};

export default ProviderRanking;
