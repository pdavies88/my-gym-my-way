# My Gym My Way

A free home-gym workout app. Pick the equipment you own, generate or build workouts from it, tick off exercises as you go, run them as a station bootcamp, follow guided cardio, mobility and stretch sessions, check your BMI, and watch a demo video of every exercise. No paywall, no account, no backend. Your data stays on the phone.

Built with Expo SDK 58, Expo Router and Reanimated. Exercise videos are YouTube embeds. See [PLAN.md](PLAN.md) for the plan and the decisions behind it.

## Run it

```bash
npm install
npx expo start --go
```

Scan the QR code with Expo Go, or press `i` for the iOS Simulator.

## Check it

```bash
npx tsc --noEmit && npx expo lint && npm test
```

## Layout

- `src/app`: screens (Expo Router)
- `src/components`: UI pieces, including the YouTube video player
- `src/context`: settings and training data providers
- `src/lib`: pure logic with tests: equipment, exercises, videos, workout generator, guided cardio, mobility and stretching, bootcamps, muscle groups, the pausable session clock, voice choice and BMI
- `scripts/check-videos.mjs`: checks every exercise video still exists and allows embedding (`npm run check-videos`)
