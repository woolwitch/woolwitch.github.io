# 🧶 Wool Witch

A modern e-commerce web application for handmade crochet and craft goods, built with React, TypeScript, and Supabase.

## 🌟 Features

- Browse handcrafted crochet products
- Shopping cart functionality
- Checkout process
- Responsive design with Tailwind CSS
- Real-time data with Supabase backend
- Type-safe development with TypeScript
- **Local development with Docker** - No cloud account needed!

## 🚀 Quick Start

### Prerequisites

- Node.js (>= 18.0.0)
- npm or yarn
- [Docker Desktop](https://docs.docker.com/get-docker/) (for local database)
- [Task](https://taskfile.dev/) (optional but recommended)
- [Supabase CLI](https://supabase.com/docs/guides/cli) (for local database)

### Installation

#### Option 1: Local Development with Docker (Recommended)

This approach runs everything locally without needing a Supabase cloud account.

1. **Install prerequisites:**
   - [Docker Desktop](https://docs.docker.com/get-docker/)
   - [Supabase CLI](https://supabase.com/docs/guides/cli): `npm install -g supabase`
   - [Task](https://taskfile.dev/installation/) (optional)

2. **Clone and setup:**
```bash
git clone https://github.com/dataGrif/wool-witch.git
cd wool-witch
task setup  # or npm install
```

3. **Start local development:**
```bash
task dev:local
# This will:
# - Start Supabase locally with Docker (first time takes a few minutes)
# - Run database migrations
# - Start the Vite dev server
```

4. **Access the application:**
   - 🌐 Web App: http://localhost:5173
   - 📊 Supabase Studio (DB Admin): http://localhost:54323
   - 🔌 API: http://localhost:54321
   - 📧 Email Testing: http://localhost:54324

#### Option 2: Cloud Supabase

If you prefer using Supabase cloud:

1. Clone the repository:
```bash
git clone https://github.com/dataGrif/wool-witch.git
cd wool-witch
```

2. Install dependencies:
```bash
task install  # or npm install
```

3. Create a `.env` file with your Supabase credentials (see [Cloud Configuration](#cloud-configuration))

4. Start development server:
```bash
task dev  # or npm run dev
```

## ⚙️ Configuration

### Local Development (Docker)

When using `task dev:local`, a `.env.local` file is automatically created with local Supabase credentials:

```env
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
```

> **Note:** This is the standard Supabase local development key. It's safe for local development only and should never be used in production.

No manual configuration needed!

### Cloud Configuration

For cloud Supabase, create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

**How to get Supabase credentials:**
1. Go to https://app.supabase.com/
2. Create a new project or select an existing one
3. Navigate to Settings → API
4. Copy the Project URL and anon/public key

## 🛠️ Development

### Available Task Commands (Local Development)

If you have Task installed, you can use these convenient commands:

```bash
task                  # List all available tasks

# Local Development (Docker)
task dev:local        # Start local Supabase + dev server
task db:start         # Start local Supabase only
task db:stop          # Stop local Supabase
task db:reset         # Reset database (deletes all data)
task db:status        # Check Supabase status
task db:migration:new # Create new migration

# Cloud Development
task dev              # Start dev server (requires .env)

# Build & Test
task install          # Install dependencies
task build            # Build for production
task preview          # Preview production build
task lint             # Run linter
task lint:fix         # Run linter and fix issues
task typecheck        # Run TypeScript type checking
task test             # Run all quality checks

# Cleanup
task clean            # Remove all build artifacts and dependencies
task clean:dist       # Remove only build artifacts
task clean:db         # Remove all local database data

# Setup
task setup            # First-time project setup
task check-deps       # Check if required tools are installed
task ci               # Run all CI checks
```

### Available npm Scripts

```bash
npm run dev         # Start development server
npm run build       # Build for production
npm run preview     # Preview production build
npm run lint        # Run ESLint
npm run typecheck   # Run TypeScript type checking
```

### Database Management

The local Supabase includes:
- **PostgreSQL Database** - Running on port 54322
- **Supabase Studio** - Database admin UI at http://localhost:54323
- **API Server** - REST/GraphQL API at http://localhost:54321
- **Email Testing** - Inbucket at http://localhost:54324

Migrations are automatically applied when starting Supabase locally.

## 📦 Building for Production

### Using Task
```bash
task build
```

### Using npm
```bash
npm run build
```

The built files will be in the `dist/` directory.

## 🧪 Quality Checks

Run all quality checks before committing:

### Using Task
```bash
task test
```

### Using npm
```bash
npm run lint
npm run typecheck
```

## 🗄️ Database Setup

### Local Development (Recommended)

The local Supabase setup handles everything automatically:

```bash
task dev:local  # Starts Supabase and applies migrations automatically
```

Database migrations in `supabase/migrations/` are automatically applied on startup.

### Cloud Supabase

If using cloud Supabase:
1. Create a Supabase project at https://app.supabase.com/
2. Run the migrations in your Supabase SQL editor (found in `supabase/migrations/`)
3. Configure the environment variables in `.env`

## 🤝 Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## 📝 License

This project is part of a personal portfolio. Please contact the repository owner for licensing information.

## 🐛 Troubleshooting

### "Missing Supabase environment variables" error
**For local development:** Make sure you're using `task dev:local` which auto-configures everything.  
**For cloud Supabase:** Create a `.env` file with valid Supabase credentials.

### Docker/Supabase won't start
1. Make sure Docker Desktop is running
2. Check if ports are available: `task db:status`
3. Try resetting: `task db:stop && task db:start`

### Build fails with type errors
Run `task typecheck` or `npm run typecheck` to see detailed type errors.

### Development server won't start
1. Remove `node_modules` and reinstall: `task clean && task install`
2. Check that port 5173 (default Vite port) is not in use

## 📞 Support

For issues and questions, please open an issue on GitHub.