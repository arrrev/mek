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

const ACCESS_CODE = '1461';

export default function RecordGame() {
  const router = useRouter();
  const { success, error: toastError } = useToaster();
  const [players, setPlayers] = useState([]);
  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const [gameDate, setGameDate] = useState(new Date().toISOString().split('T')[0]);
  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showPlayerManager, setShowPlayerManager] = useState(false);
  const [actionModal, setActionModal] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [accessCode, setAccessCode] = useState('');

  useEffect(() => {
    // Check if already authenticated in this session
    const authStatus = sessionStorage.getItem('record_game_auth');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
      fetchPlayers();
    }
  }, []);

  const handleCodeSubmit = (e) => {
    e.preventDefault();
    if (accessCode === ACCESS_CODE) {
      setIsAuthenticated(true);
      sessionStorage.setItem('record_game_auth', 'true');
      success('Access granted!');
      fetchPlayers();
    } else {
      toastError('Invalid access code');
      setAccessCode('');
    }
  };

  const fetchPlayers = async () => {
    try {
      const response = await fetch('/api/players');
      if (!response.ok) {
        console.error('Failed to fetch players:', response.status);
        setPlayers([]);
        return;
      }
      const data = await response.json();
      setPlayers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching players:', error);
      setPlayers([]);
    }
  };

  const togglePlayer = (playerId) => {
    setSelectedPlayers((prev) =>
      prev.includes(playerId)
        ? prev.filter((id) => id !== playerId)
        : [...prev, playerId]
    );
  };

  const handleActionClick = (actionType) => {
    if (selectedPlayers.length === 0) {
      toastError('Please select at least one player first');
      return;
    }

    // Check if this action type already exists
    const existingAction = actions.find(a => a.actionType === actionType);
    if (existingAction) {
      const actionInfo = ACTION_TYPES.find(a => a.value === actionType);
      toastError(`${actionInfo?.label || actionType} has already been assigned. Each action can only be assigned once per game.`);
      return;
    }

    // Open modal immediately
    const actionInfo = ACTION_TYPES.find(a => a.value === actionType);
    setActionModal({ actionType, actionInfo });
  };

  const assignActionPlayer = (playerId) => {
    if (!actionModal) return;

    const action = {
      id: Date.now(),
      actionType: actionModal.actionType,
      playerId: playerId,
    };
    setActions([...actions, action]);
    setActionModal(null);
    success(`${actionModal.actionInfo.label} assigned successfully!`);
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

    // Validate that each action type appears only once
    const actionTypes = actions.map(a => a.actionType);
    const uniqueActionTypes = new Set(actionTypes);
    if (actionTypes.length !== uniqueActionTypes.size) {
      toastError('Each action type can only be assigned once per game');
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

  // Show access code screen if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="card max-w-md w-full">
          <h1 className="text-3xl font-bold text-movato-secondary mb-2">Access Required</h1>
          <p className="text-gray-600 mb-6">Please enter the access code to record games.</p>
          <form onSubmit={handleCodeSubmit}>
            <input
              type="password"
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value)}
              placeholder="Enter access code"
              className="input-field mb-4 text-center text-2xl tracking-widest"
              autoFocus
              maxLength={10}
            />
            <button
              type="submit"
              className="btn-primary w-full text-lg py-3"
            >
              Submit
            </button>
          </form>
          <button
            onClick={() => router.push('/')}
            className="mt-4 text-center w-full text-gray-500 hover:text-gray-700"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-movato-secondary">Record Game</h1>
          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={() => setShowPlayerManager(true)}
              className="btn-secondary flex-1 sm:flex-none text-sm sm:text-base"
            >
              👥 Manage Players
            </button>
            <button
              onClick={() => router.push('/')}
              className="btn-secondary flex-1 sm:flex-none text-sm sm:text-base"
            >
              ← Home
            </button>
          </div>
        </div>

        <PlayerManager isOpen={showPlayerManager} onClose={() => {
          setShowPlayerManager(false);
          fetchPlayers();
        }} />

        {/* Action Selection Modal */}
        {actionModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="card max-w-md w-full">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-movato-secondary">
                  Assign {actionModal.actionInfo.label}
                </h3>
                <button
                  onClick={() => setActionModal(null)}
                  className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
                >
                  ×
                </button>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                {actionModal.actionInfo.points > 0 ? '+' : ''}{actionModal.actionInfo.points} points
              </p>
              <div className="space-y-2">
                {selectedPlayers.map((playerId) => {
                  const player = players.find((p) => p.id === playerId);
                  return (
                    <button
                      key={playerId}
                      onClick={() => assignActionPlayer(playerId)}
                      className="w-full p-3 bg-movato-primary hover:bg-opacity-90 text-white rounded-lg transition-all text-left"
                    >
                      {player?.name}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

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
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3">
              {players.map((player) => (
                <button
                  key={player.id}
                  type="button"
                  onClick={() => togglePlayer(player.id)}
                  className={`p-3 rounded-lg border-2 transition-all flex items-center gap-2 ${
                    selectedPlayers.includes(player.id)
                      ? 'text-white border-opacity-80'
                      : 'bg-white border-gray-300 hover:border-opacity-80'
                  }`}
                  style={{
                    backgroundColor: selectedPlayers.includes(player.id) 
                      ? (player.color || '#FF6B35') 
                      : 'white',
                    borderColor: selectedPlayers.includes(player.id)
                      ? (player.color || '#FF6B35')
                      : undefined
                  }}
                >
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: selectedPlayers.includes(player.id) ? 'white' : (player.color || '#FF6B35') }}
                  />
                  <span className="truncate">{player.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Record Actions ({actions.length} assigned)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 mb-4">
              {ACTION_TYPES.map((action) => {
                const isAlreadyAdded = actions.some(a => a.actionType === action.value);
                const assignedPlayer = isAlreadyAdded 
                  ? players.find(p => p.id === actions.find(a => a.actionType === action.value)?.playerId)
                  : null;
                
                return (
                  <button
                    key={action.value}
                    type="button"
                    onClick={() => handleActionClick(action.value)}
                    disabled={isAlreadyAdded}
                    className={`p-3 rounded-lg border-2 transition-all text-left ${
                      isAlreadyAdded
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-300 hover:border-movato-primary hover:bg-gray-50'
                    }`}
                    title={isAlreadyAdded ? `Assigned to ${assignedPlayer?.name}` : `Click to assign ${action.label}`}
                  >
                    <div className="font-medium flex items-center justify-between">
                      {action.label}
                      {isAlreadyAdded && <span className="text-green-600 text-xs">✓</span>}
                    </div>
                    <div className="text-sm text-gray-600">
                      {action.points > 0 ? '+' : ''}{action.points} pts
                    </div>
                    {isAlreadyAdded && assignedPlayer && (
                      <div className="text-xs text-green-700 mt-1">
                        → {assignedPlayer.name}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {actions.length > 0 && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold mb-2">Assigned Actions:</h4>
                <div className="space-y-2">
                  {actions.map((action) => {
                    const actionInfo = ACTION_TYPES.find((a) => a.value === action.actionType);
                    const player = players.find((p) => p.id === action.playerId);
                    return (
                      <div
                        key={action.id}
                        className="flex items-center justify-between p-2 bg-white rounded-lg"
                      >
                        <span className="font-medium">
                          {actionInfo.label}: <span className="text-movato-secondary">{player?.name}</span>
                        </span>
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
