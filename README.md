# Mek - Exploding Kittens Championship Tracker

Track your Exploding Kittens game rounds, record actions, and see who's winning the championship!

## Features

- 🎮 **Record Games**: Track players, actions, and game dates
- 📊 **Analytics & Leaderboard**: View statistics with charts and detailed tables
- 📜 **Game History**: View, edit, and delete past games
- 👥 **Player Management**: Add, view, and manage players
- 👤 **Player Statistics**: Individual player stats with detailed breakdowns
- 📈 **Scoring System**: Automatic point calculation with absence penalties
- 📅 **Date Range Presets**: Quick filters (This Month, Last Month, This Year, All Time)
- 📥 **Export to CSV**: Download leaderboard data
- 🔔 **Toast Notifications**: Better user feedback
- 📱 **Mobile Responsive**: Works great on all devices

## Scoring Rules

- **1st Dead**: -1 point
- **1st Exploded**: -3 points
- **Barking & Diffuse**: -1 point
- **Barking & Dead**: -3 points
- **2nd Place**: +5 points
- **Win**: +10 points

If a player misses games, their total points are decreased by the absence percentage.

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Database

Create a PostgreSQL database and update `.env.local`:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/mek_db
```

### 3. Create Database Schema

Run the schema SQL file:

```bash
psql -d mek_db -f scripts/schema.sql
```

### 4. Seed Initial Players

The project comes with a seed script for the initial players:

```bash
npm run seed
```

This will add: Arev, Ani, Artash, Seroj, Khcho, Serine, Davo

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
mek/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── players/      # Player management API
│   │   │   ├── games/         # Game recording API
│   │   │   └── analytics/     # Analytics API
│   │   ├── record/            # Record game page
│   │   ├── analytics/         # Analytics & leaderboard page
│   │   └── page.js            # Home page
│   ├── components/
│   │   └── PlayerManager.js   # Player management component
│   └── lib/
│       ├── db.js              # Database connection
│       └── scoring.js         # Scoring logic
├── scripts/
│   ├── schema.sql             # Database schema
│   └── seed_players.js        # Seed initial players
└── package.json
```

## Usage

1. **Record a Game**: 
   - Go to "Record Game" page
   - Select the game date
   - Select players who participated
   - Add actions (1st dead, win, etc.) and assign them to players
   - Save the game

2. **View Analytics**:
   - Go to "Analytics & Leaderboard" page
   - Use quick presets (This Month, Last Month, etc.) or select custom dates
   - View the leaderboard chart and detailed statistics
   - Click on a player name to see their individual statistics
   - Export data to CSV

3. **Game History**:
   - Go to "Game History" page
   - View all recorded games
   - Delete games if needed

4. **Player Statistics**:
   - Click on any player name in the leaderboard
   - View detailed stats including action breakdown and points per game
   - Filter by different time periods

5. **Manage Players**:
   - On the Record Game page, use the "Manage Players" section
   - Add new players or delete existing ones

## Technologies

- **Next.js 14** - React framework
- **PostgreSQL** - Database
- **Tailwind CSS** - Styling
- **Recharts** - Chart library
- **Movato Branding** - Custom theme colors

## License

ISC
