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
import { ACTION_POINTS } from '@/lib/scoring';

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
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState('desc'); // 'asc' or 'desc'
  const [showHowItWorks, setShowHowItWorks] = useState(false);

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
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to fetch analytics' }));
        console.error('Error fetching analytics:', errorData.error || 'Failed to fetch analytics');
        setData(null);
        return;
      }
      const result = await response.json();
      // Ensure result has the expected structure
      if (result && typeof result === 'object') {
        setData(result);
      } else {
        setData(null);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setData(null);
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


  const handleSort = (column) => {
    if (sortColumn === column) {
      // Toggle direction if clicking the same column
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new column and default to descending
      setSortColumn(column);
      setSortDirection('desc');
    }
  };

  const getSortedLeaderboard = () => {
    if (!data?.leaderboard || !Array.isArray(data.leaderboard) || !sortColumn) {
      return data?.leaderboard || [];
    }

    const sorted = [...data.leaderboard].sort((a, b) => {
      let aValue, bValue;

      switch (sortColumn) {
        case 'totalPoints':
          aValue = a.totalPoints;
          bValue = b.totalPoints;
          break;
        case 'gamesPlayed':
          aValue = a.gamesPlayed;
          bValue = b.gamesPlayed;
          break;
        case 'absenceRate':
          aValue = a.absenceRate;
          bValue = b.absenceRate;
          break;
        case 'win':
          aValue = a.stats.win;
          bValue = b.stats.win;
          break;
        case 'secondPlace':
          aValue = a.stats.second_place;
          bValue = b.stats.second_place;
          break;
        case 'firstDead':
          aValue = a.stats.first_dead;
          bValue = b.stats.first_dead;
          break;
        case 'firstExploded':
          aValue = a.stats.first_exploded;
          bValue = b.stats.first_exploded;
          break;
        case 'barkingDiffuse':
          aValue = a.stats.barking_diffuse;
          bValue = b.stats.barking_diffuse;
          break;
        case 'barkingDead':
          aValue = a.stats.barking_dead;
          bValue = b.stats.barking_dead;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  };

  const sortedLeaderboard = getSortedLeaderboard();

  const chartData = sortedLeaderboard && Array.isArray(sortedLeaderboard)
    ? sortedLeaderboard.map((player) => ({
        name: player.playerName,
        points: parseFloat(player.totalPoints.toFixed(2)),
        color: player.color || '#FF6B35',
      }))
    : [];

  const SortIcon = ({ column }) => {
    if (sortColumn !== column) {
      return <span className="text-gray-400 ml-1">↕</span>;
    }
    return sortDirection === 'asc' ? (
      <span className="text-blue-700 ml-1">↑</span>
    ) : (
      <span className="text-blue-700 ml-1">↓</span>
    );
  };

  return (
    <div className="min-h-screen p-3 sm:p-4 py-6 sm:py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-4 sm:mb-6">
          <div className="flex items-center justify-between mb-3 gap-2">
            <Logo className="flex-shrink-0 min-w-0" />
            <button onClick={() => router.push('/')} className="btn-secondary text-xs sm:text-sm px-3 sm:px-6 py-2 sm:py-3 flex-shrink-0 ml-2">
              ← Home
            </button>
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent break-words">
            Analytics & Leaderboard
          </h1>
        </div>

        <div className="card mb-4 sm:mb-6">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h2 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">How It Works</h2>
            <button
              onClick={() => setShowHowItWorks(!showHowItWorks)}
              className="text-sm sm:text-base text-blue-700 hover:text-movato-primary font-medium"
            >
              {showHowItWorks ? '▼ Hide' : '▶ Show'}
            </button>
          </div>
          
          {showHowItWorks && (
            <div className="space-y-4 text-sm sm:text-base">
              <div>
                <h3 className="font-semibold mb-2 text-gray-800">Scoring System</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                  <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                    <span className="font-medium">Win</span>
                    <span className="text-green-600 font-bold">+{ACTION_POINTS.win} points</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-blue-50 rounded">
                    <span className="font-medium">2nd Place</span>
                    <span className="text-blue-600 font-bold">+{ACTION_POINTS.second_place} points</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-red-50 rounded">
                    <span className="font-medium">1st Dead</span>
                    <span className="text-red-600 font-bold">{ACTION_POINTS.first_dead} points</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-red-100 rounded">
                    <span className="font-medium">1st Exploded</span>
                    <span className="text-red-700 font-bold">{ACTION_POINTS.first_exploded} points</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-orange-50 rounded">
                    <span className="font-medium">Barking & Diffuse</span>
                    <span className="text-orange-600 font-bold">{ACTION_POINTS.barking_diffuse} points</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-orange-100 rounded">
                    <span className="font-medium">Barking & Dead</span>
                    <span className="text-orange-700 font-bold">{ACTION_POINTS.barking_dead} points</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2 text-gray-800">Calculation Logic</h3>
                <div className="bg-gray-50 p-3 sm:p-4 rounded-lg space-y-2">
                  <p className="text-gray-700">
                    <strong>1. Base Points:</strong> Sum all action points for the selected period.
                  </p>
                  <p className="text-gray-700">
                    <strong>2. Participation Penalty:</strong> If a player missed games, their total points are multiplied by:
                  </p>
                  <div className="ml-4 p-2 bg-white rounded border-l-4 border-movato-secondary">
                    <code className="text-sm">(Games Played / Total Games)</code>
                  </div>
                  <p className="text-gray-700 text-xs sm:text-sm mt-2">
                    <strong>Example:</strong> If there were 20 total games and a player participated in 18 games, 
                    their points are multiplied by 18/20 = 0.9 (10% penalty for missing 2 games).
                  </p>
                  <p className="text-gray-700 text-xs sm:text-sm">
                    <strong>Note:</strong> Players who didn't play any games receive 0 points, regardless of their action history.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="card mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-3 sm:mb-4">
            <h2 className="text-lg sm:text-xl font-bold">Select Period</h2>
            <div className="flex gap-2 w-full sm:w-auto">
              <button
                onClick={() => router.push('/record')}
                className="btn-primary flex-1 sm:flex-none text-xs sm:text-sm px-3 sm:px-4 py-2 sm:py-2"
              >
                📝 Record Game
              </button>
              <button
                onClick={() => router.push('/')}
                className="btn-secondary flex-1 sm:flex-none text-xs sm:text-sm px-3 sm:px-4 py-2 sm:py-2"
              >
                ← Home
              </button>
            </div>
          </div>

          <div className="mb-3 sm:mb-4 flex flex-wrap gap-2">
            {Object.entries(DATE_PRESETS).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setDatePreset(key)}
                className="px-3 sm:px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-xs sm:text-sm font-medium flex-shrink-0"
              >
                {label}
              </button>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="flex-1 w-full sm:min-w-[200px]">
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="input-field w-full text-sm sm:text-base"
                style={{ maxWidth: '100%', boxSizing: 'border-box' }}
              />
            </div>
            <div className="flex-1 w-full sm:min-w-[200px]">
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="input-field w-full text-sm sm:text-base"
                style={{ maxWidth: '100%', boxSizing: 'border-box' }}
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
            <div className="card mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent break-words">
                Leaderboard Chart
              </h2>
              <div className="h-64 sm:h-80 md:h-96 w-full overflow-x-auto">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 20, right: 5, left: -25, bottom: 70 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="name" 
                      angle={-45}
                      textAnchor="end"
                      height={90}
                      interval={0}
                      tick={{ fontSize: 9 }}
                      width={60}
                    />
                    <YAxis width={40} tick={{ fontSize: 10 }} />
                    <Tooltip wrapperStyle={{ fontSize: '12px' }} />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
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
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent break-words">
                Detailed Leaderboard
              </h2>
              <div className="overflow-x-auto -mx-3 sm:-mx-4 md:-mx-6 px-3 sm:px-4 md:px-6">
                <table className="w-full min-w-[600px] sm:min-w-[800px] text-xs sm:text-sm md:text-base">
                  <thead>
                    <tr className="border-b-2 border-gray-200">
                      <th className="text-left p-3 font-semibold">Rank</th>
                      <th className="text-left p-3 font-semibold">Player</th>
                      <th 
                        className="text-right p-3 font-semibold cursor-pointer hover:bg-gray-100 select-none"
                        onClick={() => handleSort('totalPoints')}
                      >
                        Total Points <SortIcon column="totalPoints" />
                      </th>
                      <th 
                        className="text-right p-3 font-semibold cursor-pointer hover:bg-gray-100 select-none"
                        onClick={() => handleSort('gamesPlayed')}
                      >
                        Games Played <SortIcon column="gamesPlayed" />
                      </th>
                      <th 
                        className="text-right p-3 font-semibold cursor-pointer hover:bg-gray-100 select-none"
                        onClick={() => handleSort('absenceRate')}
                      >
                        Absence Rate <SortIcon column="absenceRate" />
                      </th>
                      <th 
                        className="text-center p-3 font-semibold cursor-pointer hover:bg-gray-100 select-none"
                        onClick={() => handleSort('win')}
                      >
                        Win <SortIcon column="win" />
                      </th>
                      <th 
                        className="text-center p-3 font-semibold cursor-pointer hover:bg-gray-100 select-none"
                        onClick={() => handleSort('secondPlace')}
                      >
                        2nd Place <SortIcon column="secondPlace" />
                      </th>
                      <th 
                        className="text-center p-3 font-semibold cursor-pointer hover:bg-gray-100 select-none"
                        onClick={() => handleSort('firstDead')}
                      >
                        1st Dead <SortIcon column="firstDead" />
                      </th>
                      <th 
                        className="text-center p-3 font-semibold cursor-pointer hover:bg-gray-100 select-none"
                        onClick={() => handleSort('firstExploded')}
                      >
                        1st Exploded <SortIcon column="firstExploded" />
                      </th>
                      <th 
                        className="text-center p-3 font-semibold cursor-pointer hover:bg-gray-100 select-none"
                        onClick={() => handleSort('barkingDiffuse')}
                      >
                        Barking & Diffuse <SortIcon column="barkingDiffuse" />
                      </th>
                      <th 
                        className="text-center p-3 font-semibold cursor-pointer hover:bg-gray-100 select-none"
                        onClick={() => handleSort('barkingDead')}
                      >
                        Barking & Dead <SortIcon column="barkingDead" />
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedLeaderboard && Array.isArray(sortedLeaderboard) ? sortedLeaderboard.map((player, index) => (
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
                              className="text-blue-700 hover:text-movato-primary hover:underline font-semibold"
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
