import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, AlertTriangle, Users, Zap, ChevronRight, Activity, Search } from 'lucide-react';

interface GhostCase {
    claim_id: string;
    patient_id: string;
    hospital_id: string;
    state: string;
    risk_score: number;
    claim_amount: number;
}

interface BeneficiarySummary {
    total_ghost_flags: number;
    unique_suspicious_beneficiaries: number;
    multi_hospital_patients: number;
    states_affected: number;
    total_fraudulent_amount_inr: number;
}

const BeneficiaryScanner = () => {
    const [summary, setSummary] = useState<BeneficiarySummary | null>(null);
    const [cases, setCases] = useState<GhostCase[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetch('http://localhost:8000/api/ghost-beneficiaries')
            .then(r => r.json())
            .then(data => {
                setSummary(data.summary);
                setCases(data.cases);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const filtered = cases.filter(c =>
        c.patient_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.hospital_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.state.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const formatINR = (n: number) => `₹${(n / 100000).toFixed(1)}L`;

    const statCards = summary ? [
        { label: 'Ghost Flags Detected', value: summary.total_ghost_flags.toLocaleString(), icon: <Shield className="w-5 h-5" />, color: 'text-brand-rose', bg: 'bg-brand-rose/10', border: 'border-brand-rose/20' },
        { label: 'Suspicious Beneficiaries', value: summary.unique_suspicious_beneficiaries.toLocaleString(), icon: <Users className="w-5 h-5" />, color: 'text-brand-violet', bg: 'bg-brand-violet/10', border: 'border-brand-violet/20' },
        { label: 'Multi-Hospital Patients', value: summary.multi_hospital_patients.toLocaleString(), icon: <Activity className="w-5 h-5" />, color: 'text-brand-indigo', bg: 'bg-brand-indigo/10', border: 'border-brand-indigo/20' },
        { label: 'Funds at Risk', value: formatINR(summary.total_fraudulent_amount_inr), icon: <AlertTriangle className="w-5 h-5" />, color: 'text-brand-emerald', bg: 'bg-brand-emerald/10', border: 'border-brand-emerald/20' },
    ] : [];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="flex items-center gap-3 text-brand-slate">
                    <Activity className="w-6 h-6 text-brand-indigo animate-pulse" />
                    <p className="text-xs font-black uppercase tracking-widest">Scanning Beneficiary Database...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full">
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="flex justify-between items-center mb-10"
            >
                <div>
                    <h2 className="text-3xl font-black text-slate-900 flex items-center gap-3">
                        Beneficiary Integrity Scanner
                        <div className="h-px bg-brand-border/50 flex-1 w-32 ml-4" />
                    </h2>
                    <p className="text-[10px] font-black text-brand-slate uppercase tracking-[0.3em] mt-2">Ghost Beneficiary & Dead-Patient Claim Detection</p>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-bold text-brand-rose bg-brand-rose/10 px-4 py-2 rounded-full border border-brand-rose/20 uppercase tracking-widest">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    CAG Gap #1 Solution
                </div>
            </motion.div>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {statCards.map((card, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 }}
                        className={`glass-card p-5 border ${card.border}`}
                    >
                        <div className={`${card.bg} w-10 h-10 rounded-xl flex items-center justify-center ${card.color} mb-4`}>
                            {card.icon}
                        </div>
                        <div className={`text-2xl font-black tracking-tighter ${card.color} mb-1`}>{card.value}</div>
                        <div className="text-[10px] font-black text-brand-slate uppercase tracking-widest">{card.label}</div>
                    </motion.div>
                ))}
            </div>

            {/* Case Table */}
            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="glass-card overflow-hidden"
            >
                <div className="p-6 border-b border-brand-border/30 flex items-center justify-between">
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Suspicious Case Registry</h3>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-brand-slate" />
                        <input
                            type="text"
                            placeholder="Search by Patient ID, Hospital, State..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="bg-white/50 border border-brand-border/50 rounded-lg pl-9 pr-4 py-2 text-[11px] font-semibold text-slate-900 placeholder:text-brand-slate/50 focus:outline-none focus:border-brand-indigo/50 w-72"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-brand-border/20">
                                {['Claim ID', 'Patient ID', 'Hospital', 'State', 'Risk Score', 'Claim Amount (INR)', 'Status'].map(h => (
                                    <th key={h} className="text-left px-5 py-3 text-[9px] font-black text-brand-slate uppercase tracking-widest">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            <AnimatePresence>
                                {filtered.map((c, i) => (
                                    <motion.tr
                                        key={c.claim_id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.04 }}
                                        className="border-b border-brand-border/10 hover:bg-brand-indigo/5 transition-colors group"
                                    >
                                        <td className="px-5 py-3 text-[11px] font-bold text-brand-indigo">{c.claim_id}</td>
                                        <td className="px-5 py-3 text-[11px] font-black text-slate-900">{c.patient_id}</td>
                                        <td className="px-5 py-3 text-[11px] text-brand-slate font-semibold">{c.hospital_id}</td>
                                        <td className="px-5 py-3 text-[11px] text-brand-slate font-semibold">{c.state}</td>
                                        <td className="px-5 py-3">
                                            <span className={`text-[11px] font-black ${c.risk_score > 80 ? 'text-brand-rose' : c.risk_score > 60 ? 'text-amber-400' : 'text-brand-emerald'}`}>
                                                {c.risk_score.toFixed(1)}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3 text-[11px] text-slate-900 font-black">{`₹${(c.claim_amount * 80).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}</td>
                                        <td className="px-5 py-3">
                                            <span className="text-[9px] font-black bg-brand-rose/10 text-brand-rose border border-brand-rose/20 px-2 py-0.5 rounded-full uppercase tracking-wider">Ghost Flag</span>
                                        </td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>
            </motion.div>
        </div>
    );
};

export default BeneficiaryScanner;
