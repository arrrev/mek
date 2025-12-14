'use client';

import { useState, useEffect } from 'react';

export default function PlayerManager() {
  const [players, setPlayers] = useState([]);
  const [newPlayerName, setNewPlayerName] = useState('');
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

  const addPlayer = async (e) => {
    e.preventDefault();
    if (!newPlayerName.trim()) return;

    setLoading(true);
    try {
      const response = await fetch('/api/players', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newPlayerName.trim() }),
      });

      if (response.ok) {
        setNewPlayerName('');
        fetchPlayers();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to add player');
      }
    } catch (error) {
      console.error('Error adding player:', error);
      alert('Failed to add player');
    } finally {
      setLoading(false);
    }
  };

  const deletePlayer = async (id) => {
    if (!confirm('Are you sure you want to delete this player?')) return;

    try {
      const response = await fetch(`/api/players?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchPlayers();
      } else {
        alert('Failed to delete player');
      }
    } catch (error) {
      console.error('Error deleting player:', error);
      alert('Failed to delete player');
    }
  };

  return (
    <div className="card mb-6">
      <h3 className="text-xl font-bold mb-4 text-movato-secondary">Manage Players</h3>
      
      <form onSubmit={addPlayer} className="mb-4 flex gap-2">
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
      </form>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {players.map((player) => (
          <div
            key={player.id}
            className="flex items-center justify-between bg-gray-50 p-2 rounded-lg"
          >
            <span className="font-medium">{player.name}</span>
            <button
              onClick={() => deletePlayer(player.id)}
              className="text-red-500 hover:text-red-700 ml-2"
              title="Delete player"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
