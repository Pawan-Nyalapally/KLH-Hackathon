import React from 'react';
import { ShieldAlert, BrainCircuit } from 'lucide-react';

interface TopNavProps {
    activeSection: string;
    currentView: string;
    setCurrentView: (view: string) => void;
}

const navigation = [
    { name: 'Overview', href: '#overview', id: 'overview' },
    { name: 'Analytics', href: '#analytics', id: 'analytics' },
    { name: 'Fraud Network', href: '#network', id: 'network' },
    { name: 'Providers', href: '#providers', id: 'providers' },
    { name: 'AI Investigation', href: '#upload', id: 'upload' },
    { name: 'Audit', href: '#audit', id: 'audit' },
];

const TopNav = ({ activeSection, currentView, setCurrentView }: TopNavProps) => {
    return (
        <header className="glass-nav sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
                <div
                    className="flex items-center gap-3 group cursor-pointer"
                    onClick={() => {
                        setCurrentView('home');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                >
                    <div className="bg-brand-indigo p-2 rounded-xl rotate-3 group-hover:rotate-0 transition-transform duration-300 shadow-sm">
                        <ShieldAlert className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-black text-slate-900 tracking-tighter leading-none">AROGYA VIGILANT</h1>
                        <p className="text-[10px] font-black text-brand-indigo tracking-[0.2em] uppercase mt-0.5">Neural Fraud Detection</p>
                    </div>
                </div>

                <nav className="hidden md:flex items-center gap-1">
                    {navigation.map((item) => (
                        <a
                            key={item.id}
                            href={item.href}
                            onClick={(e) => {
                                if (currentView !== 'home') {
                                    e.preventDefault();
                                    setCurrentView('home');
                                    setTimeout(() => {
                                        const el = document.getElementById(item.id);
                                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                                    }, 100);
                                    window.history.pushState(null, '', item.href);
                                }
                            }}
                            className={`px-4 py-2 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all duration-300 ${activeSection === item.id && currentView === 'home'
                                ? 'text-brand-indigo bg-brand-indigo/10'
                                : 'text-brand-slate hover:text-slate-900 hover:bg-slate-100'
                                }`}
                        >
                            {item.name}
                        </a>
                    ))}

                    {/* External Page Toggle Button */}
                    <button
                        onClick={() => {
                            setCurrentView('models');
                            window.scrollTo({ top: 0 });
                        }}
                        className={`ml-2 px-4 py-2 rounded-lg text-[11px] font-black uppercase tracking-widest flex items-center gap-2 transition-all duration-300 ${currentView === 'models'
                            ? 'text-white bg-slate-900 shadow-md'
                            : 'text-brand-slate border border-slate-200 hover:text-slate-900 hover:bg-slate-50'
                            }`}
                    >
                        <BrainCircuit className="w-3.5 h-3.5" />
                        ML Models
                    </button>
                </nav>

                <div className="flex items-center gap-4">
                    <div className="hidden lg:flex flex-col items-end">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-brand-emerald rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                            <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Live Analysis Active</span>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default TopNav;
