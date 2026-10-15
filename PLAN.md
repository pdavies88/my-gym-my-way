# My Gym My Way: plan

A free home-gym workout app with no paywall, no account and no backend. You pick the equipment you own, and the app builds workouts from it. During a session you tick off exercises. Each exercise has a short 3D demonstration.

## Decisions

| Topic | Decision |
| --- | --- |
| Name | My Gym My Way. Check the App Store and Google Play for collisions before branding. |
| Bundle ID and package | `com.pdavies.mygymmyway`. Both become permanent after the first store upload. |
| Backend | None. All data stays on the device. There are no API keys, so App Review needs no test credentials. |
| Cost | Free. Every dependency is open source. |
| Look | Edgy and sleek. Dark only, near-black surfaces, sharp corners, an acid-lime accent and bold uppercase headings. |
| Stack | Expo SDK 57, React Native 0.86, New Architecture, React Compiler, Expo Router with typed routes. Same conventions as `react-native-expo-playbook.md`. |

## Features

1. **Equipment.** A checklist of common home-gym equipment, such as dumbbells, barbell, rack, bench, kettlebell, pull-up bar, bands, cable machine and cardio machines. Bodyweight is always available.
2. **Exercise library.** About 60 curated exercises. Each one lists the equipment it needs, the muscles it works, step-by-step cues and a movement pattern. The library filters to what your equipment allows.
3. **Workout builder.**
   - Generate: pick a focus (full body, upper, lower, push, pull, core) and a length. The generator picks exercises you can do, balanced across movement patterns. You can swap any exercise or regenerate.
   - Build by hand: add exercises from the library.
   - Save workouts to reuse them.
4. **Session checklist.** Start a workout and tick off each exercise as you finish it. Reps and weights are not tracked. Finishing saves the session to history, with the date, duration and the exercises you completed.
5. **History.** A list of past sessions, plus a simple count of sessions this week.
6. **BMI calculator.** Height and weight in US or metric units. It shows the BMI value and the WHO category, with a "general wellness, not medical advice" line. It stays on the device.
7. **3D demonstrations.** Tap an exercise to see a looping 3D figure performing it. The figure and equipment are built from simple shapes in code, so there are no model files or licenses to manage. Each movement pattern, such as squat, hinge, press or row, has its own keyframe animation. You can drag to rotate the view.

## Open-source tools

| Need | Tool |
| --- | --- |
| 3D rendering | `three` drawn straight onto `expo-gl`. Both work in Expo Go. |
| Navigation | `expo-router` with `NativeTabs` |
| UI animation | `react-native-reanimated` 4: list entrances, checklist ticks, progress bar, press feedback |
| Storage | `expo-sqlite/kv-store`, with versioned keys |
| Validation | `zod` for stored data |
| Icons | `expo-symbols` (SF Symbols on iOS, Material on Android) |
| Fonts | `@expo-google-fonts` |
| Tests | `jest-expo` |
| Builds | EAS free tier |

## Screens

- **Workouts tab:** saved workouts, a "Generate a workout" button and a "Build your own" button.
- **Library tab:** all exercises, filtered by your equipment, with a search field.
- **History tab:** past sessions.
- **Me tab:** equipment, BMI calculator, units and an About section.
- **Exercise detail:** the 3D demo, cues, muscles and equipment.
- **Generate modal:** focus, length and a preview of the result.
- **Session screen:** the checklist and an elapsed-time counter.

## Code layout

Pure logic lives in `src/lib` and has unit tests:

- `exercises.ts`: the exercise catalog
- `equipment.ts`: the equipment list
- `generator.ts`: workout generation, with a seeded random number generator so tests are stable
- `bmi.ts`: BMI math and unit conversion
- `motion/`: the forward-kinematics rig, the animation sampler and pose keyframes for each movement

Screens stay thin and read from React context providers.

## Build order

1. Scaffold, remove template files, set the bundle ID and copy reusable pieces from Whatcha Eatin'.
2. Equipment, exercise catalog and the workout generator, with tests.
3. Saved workouts, session checklist and history.
4. BMI calculator.
5. 3D demonstrations.
6. Typecheck, lint, tests, then run in the iOS Simulator.

## Later

- App icon and splash art.
- Store listing, privacy policy and support pages, following sections 7 to 10 of the playbook.
- Optional rest timer between exercises.

## 3D notes from the build

These cost time to find. Keep them for the next 3D feature.

- React Three Fiber's native renderer rendered nothing on the iOS 27 simulator, so the demo drives Three.js directly. `src/components/exercise-demo.tsx` owns the GL view and the render loop. `src/components/demo/demo-scene.ts` builds the scene.
- Three.js 0.186's CommonJS entry calls `process.emitWarning`, which React Native lacks. `metro.config.js` points `three` at its ES module build.
- Hand Three.js a canvas stub whose `getContext` returns the `expo-gl` context. Passing `context` directly fails Three.js's WebGL 1 check.
- Keep `msaaSamples={0}` on the `GLView`. With multisampling on, no Three.js frame showed.
- Use matcap or basic materials. Any material that reads scene lights froze `expo-gl` after its first frame. `demo-scene.ts` generates the matcap texture in code.
- `npm run preview-motions -- <outDir> [motionId…]` renders every pose to a PNG contact sheet, so you can check poses without a phone.
