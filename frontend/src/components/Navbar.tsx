import React from 'react';
import { Shield, ShoppingBag, FileText, CheckCircle2 } from 'lucide-react';

export type NavPage = 'orders' | 'audit';

interface NavbarProps {
  activePage: NavPage;
  onPageChange: (page: NavPage) => void;
  backendConnected: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activePage,
  onPageChange,
  backendConnected,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-[#1A1A1A]/95 backdrop-blur-md border-b border-[#3B82F6]/25 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-3.5 cursor-pointer" onClick={() => onPageChange('orders')}>
            <div className="relative flex items-center justify-center w-12 h-12 rounded-full bg-[#1A1A1A] border-2 border-[#3B82F6] shadow-[0_0_15px_rgba(59,130,246,0.35)]">
              <Shield className="w-6 h-6 text-[#3B82F6]" />
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-[#1A1A1A]"></div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-serif font-bold tracking-wider text-[#F9F6F0]">ORDERFLOW</span>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-[#3B82F6]/20 text-[#60A5FA] border border-[#3B82F6]/40 tracking-widest">
                  SENTINEL
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Tabs (Only functional, clean tabs) */}
          <nav className="flex items-center gap-2 p-1.5 rounded-xl bg-[#222222] border border-[#3B82F6]/20">
            <button
              onClick={() => onPageChange('orders')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-medium tracking-wide transition-all ${
                activePage === 'orders'
                  ? 'bg-[#3B82F6] text-[#FFFFFF] font-bold shadow-[0_0_12px_rgba(59,130,246,0.35)]'
                  : 'text-[#F9F6F0]/80 hover:text-[#F9F6F0] hover:bg-[#2A2A2A]'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Orders & Sentinel Operations</span>
            </button>

            <button
              onClick={() => onPageChange('audit')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-medium tracking-wide transition-all ${
                activePage === 'audit'
                  ? 'bg-[#3B82F6] text-[#FFFFFF] font-bold shadow-[0_0_12px_rgba(59,130,246,0.35)]'
                  : 'text-[#F9F6F0]/80 hover:text-[#F9F6F0] hover:bg-[#2A2A2A]'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Incident Audit Log</span>
            </button>
          </nav>

          {/* Right Status Indicator */}
          <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#242424] border border-[#3A3A3A] text-xs">
            <span className={`w-2 h-2 rounded-full ${backendConnected ? 'bg-emerald-400 animate-ping' : 'bg-[#3B82F6]'}`}></span>
            <span className="text-[#F9F6F0]/80 font-mono text-[11px]">
              {backendConnected ? 'Spring Boot REST Online' : 'Sentinel Simulation Engine Active'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
