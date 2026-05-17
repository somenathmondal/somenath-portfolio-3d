# Somenath Mondal - 3D Portfolio

A modern 3D portfolio website showcasing expertise in ThreeJS, BabylonJS, and iOS SceneKit. Features a clean, minimal design inspired by Woodlight.fr with liquid glass cursor effects and smooth scroll-based animations.

## Features

- **Clean Typography**: Elegant name display with gradient text effects
- **Custom Cursor**: Liquid glass bubble that follows mouse movement
- **3D Environment**: Starfield background with floating particles
- **Scroll Animations**: CV reveals on scroll with smooth transitions
- **Responsive Design**: Works across desktop and mobile devices
- **Professional Sections**: Portfolio showcase and contact information

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Three.js** with React Three Fiber for 3D rendering
- **Framer Motion** for smooth animations
- **Tailwind CSS** for styling
- **Zustand** for state management

### Backend
- **Node.js** with Express
- **TypeScript** with ESM modules
- **Drizzle ORM** with PostgreSQL
- **Vite** for development and build

## Local Development Setup

### Prerequisites
- Node.js 20 or higher
- npm or yarn package manager
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-github-repo-url>
   cd somenath-portfolio
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   # Database (optional for development)
   DATABASE_URL=your_postgres_url_here
   
   # Development settings
   NODE_ENV=development
   PORT=5000
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5000`

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run db:push` - Push database schema changes
- `npm run db:studio` - Open Drizzle Studio for database management

## Project Structure

```
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── lib/           # Utilities and stores
│   │   ├── hooks/         # Custom React hooks
│   │   └── shaders/       # GLSL shader files
│   └── public/            # Static assets
├── server/                # Backend Express application
│   ├── index.ts          # Server entry point
│   ├── routes.ts         # API routes
│   └── storage.ts        # Database layer
├── shared/               # Shared TypeScript types
└── README.md

```

## Key Components

- **LandingPage**: Main 3D scene with name display and cursor effects
- **CustomCursor**: Liquid glass bubble cursor implementation
- **ScrollCV**: Animated CV reveal on scroll
- **Portfolio**: Project showcase sections
- **ContactSection**: Social media links and contact information

## Customization

### Updating Personal Information
1. Edit `client/src/components/LandingPage.tsx` for name display
2. Update `client/src/components/ContactSection.tsx` for social links
3. Modify `client/src/data/projects.ts` for portfolio projects
4. Replace content in `client/src/components/ScrollCV.tsx` for experience

### Styling Changes
- Colors and themes: `tailwind.config.ts`
- Typography: Update font imports in `client/src/index.css`
- 3D effects: Modify shader materials in component files

## Deployment

The application is configured for deployment on platforms like Vercel, Netlify, or Replit Deployments.

### Build for Production
```bash
npm run build
```

### Environment Variables for Production
- `DATABASE_URL`: PostgreSQL connection string
- `NODE_ENV=production`
- `PORT`: Server port (defaults to 5000)

## Performance Optimization

- Three.js scenes use efficient LOD systems
- Textures and models are optimized for web
- Code splitting for faster initial loads
- Responsive image loading

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## License

MIT License - feel free to use this as a template for your own portfolio.

---

Built with passion for 3D graphics and modern web technologies.