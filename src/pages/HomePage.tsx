import { useState, useEffect } from 'react';
import { Search, TrendingUp, Flame, Clock, Star, Filter, ChevronDown } from 'lucide-react';
import { supabase, Token } from '../lib/supabase';
import TokenCard from '../components/TokenCard';

type SortOption = 'trending' | 'new' | 'top' | 'featured';
type StatusFilter = 'all' | 'live' | 'upcoming' | 'ended';

interface HomePageProps {
  onSelectToken: (token: Token) => void;
  onNavigateCreate: () => void;
}

const SORT_OPTIONS = [
  { value: 'trending' as SortOption, label: 'Trending', icon: Flame },
  { value: 'new' as SortOption, label: 'New', icon: Clock },
  { value: 'top' as SortOption, label: 'Top Raised', icon: TrendingUp },
  { value: 'featured' as SortOption, label: 'Featured', icon: Star },
];

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'live', label: 'Live' },
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'ended', label: 'Ended' },
];

export default function HomePage({ onSelectToken, onNavigateCreate }: HomePageProps) {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortOption>('trending');
  const [status, setStatus] = useState<StatusFilter>('all');
  const [filterOpen, setFilterOpen] = useState(false);
  const [stats, setStats] = useState({ totalRaised: 0, liveCount: 0, totalTokens: 0 });

  useEffect(() => {
    fetchTokens();
    const channel = supabase
      .channel('tokens-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tokens' }, () => {
        fetchTokens();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  async function fetchTokens() {
    const { data } = await supabase.from('tokens').select('*').order('created_at', { ascending: false });
    if (data) {
      setTokens(data as Token[]);
      setStats({
        totalRaised: data.reduce((s, t) => s + t.raised_amount, 0),
        liveCount: data.filter(t => t.status === 'live').length,
        totalTokens: data.length,
      });
    }
    setLoading(false);
  }

  const filtered = tokens
    .filter(t => {
      const q = search.toLowerCase();
      const matchSearch = !q || t.name.toLowerCase().includes(q) || t.symbol.toLowerCase().includes(q);
      const matchStatus = status === 'all' || t.status === status;
      return matchSearch && matchStatus;
    })
    .sort((a, b) => {
      if (sort === 'trending') return b.replies_count - a.replies_count;
      if (sort === 'new') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      if (sort === 'top') return b.raised_amount - a.raised_amount;
      if (sort === 'featured') return (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0);
      return 0;
    });

  return (
    <div className="min-h-screen bg-[#07070f] pt-14">
      {/* Hero ticker */}
      <div className="bg-[#00ff88]/5 border-b border-[#00ff88]/10 overflow-hidden">
        <div className="flex animate-marquee whitespace-nowrap py-2">
          {[...tokens, ...tokens].map((t, i) => (
            <span key={i} className="inline-flex items-center gap-2 px-6 text-xs text-gray-400">
              <span className="text-[#00ff88] font-mono">${t.symbol}</span>
              <span>{((t.raised_amount / t.hard_cap) * 100).toFixed(0)}%</span>
              <span className="text-gray-600">•</span>
            </span>
          ))}
        </div>
      </div>

      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-b from-[#0a0a1a] to-[#07070f] py-12 px-4">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#00ff88]/3 rounded-full blur-3xl" />
          <div className="absolute top-0 right-1/4 w-64 h-64 bg-[#ff6b35]/3 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-[#00ff88]/10 border border-[#00ff88]/20 text-[#00ff88] text-xs px-3 py-1 rounded-full mb-4">
            <span className="w-1.5 h-1.5 bg-[#00ff88] rounded-full animate-pulse" />
            Live on Solana
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-3 tracking-tight">
            Launch your token<br />
            <span className="text-[#00ff88]">fair & transparent</span>
          </h1>
          <p className="text-gray-400 text-lg mb-8 max-w-xl mx-auto">
            The fairest token launchpad on Solana. No VC allocation, no insider deals — just community-driven presales.
          </p>

          {/* Stats */}
          <div className="flex items-center justify-center gap-8 mb-8">
            <div className="text-center">
              <div className="text-2xl font-black text-white">{stats.totalRaised.toFixed(0)} SOL</div>
              <div className="text-xs text-gray-500">Total Raised</div>
            </div>
            <div className="w-px h-8 bg-[#1a1a2e]" />
            <div className="text-center">
              <div className="text-2xl font-black text-[#00ff88]">{stats.liveCount}</div>
              <div className="text-xs text-gray-500">Live Presales</div>
            </div>
            <div className="w-px h-8 bg-[#1a1a2e]" />
            <div className="text-center">
              <div className="text-2xl font-black text-white">{stats.totalTokens}</div>
              <div className="text-xs text-gray-500">Tokens Launched</div>
            </div>
          </div>

          <button
            onClick={onNavigateCreate}
            className="inline-flex items-center gap-2 bg-[#00ff88] hover:bg-[#00e07a] text-black font-bold px-8 py-3 rounded-xl transition-all hover:scale-105 active:scale-95 shadow-lg shadow-[#00ff88]/20"
          >
            Launch Your Token
            <TrendingUp className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search tokens..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-[#0d0d1a] border border-[#1a1a2e] text-white placeholder-gray-500 text-sm pl-10 pr-4 py-2.5 rounded-xl focus:outline-none focus:border-[#00ff88]/50 transition-colors"
            />
          </div>

          {/* Sort tabs */}
          <div className="flex gap-1 bg-[#0d0d1a] border border-[#1a1a2e] rounded-xl p-1">
            {SORT_OPTIONS.map(opt => {
              const Icon = opt.icon;
              return (
                <button
                  key={opt.value}
                  onClick={() => setSort(opt.value)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    sort === opt.value
                      ? 'bg-[#00ff88]/10 text-[#00ff88]'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{opt.label}</span>
                </button>
              );
            })}
          </div>

          {/* Status filter */}
          <div className="relative">
            <button
              onClick={() => setFilterOpen(!filterOpen)}
              className="flex items-center gap-2 bg-[#0d0d1a] border border-[#1a1a2e] text-gray-300 text-sm px-4 py-2.5 rounded-xl hover:border-[#00ff88]/30 transition-colors"
            >
              <Filter className="w-4 h-4" />
              {STATUS_OPTIONS.find(o => o.value === status)?.label}
              <ChevronDown className={`w-4 h-4 transition-transform ${filterOpen ? 'rotate-180' : ''}`} />
            </button>
            {filterOpen && (
              <div className="absolute right-0 mt-1 w-40 bg-[#0d0d1a] border border-[#1a1a2e] rounded-xl overflow-hidden shadow-xl z-10">
                {STATUS_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => { setStatus(opt.value); setFilterOpen(false); }}
                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                      status === opt.value
                        ? 'bg-[#00ff88]/10 text-[#00ff88]'
                        : 'text-gray-400 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-[#0d0d1a] border border-[#1a1a2e] rounded-xl overflow-hidden animate-pulse">
                <div className="aspect-[16/9] bg-[#1a1a2e]" />
                <div className="p-3 space-y-2">
                  <div className="h-4 bg-[#1a1a2e] rounded w-3/4" />
                  <div className="h-3 bg-[#1a1a2e] rounded w-full" />
                  <div className="h-2 bg-[#1a1a2e] rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <div className="text-gray-400 text-lg font-medium">No tokens found</div>
            <div className="text-gray-600 text-sm mt-1">Try adjusting your search or filters</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map(token => (
              <TokenCard key={token.id} token={token} onClick={() => onSelectToken(token)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
