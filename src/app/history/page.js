'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useToaster } from '@/components/Toaster';

const ACTION_TYPES = {
  first_dead: '1st Dead',
  first_exploded: '1st Exploded',
  barking_diffuse: 'Barking & Diffuse',
  barking_dead: 'Barking & Dead',
  second_place: '2nd Place',
  win: 'Win',
};

const ACCESS_CODE = '1461';

export default function GameHistory() {
  const router = useRouter();
  const { success, error: toastError } = useToaster();
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingGame, setEditingGame] = useState(null);
  const [showDeleteAuth, setShowDeleteAuth] = useState(false);
  const [deleteAccessCode, setDeleteAccessCode] = useState('');
  const [gameToDelete, setGameToDelete] = useState(null);

  useEffect(() => {
    fetchGames();
  }, []);

  const fetchGames = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/games');
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to fetch games' }));
        toastError(errorData.error || 'Failed to fetch games');
        setGames([]);
        return;
      }
      const data = await response.json();
      // Ensure data is an array
      setGames(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching games:', error);
      toastError('Failed to fetch games. Please check your connection.');
      setGames([]);
    } finally {
      setLoading(false);
    }
  };

  const checkDeleteAuth = () => {
    const authStatus = sessionStorage.getItem('record_game_auth');
    return authStatus === 'true';
  };

  const handleDeleteClick = (gameId) => {
    if (checkDeleteAuth()) {
      // Already authenticated, proceed with delete confirmation
      if (window.confirm('Are you sure you want to delete this game?')) {
        performDelete(gameId);
      }
    } else {
      // Not authenticated, show access code prompt
      setGameToDelete(gameId);
      setShowDeleteAuth(true);
      setDeleteAccessCode('');
    }
  };

  const handleDeleteAuthSubmit = (e) => {
    e.preventDefault();
    if (deleteAccessCode === ACCESS_CODE) {
      sessionStorage.setItem('record_game_auth', 'true');
      success('Access granted!');
      setShowDeleteAuth(false);
      if (gameToDelete) {
        if (window.confirm('Are you sure you want to delete this game?')) {
          performDelete(gameToDelete);
        }
        setGameToDelete(null);
      }
    } else {
      toastError('Invalid access code');
      setDeleteAccessCode('');
    }
  };

  const performDelete = async (gameId) => {
    try {
      const response = await fetch(`/api/games/${gameId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        success('Game deleted successfully!');
        fetchGames();
      } else {
        const errorData = await response.json();
        toastError(errorData.error || 'Failed to delete game');
      }
    } catch (error) {
      console.error('Error deleting game:', error);
      toastError('Failed to delete game. Please check your database connection.');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen p-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-movato-secondary">Game History</h1>
          <div className="flex gap-2 w-full sm:w-auto">
            <Link href="/record" className="btn-primary flex-1 sm:flex-none text-sm sm:text-base">
              + New Game
            </Link>
            <button onClick={() => router.push('/')} className="btn-secondary flex-1 sm:flex-none text-sm sm:text-base">
              ← Home
            </button>
          </div>
        </div>

        {loading ? (
          <div className="card text-center py-12">
            <div className="text-xl">Loading games...</div>
          </div>
        ) : games.length === 0 ? (
          <div className="card text-center py-12">
            <div className="text-xl text-gray-500 mb-4">No games recorded yet</div>
            <Link href="/record" className="btn-primary">
              Record Your First Game
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {games.map((game) => (
              <div key={game.id} className="card">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-movato-secondary">
                      {formatDate(game.game_date)}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {game.participants?.length || 0} players
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDeleteClick(game.id)}
                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition text-sm sm:text-base"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="font-semibold mb-2">Players:</h4>
                  <div className="flex flex-wrap gap-2">
                    {game.participants?.map((player) => (
                      <span
                        key={player.id}
                        className="px-3 py-1 bg-movato-primary bg-opacity-20 text-movato-primary rounded-full text-sm"
                      >
                        {player.name}
                      </span>
                    ))}
                  </div>
                </div>

                {game.actions && game.actions.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Actions:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {game.actions.map((action) => (
                        <div
                          key={action.id}
                          className="px-3 py-2 bg-gray-50 rounded-lg text-sm"
                        >
                          <span className="font-medium">
                            {ACTION_TYPES[action.action_type] || action.action_type}:
                          </span>{' '}
                          <span className="text-movato-secondary">
                            {action.player_name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Delete Access Code Modal */}
        {showDeleteAuth && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="card max-w-md w-full">
              <h3 className="text-xl font-bold text-movato-secondary mb-2">Access Required</h3>
              <p className="text-gray-600 mb-4 text-sm">Please enter the access code to delete games.</p>
              <form onSubmit={handleDeleteAuthSubmit}>
                <input
                  type="password"
                  value={deleteAccessCode}
                  onChange={(e) => setDeleteAccessCode(e.target.value)}
                  placeholder="Enter access code"
                  className="input-field mb-4 text-center text-2xl tracking-widest"
                  autoFocus
                  maxLength={10}
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="btn-primary flex-1"
                  >
                    Submit
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowDeleteAuth(false);
                      setGameToDelete(null);
                      setDeleteAccessCode('');
                    }}
                    className="btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
