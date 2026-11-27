import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import AgentTasks from '../components/AgentTasks';
import WhyItMatters from '../components/WhyItMatters';
import FeaturesStrip from '../components/FeaturesStrip';
import Footer from '../components/Footer';
import DemoModal from '../components/DemoModal';

export default function LandingPage() {
  const [demoOpen, setDemoOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F5EDE3] text-[#1E1714] flex flex-col font-sans selection:bg-[#8B5A2B]/20 selection:text-[#1E1714]">
      {/* 1. Navbar */}
      <Navbar onOpenDemo={() => setDemoOpen(true)} />

      {/* Main Content Sections */}
      <main className="flex-1">
        {/* 2. Hero Section */}
        <Hero onOpenDemo={() => setDemoOpen(true)} />

        {/* 3. The Agent / Daily shop tasks ("Our Menu" retitled) */}
        <AgentTasks onOpenDemo={() => setDemoOpen(true)} />

        {/* 4. Why It Matters Split Section ("Our Story" retitled) */}
        <WhyItMatters onOpenDemo={() => setDemoOpen(true)} />

        {/* 5. Features Strip with 4 items & thin vertical dividers */}
        <FeaturesStrip />
      </main>

      {/* 6. Dark Footer */}
      <Footer />

      {/* Interactive AgntID Demo Modal */}
      <DemoModal isOpen={demoOpen} onClose={() => setDemoOpen(false)} />
    </div>
  );
}
