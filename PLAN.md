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
| Stack | Expo SDK 58, React Native 0.88, New Architecture, React Compiler, Expo Router with typed routes. Same conventions as `react-native-expo-playbook.md`. |

## Features

1. **Equipment.** A checklist of common home-gym equipment, such as dumbbells, barbell, rack, bench, kettlebell, pull-up bar, bands, cable machine, suspension trainer (TRX), boxing bag and cardio machines. Bodyweight is always available.
2. **Exercise library.** 116 curated exercises, including 12 mobility moves and 12 stretches. Each one lists the equipment it needs, the muscles it works, step-by-step cues and a movement pattern. The library opens from the Train tab and filters to what your equipment allows.
3. **Workout builder.**
   - Generate: pick a focus (full body, upper, lower, push, pull, core, conditioning) and a length. The generator picks exercises you can do, balanced across movement patterns. You can swap any exercise or regenerate.
   - Build by hand: add exercises from the library. The list is grouped by movement type (squat, hinge, push and so on) or by muscle (chest, back, glutes and so on). Groups start closed and show a count. Inside a muscle group, exercises are grouped again by type. Searching shows every match in one list.
   - Save workouts to reuse them. The app keeps up to 100 saved workouts and the newest 500 history entries. Each one is well under 1 KB, so the app stays small.
   - Style: sets, or a bootcamp. A bootcamp is a station circuit like an Orangetheory or Barry's class, 30, 45 or 60 minutes long. Cardio stations come from your equipment: the treadmill, rower, bike, boxing bag or jump rope, or floor cardio with no machine. With two or more machines, it runs one block on each of two machines with a floor block between. With one machine, it alternates the machine and the floor twice. Cardio blocks repeat a 4-minute wave of base, push, all-out and recovery efforts. The floor block rotates through the generated strength moves, 45 seconds on and 15 to change over. Each bootcamp has a warm-up, a minute to move between stations, and a cool-down with stretching. Version 1.2 replaced the old timed circuit, which ran every move back to back, with the bootcamp. A workout saved as a bootcamp starts as one.
4. **Session checklist.** Start a workout and log each set: weight (in lb or kg, stored as kg) and reps, or seconds for holds. Each exercise shows last time's sets and a suggested next step using double progression: add reps at the same weight until every set reaches the top of the range, then add 5 lb or 2.5 kg and drop to the bottom of the range. Logging the target number of sets ticks the exercise off. Finishing saves the session to history, with the date, duration, sets and the exercises you completed. Each exercise's screen shows a progress chart of the heaviest set (or most reps) per session, your best and the next suggestion. The exercise videos are references for people who don't know a move; logging and progress are the core. The timer pauses when you close the session screen or leave the app, and you can pause it, resume it or restart it from 0:00. History stores the time trained, without pauses.
5. **History.** A list of past sessions, a count of sessions this week, and a streak calendar of the last five weeks with a day streak and a week streak.
12. **4-week programs.** Pick 2 to 5 days a week and the app builds a plan from your equipment: the same workouts each week (full body, upper/lower, or push/pull/legs splits), so the logged weights can climb, a lighter week 4 with one set fewer, and one optional cardio session suggested each week. The Train tab shows the next workout with a Start button.
13. **Home Screen widget and Siri.** A small and medium widget start the next program workout, show the week streak and offer Quiet morning and the 5-minute stretch. Siri and Shortcuts can "Start my next workout" and "Start <any guided session>".
6. **BMI calculator.** Height and weight in US or metric units. It shows the BMI value and the WHO category, with a "general wellness, not medical advice" line. It stays on the device.
7. **Video demonstrations.** Tap an exercise to watch a short demonstration by a real person. Each video is a curated public YouTube video, embedded with YouTube's player in privacy-enhanced mode and credited to its channel. It costs nothing, and the videos need an internet connection. The first version used procedural 3D figures, but they looked clunky, so videos replaced them.
8. **Guided cardio.** A Cardio tab with at least six timed sessions for each type: rower, treadmill, boxing bag, kettlebell, TRX, bike, jump rope, no equipment, and quiet 15-minute morning and evening sessions with no jumping. Boxing and plyo sessions alternate 3-minute bag stations with plyometric stations, with 30 seconds of active recovery between, like 9Round. A shadowbox version needs no bag. Tabatas use 10 seconds of active recovery instead of rest, and the voice says only the step name for steps of 20 seconds or less, so it doesn't call start and stop every few seconds. The rower, treadmill and bag each have sessions of 30 to 45 minutes. A full-screen timer shows each step, how hard to go, a cue and what comes next. Soft bell chimes and a 3-2-1 countdown mark each step change, a natural-sounding voice at 85% speed announces each step and gives a 10-second heads-up, and a 1–10 effort meter shows how hard to go. Music ducks under the cues, and the screen stays awake. Sounds and voice each have a switch in Me. The voice says only the step's name, such as "Squats", and "Next, push-ups" 10 seconds ahead; new lines queue instead of cutting off the last one. Version 1.1 removed haptics, because they added little. Finished sessions go into History. A timed session pauses when you leave the app or the screen, unless Apple Health is on (iOS 26 and later). Then a live HealthKit workout keeps the timer, chimes and voice going on the Lock Screen, a Live Activity shows the step and its countdown, and the finished session is saved to Health as a workout. Strength checklists are saved to Health too. Ending a session offers to keep going, restart from the beginning, discard or save.
10. **Recover tab: mobility and stretching.** Five mobility sessions (5-minute mobility, morning mobility, hips and lower back, shoulders and upper back, and a 5-minute pre-workout warm-up) and four stretch sessions (5-minute stretch, full body, lower body and upper body). None needs equipment. They live in their own tab, so the app never pushes a stretch after a workout.
11. **Motion.** No bouncing animations. Presses, ticks, progress bars and the BMI marker ease into place. Animations follow the phone's Reduce Motion setting, and the how-to sheet fades instead of sliding when it is on.
9. **Navigation.** Every stacked screen has a back button, and every modal has a close button. If there is nothing to go back to, the button goes home.

## Open-source tools

| Need | Tool |
| --- | --- |
| Exercise videos | YouTube embeds (`youtube-nocookie.com`) in `react-native-webview`, which works in Expo Go. No API key. |
| Navigation | `expo-router` with `NativeTabs` |
| Cardio cues | `expo-audio` (generated bell chimes), `expo-speech` (on-device voice), `expo-keep-awake` |
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
- **Recover tab:** mobility and stretch sessions.
- **Library screen:** opened from the Train tab. All exercises, grouped by type or muscle, filtered by your equipment, with a search field.
- **History tab:** past sessions.
- **Me tab:** equipment, units, Feedback switches (sounds and voice), the BMI calculator and an About section.
- **Exercise detail:** the video, cues, muscles and equipment.
- **Generate modal:** focus, length and a preview of the result.
- **Session screen:** the checklist, an elapsed-time counter, and Pause and Restart timer buttons.
- **Timer screen:** guided cardio, bootcamps, mobility and stretch sessions.

## Code layout

Pure logic lives in `src/lib` and has unit tests:

- `exercises.ts`: the exercise catalog
- `equipment.ts`: the equipment list
- `generator.ts`: workout generation, with a seeded random number generator so tests are stable
- `bmi.ts`: BMI math and unit conversion
- `videos.ts`: the curated YouTube video for each exercise
- `cardio.ts`: guided cardio, mobility and stretch sessions, the timer position and cue logic, and effort guidance
- `muscles.ts`: the body areas used to browse exercises by muscle
- `circuit.ts`: picks bootcamp stations from your equipment and builds the timed station circuit
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
