import React, { useState, useEffect } from 'react';
import TopNav from './components/TopNav';
import HeroSection from './components/HeroSection';
import Overview from './components/Overview';
import Analytics from './components/Analytics';
import ProviderRanking from './components/ProviderRanking';
import AnomalyDetection from './components/AnomalyDetection';
import AuditReports from './components/AuditReports';
import DocumentInvestigation from './components/DocumentInvestigation';
import BeneficiaryScanner from './components/BeneficiaryScanner';
import NetworkGraph from './components/NetworkGraph';

function App() {
    const [activeSection, setActiveSection] = useState('overview');
    const [currentView, setCurrentView] = useState('home');

    useEffect(() => {
        if (currentView !== 'home') return;

        const handleScroll = () => {
            const sections = ['overview', 'analytics', 'network', 'beneficiary', 'providers', 'upload', 'audit'];
            let current = '';
            for (const section of sections) {
                const element = document.getElementById(section);
                if (element) {
                    const rect = element.getBoundingClientRect();
                    if (rect.top <= 150) current = section;
                }
            }
            if (current && current !== activeSection) setActiveSection(current);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [activeSection, currentView]);

    return (
        <div className="min-h-screen text-brand-slate flex flex-col font-sans mb-32">
            <TopNav
                activeSection={activeSection}
                currentView={currentView}
                setCurrentView={setCurrentView}
            />

            <main className="flex-1 w-full">
                {currentView === 'home' ? (
                    <>
                        <HeroSection />

                        <div className="max-w-7xl mx-auto px-6 space-y-32">
                            <section id="overview" className="scroll-mt-24">
                                <Overview />
                            </section>

                            <section id="analytics" className="scroll-mt-24">
                                <Analytics />
                            </section>

                            <section id="network" className="scroll-mt-24">
                                <NetworkGraph />
                            </section>

                            <section id="beneficiary" className="scroll-mt-24">
                                <BeneficiaryScanner />
                            </section>

                            <section id="providers" className="scroll-mt-24">
                                <ProviderRanking />
                            </section>

                            <section id="upload" className="scroll-mt-24">
                                <DocumentInvestigation />
                            </section>

                            <section id="audit" className="scroll-mt-24">
                                <AuditReports />
                            </section>
                        </div>
                    </>
                ) : currentView === 'models' ? (
                    <div className="max-w-7xl mx-auto px-6 pt-12">
                        {/* Page Header */}
                        <div className="mb-10 animate-fade-in">
                            <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase mb-2">
                                Machine Learning Models
                            </h2>
                            <p className="text-brand-slate text-sm font-medium">
                                Dedicated view for live Scikit-learn model outputs and isolation forest anomaly detection.
                            </p>
                        </div>
                        <AnomalyDetection />
                    </div>
                ) : null}
            </main>
        </div>
    );
}

export default App;
