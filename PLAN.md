# My Gym My Way: plan

A free home-gym workout app with no paywall, no account and no backend. You pick the equipment you own, and the app builds workouts from it. During a session you tick off exercises. Each exercise has a short demonstration video from YouTube.

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

1. **Equipment.** A checklist of common home-gym equipment, such as dumbbells, barbell, rack, bench, kettlebell, pull-up bar, bands, cable machine, suspension trainer (TRX), boxing bag and cardio machines. Bodyweight is always available.
2. **Exercise library.** 104 curated exercises, including 12 stretches. Each one lists the equipment it needs, the muscles it works, step-by-step cues and a movement pattern. The library filters to what your equipment allows.
3. **Workout builder.**
   - Generate: pick a focus (full body, upper, lower, push, pull, core, conditioning) and a length. The generator picks exercises you can do, balanced across movement patterns. You can swap any exercise or regenerate.
   - Build by hand: add exercises from the library.
   - Save workouts to reuse them.
   - Style: sets, or a timed circuit. A circuit runs every move back to back on a work and rest timer, then repeats the round. Presets: easy (2 rounds, 30s on, 30s off), standard (3 rounds, 40s on, 20s off) and hard (4 rounds, 45s on, 15s off). Each circuit has a warm-up and a cool-down. A saved workout can also start as a circuit.
4. **Session checklist.** Start a workout and tick off each exercise as you finish it. Reps and weights are not tracked. Finishing saves the session to history, with the date, duration and the exercises you completed. The timer pauses when you close the session screen or leave the app, and you can pause it, resume it or restart it from 0:00. History stores the time trained, without pauses.
5. **History.** A list of past sessions, plus a simple count of sessions this week.
6. **BMI calculator.** Height and weight in US or metric units. It shows the BMI value and the WHO category, with a "general wellness, not medical advice" line. It stays on the device.
7. **Video demonstrations.** Tap an exercise to watch a short demonstration by a real person. Each video is a curated public YouTube video, embedded with YouTube's player in privacy-enhanced mode and credited to its channel. It costs nothing, and the videos need an internet connection. The first version used procedural 3D figures, but they looked clunky, so videos replaced them.
8. **Guided cardio.** A Cardio tab of timed sessions for the rower, treadmill, boxing bag, kettlebell, TRX, bike, jump rope and no equipment, plus circuits that mix them. A full-screen timer shows each step, how hard to go, a cue and what comes next. Soft bell chimes and a 3-2-1 countdown mark each step change, a natural-sounding voice at 85% speed announces each step and gives a 10-second heads-up, and a 1–10 effort meter shows how hard to go. Music ducks under the cues. Haptics mark each step change, and the screen stays awake. Sounds, voice and haptics each have a switch in Me. Finished sessions go into History. Every timed session pauses when you leave the app or the screen. Ending a session offers to keep going, restart from the beginning, discard or save.
10. **Stretching.** Three guided stretch sessions: full body (about 11 minutes), lower body (about 8) and upper body (about 6). After a workout, circuit or cardio session, a "Stretch now" button offers the one that suits the muscles you used.
11. **Motion.** No bouncing animations. Presses, ticks, progress bars and the BMI marker ease into place. Animations follow the phone's Reduce Motion setting, and the how-to sheet fades instead of sliding when it is on.
9. **Navigation.** Every stacked screen has a back button, and every modal has a close button. If there is nothing to go back to, the button goes home.

## Open-source tools

| Need | Tool |
| --- | --- |
| Exercise videos | YouTube embeds (`youtube-nocookie.com`) in `react-native-webview`, which works in Expo Go. No API key. |
| Navigation | `expo-router` with `NativeTabs` |
| Cardio cues | `expo-audio` (generated bell chimes), `expo-speech` (on-device voice), `expo-haptics`, `expo-keep-awake` |
| UI animation | `react-native-reanimated` 4: list entrances, checklist ticks, progress bar, press feedback. It follows the system Reduce Motion setting. |
| Storage | `expo-sqlite/kv-store`, with versioned keys |
| Validation | `zod` for stored data |
| Icons | `expo-symbols` (SF Symbols on iOS, Material on Android) |
| Fonts | `@expo-google-fonts` |
| Tests | `jest-expo` |
| Builds | EAS free tier |

## Screens

- **Train tab:** a "before you start" health note, saved workouts, and Generate and Build tiles.
- **Cardio tab:** guided sessions, filtered by your equipment.
- **Library tab:** all exercises, filtered by your equipment, with a search field.
- **History tab:** past sessions.
- **Me tab:** equipment, units, Feedback switches (sounds, voice, haptics), the BMI calculator and an About section.
- **Exercise detail:** the video, cues, muscles and equipment.
- **Generate modal:** focus, length and a preview of the result.
- **Session screen:** the checklist, an elapsed-time counter, and Pause and Restart timer buttons.
- **Timer screen:** guided cardio, circuits and stretch sessions.

## Code layout

Pure logic lives in `src/lib` and has unit tests:

- `exercises.ts`: the exercise catalog
- `equipment.ts`: the equipment list
- `generator.ts`: workout generation, with a seeded random number generator so tests are stable
- `bmi.ts`: BMI math and unit conversion
- `videos.ts`: the curated YouTube video for each exercise
- `cardio.ts`: guided cardio and stretch sessions, the timer position and cue logic, effort guidance and stretch suggestions
- `circuit.ts`: turns a list of exercises into a timed circuit
- `session-clock.ts`: the pausable session clock
- `voice.ts`: picks the most natural installed voice

Screens stay thin and read from React context providers.

## Build order

1. Scaffold, remove template files, set the bundle ID and copy reusable pieces from Whatcha Eatin'.
2. Equipment, exercise catalog and the workout generator, with tests.
3. Saved workouts, session checklist and history.
4. BMI calculator.
5. Exercise videos.
6. Typecheck, lint, tests, then run in the iOS Simulator.

## Later

- Optional rest timer between sets in strength workouts.
- Store screenshots and the App Review recording.

## Exercise video notes

- YouTube rejects embeds with no referring page. `exercise-video.tsx` loads the player inside a small HTML page whose base URL is the app's website.
- Links that leave the player, such as the YouTube logo, open in the YouTube app or the browser instead of inside the embed.
- Videos can be deleted or have embedding turned off at any time. Run `npm run check-videos` before each release. It asks YouTube's oEmbed endpoint about every video and lists any that need replacing.
- Playing a video sends a request to YouTube. The privacy policy and `store/README.md` say so. Re-check the App Privacy answer before submitting.
