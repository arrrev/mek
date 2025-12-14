'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToaster } from '@/components/Toaster';

const ACCESS_CODE = '1461';

const ACTION_TYPE_MAP = {
  'Win': 'win',
  '2nd place': 'second_place',
  'Barking & Difuse': 'barking_diffuse',
  'Barking & Dead': 'barking_dead',
  '1st exploaded': 'first_exploded',
  '1st dead': 'first_dead',
};

export default function ImportPage() {
  const router = useRouter();
  const { success, error: toastError } = useToaster();
  const [loading, setLoading] = useState(false);
  const [csvData, setCsvData] = useState('');
  const [preview, setPreview] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [accessCode, setAccessCode] = useState('');

  useEffect(() => {
    const authStatus = sessionStorage.getItem('record_game_auth');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleCodeSubmit = (e) => {
    e.preventDefault();
    if (accessCode === ACCESS_CODE) {
      setIsAuthenticated(true);
      sessionStorage.setItem('record_game_auth', 'true');
      success('Access granted!');
    } else {
      toastError('Invalid access code');
      setAccessCode('');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="card max-w-md w-full">
          <h1 className="text-3xl font-bold text-movato-secondary mb-2">Access Required</h1>
          <p className="text-gray-600 mb-6">Please enter the access code to import games.</p>
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


  const handleCSVImport = async () => {
    if (!csvData.trim()) {
      toastError('Please paste CSV data');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ csvData }),
      });

      if (!response.ok) {
        const error = await response.json();
        toastError(error.error || 'Failed to parse CSV data');
        setLoading(false);
        return;
      }

      const result = await response.json();
      
      if (result.error) {
        toastError(result.error);
        setLoading(false);
        return;
      }
      
      const games = result.games;
      
      if (!games || games.length === 0) {
        toastError('No valid games found in CSV data');
        setLoading(false);
        return;
      }

      setPreview(games);
      success(result.message || `Found ${games.length} game(s). Please review and click "Import All" to confirm.`);
    } catch (error) {
      console.error('Error parsing CSV:', error);
      toastError('Error parsing CSV data');
    } finally {
      setLoading(false);
    }
  };


  const importGames = async () => {
    if (!preview || preview.length === 0) {
      toastError('No games to import');
      return;
    }

    setLoading(true);
    let imported = 0;
    let errors = 0;

    try {
      // First, get all players to map names to IDs
      const playersResponse = await fetch('/api/players');
      const players = await playersResponse.json();
      const playerMap = {};
      players.forEach(p => {
        playerMap[p.name] = p.id;
      });

      for (const game of preview) {
        try {
          // Map player names to IDs
          const participantIds = game.participants
            .map(name => playerMap[name])
            .filter(id => id !== undefined);

          if (participantIds.length === 0) {
            console.warn(`No valid players found for game on ${game.gameDate}`);
            errors++;
            continue;
          }

          const actionsWithIds = game.actions
            .map(action => {
              const playerId = playerMap[action.playerName];
              return playerId ? {
                playerId,
                actionType: action.actionType,
              } : null;
            })
            .filter(a => a !== null);

          const response = await fetch('/api/games', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              gameDate: game.gameDate,
              participants: participantIds,
              actions: actionsWithIds,
            }),
          });

          if (response.ok) {
            imported++;
          } else {
            errors++;
          }
        } catch (error) {
          console.error('Error importing game:', error);
          errors++;
        }
      }

      if (imported > 0) {
        success(`Successfully imported ${imported} game(s)! ${errors > 0 ? `${errors} failed.` : ''}`);
        setTimeout(() => router.push('/analytics'), 1500);
      } else {
        toastError(`Failed to import games. ${errors} error(s).`);
      }
    } catch (error) {
      console.error('Error importing games:', error);
      toastError('Error importing games');
    } finally {
      setLoading(false);
      setPreview(null);
    }
  };

  return (
    <div className="min-h-screen p-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-4xl font-bold text-movato-secondary">Import Games</h1>
          <button onClick={() => router.push('/')} className="btn-secondary">
            ← Home
          </button>
        </div>

        <div className="card mb-6">
          <h2 className="text-xl font-bold mb-4">Import from CSV</h2>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Paste CSV Data or Upload File
            </label>
            <textarea
              value={csvData}
              onChange={(e) => setCsvData(e.target.value)}
              placeholder="Date,Round,Participants,Win,2nd place,Barking & Difuse,Barking & Dead,1st exploaded,1st dead&#10;1-Dec-2025,1,&quot;Arev,Ani,Artash&quot;,Serine,Artash,Arev,,Ani,Khcho"
              className="input-field h-32 font-mono text-sm"
            />
            <div className="mt-2 flex items-center gap-2">
              <input
                type="file"
                accept=".csv"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      setCsvData(event.target?.result || '');
                    };
                    reader.readAsText(file);
                  }
                }}
                className="text-sm"
              />
              <a
                href="/sample_games.csv"
                download
                className="text-sm text-movato-secondary hover:underline"
              >
                📥 Download Sample CSV
              </a>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              CSV Format: Date, Round, Participants (comma-separated), Win, 2nd place, Barking & Difuse, Barking & Dead, 1st exploaded, 1st dead
              <br />
              <span className="text-movato-secondary font-semibold">Note:</span> The "Participants" column lists ALL players who were present, even if they have no actions.
            </p>
          </div>
          <button
            onClick={handleCSVImport}
            disabled={loading}
            className="btn-primary disabled:opacity-50"
          >
            {loading ? 'Parsing...' : 'Parse CSV'}
          </button>
        </div>

        {preview && (
          <div className="card">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-4">
              <h2 className="text-xl font-bold">Preview ({preview.length} games)</h2>
              <button
                onClick={importGames}
                disabled={loading}
                className="btn-primary disabled:opacity-50 w-full sm:w-auto"
              >
                {loading ? 'Importing...' : 'Import All'}
              </button>
            </div>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {preview.map((game, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="font-semibold mb-2 text-base sm:text-lg">
                    {new Date(game.gameDate).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'short', 
                      day: 'numeric' 
                    })} - Round {game.round}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600 mb-2">
                    <span className="font-medium">Participants ({game.participants.length}):</span> {game.participants.join(', ')}
                  </div>
                  {game.actions.length === 0 && (
                    <div className="text-xs text-orange-600 mb-2">
                      ⚠️ No actions recorded for this game
                    </div>
                  )}
                  <div className="text-xs sm:text-sm flex flex-wrap gap-2">
                    {game.actions.map((action, i) => (
                      <span 
                        key={i} 
                        className="px-2 py-1 bg-white rounded border border-gray-300"
                      >
                        <span className="font-medium">
                          {Object.keys(ACTION_TYPE_MAP).find(k => ACTION_TYPE_MAP[k] === action.actionType)}:
                        </span>{' '}
                        <span className="text-movato-secondary">{action.playerName}</span>
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
