# My Gym My Way

A free home-gym workout app. Pick the equipment you own, generate or build workouts from it, tick off exercises as you go, check your BMI, and watch a 3D demo of every exercise. No paywall, no account, no backend. Everything stays on the phone.

Built with Expo SDK 57, Expo Router, Reanimated and Three.js. See [PLAN.md](PLAN.md) for the plan and the decisions behind it.

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
- `src/components`: UI pieces, including the 3D demo
- `src/context`: settings and training data providers
- `src/lib`: pure logic with tests: equipment, exercises, workout generator, BMI, and the motion rig
- `scripts/preview-motions.ts`: renders every exercise pose to PNG for checking
