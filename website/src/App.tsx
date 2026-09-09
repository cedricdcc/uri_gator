import React from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Concepts from './components/Concepts';
import UsageGuides from './components/UsageGuides';
import PlaygroundSection from './components/Playground/PlaygroundSection';
import Footer from './components/Footer';

export default function App() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <a href="#playground" className="skip-link">
        Skip to Discovery Studio
      </a>
      <Navbar />
      <main id="main-content" style={{ flex: 1 }}>
        <Hero />
        <Concepts />
        <UsageGuides />
        <PlaygroundSection />
      </main>
      <Footer />
    </div>
  );
}
