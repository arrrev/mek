# Movatos Exploding Kittens Game Tracker

A Next.js application for tracking Exploding Kittens game rounds, player actions, and championship leaderboards.

## Features

- 🎮 Record game rounds with player actions
- 📊 Analytics & Leaderboard with charts
- 📈 Individual player statistics
- 📥 CSV import for bulk game data
- 🎨 Player color customization
- 📱 Mobile-responsive design

## Tech Stack

- **Framework:** Next.js 14
- **Database:** PostgreSQL (Neon)
- **Styling:** Tailwind CSS
- **Charts:** Recharts
- **Deployment:** Vercel

## Local Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/arrrev/mek.git
   cd mek
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file:
   ```env
   DATABASE_URL=postgresql://user:password@host:port/database
   ```

4. **Set up the database**
   - Create a PostgreSQL database
   - Run the schema:
     ```bash
     psql $DATABASE_URL -f scripts/schema.sql
     ```
   - Add color column to players:
     ```bash
     psql $DATABASE_URL -f scripts/add_color_to_players.sql
     ```
   - Seed initial players:
     ```bash
     npm run seed
     ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3001](http://localhost:3001) (or next available port)

## Deployment to Vercel with Neon DB

### 1. Set up Neon Database

1. **Create a Neon account:**
   - Go to [Neon Console](https://console.neon.tech/)
   - Sign up or log in

2. **Create a new project:**
   - Click "Create Project"
   - Choose a name (e.g., "mek-db")
   - Select a region close to your users
   - Click "Create Project"

3. **Get your connection string:**
   - After project creation, you'll see the connection string
   - It looks like: `postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require`
   - Copy this - you'll need it for Vercel

4. **Set up the database schema:**
   - In Neon dashboard, go to "SQL Editor"
   - Copy and paste the contents of `scripts/schema.sql`
   - Click "Run" to execute
   - Then run `scripts/add_color_to_players.sql` in the same way

### 2. Deploy to Vercel

1. **Import your GitHub repository:**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New Project"
   - Import `arrrev/mek` from GitHub
   - Vercel will auto-detect Next.js

2. **Configure Environment Variables:**
   - Before deploying, go to "Environment Variables" in project settings
   - Add a new variable:
     - **Name:** `DATABASE_URL`
     - **Value:** Your Neon connection string (from step 1.3)
   - Make sure to enable it for:
     - ✅ Production
     - ✅ Preview
     - ✅ Development
   - Click "Save"

3. **Deploy:**
   - Click "Deploy"
   - Vercel will build and deploy your app
   - Wait for deployment to complete (usually 1-2 minutes)

4. **Verify deployment:**
   - Once deployed, visit your Vercel URL
   - The app should load (database will be empty initially)

### 3. Seed Initial Players

After deployment, you need to add initial players. You have two options:

**Option A: Using the app (recommended)**
1. Visit your deployed app
2. Go to "Record Game" (code: 1461)
3. Click "Manage Players"
4. Add players manually through the UI

**Option B: Using SQL in Neon**
1. Go to Neon SQL Editor
2. Run this SQL (adjust names as needed):
```sql
INSERT INTO players (name, color) VALUES
  ('Arev', '#FF6B35'),
  ('Ani', '#FF6B35'),
  ('Artash', '#FF6B35'),
  ('Seroj', '#FF6B35'),
  ('Khcho', '#FF6B35'),
  ('Serine', '#FF6B35'),
  ('Davo', '#FF6B35')
ON CONFLICT (name) DO NOTHING;
```

**Option C: Using local script**
```bash
# Update .env.local with your Neon connection string
DATABASE_URL=postgresql://user:password@ep-xxx.neon.tech/neondb?sslmode=require

# Then run:
npm run seed
```

### 4. Update Vercel Settings (Optional)

- **Custom Domain:** Add your domain in Vercel project settings
- **Environment Variables:** Add any additional variables if needed
- **Build Settings:** Vercel auto-detects Next.js, but you can customize if needed

### Troubleshooting

- **Database connection errors:** Verify `DATABASE_URL` is set correctly in Vercel
- **Schema errors:** Make sure you ran both SQL scripts in Neon
- **Build errors:** Check Vercel build logs for details

## Scoring System

- **Win:** +10 points
- **2nd place:** +5 points
- **Barking & Diffuse:** -1 point
- **Barking & Dead:** -3 points
- **1st exploded:** -1 point
- **1st dead:** -5 points

**Participation Penalty:**
If a player misses games, their total points are multiplied by (games played / total games).
Example: 20 total games, player played 18 → multiply by 0.9

## Access Codes

- **Record Game:** 1461 or 6669
- **Import Games:** 1461 or 6669

## Environment Variables

- `DATABASE_URL` - PostgreSQL connection string (required)

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run seed` - Seed initial players

## License

Private project
