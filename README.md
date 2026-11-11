# Leanbean

Leanbean is a private nutrition and strength-training journal built as a ChatGPT Site. The current application lives entirely in [`site/`](site/); the previous Django and standalone React applications have been removed.

## What you can do

- Review nutrition, macros, training, and check-ins by day.
- Save reusable ingredients and meals, including favorite meals for quick access.
- Set calorie goals and optional protein, carbohydrate, and fat goals.
- Import complete workouts from Strong-style text exports.
- Compare exercise performance against the previous two sessions.
- Explore best estimated one-rep max trends without duplicate set-level points.
- Log and manage body weight and optional body-fat check-ins.
- Review workouts, nutrition, and check-ins in the calendar.

## Local setup

Leanbean requires Node.js 22.13 or newer.

This repository includes an `.nvmrc`. If your terminal is using Node 20, switch versions before installing dependencies:

```bash
cd <repo directory>
nvm install
nvm use
node --version
```

The reported version must be `v22.13.0` or newer.

Install the locked dependencies:

```bash
cd <repo directory>/site
npm ci
```

For a brand-new local database, build once and apply the migrations in order:

```bash
npm run build
for migration in drizzle/*.sql; do
  node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file "$migration"
done
```

Do not replay that migration loop against an existing local database. Local data is stored in the ignored `site/.wrangler/` directory.

## Run locally

Start the development server on Leanbean's custom port:

```bash
cd <repo directory>
npm run dev -- --port 8011
```

Open <http://127.0.0.1:8011/signin-with-chatgpt?return_to=/>. The local Sites runtime provides a development-only test sign-in.

Stop the foreground server with `Ctrl-C`. If the terminal was closed or the process was detached, find and stop it by port:

```bash
lsof -nP -iTCP:8011 -sTCP:LISTEN
kill "$(lsof -tiTCP:8011 -sTCP:LISTEN)"
```

To run the already-built Worker instead of the hot-reload development server:

```bash
cd /Users/ivansalazar/repos/leanbean/site
npm run build
npm start -- --port 8011
```

The built Worker preview does not simulate ChatGPT sign-in, so use `npm run dev` for normal local use.

## Checks

```bash
cd /Users/ivansalazar/repos/leanbean/site
npm run lint
npm run build
```

