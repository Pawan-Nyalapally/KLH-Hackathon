import React, { useState, useEffect } from 'react';
import { Activity, ShieldCheck, AlertCircle, Clock, TrendingUp, Info, Users, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

const logEntries = [
    { id: 1, time: '10:42 AM', type: 'info', message: 'Batch PDF OCR ingestion completed (420 records).' },
    { id: 2, time: '10:38 AM', type: 'warning', message: 'Duplicate signature detected from Provider #0442.' },
    { id: 3, time: '10:15 AM', type: 'alert', message: 'Isolation Forest flagged 14 claims > 0.82 Anomaly Score.' },
    { id: 4, time: '09:00 AM', type: 'info', message: 'System initialization and embedding model loaded.' },
];

const Overview = () => {
    const [stats, setStats] = useState({
        total_claims: 0,
        fraud_count: 0,
        avg_risk_score: 0,
        critical_cases: 0,
        ghost_beneficiaries: 0,
        concurrent_fraud: 0,
        funds_at_risk_inr: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('http://localhost:8000/api/stats')
            .then(res => res.json())
            .then(data => {
                setStats(data);
                setLoading(false);
            })
            .catch(err => console.error("Error fetching stats:", err));
    }, []);

    return (
        <div className="w-full">
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="flex justify-between items-center mb-8"
            >
                <h2 className="text-3xl font-black text-slate-900 flex items-center gap-3">
                    System Intelligence
                    <div className="h-px bg-brand-border/50 flex-1 w-32 ml-4" />
                </h2>
                <div className="flex items-center gap-2 text-xs font-bold text-brand-slate bg-brand-card/50 px-4 py-2 rounded-full border border-brand-border/50 uppercase tracking-widest">
                    <Clock className="w-3.5 h-3.5" />
                    Last Updated: {loading ? 'Syncing...' : 'Just now'}
                </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <StatCard
                        label="Claims Processed"
                        value={stats.total_claims.toLocaleString()}
                        subtext="↑ +12.4% vs last cycle"
                        icon={<ShieldCheck className="w-5 h-5 text-brand-emerald" />}
                        trend="positive"
                        delay={0.1}
                    />
                    <StatCard
                        label="High-Risk Alerts"
                        value={stats.fraud_count.toLocaleString()}
                        subtext="Requires immediate verification"
                        icon={<AlertCircle className="w-5 h-5 text-brand-rose" />}
                        trend="warning"
                        delay={0.2}
                    />
                    <StatCard
                        label="Ghost Beneficiaries"
                        value={stats.ghost_beneficiaries.toLocaleString()}
                        subtext="Invalid/deceased patient IDs"
                        icon={<Users className="w-5 h-5 text-brand-violet" />}
                        trend="danger"
                        delay={0.3}
                    />
                    <StatCard
                        label="Concurrent Fraud"
                        value={stats.concurrent_fraud.toLocaleString()}
                        subtext="Multi-hospital same-day claims"
                        icon={<Zap className="w-5 h-5 text-amber-400" />}
                        trend="danger"
                        delay={0.4}
                    />
                </div>

                {/* System Activity Log */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5 }}
                    className="glass-card flex flex-col h-full bg-slate-50"
                >
                    <div className="border-b border-brand-border/50 p-6 flex items-center justify-between">
                        <h3 className="font-bold text-slate-900 flex items-center gap-2">
                            <Activity className="w-4 h-4 text-brand-indigo" />
                            Live Security Log
                        </h3>
                        <div className="w-2 h-2 bg-brand-emerald rounded-full animate-pulse" />
                    </div>
                    <div className="p-6 flex-1 overflow-y-auto">
                        <div className="space-y-6">
                            {logEntries.map((log, i) => (
                                <div key={log.id} className="flex gap-4 group relative">
                                    <div className="flex flex-col items-center">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors
                                            ${log.type === 'alert' ? 'bg-brand-rose/20 text-brand-rose' :
                                                log.type === 'warning' ? 'bg-amber-500/20 text-amber-500' :
                                                    'bg-brand-emerald/20 text-brand-emerald'}`}
                                        >
                                            <Info className="w-4 h-4" />
                                        </div>
                                        {i !== logEntries.length - 1 && <div className="w-px h-full bg-brand-border/30 my-2" />}
                                    </div>
                                    <div className="flex-1 pt-1">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-[10px] text-brand-slate font-black uppercase tracking-widest">{log.time}</span>
                                            <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-widest
                                                ${log.type === 'alert' ? 'bg-brand-rose/10 text-brand-rose border border-brand-rose/20' :
                                                    log.type === 'warning' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                                                        'bg-brand-emerald/10 text-brand-emerald border border-brand-emerald/20'}`}
                                            >
                                                {log.type}
                                            </span>
                                        </div>
                                        <p className="text-sm text-slate-300 leading-snug group-hover:text-slate-900 transition-colors">
                                            {log.message}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

const StatCard = ({ label, value, subtext, icon, trend, delay }: any) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay, duration: 0.5 }}
        className="glass-card p-6 group hover:border-brand-indigo/40 transition-all duration-300 hover:bg-brand-card/60"
    >
        <div className="flex justify-between items-start mb-6">
            <div className="p-3 bg-white/50 rounded-xl group-hover:scale-110 transition-transform">
                {icon}
            </div>
            {trend && (
                <div className={`text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-widest
                    ${trend === 'positive' ? 'bg-brand-emerald/10 text-brand-emerald' :
                        trend === 'warning' ? 'bg-brand-rose/10 text-brand-rose' :
                            'bg-brand-rose/20 text-brand-rose'}`}
                >
                    {trend === 'positive' ? 'Optimized' : 'Alert'}
                </div>
            )}
        </div>
        <div className="text-xs font-bold text-brand-slate uppercase tracking-[0.15em] mb-2">{label}</div>
        <div className="text-3xl font-black text-slate-900 mb-2 group-hover:text-glow transition-all">{value}</div>
        <div className="text-[11px] text-brand-slate/60 font-medium">{subtext}</div>
    </motion.div>
);

export default Overview;
