# Impulse

Impulse is a frontend-only MVP for the FBLA Business Plan concept: an AI-driven social discovery network where users train a personal social agent, agents evaluate compatibility with other agents, and humans connect only after a strong match.

This demo intentionally runs without Supabase, OpenAI, API keys, `.env` files, or backend services. All data lives locally in the browser through Zustand persistence backed by AsyncStorage/localStorage.

## Run Locally

```bash
npm install
npx expo start --web --clear
```

Open the Expo web URL, usually `http://localhost:8081`.

If Metro fails on macOS with `EMFILE: too many open files, watch`, run the web server in CI mode:

```bash
CI=1 npx expo start --web --clear
```

## Demo Flow

1. Create an account with any email and a password of 4+ characters.
2. Confirm the 15+ age checkbox.
3. Complete the six onboarding steps:
   - profile name and basics
   - agent name
   - personality quiz
   - at least five interests
   - five training messages with the agent
4. Enter the app and show the core product loop:
   - mood-adaptive feed
   - Discover agent matching
   - agent-to-agent compatibility transcript
   - Matches list
   - human chat with Co-Pilot suggestions
   - My Agent personality breakdown
   - Meaningful Connections Score
   - Premium mock upgrade

## Architecture

- `app/`: Expo Router screens and modals.
- `components/`: reusable UI pieces such as agent avatars, match cards, compatibility rings, mood picker, and conversation viewer.
- `stores/appStore.ts`: local auth, onboarding, agents, matching, messages, feed, notifications, premium state, and persistence.
- `lib/ai.ts`: local heuristic engine replacing the proposed OpenAI edge functions for MVP purposes.
- `lib/api.ts`: typed local wrappers that mirror the planned edge-function API names.
- `lib/permissions.ts`: freemium limits for discovery cards, Co-Pilot usage, compatibility detail, and agent logs.
- `lib/seed.ts`: fictional seed users and trained agents so every new demo user can get matches.
- `lib/connectionScore.ts`: Meaningful Connections Score algorithm.

## MVP Scope

The current MVP implements the business-plan story locally:

- Local email/password demo auth.
- Agent creation from onboarding answers.
- User-to-agent training chat.
- Simulated P.E.N.T-style agent-to-agent compatibility scoring.
- Seed profiles that produce immediate matches after onboarding.
- Human match chat with local auto-replies for demo continuity.
- AI Co-Pilot suggestions using local heuristics.
- Mood check-ins and ranked feed posts.
- In-app notifications.
- Freemium gates and mock premium upgrade.
- Persistent state across refreshes.

## Frontend-Only Notes

The original business plan describes Supabase, OpenAI, realtime infrastructure, and advanced avatars. Those are treated as production roadmap architecture. This repository is the self-contained MVP for judging/demo use, so it does not require:

- Supabase project setup
- OpenAI API keys
- Edge Function deployment
- `.env` files
- external network services

## Roadmap

- Supabase Auth, PostgreSQL, Realtime, and Storage.
- OpenAI-powered edge functions for agent chat, matching, Co-Pilot, and mood feed ranking.
- Real seed-agent table and scheduled matching jobs.
- Real Stripe payments.
- Push notifications.
- Rich avatar customization and 3D avatar rendering.
- Voice/video calls.
- VR/AR agent meetings.
- Events marketplace and developer platform.
