'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PlayerManager from '@/components/PlayerManager';
import { useToaster } from '@/components/Toaster';

const ACTION_TYPES = [
  { value: 'first_dead', label: '1st Dead', points: -1 },
  { value: 'first_exploded', label: '1st Exploded', points: -3 },
  { value: 'barking_diffuse', label: 'Barking & Diffuse', points: -1 },
  { value: 'barking_dead', label: 'Barking & Dead', points: -3 },
  { value: 'second_place', label: '2nd Place', points: 5 },
  { value: 'win', label: 'Win', points: 10 },
];

export default function RecordGame() {
  const router = useRouter();
  const { success, error: toastError } = useToaster();
  const [players, setPlayers] = useState([]);
  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const [gameDate, setGameDate] = useState(new Date().toISOString().split('T')[0]);
  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPlayers();
  }, []);

  const fetchPlayers = async () => {
    try {
      const response = await fetch('/api/players');
      const data = await response.json();
      setPlayers(data);
    } catch (error) {
      console.error('Error fetching players:', error);
    }
  };

  const togglePlayer = (playerId) => {
    setSelectedPlayers((prev) =>
      prev.includes(playerId)
        ? prev.filter((id) => id !== playerId)
        : [...prev, playerId]
    );
  };

  const addAction = (actionType) => {
    if (selectedPlayers.length === 0) {
      toastError('Please select at least one player first');
      return;
    }

    const action = {
      id: Date.now(),
      actionType,
      playerId: null, // Will be set when selecting player
    };
    setActions([...actions, action]);
  };

  const setActionPlayer = (actionId, playerId) => {
    setActions((prev) =>
      prev.map((action) =>
        action.id === actionId ? { ...action, playerId } : action
      )
    );
  };

  const removeAction = (actionId) => {
    setActions((prev) => prev.filter((action) => action.id !== actionId));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (selectedPlayers.length === 0) {
      toastError('Please select at least one player');
      return;
    }

    // Validate all actions have players assigned
    const incompleteActions = actions.filter((a) => !a.playerId);
    if (incompleteActions.length > 0) {
      toastError('Please assign players to all actions');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/games', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameDate,
          participants: selectedPlayers,
          actions: actions.map((a) => ({
            playerId: a.playerId,
            actionType: a.actionType,
          })),
        }),
      });

      if (response.ok) {
        success('Game recorded successfully!');
        setTimeout(() => router.push('/analytics'), 1000);
      } else {
        const error = await response.json();
        toastError(error.error || 'Failed to record game');
      }
    } catch (error) {
      console.error('Error recording game:', error);
      toastError('Failed to record game');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-4xl font-bold text-movato-secondary">Record Game</h1>
          <button
            onClick={() => router.push('/')}
            className="btn-secondary"
          >
            ← Home
          </button>
        </div>

        <PlayerManager />

        <form onSubmit={handleSubmit} className="card">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Game Date
            </label>
            <input
              type="date"
              value={gameDate}
              onChange={(e) => setGameDate(e.target.value)}
              className="input-field"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Select Players ({selectedPlayers.length} selected)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {players.map((player) => (
                <button
                  key={player.id}
                  type="button"
                  onClick={() => togglePlayer(player.id)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    selectedPlayers.includes(player.id)
                      ? 'bg-movato-primary text-white border-movato-primary'
                      : 'bg-white border-gray-300 hover:border-movato-primary'
                  }`}
                >
                  {player.name}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Record Actions
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 mb-4">
              {ACTION_TYPES.map((action) => (
                <button
                  key={action.value}
                  type="button"
                  onClick={() => addAction(action.value)}
                  className="p-3 rounded-lg border-2 border-gray-300 hover:border-movato-primary hover:bg-gray-50 transition-all text-left"
                >
                  <div className="font-medium">{action.label}</div>
                  <div className="text-sm text-gray-600">
                    {action.points > 0 ? '+' : ''}{action.points} pts
                  </div>
                </button>
              ))}
            </div>

            {actions.length > 0 && (
              <div className="space-y-2 mt-4">
                {actions.map((action) => {
                  const actionInfo = ACTION_TYPES.find((a) => a.value === action.actionType);
                  return (
                    <div
                      key={action.id}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                    >
                      <span className="font-medium min-w-[150px]">
                        {actionInfo.label}
                      </span>
                      <select
                        value={action.playerId || ''}
                        onChange={(e) => setActionPlayer(action.id, parseInt(e.target.value))}
                        className="input-field flex-1"
                      >
                        <option value="">Select player...</option>
                        {selectedPlayers.map((playerId) => {
                          const player = players.find((p) => p.id === playerId);
                          return (
                            <option key={playerId} value={playerId}>
                              {player?.name}
                            </option>
                          );
                        })}
                      </select>
                      <button
                        type="button"
                        onClick={() => removeAction(action.id)}
                        className="text-red-500 hover:text-red-700 px-2"
                      >
                        ×
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || selectedPlayers.length === 0}
            className="btn-primary w-full text-lg py-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : 'Save Game'}
          </button>
        </form>
      </div>
    </div>
  );
}
