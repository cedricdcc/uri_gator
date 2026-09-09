import React from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Concepts from './components/Concepts';

export default function App() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <main style={{ flex: 1 }}>
        <Hero />
        <Concepts />
      </main>
    </div>
  );
}
