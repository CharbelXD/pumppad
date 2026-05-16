import { useState, useEffect } from 'react';
import {
  ArrowLeft, Globe, Twitter, Send, Copy, ExternalLink,
  TrendingUp, Users, Clock, CheckCircle, MessageCircle,
  Zap, AlertCircle
} from 'lucide-react';
import { supabase, Token, Contribution, Comment } from '../lib/supabase';

interface TokenPageProps {
  tokenId: string;
  onBack: () => void;
}

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function shortenAddr(addr: string) {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export default function TokenPage({ tokenId, onBack }: TokenPageProps) {
  const [token, setToken] = useState<Token | null>(null);
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [buyAmount, setBuyAmount] = useState('');
  const [commentText, setCommentText] = useState('');
  const [buyLoading, setBuyLoading] = useState(false);
  const [commentLoading, setCommentLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [tab, setTab] = useState<'info' | 'trades' | 'comments'>('info');

  useEffect(() => {
    fetchAll();
    const channel = supabase
      .channel(`token-${tokenId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'contributions', filter: `token_id=eq.${tokenId}` }, fetchAll)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'comments', filter: `token_id=eq.${tokenId}` }, () => fetchComments())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [tokenId]);

  async function fetchAll() {
    const [tokenRes, contribRes, commentRes] = await Promise.all([
      supabase.from('tokens').select('*').eq('id', tokenId).maybeSingle(),
      supabase.from('contributions').select('*').eq('token_id', tokenId).order('created_at', { ascending: false }),
      supabase.from('comments').select('*').eq('token_id', tokenId).order('created_at', { ascending: false }),
    ]);
    if (tokenRes.data) setToken(tokenRes.data as Token);
    if (contribRes.data) setContributions(contribRes.data as Contribution[]);
    if (commentRes.data) setComments(commentRes.data as Comment[]);
    setLoading(false);
  }

  async function fetchComments() {
    const { data } = await supabase.from('comments').select('*').eq('token_id', tokenId).order('created_at', { ascending: false });
    if (data) setComments(data as Comment[]);
  }

  async function handleBuy() {
    if (!token || !buyAmount || parseFloat(buyAmount) <= 0) return;
    setBuyLoading(true);

    const amountSol = parseFloat(buyAmount);
    const tokensAllocated = amountSol / token.presale_price;
    const newRaised = Math.min(token.raised_amount + amountSol, token.hard_cap);
    const contributors = ['8xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsV', '9mNPcE3zBVKk2vXkFz2zBcnGGgNzKAMmWiPiMLzFxpQL', '5kCDnFy9MEP4FdUxGUBGRqfVb8vSZM9NKQ6FWHRhGxpP'];

    await Promise.all([
      supabase.from('contributions').insert({
        token_id: tokenId,
        contributor_address: contributors[Math.floor(Math.random() * contributors.length)],
        amount_sol: amountSol,
        tokens_allocated: tokensAllocated,
        tx_hash: `${Math.random().toString(36).slice(2)}${Math.random().toString(36).slice(2)}`,
      }),
      supabase.from('tokens').update({
        raised_amount: newRaised,
        market_cap: newRaised * 1000,
        status: newRaised >= token.hard_cap ? 'ended' : 'live',
      }).eq('id', tokenId),
    ]);

    setBuyAmount('');
    setBuyLoading(false);
    await fetchAll();
  }

  async function handleComment() {
    if (!commentText.trim()) return;
    setCommentLoading(true);
    const names = ['CryptoWhale', 'DiamondHands', 'MoonBoi', 'DeFiDegen', 'SolanaFan', 'Wen Moon', 'NGMI', 'WAGMI'];
    await supabase.from('comments').insert({
      token_id: tokenId,
      author_address: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
      author_name: names[Math.floor(Math.random() * names.length)],
      content: commentText.trim(),
    });
    await supabase.from('tokens').update({ replies_count: (token?.replies_count ?? 0) + 1 }).eq('id', tokenId);
    setCommentText('');
    setCommentLoading(false);
    await fetchComments();
  }

  function copyMint() {
    if (token) {
      navigator.clipboard.writeText(token.mint_address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#07070f] pt-14 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#00ff88]/30 border-t-[#00ff88] rounded-full animate-spin" />
      </div>
    );
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-[#07070f] pt-14 flex items-center justify-center">
        <div className="text-gray-400">Token not found</div>
      </div>
    );
  }

  const progressPct = Math.min((token.raised_amount / token.hard_cap) * 100, 100);
  const tokensForAmount = buyAmount ? parseFloat(buyAmount) / token.presale_price : 0;

  return (
    <div className="min-h-screen bg-[#07070f] pt-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Back */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 text-sm transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to explore
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left — token info */}
          <div className="lg:col-span-2 space-y-5">
            {/* Token header */}
            <div className="bg-[#0d0d1a] border border-[#1a1a2e] rounded-2xl overflow-hidden">
              {token.image_url && (
                <div className="relative h-52 overflow-hidden">
                  <img src={token.image_url} alt={token.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d1a] via-[#0d0d1a]/40 to-transparent" />
                  <div className="absolute bottom-4 left-4 flex items-center gap-3">
                    <div>
                      <h1 className="text-2xl font-black text-white">{token.name}</h1>
                      <div className="flex items-center gap-2">
                        <span className="text-[#00ff88] font-mono font-bold">${token.symbol}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${
                          token.status === 'live' ? 'bg-[#00ff88]/10 text-[#00ff88] border-[#00ff88]/20' :
                          token.status === 'ended' ? 'bg-gray-500/10 text-gray-400 border-gray-500/20' :
                          'bg-[#ffcc00]/10 text-[#ffcc00] border-[#ffcc00]/20'
                        }`}>
                          {token.status === 'live' && <span className="inline-block w-1.5 h-1.5 bg-[#00ff88] rounded-full mr-1 animate-pulse" />}
                          {token.status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div className="p-5">
                {!token.image_url && (
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h1 className="text-2xl font-black text-white">{token.name}</h1>
                      <span className="text-[#00ff88] font-mono font-bold">${token.symbol}</span>
                    </div>
                  </div>
                )}
                <p className="text-gray-400 text-sm leading-relaxed mb-4">{token.description}</p>

                {/* Socials */}
                <div className="flex items-center gap-3">
                  {token.website && (
                    <a href={token.website} target="_blank" rel="noreferrer"
                      className="flex items-center gap-1 text-xs text-gray-500 hover:text-white transition-colors">
                      <Globe className="w-3.5 h-3.5" /> Website
                    </a>
                  )}
                  {token.twitter && (
                    <span className="flex items-center gap-1 text-xs text-gray-500 hover:text-white cursor-pointer transition-colors">
                      <Twitter className="w-3.5 h-3.5" /> {token.twitter}
                    </span>
                  )}
                  {token.telegram && (
                    <span className="flex items-center gap-1 text-xs text-gray-500 hover:text-white cursor-pointer transition-colors">
                      <Send className="w-3.5 h-3.5" /> {token.telegram}
                    </span>
                  )}
                </div>

                {/* Mint address */}
                <div className="mt-4 flex items-center gap-2 bg-[#0a0a0f] border border-[#1a1a2e] rounded-lg px-3 py-2">
                  <span className="text-xs text-gray-500">Mint:</span>
                  <span className="text-xs text-gray-300 font-mono flex-1 truncate">{token.mint_address}</span>
                  <button onClick={copyMint} className="text-gray-500 hover:text-[#00ff88] transition-colors">
                    {copied ? <CheckCircle className="w-4 h-4 text-[#00ff88]" /> : <Copy className="w-4 h-4" />}
                  </button>
                  <ExternalLink className="w-4 h-4 text-gray-600 cursor-pointer hover:text-gray-400 transition-colors" />
                </div>
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Market Cap', value: `$${token.market_cap.toLocaleString()}`, icon: TrendingUp, color: 'text-[#00ff88]' },
                { label: 'Total Raised', value: `${token.raised_amount.toFixed(2)} SOL`, icon: Zap, color: 'text-[#ffcc00]' },
                { label: 'Contributors', value: contributions.length.toString(), icon: Users, color: 'text-blue-400' },
                { label: 'Replies', value: token.replies_count.toString(), icon: MessageCircle, color: 'text-[#ff6b35]' },
              ].map(stat => {
                const Icon = stat.icon;
                return (
                  <div key={stat.label} className="bg-[#0d0d1a] border border-[#1a1a2e] rounded-xl p-3">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Icon className={`w-3.5 h-3.5 ${stat.color}`} />
                      <span className="text-xs text-gray-500">{stat.label}</span>
                    </div>
                    <div className={`text-sm font-bold ${stat.color}`}>{stat.value}</div>
                  </div>
                );
              })}
            </div>

            {/* Tabs */}
            <div className="bg-[#0d0d1a] border border-[#1a1a2e] rounded-2xl overflow-hidden">
              <div className="flex border-b border-[#1a1a2e]">
                {(['info', 'trades', 'comments'] as const).map(t => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={`flex-1 py-3 text-sm font-medium capitalize transition-colors ${
                      tab === t ? 'text-[#00ff88] border-b-2 border-[#00ff88]' : 'text-gray-500 hover:text-gray-300'
                    }`}
                  >
                    {t}
                    {t === 'comments' && comments.length > 0 && (
                      <span className="ml-1 text-xs bg-[#1a1a2e] px-1.5 py-0.5 rounded-full">{comments.length}</span>
                    )}
                  </button>
                ))}
              </div>

              <div className="p-4">
                {tab === 'info' && (
                  <div className="space-y-3">
                    {[
                      ['Total Supply', parseInt(token.total_supply as unknown as string).toLocaleString()],
                      ['Presale Price', `${token.presale_price} SOL`],
                      ['Soft Cap', `${token.soft_cap} SOL`],
                      ['Hard Cap', `${token.hard_cap} SOL`],
                      ['Category', token.category],
                      ['Creator', shortenAddr(token.creator_address)],
                    ].map(([k, v]) => (
                      <div key={k} className="flex justify-between text-sm">
                        <span className="text-gray-500">{k}</span>
                        <span className="text-white font-mono capitalize">{v}</span>
                      </div>
                    ))}
                  </div>
                )}

                {tab === 'trades' && (
                  <div>
                    {contributions.length === 0 ? (
                      <div className="text-center py-8 text-gray-500 text-sm">No contributions yet</div>
                    ) : (
                      <div className="space-y-2">
                        {contributions.map(c => (
                          <div key={c.id} className="flex items-center justify-between py-2 border-b border-[#1a1a2e] last:border-0">
                            <div>
                              <div className="text-xs text-gray-300 font-mono">{shortenAddr(c.contributor_address)}</div>
                              <div className="text-xs text-gray-500 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatTime(c.created_at)}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-bold text-[#00ff88]">{c.amount_sol} SOL</div>
                              <div className="text-xs text-gray-500">{c.tokens_allocated.toLocaleString()} {token.symbol}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {tab === 'comments' && (
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <input
                        value={commentText}
                        onChange={e => setCommentText(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleComment()}
                        placeholder="Add a comment..."
                        className="flex-1 bg-[#0a0a0f] border border-[#1a1a2e] text-white placeholder-gray-600 text-sm px-3 py-2 rounded-lg focus:outline-none focus:border-[#00ff88]/50 transition-colors"
                      />
                      <button
                        onClick={handleComment}
                        disabled={!commentText.trim() || commentLoading}
                        className="bg-[#00ff88]/10 hover:bg-[#00ff88]/20 border border-[#00ff88]/30 text-[#00ff88] px-3 py-2 rounded-lg text-sm transition-colors disabled:opacity-50"
                      >
                        Post
                      </button>
                    </div>
                    {comments.length === 0 ? (
                      <div className="text-center py-6 text-gray-500 text-sm">No comments yet. Be first!</div>
                    ) : (
                      comments.map(c => (
                        <div key={c.id} className="flex gap-3 py-3 border-b border-[#1a1a2e] last:border-0">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#00ff88]/30 to-[#00cc6a]/30 flex items-center justify-center text-[#00ff88] text-xs font-bold flex-shrink-0">
                            {c.author_name[0]}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="text-xs font-medium text-white">{c.author_name}</span>
                              <span className="text-xs text-gray-600">{formatTime(c.created_at)}</span>
                            </div>
                            <p className="text-sm text-gray-400">{c.content}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right — buy panel */}
          <div className="space-y-4">
            {/* Progress */}
            <div className="bg-[#0d0d1a] border border-[#1a1a2e] rounded-2xl p-5">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">Progress</span>
                <span className="text-white font-bold">{progressPct.toFixed(1)}%</span>
              </div>
              <div className="w-full h-3 bg-[#1a1a2e] rounded-full overflow-hidden mb-3">
                <div
                  className="h-full bg-gradient-to-r from-[#00ff88] to-[#00cc6a] rounded-full transition-all duration-500"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>{token.raised_amount.toFixed(2)} SOL raised</span>
                <span>{token.hard_cap} SOL goal</span>
              </div>
              {progressPct >= 100 && (
                <div className="mt-3 flex items-center gap-2 bg-[#00ff88]/10 border border-[#00ff88]/20 rounded-lg px-3 py-2">
                  <CheckCircle className="w-4 h-4 text-[#00ff88]" />
                  <span className="text-xs text-[#00ff88] font-medium">Fully funded!</span>
                </div>
              )}
            </div>

            {/* Buy */}
            {token.status === 'live' && (
              <div className="bg-[#0d0d1a] border border-[#1a1a2e] rounded-2xl p-5">
                <h3 className="text-white font-bold mb-4">Participate in Presale</h3>

                <div className="mb-4">
                  <label className="block text-xs text-gray-500 mb-1.5">Amount (SOL)</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={buyAmount}
                      onChange={e => setBuyAmount(e.target.value)}
                      placeholder="0.0"
                      className="w-full bg-[#0a0a0f] border border-[#1a1a2e] text-white text-sm px-3 py-3 rounded-xl focus:outline-none focus:border-[#00ff88]/50 transition-colors"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">SOL</span>
                  </div>
                  {/* Quick amounts */}
                  <div className="flex gap-2 mt-2">
                    {['0.1', '0.5', '1', '5'].map(amt => (
                      <button
                        key={amt}
                        onClick={() => setBuyAmount(amt)}
                        className="flex-1 text-xs bg-[#1a1a2e] hover:bg-[#00ff88]/10 hover:text-[#00ff88] text-gray-400 py-1.5 rounded-lg transition-colors"
                      >
                        {amt}
                      </button>
                    ))}
                  </div>
                </div>

                {buyAmount && parseFloat(buyAmount) > 0 && (
                  <div className="bg-[#0a0a0f] border border-[#1a1a2e] rounded-xl p-3 mb-4 space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">You pay</span>
                      <span className="text-white">{buyAmount} SOL</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">You receive</span>
                      <span className="text-[#00ff88]">{tokensForAmount.toLocaleString()} {token.symbol}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Price per token</span>
                      <span className="text-white">{token.presale_price} SOL</span>
                    </div>
                  </div>
                )}

                <button
                  onClick={handleBuy}
                  disabled={!buyAmount || parseFloat(buyAmount) <= 0 || buyLoading}
                  className="w-full bg-[#00ff88] hover:bg-[#00e07a] disabled:bg-[#00ff88]/30 disabled:cursor-not-allowed text-black font-bold py-3 rounded-xl text-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  {buyLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                      Processing...
                    </span>
                  ) : 'Buy Now'}
                </button>

                <div className="mt-3 flex items-start gap-2 text-xs text-gray-600">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                  Demo mode — no real transactions. Connect a wallet on mainnet to participate.
                </div>
              </div>
            )}

            {token.status === 'ended' && (
              <div className="bg-[#0d0d1a] border border-[#1a1a2e] rounded-2xl p-5 text-center">
                <CheckCircle className="w-10 h-10 text-[#00ff88] mx-auto mb-2" />
                <div className="text-white font-bold mb-1">Presale Ended</div>
                <div className="text-gray-500 text-sm">This presale has concluded successfully</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
