# Local Development Quick Start Guide

This guide demonstrates the complete local development setup for Wool Witch.

## Prerequisites Installation

1. **Docker Desktop**: https://docs.docker.com/get-docker/
2. **Supabase CLI**: `npm install -g supabase`
3. **Task** (optional): https://taskfile.dev/installation/

## First-Time Setup

```bash
# Clone the repository
git clone https://github.com/dataGrif/wool-witch.git
cd wool-witch

# Run setup (installs dependencies, creates .env.local)
task setup

# Expected output:
# ✅ Node.js v18.x.x
# ✅ npm x.x.x
# ✅ Docker xx.xx.xx
# ✅ Supabase CLI x.x.x
# ✅ Created .env.local
# ✅ Setup complete!
```

## Start Development

```bash
# Start local Supabase + development server
task dev:local

# First time: Downloads Docker images (~2-5 minutes)
# Subsequent runs: Starts in ~30 seconds

# Expected output:
# 🐳 Starting Supabase local development environment...
# ✅ Supabase is running!
# 📊 Studio: http://localhost:54323
# 🔌 API: http://localhost:54321
# 🚀 Starting development server...
```

## Access Your Application

- **Web App**: http://localhost:5173
- **Database Admin (Supabase Studio)**: http://localhost:54323
- **API**: http://localhost:54321
- **Email Testing (Inbucket)**: http://localhost:54324

## Database Management

```bash
# Check status
task db:status

# Stop database (keeps data)
task db:stop

# Start database
task db:start

# Reset database (deletes all data)
task db:reset

# Create new migration
task db:migration:new -- add_new_feature
```

## Development Workflow

```bash
# Make changes to code
# Hot reload automatically updates the browser

# Run quality checks
task test        # lint + typecheck

# Build for production
task build
```

## Stopping Development

```bash
# Stop the dev server: Ctrl+C

# Stop Supabase
task db:stop

# Or stop everything and clean up
task clean:db
```

## Environment Files

- `.env.local` - Auto-created for local development (gitignored)
- `.env.example` - Template for cloud Supabase credentials
- `.env` - Your cloud Supabase credentials (create if needed, gitignored)

## Benefits of Local Development

✅ **No cloud account needed** - Everything runs locally  
✅ **Faster development** - No network latency  
✅ **Free** - No cloud costs  
✅ **Offline work** - Develop without internet  
✅ **Data privacy** - All data stays on your machine  
✅ **Easy reset** - Start fresh anytime with `task db:reset`

## Troubleshooting

### Docker not running
```bash
# Make sure Docker Desktop is started
# Check: docker ps
```

### Port already in use
```bash
# Check what's using the port
# Linux/Mac: lsof -i :54321
# Windows: netstat -ano | findstr :54321

# Stop Supabase and try again
task db:stop
task db:start
```

### Database won't start
```bash
# Complete reset
task db:stop
task clean:db
task db:start
```

### Migrations not applying
```bash
# Reset database (applies all migrations)
task db:reset
```
