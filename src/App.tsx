import * as React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navigation } from '@/components/Navigation';
import { Dashboard } from '@/pages/Dashboard';
import { MarketData } from '@/pages/MarketData';
import { Analysis } from '@/pages/Analysis';
import { Portfolio } from '@/pages/Portfolio';
import Collections from '@/pages/Collections';
import NFTAnalysis from '@/pages/NFTAnalysis';
import IndividualNFTAnalysis from '@/pages/IndividualNFTAnalysis';
import Chat from '@/pages/Chat';
import './index.css';

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background text-foreground">
        <Navigation />
        <main className="container mx-auto px-4 py-6 pb-20 md:pb-6">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/market-data" element={<MarketData />} />
            <Route path="/analysis" element={<Analysis />} />
            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="/collections" element={<Collections />} />
            <Route path="/nft-analysis" element={<NFTAnalysis />} />
            <Route path="/nft-analysis/:id" element={<IndividualNFTAnalysis />} />
            <Route path="/chat" element={<Chat />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
