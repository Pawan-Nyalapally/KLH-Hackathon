import React, { useState, useEffect } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ZAxis } from 'recharts';
import { Info, Activity, Zap, Brain } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ScatterPoint {
    x: number;
    y: number;
    z: number;
    isAnomaly: boolean;
    anomalyScore: number;
    id: string;
}

interface ModelEval {
    roc_auc: number;
    precision: number;
    recall: number;
    f1_score: number;
    note: string;
}

interface IFData {
    total_anomalies_detected: number;
    contamination_rate: number;
    model_n_estimators: number;
    features_used: string[];
    evaluation: ModelEval;
    scatter_data: ScatterPoint[];
}

const AnomalyDetection = () => {
    const [showExplanation, setShowExplanation] = useState(false);
    const [ifData, setIfData] = useState<IFData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('http://localhost:8000/api/isolation-forest-data')
            .then(r => r.json())
            .then(setIfData)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const normalData = ifData?.scatter_data.filter(d => !d.isAnomaly) || [];
    const anomalyData = ifData?.scatter_data.filter(d => d.isAnomaly) || [];

    return (
        <div className="w-full">
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="flex justify-between items-center mb-10"
            >
                <div className="flex flex-col">
                    <h2 className="text-3xl font-black text-slate-900 flex items-center gap-3">
                        Isolation Forest Output
                        <div className="h-px bg-brand-border/50 flex-1 w-32 ml-4" />
                    </h2>
                    <div className="flex items-center gap-4 mt-2">
                        <p className="text-[10px] font-black text-brand-slate uppercase tracking-[0.3em]">Real Scikit-Learn Model · Live Predictions</p>
                        {ifData && (
                            <div className="flex items-center gap-2 text-[9px] font-black text-brand-emerald uppercase tracking-widest bg-brand-emerald/10 px-2 py-0.5 rounded-full border border-brand-emerald/20">
                                <span className="w-1.5 h-1.5 rounded-full bg-brand-emerald animate-pulse" />
                                {ifData.total_anomalies_detected} Anomalies Detected
                            </div>
                        )}
                    </div>
                </div>

                <button
                    onClick={() => setShowExplanation(!showExplanation)}
                    className="flex items-center gap-2 text-[10px] font-bold text-brand-indigo bg-brand-indigo/10 px-4 py-2 rounded-full border border-brand-indigo/20 uppercase tracking-widest hover:bg-brand-indigo hover:text-slate-900 transition-all duration-300"
                >
                    <Info className="w-3.5 h-3.5" />
                    {showExplanation ? 'Hide Methodology' : 'System Logic'}
                </button>
            </motion.div>

            <AnimatePresence>
                {showExplanation && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="bg-white/90 border border-brand-indigo/40 p-6 rounded-2xl mb-8 text-xs text-brand-slate shadow-2xl relative">
                            <div className="absolute top-0 left-0 w-1 h-full bg-brand-indigo shadow-[0_0_15px_rgba(99,102,241,0.5)]" />
                            <div className="flex gap-4 items-start">
                                <div className="bg-brand-indigo/20 p-3 rounded-xl border border-brand-indigo/40 shrink-0">
                                    <Brain className="w-5 h-5 text-brand-indigo" />
                                </div>
                                <div className="space-y-2 font-semibold leading-relaxed">
                                    <p><strong className="text-slate-900 uppercase tracking-wider text-[10px]">Real Model:</strong> sklearn IsolationForest({ifData?.model_n_estimators} estimators, contamination={ifData?.contamination_rate}). Features: {ifData?.features_used?.join(', ') || 'N/A'}.</p>
                                    <p><strong className="text-slate-900 uppercase tracking-wider text-[10px]">Why these features:</strong> Only <em>independent raw signals</em> are used — claim value deviation, hospital volume, and reuse rate. No pre-computed risk scores, ensuring zero circular dependency.</p>
                                    <p><strong className="text-slate-900 uppercase tracking-wider text-[10px]">Why Isolation Forest:</strong> Outliers require fewer tree splits to isolate — ideal for rare fraud in high-volume data without labeled training examples.</p>
                                    <div className="flex gap-6 mt-3">
                                        <div className="text-center">
                                            <div className="text-lg font-black text-brand-indigo">{ifData?.model_n_estimators}</div>
                                            <div className="text-[9px] uppercase tracking-widest text-brand-slate">Estimators</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-lg font-black text-brand-rose">{((ifData?.contamination_rate || 0.055) * 100).toFixed(1)}%</div>
                                            <div className="text-[9px] uppercase tracking-widest text-brand-slate">Contamination</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-lg font-black text-brand-emerald">{ifData?.total_anomalies_detected}</div>
                                            <div className="text-[9px] uppercase tracking-widest text-brand-slate">Anomalies</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-lg font-black text-brand-violet">{ifData?.evaluation?.roc_auc ? (ifData.evaluation.roc_auc * 100).toFixed(1) + '%' : '-'}</div>
                                            <div className="text-[9px] uppercase tracking-widest text-brand-slate">ROC-AUC</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="glass-card p-8 bg-slate-50 relative overflow-hidden group"
            >
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Activity className="w-32 h-32 text-brand-indigo" />
                </div>

                {loading ? (
                    <div className="h-[450px] flex items-center justify-center">
                        <div className="flex items-center gap-3 text-brand-slate">
                            <Brain className="w-8 h-8 text-brand-indigo animate-pulse" />
                            <div>
                                <p className="text-xs font-black text-slate-900 uppercase tracking-widest">Running Isolation Forest Model</p>
                                <p className="text-[10px] text-brand-slate mt-1">Fitting on 10,000 claims...</p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="h-[450px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.3} vertical={false} />
                                <XAxis
                                    type="number"
                                    dataKey="x"
                                    name="Risk Score (Z-Score)"
                                    tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 900 }}
                                    stroke="#1e293b"
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis
                                    type="number"
                                    dataKey="y"
                                    name="Claim Amount (Z-Score)"
                                    tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 900 }}
                                    stroke="#1e293b"
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <ZAxis type="number" dataKey="z" range={[20, 400]} />
                                <Tooltip
                                    cursor={{ strokeDasharray: '3 3', stroke: '#6366f1', opacity: 0.5 }}
                                    contentStyle={{
                                        backgroundColor: 'rgba(2, 6, 23, 0.95)',
                                        borderColor: 'rgba(99, 102, 241, 0.3)',
                                        borderRadius: '12px',
                                        fontSize: '10px',
                                        fontWeight: '900',
                                        color: '#fff',
                                        border: '1px solid rgba(255,255,255,0.1)'
                                    }}
                                    formatter={(value: any) => typeof value === 'number' ? value.toFixed(3) : value}
                                />
                                <Scatter name="Verified Baseline" data={normalData} fill="#6366f1" fillOpacity={0.25} stroke="#6366f1" strokeOpacity={0.4} line={false} />
                                <Scatter name="Detected Anomalies" data={anomalyData} fill="#f43f5e" fillOpacity={0.7} stroke="#f43f5e" strokeWidth={2} line={false} shape="circle" />
                            </ScatterChart>
                        </ResponsiveContainer>
                    </div>
                )}

                <div className="mt-8 border-t border-brand-border/30 pt-8 space-y-4">
                    <div className="flex items-center justify-center gap-12">
                        <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full bg-brand-indigo/30 border border-brand-indigo" />
                            <span className="text-[10px] font-black text-brand-slate uppercase tracking-widest">Inlier Distribution ({normalData.length})</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full bg-brand-rose border border-brand-rose shadow-[0_0_10px_rgba(244,63,94,0.5)]" />
                            <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Isolation Clusters ({anomalyData.length})</span>
                        </div>
                    </div>
                    {ifData?.evaluation && (
                        <div className="grid grid-cols-4 gap-4 mt-4">
                            {[{ label: 'ROC-AUC', value: ifData.evaluation.roc_auc, color: 'indigo' },
                            { label: 'Precision', value: ifData.evaluation.precision, color: 'violet' },
                            { label: 'Recall', value: ifData.evaluation.recall, color: 'emerald' },
                            { label: 'F1 Score', value: ifData.evaluation.f1_score, color: 'rose' }].map(m => (
                                <div key={m.label} className={`bg-brand-${m.color}/5 border border-brand-${m.color}/20 rounded-xl p-4 text-center`}>
                                    <div className={`text-2xl font-black text-brand-${m.color}`}>{(m.value * 100).toFixed(1)}%</div>
                                    <div className="text-[9px] uppercase tracking-widest text-brand-slate mt-1">{m.label}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default AnomalyDetection;
