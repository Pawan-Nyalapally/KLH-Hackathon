import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Network, AlertTriangle, Zap, Activity } from 'lucide-react';

interface Edge {
    source: string;
    target: string;
    shared_patients: number;
    suspicion_score: number;
}

interface Node {
    id: string;
    risk_score: number;
}

interface NetworkData {
    nodes: Node[];
    edges: Edge[];
    high_centrality_count: number;
}

const NetworkGraph = () => {
    const [data, setData] = useState<NetworkData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('http://localhost:8000/api/fraud-network')
            .then(r => r.json())
            .then(setData)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="flex items-center gap-3 text-brand-slate">
                    <Activity className="w-6 h-6 text-brand-violet animate-pulse" />
                    <p className="text-xs font-black uppercase tracking-widest">Mapping Collusion Network...</p>
                </div>
            </div>
        );
    }

    const topEdges = data?.edges.slice(0, 15) || [];
    const topNodes = data?.nodes.sort((a, b) => b.risk_score - a.risk_score).slice(0, 8) || [];

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
                        Hospital Collusion Network
                        <div className="h-px bg-brand-border/50 flex-1 w-32 ml-4" />
                    </h2>
                    <p className="text-[10px] font-black text-brand-slate uppercase tracking-[0.3em] mt-2">Graph-Based Fraud Ring Detection</p>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-bold text-brand-violet bg-brand-violet/10 px-4 py-2 rounded-full border border-brand-violet/20 uppercase tracking-widest">
                    <Network className="w-3.5 h-3.5" />
                    CAG Gap #3 Solution
                </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="glass-card p-5 border border-brand-violet/20"
                >
                    <div className="bg-brand-violet/10 w-10 h-10 rounded-xl flex items-center justify-center text-brand-violet mb-4">
                        <Network className="w-5 h-5" />
                    </div>
                    <div className="text-2xl font-black text-brand-violet tracking-tighter mb-1">{data?.nodes.length}</div>
                    <div className="text-[10px] font-black text-brand-slate uppercase tracking-widest">Hospitals in Network</div>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 }}
                    className="glass-card p-5 border border-brand-rose/20"
                >
                    <div className="bg-brand-rose/10 w-10 h-10 rounded-xl flex items-center justify-center text-brand-rose mb-4">
                        <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div className="text-2xl font-black text-brand-rose tracking-tighter mb-1">{data?.high_centrality_count}</div>
                    <div className="text-[10px] font-black text-brand-slate uppercase tracking-widest">High-Centrality Clusters</div>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                    className="glass-card p-5 border border-brand-indigo/20"
                >
                    <div className="bg-brand-indigo/10 w-10 h-10 rounded-xl flex items-center justify-center text-brand-indigo mb-4">
                        <Zap className="w-5 h-5" />
                    </div>
                    <div className="text-2xl font-black text-brand-indigo tracking-tighter mb-1">{data?.edges.length}</div>
                    <div className="text-[10px] font-black text-brand-slate uppercase tracking-widest">Suspicious Connections</div>
                </motion.div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Suspicious Connections */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="glass-card overflow-hidden"
                >
                    <div className="p-5 border-b border-brand-border/30">
                        <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Top Suspicious Hospital Pairs</h3>
                    </div>
                    <div className="p-4 space-y-2">
                        {topEdges.map((edge, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="flex items-center justify-between p-3 bg-white/40 rounded-xl border border-brand-border/30 hover:border-brand-violet/30 transition-all"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="text-[10px] text-brand-indigo font-black">{edge.source}</div>
                                    <div className="text-[9px] text-brand-slate">↔</div>
                                    <div className="text-[10px] text-brand-indigo font-black">{edge.target}</div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-right">
                                        <div className="text-[9px] text-brand-slate uppercase tracking-widest">Shared</div>
                                        <div className="text-[11px] font-black text-slate-900">{edge.shared_patients} patients</div>
                                    </div>
                                    <div className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${edge.suspicion_score >= 80 ? 'bg-brand-rose/10 text-brand-rose border-brand-rose/20' : edge.suspicion_score >= 50 ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-brand-emerald/10 text-brand-emerald border-brand-emerald/20'}`}>
                                        {edge.suspicion_score}%
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* High-Risk Hospital Nodes */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="glass-card overflow-hidden"
                >
                    <div className="p-5 border-b border-brand-border/30">
                        <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">High-Centrality Hospital Nodes</h3>
                    </div>
                    <div className="p-6 space-y-4">
                        {topNodes.map((node, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: i * 0.06 }}
                                className="flex items-center gap-4"
                            >
                                <div className="text-[10px] font-black text-brand-indigo w-24 shrink-0">{node.id}</div>
                                <div className="flex-1 bg-brand-border/30 rounded-full h-2 overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        whileInView={{ width: `${node.risk_score}%` }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.8, delay: i * 0.07 }}
                                        className={`h-full rounded-full ${node.risk_score > 70 ? 'bg-brand-rose' : node.risk_score > 50 ? 'bg-amber-500' : 'bg-brand-indigo'}`}
                                    />
                                </div>
                                <div className={`text-[11px] font-black w-12 text-right ${node.risk_score > 70 ? 'text-brand-rose' : node.risk_score > 50 ? 'text-amber-400' : 'text-brand-indigo'}`}>
                                    {node.risk_score.toFixed(1)}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default NetworkGraph;
