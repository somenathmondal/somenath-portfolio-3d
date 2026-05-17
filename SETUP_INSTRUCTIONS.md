# Local Development Setup Instructions

## Step 1: Download Project Files

Since git operations are restricted in this environment, you'll need to download the project files:

1. **Download all files** from this Replit workspace to your local machine
2. **Create a new folder** on your computer called `somenath-portfolio`
3. **Copy all files** from this workspace to that folder

## Step 2: Initialize Git Repository

```bash
cd somenath-portfolio
git init
git add .
git commit -m "Initial commit: 3D Portfolio with Woodlight.fr-inspired design"
```

## Step 3: Create GitHub Repository

1. Go to [GitHub.com](https://github.com) and create a new repository
2. Name it `somenath-portfolio` or your preferred name
3. **Don't** initialize with README (we already have one)
4. Copy the repository URL

## Step 4: Connect Local Repository to GitHub

```bash
git remote add origin YOUR_GITHUB_REPO_URL
git branch -M main
git push -u origin main
```

## Step 5: Install Dependencies and Run Locally

```bash
# Install all dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:5000`

## Key Files You Can Customize

### Personal Information
- `client/src/components/LandingPage.tsx` - Your name display
- `client/src/components/ContactSection.tsx` - Social media links
- `client/src/components/ScrollCV.tsx` - Your CV content

### Project Portfolio
- `client/src/data/projects.ts` - Add your actual projects

### Styling
- `tailwind.config.ts` - Color schemes and design tokens
- `client/src/index.css` - Global styles and CSS variables

### 3D Effects
- `client/src/components/CustomCursor.tsx` - Cursor bubble effects
- `client/src/components/LiquidGlassName.tsx` - Name shader effects

## Development Commands

```bash
npm run dev          # Start development with hot reload
npm run build        # Build for production
npm run start        # Start production server
npm run db:push      # Update database schema (if using database)
```

## Environment Variables (Optional)

Create `.env` file for database integration:
```env
DATABASE_URL=your_postgres_connection_string
NODE_ENV=development
PORT=5000
```

## Troubleshooting

### If npm install fails:
```bash
rm -rf node_modules package-lock.json
npm install
```

### If port 5000 is busy:
```bash
PORT=3000 npm run dev
```

### For TypeScript errors:
```bash
npm run build
```

This will show any type errors that need fixing.

## Project Structure Overview

```
somenath-portfolio/
├── client/                 # React frontend
│   ├── src/components/     # UI components
│   ├── src/lib/           # Stores and utilities  
│   └── public/            # Static assets
├── server/                # Express backend
├── shared/                # Shared types
├── package.json          # Dependencies
└── README.md            # Documentation
```

Your portfolio is ready for customization!