'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const ACTION_TYPES = {
  first_dead: '1st Dead',
  first_exploded: '1st Exploded',
  barking_diffuse: 'Barking & Diffuse',
  barking_dead: 'Barking & Dead',
  second_place: '2nd Place',
  win: 'Win',
};

const DATE_PRESETS = {
  thisMonth: 'This Month',
  lastMonth: 'Last Month',
  thisYear: 'This Year',
  allTime: 'All Time',
};

export default function PlayerStats() {
  const router = useRouter();
  const params = useParams();
  const playerId = params.id;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
      .toISOString()
      .split('T')[0];
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      .toISOString()
      .split('T')[0];
    setStartDate(firstDay);
    setEndDate(lastDay);
  }, []);

  useEffect(() => {
    if (startDate && endDate && playerId) {
      fetchStats();
    }
  }, [startDate, endDate, playerId]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/players/${playerId}/stats?startDate=${startDate}&endDate=${endDate}`
      );
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Error fetching player stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const setDatePreset = (preset) => {
    const now = new Date();
    let start, end;

    switch (preset) {
      case 'thisMonth':
        start = new Date(now.getFullYear(), now.getMonth(), 1)
          .toISOString()
          .split('T')[0];
        end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
          .toISOString()
          .split('T')[0];
        break;
      case 'lastMonth':
        start = new Date(now.getFullYear(), now.getMonth() - 1, 1)
          .toISOString()
          .split('T')[0];
        end = new Date(now.getFullYear(), now.getMonth(), 0)
          .toISOString()
          .split('T')[0];
        break;
      case 'thisYear':
        start = new Date(now.getFullYear(), 0, 1)
          .toISOString()
          .split('T')[0];
        end = new Date(now.getFullYear(), 11, 31)
          .toISOString()
          .split('T')[0];
        break;
      case 'allTime':
        start = '2000-01-01';
        end = new Date(now.getFullYear() + 1, 11, 31)
          .toISOString()
          .split('T')[0];
        break;
      default:
        return;
    }

    setStartDate(start);
    setEndDate(end);
  };

  const actionChartData = data
    ? Object.entries(data.stats).map(([key, value]) => ({
        name: ACTION_TYPES[key] || key,
        count: value,
      }))
    : [];

  const gameBreakdownData = data
    ? data.gameBreakdown.map((game) => {
        const points = game.actions.reduce((sum, action) => sum + (action.points || 0), 0);
        return {
          date: new Date(game.game_date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          }),
          points,
        };
      })
    : [];

  if (loading) {
    return (
      <div className="min-h-screen p-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="card text-center py-12">
            <div className="text-xl">Loading player statistics...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen p-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="card text-center py-12">
            <div className="text-xl text-gray-500">Player not found</div>
            <button onClick={() => router.push('/analytics')} className="btn-primary mt-4">
              Back to Analytics
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold text-movato-secondary">
              {data.player.name}
            </h1>
            <p className="text-gray-600 mt-1">Player Statistics</p>
          </div>
          <button onClick={() => router.push('/analytics')} className="btn-secondary">
            ← Back
          </button>
        </div>

        <div className="card mb-6">
          <h2 className="text-xl font-bold mb-4">Select Period</h2>
          <div className="mb-4 flex flex-wrap gap-2">
            {Object.entries(DATE_PRESETS).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setDatePreset(key)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm font-medium"
              >
                {label}
              </button>
            ))}
          </div>
          <div className="flex gap-4 items-end flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="input-field"
              />
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="input-field"
              />
            </div>
            <button onClick={fetchStats} className="btn-primary">
              Update
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="card text-center">
            <div className="text-3xl font-bold text-movato-primary">
              {data.totalPoints > 0 ? '+' : ''}
              {data.totalPoints.toFixed(2)}
            </div>
            <div className="text-gray-600 mt-1">Total Points</div>
          </div>
          <div className="card text-center">
            <div className="text-3xl font-bold text-movato-secondary">
              {data.gamesPlayed} / {data.totalGames}
            </div>
            <div className="text-gray-600 mt-1">Games Played</div>
          </div>
          <div className="card text-center">
            <div className="text-3xl font-bold text-orange-600">
              {data.absenceRate.toFixed(1)}%
            </div>
            <div className="text-gray-600 mt-1">Absence Rate</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="card">
            <h3 className="text-xl font-bold mb-4">Actions Breakdown</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={actionChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#FF6B35" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card">
            <h3 className="text-xl font-bold mb-4">Points Per Game</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={gameBreakdownData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="points"
                    stroke="#FF6B35"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-xl font-bold mb-4">Detailed Stats</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(data.stats).map(([key, value]) => (
              <div key={key} className="p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600">{ACTION_TYPES[key] || key}</div>
                <div className="text-2xl font-bold text-movato-secondary">{value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
