import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Loader2, BarChart3, TrendingUp, Map } from 'lucide-react';
import { motion } from 'framer-motion';

const Analytics = () => {
    const [data, setData] = useState<{ timeline: any[], regions: any[] }>({ timeline: [], regions: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('http://localhost:8000/api/analytics')
            .then(res => res.json())
            .then(res => { setData(res); setLoading(false); })
            .catch(err => console.error("Error fetching analytics:", err));
    }, []);

    if (loading) {
        return (
            <div className="w-full h-96 flex flex-col items-center justify-center text-brand-slate">
                <Loader2 className="w-10 h-10 animate-spin mb-4 text-brand-indigo" />
                <p className="font-medium tracking-wide">Analyzing high-dimensional behavior...</p>
            </div>
        );
    }

    return (
        <div className="w-full">
            <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-black text-slate-900 flex items-center gap-3">
                    Behavioral Models
                    <div className="h-px bg-brand-border/50 flex-1 w-32 ml-4" />
                </h2>
                <div className="flex items-center gap-2 text-xs font-bold text-brand-indigo bg-brand-indigo/10 px-4 py-2 rounded-full border border-brand-indigo/20 uppercase tracking-widest">
                    <BarChart3 className="w-3.5 h-3.5" />
                    Deep Learning Active
                </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="glass-card p-8 bg-slate-50 group">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="font-bold text-slate-900 flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-brand-indigo" />
                            Claim Processing Velocity
                        </h3>
                        <div className="flex items-center gap-4 text-[10px] uppercase font-bold tracking-widest">
                            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-brand-indigo" /> Total</div>
                            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-brand-rose" /> High Risk</div>
                        </div>
                    </div>
                    <div className="h-80 w-full group-hover:scale-[1.01] transition-transform duration-500">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data.timeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorProcessed" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorFlagged" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="month" stroke="#475569" fontSize={11} fontWeight={600} tickLine={false} axisLine={false} dy={10} />
                                <YAxis stroke="#475569" fontSize={11} fontWeight={600} tickLine={false} axisLine={false} tickFormatter={(val) => `${val / 1000}k`} dx={-5} />
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#f8fafc' }} itemStyle={{ fontSize: '11px', fontWeight: 600, color: '#f8fafc' }} />
                                <Area type="monotone" dataKey="processed" name="Processed" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorProcessed)" />
                                <Area type="monotone" dataKey="flagged" name="High Risk" stroke="#f43f5e" strokeWidth={3} fillOpacity={1} fill="url(#colorFlagged)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="glass-card p-8 bg-slate-50 group">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="font-bold text-slate-900 flex items-center gap-2">
                            <Map className="w-4 h-4 text-brand-emerald" />
                            Regional Anomaly Distribution
                        </h3>
                    </div>
                    <div className="h-80 w-full group-hover:scale-[1.01] transition-transform duration-500">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.regions} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                <XAxis dataKey="region" stroke="#475569" fontSize={11} fontWeight={600} tickLine={false} axisLine={false} dy={10} />
                                <YAxis stroke="#475569" fontSize={11} fontWeight={600} tickLine={false} axisLine={false} dx={-5} />
                                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#f8fafc' }} cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }} />
                                <Bar dataKey="legitimate" name="Valid" stackId="a" fill="#10b981" radius={[0, 0, 4, 4]} />
                                <Bar dataKey="fraudulent" name="Anomalous" stackId="a" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>
            </div>

            <StateIntelligenceTable />
        </div>
    );
};

const THREAT_CONFIG: Record<string, { color: string; bg: string; border: string }> = {
    Critical: { color: 'text-brand-rose', bg: 'bg-brand-rose/10', border: 'border-brand-rose/20' },
    High: { color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/20' },
    Elevated: { color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/20' },
    Low: { color: 'text-brand-emerald', bg: 'bg-brand-emerald/10', border: 'border-brand-emerald/20' },
};

const StateIntelligenceTable = () => {
    const [states, setStates] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('http://localhost:8000/api/state-intelligence')
            .then(r => r.json())
            .then(setStates)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) return null;

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mt-8 glass-card overflow-hidden">
            <div className="p-6 border-b border-brand-border/30 flex items-center justify-between">
                <div>
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">State Threat Intelligence</h3>
                    <p className="text-[10px] text-brand-slate mt-0.5 font-semibold">CAG Gap #6 — Geographic Risk Stratification</p>
                </div>
                <div className="text-[9px] font-black text-brand-rose bg-brand-rose/10 px-3 py-1 rounded-full border border-brand-rose/20 uppercase tracking-widest">
                    Bihar 🔴 72.1% Fraud Rate
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-brand-border/20 bg-slate-50/60">
                            {['State', 'Threat', 'Fraud Rate', 'Primary Fraud Type', 'Ghost IDs', 'Concurrent', 'Est. Loss'].map(h => (
                                <th key={h} className="text-left px-5 py-3 text-[9px] font-black text-brand-slate uppercase tracking-widest">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {states.map((s, i) => {
                            const t = THREAT_CONFIG[s.threat_level] || THREAT_CONFIG.Low;
                            return (
                                <motion.tr key={s.state} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }} className="border-b border-brand-border/10 hover:bg-white/[0.02] transition-colors">
                                    <td className="px-5 py-3 text-[11px] font-black text-slate-900">{s.state}</td>
                                    <td className="px-5 py-3">
                                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${t.color} ${t.bg} ${t.border} uppercase tracking-wider`}>{s.threat_level}</span>
                                    </td>
                                    <td className="px-5 py-3">
                                        <div className="flex items-center gap-2">
                                            <div className="w-14 h-1.5 bg-brand-border/30 rounded-full overflow-hidden">
                                                <div className={`h-full rounded-full ${s.fraud_rate_pct > 20 ? 'bg-brand-rose' : s.fraud_rate_pct > 13 ? 'bg-amber-400' : 'bg-brand-emerald'}`} style={{ width: `${Math.min(s.fraud_rate_pct, 100)}%` }} />
                                            </div>
                                            <span className={`text-[11px] font-black ${s.fraud_rate_pct > 20 ? 'text-brand-rose' : s.fraud_rate_pct > 13 ? 'text-amber-400' : 'text-brand-emerald'}`}>{s.fraud_rate_pct}%</span>
                                        </div>
                                    </td>
                                    <td className="px-5 py-3 text-[10px] text-brand-slate font-semibold">{s.primary_fraud_type}</td>
                                    <td className="px-5 py-3 text-[11px] text-brand-violet font-black">{s.ghost_beneficiaries}</td>
                                    <td className="px-5 py-3 text-[11px] text-brand-indigo font-black">{s.concurrent_claims}</td>
                                    <td className="px-5 py-3 text-[11px] text-slate-900 font-black">₹{(s.estimated_loss_inr / 10000000).toFixed(1)} Cr</td>
                                </motion.tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </motion.div>
    );
};

export default Analytics;
