# App Store release kit

Everything App Store Connect asks for, ready to paste. Fill these in under **App Store Connect → Apps → My Gym My Way**.

## Go-live checklist

- [x] The repo is public and GitHub Pages serves `docs/`. Both URLs below opened on November 19, 2026.
- [x] The app links to the privacy policy and support page from **Me → About**. Apple requires this.
- [x] A TestFlight build installs and works on your iPhone. Version 1.3.0, build 9.
- [ ] On a real iPhone with Apple Health on, a locked phone keeps the timer, voice and Lock Screen countdown going. It worked in the simulator.
- [ ] App information, pricing and the version page are filled in from this file.
- [ ] Screenshots are uploaded. See [Screenshots](#screenshots). The 6.9-inch set is in `store/screenshots/app-store/`.
- [ ] The App Privacy questionnaire is answered. See [App Privacy](#app-privacy-questionnaire).
- [ ] The age rating questionnaire is answered.
- [ ] The screen recording is attached and the App Review notes are pasted in. See [App Review information](#app-review-information).
- [ ] The build is selected on the version page, then **Add for Review → Submit**.

## Name check

On October 15, 2026, I searched the US App Store and Google Play for "My Gym My Way".

- **Exact name:** no app uses it on either store.
- **Close names:** many apps start with "My Gym" or "MyGym". The closest are "My Gym Children's Fitness" (App Store) and several gym-management apps called "My Gym" (Google Play). "FIT my way" and "GymWay" are on Google Play.
- **Trademark risk:** "My Gym" is the brand of My Gym Enterprises, a children's fitness franchise. "My Gym My Way" is a longer phrase in a different market, but a trademark search on USPTO is worth doing before a public launch.

If App Store Connect says the name is taken when you create the record, keep "My Gym My Way" as the home-screen name and list it as something like "My Gym My Way: Home Workouts".

## URLs

| Field | Value |
| --- | --- |
| Privacy Policy URL | https://pdavies88.github.io/my-gym-my-way/privacy/ |
| Support URL | https://pdavies88.github.io/my-gym-my-way/support/ |
| Marketing URL (optional) | https://pdavies88.github.io/my-gym-my-way/ |

These URLs assume the GitHub repo is `pdavies88/my-gym-my-way`. Change them if the repo name differs.

## App information

| Field | Value | Limit |
| --- | --- | --- |
| Name | My Gym My Way | 30 |
| Subtitle | Home workouts from your gear | 30 |
| Primary category | Health & Fitness | |
| Secondary category | Sports | |
| Content rights | Yes, it shows third-party content: embedded YouTube videos, played through YouTube's own embedded player under YouTube's Terms of Service and credited to each channel | |
| Copyright | 2026 Preston Davies | |
| Price | Free | |

### Promotional text (170 characters, can change without review)

```
Workouts built from the gear you own. Log every set, follow a 4-week plan and see your progress. Free for real: no paywall, no account, no ads.
```

### Description (4,000 characters)

```
My Gym My Way builds home workouts from the equipment you actually own, then helps you get stronger every week.

Tick off your gear once: dumbbells, a barbell, a rack, a bench, kettlebells, bands, a pull-up bar, a cable machine, a suspension trainer, a boxing bag or cardio machines. Bodyweight is always included. Every workout and every exercise fits what you have.

LOG EVERY SET, GET STRONGER EVERY WEEK
Log the weight and reps for each set with quick plus and minus buttons. The app shows what you did last time and suggests your next step: one more rep, or a little more weight once you hit the top of the range. Each exercise has a progress chart and your personal best.

FOLLOW A 4-WEEK PROGRAM
Choose 2 to 5 days a week and get a plan built from your equipment. The same workouts repeat each week so your weights can climb, the last week is lighter, and each week suggests a cardio session. A streak calendar keeps you going.

GENERATE OR BUILD A WORKOUT
Pick a focus (full body, upper, lower, push, pull, core or conditioning) and a length, and the app picks exercises you can do, balanced across movement patterns. Or hand-pick every move from a library of over 100 exercises, grouped by type or muscle.

GUIDED CARDIO
At least six timed sessions each for the rower, treadmill, boxing bag, kettlebell, TRX, bike, jump rope and no equipment. Try boxing and plyometric stations, or Tabatas that keep you moving the whole way. A full-screen timer tells you what to do and how hard to go, and a voice calls each move while your music keeps playing.

QUIET SESSIONS
15-minute morning and evening workouts with no jumping, so they won't wake the house. Full-body strength and stretching in one.

BOOTCAMP AT HOME
A class-style station workout in 30, 45 or 60 minutes, built from your cardio machines and a floor station of strength moves.

MOBILITY AND STRETCHING
A Recover tab with guided mobility and stretch sessions, including 5-minute versions of each.

APPLE HEALTH AND THE LOCK SCREEN
Turn on Apple Health to save finished sessions as workouts. Timed sessions then keep going with your phone locked, with the current move and countdown on the Lock Screen and in the Dynamic Island. The app only saves workouts. It never reads your health data.

WIDGET AND SIRI
Start your next workout from the Home Screen widget, or say "Start my next workout in My Gym My Way". Siri can start any guided session too, like Quiet morning.

SEE EVERY MOVE
Every exercise has step-by-step form cues and a short demonstration video from a fitness coach, so you know exactly what to do.

FREE. FOR REAL.
- No paywall, subscription or in-app purchases
- No ads
- No account or sign-up
- No analytics or tracking
- Works offline, except the exercise videos
- Your workouts, history and measurements stay on your phone

My Gym My Way gives general fitness information for adults. It is not medical advice. Talk to a doctor before starting a new exercise program.
```

### Keywords (100 characters, comma-separated, no spaces)

```
workout,tracker,log,program,dumbbell,kettlebell,strength,home,lifting,planner,hiit,rower,boxing,free
```

"gym" also appears in the name, and Apple indexes the name. Swap words here freely, but leave out other companies' trademarks.

## App Privacy questionnaire

App Store Connect → **App Privacy → Get Started**.

1. **Do you or your third-party partners collect data from this app?** No.
2. Click **Publish**.

The label then shows "Data Not Collected".

**Review before submitting:** the exercise videos are YouTube embeds in a web view, in privacy-enhanced mode. YouTube receives the viewer's IP address and may record views. That is the standard YouTube embed, not a third-party SDK in the app, and the privacy policy discloses it. Re-read Apple's current App Privacy guidance before answering, in case it now counts embedded web players.

Why this answer:
- **Apple Health doesn't count as collection.** With the optional Apple Health switch on, the app writes workouts to HealthKit on the device. It never reads Health data and never sends it anywhere, so nothing is collected under Apple's definition. The privacy policy has an Apple Health section, which HealthKit apps need.
- **The user's data never leaves the device.** Equipment, workouts, history, height, weight and settings are stored only in the app's on-device storage. The app's network use is loading YouTube's embedded player for exercise videos and opening its own privacy and support pages.
- **No third-party code collects data.** The app has no analytics, crash reporting, advertising or tracking SDK.
- **Consistency:** the app's privacy manifest (`ios.privacyManifests` in `app.json`) declares no collected data types and no tracking, so the build and the label match. It lists the required-reason APIs that React Native and Expo modules use, taken from their own `PrivacyInfo.xcprivacy` files.

## Age rating

Answer **None** or **No** to every content question: violence, sexual content, profanity, drugs, gambling, horror and so on. Then answer:

| Question | Answer | Why |
| --- | --- | --- |
| Unrestricted web access | No | The app only loads YouTube's embedded player for exercise videos and opens its own privacy and support pages. Links out of the player open in the YouTube app or Safari. |
| User-generated content shared with others | No | Nothing is shared between users. |
| Messaging or chat | No | |
| Advertising | No | |
| Medical or treatment information | None | It shows exercises and a BMI number, not medical advice. |
| Health or wellness topics | Yes | It is a workout app with a BMI calculator. |

Apple updated this questionnaire in 2025, so the exact wording may differ. The expected result is the lowest age rating.

## Regulated medical device

**No.**

## App Review information

| Field | Value |
| --- | --- |
| Sign-in required | No |
| Contact name, phone and email | Yours. Apple uses these only to reach you and doesn't show them publicly. |

### Notes

These notes also answer the six questions in Apple's "Guideline 2.1 - Information Needed" request, which new developer accounts get on their first submission. Paste the same text into the App Review **Notes** field (4,000 characters) and, if Apple asks, as your reply in App Store Connect.

```
1. SCREEN RECORDING
Attached: a recording on a physical iPhone running the latest iOS, starting from launch. It shows choosing equipment, starting a 4-week program, logging sets with weights, the progress chart, a guided cardio session continuing on the Lock Screen, the history and streak calendar, and the BMI calculator. The app has no account registration or login, no user-generated content shared with other users, and no paid content or in-app purchases.

2. PURPOSE AND AUDIENCE
My Gym My Way helps adults who train at home plan workouts with the equipment they own. Most workout apps assume a full commercial gym or hide plans behind a subscription. This app asks which equipment the user has, then generates or lets them build workouts that use only that equipment. Each exercise has form cues and a demonstration video embedded from YouTube. The app is free, with no paywall, ads, account or analytics, and everything except the videos works offline.

What makes it different: it plans only from the equipment you own; it logs every set and suggests the next step up (double progression); it builds 4-week programs that repeat so weights can climb; and it has 60+ guided timed sessions, including quiet no-jumping workouts for early mornings, boxing and plyometric stations, and class-style bootcamps built from the user's cardio machines. Apple Health, a Lock Screen Live Activity, a Home Screen widget and Siri shortcuts are built for this app.

3. SETUP AND TEST INSTRUCTIONS
No login, credentials or sample files are needed.
a. Launch the app. On the Train tab, tap "Choose equipment", tick a few items (for example Dumbbells and Weight bench) and go back.
b. Tap "Generate". Pick a focus and a length. Tap "Shuffle" to get a new mix, or swap a single exercise. Tap "Save workout".
c. Tap any exercise to open its detail page with its YouTube demonstration video. Tap play. The credit line under the video opens it on YouTube.
d. From the saved workout, tap "Start workout". Under each exercise, tap "Log a set", enter a weight and reps, and add more sets. The exercise ticks itself off at the target number of sets. Tap "Finish workout". Open any exercise again to see the progress chart and the suggested next step.
d2. On the Train tab, tap "4-week program", choose the days a week and tap "Start this program". The Train tab then shows the next workout. History shows the streak calendar.
d3. Widget and Siri (iPhone): add the "Next workout" widget from the Home Screen, or say "Start my next workout in My Gym My Way" or "Start Quiet morning in My Gym My Way".
e. Open the Cardio tab, choose any session ("No-equipment HIIT" needs no gear) and tap "Start session". The timer shows each step with chimes and a spoken cue. Tap the skip button to move through steps, then the X and "Save and end".
f. Open the History tab to see the sessions. Open it and tap "Delete from history" to remove it.
g. Open the Me tab. Enter a height and weight to see the BMI and its category. Switch between US and metric units.
h. Me > Feedback has switches for sounds and voice. Me > About links to the privacy policy and support page.
i. Apple Health (optional, iPhone only): open any cardio session and tap "Turn on" on the Apple Health card, or use Me > Apple Health, and allow Workouts. Start a session and lock the phone: the timer, chimes and voice keep going, and the Lock Screen shows the step and its countdown as a Live Activity. Finish the session, and it appears in the Health app under Workouts.

BACKGROUND MODES AND HEALTHKIT
The app uses HealthKit only to save finished workouts (the workout type and its start and end time). It never reads Health data. While a timed session is going, the app runs an HKWorkoutSession (iOS 26 and later), so the timer keeps running with the phone locked. The "audio" background mode plays the spoken coaching cues and countdown chimes during that workout. Both are used only while a workout the user started is running, and only when the user turned on Apple Health.

4. EXTERNAL SERVICES
YouTube, for exercise demonstration videos. Each exercise embeds one public YouTube video with YouTube's own embedded player, in privacy-enhanced mode (youtube-nocookie.com). The app has no backend server, authentication service, payment processor, analytics, crash reporting or advertising SDK. It also opens its own privacy policy and support pages in an in-app browser when the user taps them. All user data is stored on the device.

5. REGIONAL DIFFERENCES
The app works the same in every region. All features are available everywhere, and users can choose US or metric units.

6. REGULATED INDUSTRY AND THIRD-PARTY MATERIAL
The app is not a medical device and does not diagnose, treat or manage any medical condition. It gives general fitness information for adults. The BMI calculator uses the standard formula and World Health Organization adult categories, and says in the app that it is not medical advice.
The exercise videos are public YouTube videos shown through YouTube's embedded player under YouTube's Terms of Service. Each is credited to its channel, with a link to watch it on YouTube. The exercise text was written for this app. Fonts are Archivo under the SIL Open Font License.

Privacy policy: https://pdavies88.github.io/my-gym-my-way/privacy/
Support: https://pdavies88.github.io/my-gym-my-way/support/
```

### Screen recording for App Review

Apple asks for a recording on a physical iPhone running the latest iOS, starting from launch.

1. Update the iPhone to the latest iOS. Delete the app, then reinstall the build you submitted from TestFlight, so the first-run equipment prompt appears.
2. Add **Screen Recording** to Control Center (Settings → Control Center) if it isn't there. Swipe down from the top right and tap the record button. The countdown gives you 3 seconds.
3. Record this flow, slowly, in about 3 minutes:
   1. On the Home Screen, tap the app icon.
   2. Train tab: tap **Choose equipment**, tick Dumbbells and Weight bench, and go back.
   3. Tap **4-week program**, pick 3 days and tap **Start this program**, then **Start workout**.
   4. Under the first exercise, tap **Log a set**, set a weight and reps with the − and + buttons, and add two more sets. Do the same for one more exercise, then tap **Finish** and confirm.
   5. Tap an exercise's video button to show the demo, then go back.
   6. Cardio tab: open **Quiet morning**, tap **Turn on** on the Apple Health card and allow Workouts, then **Start session**. Lock the phone for a few seconds to show the Lock Screen countdown, unlock, then tap the X and **Save and end**.
   7. History tab: show the streak calendar, then open a session.
   8. Me tab: enter a height and weight to show the BMI, then **About → Privacy policy**.
4. Stop recording from the red status indicator. The video is saved to Photos.
5. AirDrop it to your Mac. Attach it to your reply in App Store Connect. If the upload is too large, export a smaller copy with QuickTime (File → Export As → 1080p) and try again.

## Screenshots

The App Store set is in [`screenshots/app-store/`](screenshots/app-store/): eight 6.9-inch shots, 1320 × 2868, from a Release build on the iPhone 18 Pro Max simulator, with sample data from a realistic month of training. Upload them in this order, since the first three show in search results:

1. `01-train.png`: Train tab with the 4-week program card
2. `02-log-sets.png`: logging sets with weights, last time's numbers and the next-step suggestion
3. `03-progress.png`: an exercise with its demo, form cues and progress chart
4. `04-program.png`: the 4-week program, 8 of 12 workouts done
5. `05-history.png`: History with the streak calendar
6. `06-cardio.png`: Cardio tab with the quiet no-jumping sessions
7. `07-timer.png`: the guided timer during Box and Plyo 9
8. `08-lock-screen.png`: the Live Activity on the Lock Screen

App Store Connect scales the 6.9-inch set down for smaller iPhones. If it asks for a 6.3-inch set anyway, upload [`screenshots/app-store/6.3-inch/`](screenshots/app-store/6.3-inch/) (1206 × 2622).

The shots in `screenshots/` itself are older Expo Go captures for Google Play. They show Expo Go's developer button, so don't upload them to App Store Connect.

**Retaking them:** build a Release version with `npx expo run:ios --configuration Release --device "iPhone 18 Pro Max"`, set the status bar with `xcrun simctl status_bar booted override --time 9:41 --batteryState discharging --batteryLevel 100 --cellularBars 4 --wifiBars 3 --operatorName ""`, and save each screen with `xcrun simctl io booted screenshot <file>.png`.

## Google Play listing

| Field | Value | Limit |
| --- | --- | --- |
| App name | My Gym My Way | 30 |
| Short description | Free home gym workouts built from the equipment you own. No paywall. | 80 |
| Full description | Same as the App Store description above | 4,000 |
| App icon | `store/android/play-icon-512.png` | 512 × 512 |
| Category | Health & Fitness | |
| Data safety | No data collected, no data shared. Review the YouTube note under App Privacy first. | |

The feature graphic, phone screenshots and every Play Console answer are in [android/README.md](android/README.md). `node scripts/generate-play-assets.mjs` regenerates the images.

## Brand assets

`node scripts/generate-brand-assets.mjs` renders `src/components/brand/logo-svg.ts` to every icon and splash image. Run it again after changing the logo. It writes:

- `assets/images/icon.png`: iOS icon, 1024 × 1024, square with no alpha channel
- `assets/images/splash-icon.png`: splash mark without the tile
- `assets/images/favicon.png`: web favicon
- `assets/images/android-icon-foreground.png` and `android-icon-monochrome.png`: Android adaptive icon layers
- `store/android/play-icon-512.png`: Google Play icon
- `docs/logo.png` and `docs/favicon.png`: for the GitHub Pages site

## After approval

- Choose **Manually release this version** on the version page if you want to pick the launch day.
- For each update, bump `version` in `app.json`. EAS increments the build number automatically.
