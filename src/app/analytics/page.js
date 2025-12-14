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
  Cell,
  LabelList,
} from 'recharts';
import Logo from '@/components/Logo';

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
    // Set default to current month: from 1st of current month (included) to 1st of next month (not included)
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    
    // Format as YYYY-MM-DD using local timezone
    const formatDate = (y, m, d) => {
      const date = new Date(y, m, d);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    
    const firstDay = formatDate(year, month, 1);
    const nextMonthFirstDay = formatDate(year, month + 1, 1);
    
    setStartDate(firstDay);
    setEndDate(nextMonthFirstDay);
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
    const year = now.getFullYear();
    const month = now.getMonth();
    
    // Format as YYYY-MM-DD using local timezone
    const formatDate = (y, m, d) => {
      const date = new Date(y, m, d);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    
    let start, end;

    switch (preset) {
      case 'thisMonth':
        // From this month's 1st day (included) to next month's 1st day (not included)
        start = formatDate(year, month, 1);
        end = formatDate(year, month + 1, 1);
        break;
      case 'lastMonth':
        // From last month's 1st day (included) to this month's 1st day (not included)
        start = formatDate(year, month - 1, 1);
        end = formatDate(year, month, 1);
        break;
      case 'thisYear':
        // From this year January 1st (included) to next year January 1st (not included)
        start = formatDate(year, 0, 1);
        end = formatDate(year + 1, 0, 1);
        break;
      case 'allTime':
        start = '2000-01-01';
        end = formatDate(year + 1, 11, 31);
        break;
      default:
        return;
    }

    setStartDate(start);
    setEndDate(end);
  };


  const chartData = data?.leaderboard && Array.isArray(data.leaderboard)
    ? data.leaderboard.map((player) => ({
        name: player.playerName,
        points: parseFloat(player.totalPoints.toFixed(2)),
        color: player.color || '#FF6B35',
      }))
    : [];

  return (
    <div className="min-h-screen p-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Logo />
            <h1 className="text-4xl font-bold text-movato-secondary">Analytics & Leaderboard</h1>
          </div>
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
                  <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="name" 
                      angle={-45}
                      textAnchor="end"
                      height={100}
                      interval={0}
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar
                      dataKey="points"
                      name="Total Points"
                      radius={[8, 8, 0, 0]}
                    >
                      <LabelList 
                        dataKey="points" 
                        position="top"
                        formatter={(value) => value > 0 ? `+${value.toFixed(1)}` : value.toFixed(1)}
                        style={{ fontSize: '12px', fontWeight: 'bold' }}
                        fill="#333"
                      />
                      {chartData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.color || '#FF6B35'} 
                        />
                      ))}
                    </Bar>
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
                    {data?.leaderboard && Array.isArray(data.leaderboard) ? data.leaderboard.map((player, index) => (
                      <tr
                        key={player.playerId}
                        className="border-b border-gray-100 hover:bg-gray-50"
                      >
                        <td className="p-3 font-bold text-lg">
                          {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                        </td>
                        <td className="p-3 font-medium">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full flex-shrink-0"
                              style={{ backgroundColor: player.color || '#FF6B35' }}
                            />
                            <button
                              onClick={() => router.push(`/player/${player.playerId}`)}
                              className="text-movato-secondary hover:text-movato-primary hover:underline"
                            >
                              {player.playerName}
                            </button>
                          </div>
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
                    )) : (
                      <tr>
                        <td colSpan="11" className="p-4 text-center text-gray-500">
                          No data available
                        </td>
                      </tr>
                    )}
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
