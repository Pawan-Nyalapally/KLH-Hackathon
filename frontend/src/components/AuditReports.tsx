import React from 'react';
import { Download, FileText, CheckCircle, Clock, ShieldCheck, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

const reports = [
    { id: 'AUD-2024-8912', title: 'Q1 Fraud Network Analysis (North Region)', date: 'Oct 24, 2024', status: 'Finalized', format: 'PDF', size: '2.4 MB', type: 'Intelligence' },
    { id: 'AUD-2024-8905', title: 'Suspicious Upcoding Audit: Cardiology', date: 'Oct 15, 2024', status: 'Finalized', format: 'PDF', size: '1.8 MB', type: 'Forensic' },
    { id: 'AUD-2024-8890', title: 'Monthly Isolation Forest Log', date: 'Oct 01, 2024', status: 'Finalized', format: 'CSV', size: '14.2 MB', type: 'Data Stream' },
    { id: 'AUD-2024-8920', title: 'Pending Investigation Summaries', date: 'Processing', status: 'Generating', format: 'PDF', size: '--', type: 'Draft' },
];

const AuditReports = () => {
    return (
        <div className="w-full">
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="flex justify-between items-center mb-10"
            >
                <h2 className="text-3xl font-black text-slate-900 flex items-center gap-3">
                    Intelligence Archive
                    <div className="h-px bg-brand-border/50 flex-1 w-32 ml-4" />
                </h2>
                <div className="flex items-center gap-2 text-[10px] font-bold text-brand-emerald bg-brand-emerald/10 px-4 py-2 rounded-full border border-brand-emerald/20 uppercase tracking-widest">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Verified Storage
                </div>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {reports.map((report, i) => (
                    <motion.div
                        key={report.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 }}
                        className="glass-card p-6 bg-slate-50 flex flex-col gap-6 group hover:bg-slate-50 transition-all relative overflow-hidden"
                    >
                        <div className="flex items-start gap-4 z-10">
                            <div className={`p-4 rounded-2xl relative ${report.status === 'Finalized' ? 'bg-brand-indigo/10 border border-brand-indigo/20' : 'bg-white/40 border border-brand-border/50'}`}>
                                <FileText className={`w-8 h-8 ${report.status === 'Finalized' ? 'text-brand-indigo' : 'text-brand-slate'}`} />
                                {report.status === 'Finalized' && (
                                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-brand-indigo rounded-full flex items-center justify-center text-slate-900 ring-2 ring-brand-dark">
                                        <ShieldCheck className="w-2.5 h-2.5" />
                                    </div>
                                )}
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-[10px] font-black text-brand-indigo bg-brand-indigo/10 px-2 py-1 rounded-md uppercase tracking-widest border border-brand-indigo/10">{report.id}</span>
                                    <span className="text-[10px] font-black text-brand-slate uppercase tracking-widest opacity-60">{report.format} • {report.size}</span>
                                </div>
                                <h3 className="text-base font-black text-slate-900 mb-2 leading-snug tracking-tight group-hover:text-brand-indigo transition-colors">{report.title}</h3>
                                <div className="flex items-center gap-3 mb-4">
                                    <span className="text-[10px] font-black py-0.5 px-2 rounded-md bg-white/90 text-brand-slate uppercase tracking-wider border border-brand-border/50">{report.type}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-6 border-t border-brand-border/30 z-10">
                            <span className="text-[10px] font-black text-brand-slate flex items-center gap-2 uppercase tracking-widest">
                                {report.status === 'Finalized' ? (
                                    <><CheckCircle className="w-4 h-4 text-brand-emerald" /> {report.date}</>
                                ) : (
                                    <><Clock className="w-4 h-4 text-brand-rose animate-pulse" /> {report.status}</>
                                )}
                            </span>
                            <button
                                disabled={report.status !== 'Finalized'}
                                className={`text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${report.status === 'Finalized'
                                    ? 'bg-brand-indigo/10 text-slate-900 border border-brand-indigo/40 hover:bg-brand-indigo'
                                    : 'text-brand-slate/30 border border-brand-border/30 cursor-not-allowed'
                                    }`}
                            >
                                Extract <Download className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Decoration */}
                        <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-brand-indigo/5 rounded-full blur-[60px] group-hover:bg-brand-indigo/10 transition-all duration-700" />
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default AuditReports;
