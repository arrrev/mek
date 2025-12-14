'use client';

import { useState, useEffect } from 'react';
import { useToaster } from '@/components/Toaster';
import ColorPalette from '@/components/ColorPalette';

export default function PlayerManager({ isOpen, onClose }) {
  const { success, error: toastError } = useToaster();
  const [players, setPlayers] = useState([]);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [newPlayerColor, setNewPlayerColor] = useState('#FF6B35');
  const [loading, setLoading] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchPlayers();
    }
  }, [isOpen]);

  const fetchPlayers = async () => {
    try {
      const response = await fetch('/api/players');
      if (!response.ok) {
        console.error('Failed to fetch players:', response.status);
        setPlayers([]);
        return;
      }
      const data = await response.json();
      // Ensure data is an array
      if (Array.isArray(data)) {
        setPlayers(data);
      } else {
        console.error('Invalid data format:', data);
        setPlayers([]);
      }
    } catch (error) {
      console.error('Error fetching players:', error);
      setPlayers([]);
    }
  };

  const addPlayer = async (e) => {
    e.preventDefault();
    if (!newPlayerName.trim()) return;

    setLoading(true);
    try {
      const response = await fetch('/api/players', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: newPlayerName.trim(),
          color: newPlayerColor
        }),
      });

      if (response.ok) {
        const playerData = await response.json();
        setNewPlayerName('');
        setNewPlayerColor('#FF6B35');
        success(`Player "${playerData.name}" added successfully!`);
        fetchPlayers();
      } else {
        const errorData = await response.json();
        const errorMessage = errorData.error || 'Failed to add player';
        toastError(errorMessage);
      }
    } catch (error) {
      console.error('Error adding player:', error);
      toastError('Failed to add player. Please check your database connection.');
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (player) => {
    setEditingPlayer({
      id: player.id,
      name: player.name,
      color: player.color || '#FF6B35',
    });
  };

  const cancelEdit = () => {
    setEditingPlayer(null);
  };

  const saveEdit = async () => {
    if (!editingPlayer.name.trim()) {
      toastError('Player name cannot be empty');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/players/${editingPlayer.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editingPlayer.name.trim(),
          color: editingPlayer.color,
        }),
      });

      if (response.ok) {
        success(`Player "${editingPlayer.name}" updated successfully!`);
        setEditingPlayer(null);
        fetchPlayers();
      } else {
        const errorData = await response.json();
        toastError(errorData.error || 'Failed to update player');
      }
    } catch (error) {
      console.error('Error updating player:', error);
      toastError('Failed to update player');
    } finally {
      setLoading(false);
    }
  };

  const deletePlayer = async (id) => {
    const player = players.find(p => p.id === id);
    const playerName = player ? player.name : 'this player';
    
    if (!window.confirm(`Are you sure you want to delete "${playerName}"?`)) return;

    try {
      const response = await fetch(`/api/players?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        success(`Player "${playerName}" deleted successfully!`);
        fetchPlayers();
      } else {
        const errorData = await response.json();
        toastError(errorData.error || 'Failed to delete player');
      }
    } catch (error) {
      console.error('Error deleting player:', error);
      toastError('Failed to delete player. Please check your database connection.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="card max-w-2xl w-full max-h-[90vh] my-4 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl sm:text-2xl font-bold text-movato-secondary">Manage Players</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 active:text-gray-900 text-3xl font-bold min-w-[44px] min-h-[44px] flex items-center justify-center touch-manipulation"
            aria-label="Close"
          >
            ×
          </button>
        </div>
        
        <form onSubmit={addPlayer} className="mb-6 space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={newPlayerName}
              onChange={(e) => setNewPlayerName(e.target.value)}
              placeholder="Add new player..."
              className="input-field flex-1"
            />
            <button
              type="submit"
              disabled={loading || !newPlayerName.trim()}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add
            </button>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Player Color
            </label>
            <ColorPalette
              selectedColor={newPlayerColor}
              onSelect={setNewPlayerColor}
            />
          </div>
        </form>

        {players.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No players yet. Add your first player above!
          </div>
        ) : (
          <div className="space-y-3">
            {players.map((player) => (
              editingPlayer && editingPlayer.id === player.id ? (
                <div key={player.id} className="p-4 bg-blue-50 border-2 border-blue-300 rounded-lg">
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Player Name
                      </label>
                      <input
                        type="text"
                        value={editingPlayer.name}
                        onChange={(e) => setEditingPlayer({ ...editingPlayer, name: e.target.value })}
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Player Color
                      </label>
                      <ColorPalette
                        selectedColor={editingPlayer.color}
                        onSelect={(color) => setEditingPlayer({ ...editingPlayer, color })}
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={saveEdit}
                        disabled={loading}
                        className="btn-primary flex-1 disabled:opacity-50"
                      >
                        {loading ? 'Saving...' : 'Save'}
                      </button>
                      <button
                        onClick={cancelEdit}
                        disabled={loading}
                        className="btn-secondary flex-1 disabled:opacity-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  key={player.id}
                  className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-200"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div
                      className="w-4 h-4 rounded-full flex-shrink-0"
                      style={{ backgroundColor: player.color || '#FF6B35' }}
                    />
                    <span className="font-medium truncate">{player.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => startEdit(player)}
                      className="px-3 py-1 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white rounded transition-colors text-sm min-h-[32px] touch-manipulation"
                      title="Edit player"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deletePlayer(player.id)}
                      className="text-red-500 hover:text-red-700 active:text-red-900 ml-2 text-xl min-w-[32px] min-h-[32px] flex items-center justify-center touch-manipulation"
                      title="Delete player"
                    >
                      ×
                    </button>
                  </div>
                </div>
              )
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
