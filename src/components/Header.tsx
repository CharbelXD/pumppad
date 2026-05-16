import { useState } from 'react';
import { Rocket, Zap, Menu, X } from 'lucide-react';

type Page = 'home' | 'create' | 'token';

interface HeaderProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

export default function Header({ currentPage, onNavigate }: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);
  const fakeAddress = '7xKXtg...gAsU';

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0f]/95 backdrop-blur-md border-b border-[#1a1a2e]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2 group"
          >
            <div className="relative">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#00ff88] to-[#00cc6a] flex items-center justify-center group-hover:scale-110 transition-transform">
                <Rocket className="w-4 h-4 text-black" />
              </div>
              <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-[#ff6b35] rounded-full flex items-center justify-center">
                <Zap className="w-1.5 h-1.5 text-white" />
              </div>
            </div>
            <span className="font-bold text-lg tracking-tight">
              <span className="text-[#00ff88]">Pump</span>
              <span className="text-white">Pad</span>
            </span>
          </button>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => onNavigate('home')}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                currentPage === 'home'
                  ? 'bg-[#00ff88]/10 text-[#00ff88]'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              Explore
            </button>
            <button
              onClick={() => onNavigate('create')}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                currentPage === 'create'
                  ? 'bg-[#00ff88]/10 text-[#00ff88]'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              Launch Token
            </button>
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setWalletConnected(!walletConnected)}
              className={`hidden md:flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-all border ${
                walletConnected
                  ? 'border-[#00ff88]/30 bg-[#00ff88]/10 text-[#00ff88] hover:bg-[#00ff88]/20'
                  : 'border-[#00ff88] bg-transparent text-[#00ff88] hover:bg-[#00ff88]/10'
              }`}
            >
              {walletConnected ? (
                <>
                  <div className="w-2 h-2 bg-[#00ff88] rounded-full animate-pulse" />
                  {fakeAddress}
                </>
              ) : (
                'Connect Wallet'
              )}
            </button>

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden text-gray-400 hover:text-white p-1"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-[#0a0a0f] border-t border-[#1a1a2e] px-4 py-3 flex flex-col gap-2">
          <button
            onClick={() => { onNavigate('home'); setMobileOpen(false); }}
            className="text-left px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-white/5"
          >
            Explore
          </button>
          <button
            onClick={() => { onNavigate('create'); setMobileOpen(false); }}
            className="text-left px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-white/5"
          >
            Launch Token
          </button>
          <button
            onClick={() => setWalletConnected(!walletConnected)}
            className="text-left px-3 py-2 rounded-lg text-sm text-[#00ff88] border border-[#00ff88]/30"
          >
            {walletConnected ? fakeAddress : 'Connect Wallet'}
          </button>
        </div>
      )}
    </header>
  );
}
