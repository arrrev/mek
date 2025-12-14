import { NextResponse } from 'next/server';

const ACTION_TYPE_MAP = {
  'Win': 'win',
  '2nd place': 'second_place',
  'Barking & Difuse': 'barking_diffuse',
  'Barking & Dead': 'barking_dead',
  '1st exploaded': 'first_exploded',
  '1st dead': 'first_dead',
};

// Helper function to parse date in various formats
function parseDate(dateString) {
  if (!dateString || dateString.trim() === '') return null;
  
  // Try different date formats
  // Format: DD-MMM-YYYY (e.g., "1-Dec-2025")
  const ddmmyyyy = dateString.match(/(\d+)-([A-Za-z]+)-(\d+)/);
  if (ddmmyyyy) {
    const [, day, monthStr, year] = ddmmyyyy;
    const monthMap = {
      'jan': 0, 'feb': 1, 'mar': 2, 'apr': 3, 'may': 4, 'jun': 5,
      'jul': 6, 'aug': 7, 'sep': 8, 'oct': 9, 'nov': 10, 'dec': 11
    };
    const month = monthMap[monthStr.toLowerCase().substring(0, 3)];
    if (month !== undefined) {
      return new Date(parseInt(year), month, parseInt(day));
    }
  }
  
  // Try standard Date parsing
  const date = new Date(dateString);
  if (!isNaN(date.getTime())) {
    return date;
  }
  
  return null;
}

// Parse CSV with proper handling of quoted fields and empty values
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result;
}

export async function POST(request) {
  try {
    const { csvData } = await request.json();

    if (!csvData) {
      return NextResponse.json(
        { error: 'CSV data is required' },
        { status: 400 }
      );
    }

    const csv = csvData;

    // Parse CSV
    const lines = csv.trim().split(/\r?\n/).filter(line => line.trim() !== '');
    if (lines.length < 2) {
      return NextResponse.json(
        { error: 'CSV data is empty or invalid. Need at least a header row and one data row.' },
        { status: 400 }
      );
    }

    // Parse header
    const headers = parseCSVLine(lines[0]).map(h => h.trim().replace(/^"|"$/g, ''));
    
    // Validate required columns
    const requiredColumns = ['Date', 'Round'];
    const missingColumns = requiredColumns.filter(col => !headers.includes(col));
    if (missingColumns.length > 0) {
      return NextResponse.json(
        { error: `Missing required columns: ${missingColumns.join(', ')}` },
        { status: 400 }
      );
    }

    const games = [];

    // Process data rows
    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]).map(v => v.trim().replace(/^"|"$/g, ''));
      if (values.length < headers.length) {
        // Pad with empty strings if needed
        while (values.length < headers.length) {
          values.push('');
        }
      }

      const row = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });

      // Skip empty rows
      if (!row.Date || !row.Round || row.Date.trim() === '' || row.Round.trim() === '') {
        continue;
      }

      // Parse date
      const gameDate = parseDate(row.Date);
      if (!gameDate || isNaN(gameDate.getTime())) {
        console.warn(`Skipping row ${i + 1}: Invalid date "${row.Date}"`);
        continue;
      }

      // Format date in local timezone (YYYY-MM-DD) to avoid timezone conversion issues
      // Use the date components directly instead of toISOString() which converts to UTC
      const formatDateLocal = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };
      
      const gameDateStr = formatDateLocal(gameDate);
      const round = row.Round || '1';

      // Collect ALL participants (players who were present in the game)
      // First, collect from action columns (these are players with actions)
      const participants = new Set();
      const actions = [];

      // Map actions from columns and collect participants
      Object.keys(ACTION_TYPE_MAP).forEach(actionLabel => {
        const playerName = row[actionLabel];
        if (playerName && playerName.trim() && playerName.trim() !== '') {
          const trimmedName = playerName.trim();
          participants.add(trimmedName);
          actions.push({
            actionType: ACTION_TYPE_MAP[actionLabel],
            playerName: trimmedName,
          });
        }
      });

      // Check for a "Participants" column that lists all players who were present
      // This allows players to be present even if they have no actions
      if (row.Participants || row.Players || row['Who Played']) {
        const participantsColumn = row.Participants || row.Players || row['Who Played'];
        if (participantsColumn && participantsColumn.trim()) {
          // Split by comma, semicolon, or space
          const playerList = participantsColumn
            .split(/[,;]/)
            .map(p => p.trim())
            .filter(p => p !== '');
          playerList.forEach(playerName => {
            participants.add(playerName);
          });
        }
      }

      if (participants.size === 0) {
        console.warn(`Skipping row ${i + 1}: No players found`);
        continue;
      }

      games.push({
        gameDate: gameDateStr,
        round,
        participants: Array.from(participants),
        actions,
      });
    }

    if (games.length === 0) {
      return NextResponse.json(
        { error: 'No valid games found in the data. Please check your CSV format.' },
        { status: 400 }
      );
    }

    return NextResponse.json({ 
      games,
      message: `Successfully parsed ${games.length} game(s)`
    });
  } catch (error) {
    console.error('Error importing data:', error);
    return NextResponse.json(
      { error: `Failed to import data: ${error.message || 'Unknown error'}` },
      { status: 500 }
    );
  }
}
