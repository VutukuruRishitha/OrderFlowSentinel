import React, { useState, useEffect } from 'react';
import { Navbar, NavPage } from './components/Navbar';
import { UnifiedOrdersPage } from './pages/UnifiedOrdersPage';
import { AuditTrailPage } from './pages/AuditTrailPage';
import { SuccessCelebrationModal } from './components/SuccessCelebrationModal';
import type { Order } from './types';
import { checkBackendConnection } from './services/api';
import { Shield } from 'lucide-react';

export function App() {
  const [activePage, setActivePage] = useState<NavPage>('orders');
  const [backendConnected, setBackendConnected] = useState(false);

  // Celebratory modal state
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [rectifiedOrder, setRectifiedOrder] = useState<Order | null>(null);

  // Probe backend connection
  useEffect(() => {
    const probe = async () => {
      const ok = await checkBackendConnection();
      setBackendConnected(ok);
    };
    probe();
    const interval = setInterval(probe, 6000);
    return () => clearInterval(interval);
  }, []);

  // When an order is successfully rectified
  const handleSuccessRectified = (order: Order) => {
    setRectifiedOrder(order);
    setIsSuccessModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#1A1A1A] text-[#F9F6F0] flex flex-col font-sans selection:bg-[#3B82F6] selection:text-[#FFFFFF]">
      {/* Top Navigation */}
      <Navbar
        activePage={activePage}
        onPageChange={setActivePage}
        backendConnected={backendConnected}
      />

      {/* Main Content Pages */}
      <main className="flex-1">
        {activePage === 'orders' && (
          <UnifiedOrdersPage
            onSuccessRectified={handleSuccessRectified}
          />
        )}

        {activePage === 'audit' && (
          <AuditTrailPage />
        )}
      </main>

      {/* Celebratory Modal After Rectifying Order */}
      <SuccessCelebrationModal
        order={rectifiedOrder}
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
      />

      {/* Clean Footer */}
      <footer className="w-full bg-[#141414] border-t border-[#3B82F6]/20 py-6 px-4 sm:px-6 lg:px-8 text-xs text-[#F9F6F0]/60">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-full bg-[#1A1A1A] border border-[#3B82F6] flex items-center justify-center">
              <Shield className="w-3.5 h-3.5 text-[#3B82F6]" />
            </div>
            <div>
              <p className="font-serif font-bold text-[#F9F6F0]">ORDERFLOW SENTINEL</p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              Autonomous Self-Healing Active
            </span>
            <span className="text-[#333333]">|</span>
            <span className="text-[#60A5FA] font-mono">Executive Edition</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
