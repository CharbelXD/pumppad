import { useState } from 'react';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import CreateTokenPage from './pages/CreateTokenPage';
import TokenPage from './pages/TokenPage';
import { Token } from './lib/supabase';

type Page = 'home' | 'create' | 'token';

export default function App() {
  const [page, setPage] = useState<Page>('home');
  const [selectedTokenId, setSelectedTokenId] = useState<string | null>(null);

  function handleSelectToken(token: Token) {
    setSelectedTokenId(token.id);
    setPage('token');
  }

  function handleCreateSuccess(tokenId: string) {
    setSelectedTokenId(tokenId);
    setPage('token');
  }

  return (
    <div className="bg-[#07070f] min-h-screen">
      <Header
        currentPage={page}
        onNavigate={(p) => setPage(p as Page)}
      />

      {page === 'home' && (
        <HomePage
          onSelectToken={handleSelectToken}
          onNavigateCreate={() => setPage('create')}
        />
      )}

      {page === 'create' && (
        <CreateTokenPage onSuccess={handleCreateSuccess} />
      )}

      {page === 'token' && selectedTokenId && (
        <TokenPage
          tokenId={selectedTokenId}
          onBack={() => setPage('home')}
        />
      )}
    </div>
  );
}
