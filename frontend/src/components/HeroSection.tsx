import React from 'react';
import { ShieldCheck, Users, AlertTriangle, Fingerprint, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';

const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

const HeroSection = () => {
    return (
        <div className="relative pt-24 pb-16 mb-16 overflow-hidden">
            {/* Background Mesh Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[60%] bg-brand-indigo/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[60%] bg-brand-violet/10 blur-[120px] rounded-full" />
            </div>

            <div className="max-w-7xl mx-auto px-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-12">
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        className="max-w-3xl"
                    >
                        <div className="flex items-center gap-2 mb-6">
                            <span className="bg-brand-indigo/20 text-brand-indigo text-[10px] font-bold px-3 py-1 rounded-full border border-brand-indigo/40 uppercase tracking-widest">
                                AI Core v4.2 Deployment
                            </span>
                        </div>
                        <h2 className="text-5xl lg:text-6xl font-black text-slate-900 tracking-tight mb-6 leading-[1.1]">
                            AI-Powered <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-indigo to-brand-violet">Fraud Intelligence</span>
                        </h2>
                        <p className="text-xl text-brand-slate leading-relaxed mb-8 max-w-2xl font-light">
                            Securing public healthcare through autonomous deep-learning audits.
                            Proactively identifying billing anomalies and isolating high-risk networks within the PM-JAY ecosystem.
                        </p>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => scrollTo('upload')}
                                className="btn-primary px-8 py-3"
                            >
                                <Fingerprint className="w-5 h-5" />
                                Start Investigation
                            </button>
                            <button
                                onClick={() => scrollTo('audit')}
                                className="flex items-center gap-2 px-8 py-3 rounded-xl font-semibold text-slate-900 border border-brand-border hover:bg-slate-100 transition-colors"
                            >
                                <BookOpen className="w-4 h-4" />
                                Documentation
                            </button>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8 }}
                        className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:w-[450px]"
                    >
                        <MetricCard
                            icon={<ShieldCheck className="w-6 h-6 text-brand-indigo" />}
                            label="Total Claims Analyzed"
                            value="145,289"
                            delay={0.2}
                        />
                        <MetricCard
                            icon={<AlertTriangle className="w-6 h-6 text-brand-rose" />}
                            label="High Risk Claims"
                            value="12.1%"
                            delay={0.3}
                        />
                        <MetricCard
                            icon={<Users className="w-6 h-6 text-brand-emerald" />}
                            label="Monitored Providers"
                            value="8.4k"
                            delay={0.4}
                        />
                        <div className="glass-card p-6 flex flex-col justify-center border-brand-indigo/40 bg-brand-indigo/5">
                            <div className="text-xs font-bold text-brand-indigo mb-1 uppercase tracking-wider">System State</div>
                            <div className="text-lg font-bold text-slate-900">Full Load Active</div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

const MetricCard = ({ icon, label, value, delay }: { icon: React.ReactNode, label: string, value: string, delay: number }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.5 }}
        className="glass-card p-6 hover:border-brand-indigo/50 transition-colors group"
    >
        <div className="mb-4 bg-white/50 w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
            {icon}
        </div>
        <div className="text-sm font-medium text-brand-slate mb-1">{label}</div>
        <div className="text-2xl font-bold text-slate-900">{value}</div>
    </motion.div>
);

export default HeroSection;
