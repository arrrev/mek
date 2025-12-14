'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const DATE_PRESETS = {
  thisMonth: 'This Month',
  lastMonth: 'Last Month',
  thisYear: 'This Year',
  allTime: 'All Time',
};

export default function Analytics() {
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    // Set default to current month
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
    if (startDate && endDate) {
      fetchAnalytics();
    }
  }, [startDate, endDate]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/analytics?startDate=${startDate}&endDate=${endDate}`
      );
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Error fetching analytics:', error);
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

  const exportToCSV = () => {
    if (!data || !data.leaderboard) return;

    const headers = [
      'Rank',
      'Player',
      'Total Points',
      'Games Played',
      'Total Games',
      'Absence Rate %',
      'Wins',
      '2nd Place',
      '1st Dead',
      '1st Exploded',
      'Barking & Diffuse',
      'Barking & Dead',
    ];

    const rows = data.leaderboard.map((player, index) => [
      index + 1,
      player.playerName,
      player.totalPoints.toFixed(2),
      player.gamesPlayed,
      player.totalGames,
      player.absenceRate.toFixed(1),
      player.stats.win,
      player.stats.second_place,
      player.stats.first_dead,
      player.stats.first_exploded,
      player.stats.barking_diffuse,
      player.stats.barking_dead,
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leaderboard_${startDate}_${endDate}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const chartData = data?.leaderboard.map((player) => ({
    name: player.playerName,
    points: player.totalPoints,
  })) || [];

  return (
    <div className="min-h-screen p-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-4xl font-bold text-movato-secondary">Analytics & Leaderboard</h1>
          <button onClick={() => router.push('/')} className="btn-secondary">
            ← Home
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
            <div className="flex gap-2">
              <button onClick={fetchAnalytics} className="btn-primary">
                Update
              </button>
              {data && (
                <button
                  onClick={exportToCSV}
                  className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                >
                  📥 Export CSV
                </button>
              )}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="card text-center py-12">
            <div className="text-xl">Loading analytics...</div>
          </div>
        ) : data ? (
          <>
            <div className="card mb-6">
              <h2 className="text-2xl font-bold mb-4 text-movato-secondary">
                Leaderboard Chart
              </h2>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar
                      dataKey="points"
                      fill="#FF6B35"
                      name="Total Points"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="card">
              <h2 className="text-2xl font-bold mb-4 text-movato-secondary">
                Detailed Leaderboard
              </h2>
              <div className="overflow-x-auto -mx-6 px-6">
                <table className="w-full min-w-[800px]">
                  <thead>
                    <tr className="border-b-2 border-gray-200">
                      <th className="text-left p-3 font-semibold">Rank</th>
                      <th className="text-left p-3 font-semibold">Player</th>
                      <th className="text-right p-3 font-semibold">Total Points</th>
                      <th className="text-right p-3 font-semibold">Games Played</th>
                      <th className="text-right p-3 font-semibold">Absence Rate</th>
                      <th className="text-center p-3 font-semibold">Win</th>
                      <th className="text-center p-3 font-semibold">2nd Place</th>
                      <th className="text-center p-3 font-semibold">1st Dead</th>
                      <th className="text-center p-3 font-semibold">1st Exploded</th>
                      <th className="text-center p-3 font-semibold">Barking & Diffuse</th>
                      <th className="text-center p-3 font-semibold">Barking & Dead</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.leaderboard.map((player, index) => (
                      <tr
                        key={player.playerId}
                        className="border-b border-gray-100 hover:bg-gray-50"
                      >
                        <td className="p-3 font-bold text-lg">
                          {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                        </td>
                        <td className="p-3 font-medium">
                          <button
                            onClick={() => router.push(`/player/${player.playerId}`)}
                            className="text-movato-secondary hover:text-movato-primary hover:underline"
                          >
                            {player.playerName}
                          </button>
                        </td>
                        <td className="p-3 text-right font-bold text-lg">
                          <span
                            className={
                              player.totalPoints >= 0
                                ? 'text-green-600'
                                : 'text-red-600'
                            }
                          >
                            {player.totalPoints > 0 ? '+' : ''}
                            {player.totalPoints.toFixed(2)}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          {player.gamesPlayed} / {player.totalGames}
                        </td>
                        <td className="p-3 text-right">
                          {player.absenceRate.toFixed(1)}%
                        </td>
                        <td className="p-3 text-center">
                          <span className="text-green-600 font-semibold">
                            {player.stats.win}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <span className="text-blue-600 font-semibold">
                            {player.stats.second_place}
                          </span>
                        </td>
                        <td className="p-3 text-center text-red-600">
                          {player.stats.first_dead}
                        </td>
                        <td className="p-3 text-center text-red-700 font-semibold">
                          {player.stats.first_exploded}
                        </td>
                        <td className="p-3 text-center text-orange-600">
                          {player.stats.barking_diffuse}
                        </td>
                        <td className="p-3 text-center text-orange-700 font-semibold">
                          {player.stats.barking_dead}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          <div className="card text-center py-12">
            <div className="text-xl text-gray-500">No data available</div>
          </div>
        )}
      </div>
    </div>
  );
}
