import { useState } from 'react';
import { Upload, Globe, Twitter, Send, ChevronRight, Info, Rocket } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface CreateTokenPageProps {
  onSuccess: (tokenId: string) => void;
}

const CATEGORIES = ['meme', 'defi', 'nft', 'gaming', 'ai', 'other'];

export default function CreateTokenPage({ onSuccess }: CreateTokenPageProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    symbol: '',
    description: '',
    image_url: '',
    website: '',
    twitter: '',
    telegram: '',
    total_supply: '1000000000',
    presale_price: '0.000001',
    soft_cap: '10',
    hard_cap: '100',
    category: 'meme',
  });

  function set(key: string, value: string) {
    setForm(f => ({ ...f, [key]: value }));
  }

  async function handleSubmit() {
    setLoading(true);
    const mintAddress = `${form.symbol.toUpperCase()}sol${Math.random().toString(36).slice(2, 14)}`;
    const creatorAddress = '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU';

    const { data, error } = await supabase
      .from('tokens')
      .insert({
        name: form.name,
        symbol: form.symbol.toUpperCase(),
        description: form.description,
        image_url: form.image_url || 'https://images.pexels.com/photos/844124/pexels-photo-844124.jpeg?auto=compress&cs=tinysrgb&w=400',
        website: form.website,
        twitter: form.twitter,
        telegram: form.telegram,
        creator_address: creatorAddress,
        mint_address: mintAddress,
        total_supply: parseInt(form.total_supply),
        presale_price: parseFloat(form.presale_price),
        soft_cap: parseFloat(form.soft_cap),
        hard_cap: parseFloat(form.hard_cap),
        raised_amount: 0,
        status: 'live',
        category: form.category,
        market_cap: 0,
        is_featured: false,
        replies_count: 0,
      })
      .select()
      .single();

    setLoading(false);
    if (!error && data) {
      onSuccess(data.id);
    }
  }

  const step1Valid = form.name && form.symbol && form.description;
  const step2Valid = form.presale_price && form.soft_cap && form.hard_cap && form.total_supply;

  return (
    <div className="min-h-screen bg-[#07070f] pt-14">
      <div className="max-w-2xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-[#00ff88]/10 border border-[#00ff88]/20 rounded-2xl mb-4">
            <Rocket className="w-6 h-6 text-[#00ff88]" />
          </div>
          <h1 className="text-3xl font-black text-white mb-2">Launch Your Token</h1>
          <p className="text-gray-500 text-sm">Fair launch on Solana — no VC, no pre-mine</p>
        </div>

        {/* Steps */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3].map(s => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                s < step ? 'bg-[#00ff88] text-black' :
                s === step ? 'bg-[#00ff88]/20 text-[#00ff88] border border-[#00ff88]/50' :
                'bg-[#1a1a2e] text-gray-500'
              }`}>
                {s < step ? '✓' : s}
              </div>
              {s < 3 && <div className={`w-12 h-px ${s < step ? 'bg-[#00ff88]/50' : 'bg-[#1a1a2e]'}`} />}
            </div>
          ))}
        </div>
        <div className="flex justify-center gap-14 text-xs text-gray-500 mb-8 -mt-4">
          <span className={step >= 1 ? 'text-[#00ff88]' : ''}>Token Info</span>
          <span className={step >= 2 ? 'text-[#00ff88]' : ''}>Presale Setup</span>
          <span className={step >= 3 ? 'text-[#00ff88]' : ''}>Review</span>
        </div>

        <div className="bg-[#0d0d1a] border border-[#1a1a2e] rounded-2xl p-6">
          {/* Step 1 */}
          {step === 1 && (
            <div className="space-y-5">
              <h2 className="text-white font-bold text-lg mb-5">Token Information</h2>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Token Name *</label>
                  <input
                    value={form.name}
                    onChange={e => set('name', e.target.value)}
                    placeholder="e.g. PepeCoin"
                    className="w-full bg-[#0a0a0f] border border-[#1a1a2e] text-white placeholder-gray-600 text-sm px-3 py-2.5 rounded-lg focus:outline-none focus:border-[#00ff88]/50 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Symbol *</label>
                  <input
                    value={form.symbol}
                    onChange={e => set('symbol', e.target.value.toUpperCase().slice(0, 10))}
                    placeholder="e.g. PEPE"
                    className="w-full bg-[#0a0a0f] border border-[#1a1a2e] text-white placeholder-gray-600 text-sm px-3 py-2.5 rounded-lg focus:outline-none focus:border-[#00ff88]/50 transition-colors font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Description *</label>
                <textarea
                  value={form.description}
                  onChange={e => set('description', e.target.value)}
                  placeholder="Tell the world about your token..."
                  rows={3}
                  className="w-full bg-[#0a0a0f] border border-[#1a1a2e] text-white placeholder-gray-600 text-sm px-3 py-2.5 rounded-lg focus:outline-none focus:border-[#00ff88]/50 transition-colors resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Category</label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      onClick={() => set('category', cat)}
                      className={`px-3 py-1 rounded-lg text-xs font-medium capitalize transition-all ${
                        form.category === cat
                          ? 'bg-[#00ff88]/10 text-[#00ff88] border border-[#00ff88]/30'
                          : 'bg-[#0a0a0f] border border-[#1a1a2e] text-gray-400 hover:text-white'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">
                  <Upload className="w-3.5 h-3.5 inline mr-1" />
                  Image URL
                </label>
                <input
                  value={form.image_url}
                  onChange={e => set('image_url', e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-[#0a0a0f] border border-[#1a1a2e] text-white placeholder-gray-600 text-sm px-3 py-2.5 rounded-lg focus:outline-none focus:border-[#00ff88]/50 transition-colors"
                />
                {form.image_url && (
                  <div className="mt-2 w-20 h-20 rounded-lg overflow-hidden border border-[#1a1a2e]">
                    <img src={form.image_url} alt="preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">
                    <Globe className="w-3.5 h-3.5 inline mr-1" />Website
                  </label>
                  <input
                    value={form.website}
                    onChange={e => set('website', e.target.value)}
                    placeholder="https://..."
                    className="w-full bg-[#0a0a0f] border border-[#1a1a2e] text-white placeholder-gray-600 text-xs px-3 py-2.5 rounded-lg focus:outline-none focus:border-[#00ff88]/50 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">
                    <Twitter className="w-3.5 h-3.5 inline mr-1" />Twitter
                  </label>
                  <input
                    value={form.twitter}
                    onChange={e => set('twitter', e.target.value)}
                    placeholder="@handle"
                    className="w-full bg-[#0a0a0f] border border-[#1a1a2e] text-white placeholder-gray-600 text-xs px-3 py-2.5 rounded-lg focus:outline-none focus:border-[#00ff88]/50 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">
                    <Send className="w-3.5 h-3.5 inline mr-1" />Telegram
                  </label>
                  <input
                    value={form.telegram}
                    onChange={e => set('telegram', e.target.value)}
                    placeholder="@group"
                    className="w-full bg-[#0a0a0f] border border-[#1a1a2e] text-white placeholder-gray-600 text-xs px-3 py-2.5 rounded-lg focus:outline-none focus:border-[#00ff88]/50 transition-colors"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <div className="space-y-5">
              <h2 className="text-white font-bold text-lg mb-5">Presale Configuration</h2>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Total Supply</label>
                <div className="relative">
                  <input
                    type="number"
                    value={form.total_supply}
                    onChange={e => set('total_supply', e.target.value)}
                    className="w-full bg-[#0a0a0f] border border-[#1a1a2e] text-white text-sm px-3 py-2.5 rounded-lg focus:outline-none focus:border-[#00ff88]/50 transition-colors"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">tokens</div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">
                  Presale Price (SOL per token)
                  <span className="ml-1 text-gray-600">
                    <Info className="w-3 h-3 inline" />
                  </span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.0000001"
                    value={form.presale_price}
                    onChange={e => set('presale_price', e.target.value)}
                    className="w-full bg-[#0a0a0f] border border-[#1a1a2e] text-white text-sm px-3 py-2.5 rounded-lg focus:outline-none focus:border-[#00ff88]/50 transition-colors"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">SOL</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Soft Cap (SOL)</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={form.soft_cap}
                      onChange={e => set('soft_cap', e.target.value)}
                      className="w-full bg-[#0a0a0f] border border-[#1a1a2e] text-white text-sm px-3 py-2.5 rounded-lg focus:outline-none focus:border-[#00ff88]/50 transition-colors"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">SOL</div>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">Minimum to proceed</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Hard Cap (SOL)</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={form.hard_cap}
                      onChange={e => set('hard_cap', e.target.value)}
                      className="w-full bg-[#0a0a0f] border border-[#1a1a2e] text-white text-sm px-3 py-2.5 rounded-lg focus:outline-none focus:border-[#00ff88]/50 transition-colors"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">SOL</div>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">Maximum to raise</p>
                </div>
              </div>

              {/* Calculated preview */}
              {form.presale_price && form.hard_cap && (
                <div className="bg-[#0a0a0f] border border-[#1a1a2e] rounded-xl p-4 space-y-2">
                  <div className="text-xs font-medium text-gray-400 mb-3">Presale Preview</div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Tokens for presale</span>
                    <span className="text-white font-mono">
                      {(parseFloat(form.hard_cap) / parseFloat(form.presale_price)).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Max raise</span>
                    <span className="text-[#00ff88] font-mono">{form.hard_cap} SOL</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Token price</span>
                    <span className="text-white font-mono">{form.presale_price} SOL</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 3 — Review */}
          {step === 3 && (
            <div className="space-y-5">
              <h2 className="text-white font-bold text-lg mb-5">Review & Launch</h2>

              <div className="bg-[#0a0a0f] border border-[#1a1a2e] rounded-xl overflow-hidden">
                {form.image_url && (
                  <img src={form.image_url} alt={form.name} className="w-full h-36 object-cover" />
                )}
                <div className="p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <div>
                      <div className="text-white font-bold">{form.name}</div>
                      <div className="text-[#00ff88] text-xs font-mono">${form.symbol}</div>
                    </div>
                    <span className="ml-auto text-xs bg-[#00ff88]/10 text-[#00ff88] border border-[#00ff88]/20 px-2 py-0.5 rounded-full capitalize">{form.category}</span>
                  </div>
                  <p className="text-gray-400 text-sm">{form.description}</p>
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#1a1a2e]">
                    <div className="text-center">
                      <div className="text-xs text-gray-500">Supply</div>
                      <div className="text-xs text-white font-mono">{parseInt(form.total_supply).toLocaleString()}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-gray-500">Soft Cap</div>
                      <div className="text-xs text-[#00ff88] font-mono">{form.soft_cap} SOL</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-gray-500">Hard Cap</div>
                      <div className="text-xs text-[#00ff88] font-mono">{form.hard_cap} SOL</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-[#ff6b35]/5 border border-[#ff6b35]/20 rounded-xl p-4 text-xs text-gray-400">
                <Info className="w-4 h-4 text-[#ff6b35] inline mr-2 mb-0.5" />
                By launching, you confirm this token does not constitute a security offering and you accept full responsibility for compliance.
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-3 mt-6 pt-5 border-t border-[#1a1a2e]">
            {step > 1 && (
              <button
                onClick={() => setStep(s => s - 1)}
                className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-white bg-[#1a1a2e] hover:bg-[#1a1a2e]/80 transition-colors"
              >
                Back
              </button>
            )}
            <button
              onClick={() => {
                if (step < 3) setStep(s => s + 1);
                else handleSubmit();
              }}
              disabled={(step === 1 && !step1Valid) || (step === 2 && !step2Valid) || loading}
              className="flex-1 flex items-center justify-center gap-2 bg-[#00ff88] hover:bg-[#00e07a] disabled:bg-[#00ff88]/30 disabled:cursor-not-allowed text-black font-bold px-5 py-2.5 rounded-xl text-sm transition-all"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  Deploying...
                </span>
              ) : step === 3 ? (
                <>
                  <Rocket className="w-4 h-4" />
                  Launch Token
                </>
              ) : (
                <>
                  Continue
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
