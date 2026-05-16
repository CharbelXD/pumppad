import { MessageCircle, TrendingUp, Clock, Zap } from 'lucide-react';
import { Token } from '../lib/supabase';

interface TokenCardProps {
  token: Token;
  onClick: () => void;
}

function formatSOL(val: number) {
  if (val >= 1000) return `${(val / 1000).toFixed(1)}K`;
  return val.toFixed(1);
}

function formatMC(val: number) {
  if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(2)}M`;
  if (val >= 1_000) return `$${(val / 1_000).toFixed(1)}K`;
  return `$${val.toFixed(0)}`;
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function getProgressColor(pct: number) {
  if (pct >= 100) return 'from-[#00ff88] to-[#00cc6a]';
  if (pct >= 75) return 'from-[#00ff88] to-[#ffcc00]';
  if (pct >= 50) return 'from-[#ffcc00] to-[#ff6b35]';
  return 'from-[#ff6b35] to-[#ff4444]';
}

export default function TokenCard({ token, onClick }: TokenCardProps) {
  const progressPct = Math.min((token.raised_amount / token.hard_cap) * 100, 100);
  const statusColors: Record<string, string> = {
    live: 'bg-[#00ff88]/10 text-[#00ff88] border-[#00ff88]/20',
    ended: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
    upcoming: 'bg-[#ffcc00]/10 text-[#ffcc00] border-[#ffcc00]/20',
    finalized: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  };

  return (
    <button
      onClick={onClick}
      className="group w-full text-left bg-[#0d0d1a] border border-[#1a1a2e] rounded-xl overflow-hidden hover:border-[#00ff88]/30 hover:bg-[#0d0d1a]/80 transition-all duration-200 hover:shadow-lg hover:shadow-[#00ff88]/5 hover:-translate-y-0.5"
    >
      {/* Image */}
      <div className="relative aspect-[16/9] overflow-hidden bg-[#1a1a2e]">
        {token.image_url ? (
          <img
            src={token.image_url}
            alt={token.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl">
            🪙
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d1a]/80 via-transparent to-transparent" />
        {token.is_featured && (
          <div className="absolute top-2 left-2 flex items-center gap-1 bg-[#ff6b35] text-white text-xs font-bold px-2 py-0.5 rounded-full">
            <Zap className="w-3 h-3" />
            HOT
          </div>
        )}
        <div className={`absolute top-2 right-2 text-xs font-medium px-2 py-0.5 rounded-full border ${statusColors[token.status]}`}>
          {token.status === 'live' && <span className="inline-block w-1.5 h-1.5 bg-[#00ff88] rounded-full mr-1 animate-pulse" />}
          {token.status.toUpperCase()}
        </div>
      </div>

      {/* Content */}
      <div className="p-3">
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <div>
            <h3 className="font-bold text-white text-sm leading-tight">{token.name}</h3>
            <span className="text-[#00ff88] text-xs font-mono font-semibold">${token.symbol}</span>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-500">MKT CAP</div>
            <div className="text-xs font-bold text-white">{formatMC(token.market_cap)}</div>
          </div>
        </div>

        <p className="text-gray-500 text-xs line-clamp-2 mb-3 leading-relaxed">{token.description}</p>

        {/* Progress bar */}
        <div className="mb-2">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>{formatSOL(token.raised_amount)} SOL raised</span>
            <span>{progressPct.toFixed(0)}%</span>
          </div>
          <div className="w-full h-1.5 bg-[#1a1a2e] rounded-full overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${getProgressColor(progressPct)} rounded-full transition-all`}
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-600 mt-1">
            <span>Goal: {formatSOL(token.soft_cap)} SOL</span>
            <span>Max: {formatSOL(token.hard_cap)} SOL</span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-[#1a1a2e]">
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <MessageCircle className="w-3 h-3" />
              {token.replies_count}
            </span>
            <span className="flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              {formatSOL(token.raised_amount)} SOL
            </span>
          </div>
          <span className="flex items-center gap-1 text-xs text-gray-600">
            <Clock className="w-3 h-3" />
            {timeAgo(token.created_at)}
          </span>
        </div>
      </div>
    </button>
  );
}
