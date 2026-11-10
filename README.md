# Leanbean

Leanbean is a local-first nutrition and workout tracker. It combines a React interface with a Django REST API and keeps account and health data in a local SQLite database.

## What you can do

- Create a local account and sign in securely with token-based authentication.
- Build a reusable ingredient library with serving sizes and calorie, carbohydrate, fat, and protein values.
- Combine ingredients into recipes and edit them later.
- Log recipes, servings, or individual ingredients as meals on a selected date.
- Review daily calorie and macro totals, including a macro breakdown chart.
- Log body weight and follow weekly weight trends.
- Create cardio and lifting activities with the units that make sense for each activity.
- Assemble reusable workouts, log completed workouts, and review or edit workout history by date.
- Navigate across dates to review past entries and plan or record new ones.
- Keep every user's records isolated from other local accounts.

## How it runs

Like the Budget App, Leanbean runs as one local process on a custom port. Django serves both the API and the built React app, so there is no VM and no second frontend server required during normal use. The default address is <http://127.0.0.1:8011>.

All persistent app data is stored in `db.sqlite3`. That file is intentionally ignored by Git because it can contain usernames, email addresses, password hashes, nutrition history, weights, and workout data.

## Setup

Requires Python 3.10 or newer and Node.js 20 or newer.

Create a Python environment and install the backend dependencies:

```bash
python3 -m venv .venv
source .venv/bin/activate
python3 -m pip install -r requirements.txt
```

Install and build the frontend, then prepare the database:

```bash
cd frontend
npm install
npm run build
cd ..
python3 manage.py migrate
```

Start Leanbean in the foreground:

```bash
python3 server.py
```

Open <http://127.0.0.1:8011>. Stop it with `Ctrl-C`.

### Run in the background on a custom port

This example uses port `8124`, writes logs to `leanbean.log`, and saves the process ID to `leanbean.pid`:

```bash
LEANBEAN_PORT=8124 nohup python3 server.py > leanbean.log 2>&1 & echo $! > leanbean.pid
```

Open <http://127.0.0.1:8124>. Change `8124` to any available port. The default host is `127.0.0.1`, so the app is only reachable from your computer.

Check the process or follow its logs:

```bash
ps -p "$(cat leanbean.pid)"
tail -f leanbean.log
```

Stop the background process and remove its PID file:

```bash
kill "$(cat leanbean.pid)"
rm leanbean.pid
```

If the PID file is missing, find and stop the process by port:

```bash
lsof -nP -iTCP:8124 -sTCP:LISTEN
kill "$(lsof -tiTCP:8124 -sTCP:LISTEN)"
```

### Frontend development

For hot reload, run the backend on its default port in one terminal and Vite in another:

```bash
python3 server.py
```

```bash
cd frontend
npm run dev
```

Vite runs at <http://127.0.0.1:3001> and proxies `/api` to `127.0.0.1:8011`. Rebuild with `npm run build` before using the single-process app again.

### Configuration

Copy `.env.example` values into your shell or preferred local environment loader if you want overrides. `server.py` reads `LEANBEAN_HOST` and `LEANBEAN_PORT`; Django also supports `LEANBEAN_DB`, `DJANGO_SECRET_KEY`, `DJANGO_DEBUG`, and comma-separated `DJANGO_ALLOWED_HOSTS`.

### Checks

```bash
python3 manage.py test
python3 manage.py check
cd frontend && npm run lint && npm run build
```

## Publishing this repository

The root `.gitignore` excludes SQLite databases, `.env` files, Python caches and virtual environments, frontend dependencies and builds, logs, PID files, and common editor files. Keep `.env.example` committed, but never put real secrets in it.

Before making the repository public, verify the staged and tracked files:

```bash
git status
git ls-files | grep -E '(^|/)(\.env|db\.sqlite3|__pycache__|.*\.pyc)$'
```

This repository previously tracked local runtime files. Removing them in a new commit prevents them from appearing in the current public checkout, but old commits still retain them. The tracked `.env` only contained a local API URL when reviewed; `db.sqlite3` is private user data and should be treated as exposed if the existing history is published. The safest publication path is to create a fresh public repository from the cleaned working tree without the old `.git` history.

