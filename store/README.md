# App Store release kit

Everything App Store Connect asks for, ready to paste. Fill these in under **App Store Connect → Apps → My Gym My Way**.

## Go-live checklist

- [ ] The repo is public and GitHub Pages serves `docs/`. Check that both URLs below open.
- [x] The app links to the privacy policy and support page from **Me → About**. Apple requires this.
- [ ] A TestFlight build installs and works on your iPhone.
- [ ] App information, pricing and the version page are filled in from this file.
- [ ] Screenshots are uploaded. See [Screenshots](#screenshots). *Play shots are ready. App Store 6.9-inch shots are not taken yet.*
- [ ] The App Privacy questionnaire is answered. See [App Privacy](#app-privacy-questionnaire).
- [ ] The age rating questionnaire is answered.
- [ ] The App Review notes are pasted in. See [App Review information](#app-review-information).
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
| Subtitle | Home gym workouts, no paywall | 30 |
| Primary category | Health & Fitness | |
| Secondary category | Sports | |
| Content rights | Yes, it shows third-party content: embedded YouTube videos, played through YouTube's own embedded player under YouTube's Terms of Service and credited to each channel | |
| Copyright | 2026 Preston Davies | |
| Price | Free | |

### Promotional text (170 characters, can change without review)

```
Tell it what gear you own and get a workout you can actually do. Free for real: no paywall, no account, no ads. Your history stays on your phone.
```

### Description (4,000 characters)

```
My Gym My Way builds home workouts from the equipment you actually own.

Tick off your gear once: dumbbells, a barbell, a rack, a bench, kettlebells, bands, a pull-up bar, a cable machine, a suspension trainer, a boxing bag or cardio machines. Bodyweight is always included. Every workout and every exercise in the library fits what you have.

GENERATE A WORKOUT IN SECONDS
Pick a focus (full body, upper, lower, push, pull, core or conditioning) and a length. The app picks exercises you can do and balances them across movement patterns. Swap any move you don't like, shuffle for a new mix, and save the ones you love.

OR BUILD YOUR OWN
Hand-pick every exercise from a library of over 100 moves, grouped by movement type or by muscle so you can find what you want fast. Each one lists the muscles it works, the gear it needs and step-by-step form cues.

WATCH EVERY MOVE
Every exercise has a short demonstration video from a fitness coach, plus step-by-step form cues. The cues work offline.

GUIDED CARDIO
Timed sessions from 14 to 45 minutes for the rower, treadmill, boxing bag, kettlebell, TRX, bike and jump rope, plus a no-equipment HIIT. Quiet 15-minute morning and evening sessions mix full-body strength and stretching with no jumping, so they won't wake the house. A full-screen timer tells you what to do, how hard to go on a 1–10 scale and what's next. Soft chimes count you down, a voice announces each step, and your music keeps playing underneath.

RUN IT AS A CIRCUIT
Turn any workout into a timed weight circuit. Every move runs back to back on a work and rest timer, round after round, with an easy, standard or hard setting.

MOBILITY AND STRETCHING
A Recover tab with guided mobility sessions, including a quick pre-workout warm-up, and full-body, lower-body and upper-body stretches. No equipment needed.

A SIMPLE SESSION CHECKLIST
Start a workout and tick off each exercise as you finish it. A timer tracks how long you've been training. It pauses when you leave the app, and you can pause or restart it any time. Finish, and the session goes into your history.

HISTORY AND BMI
See your past sessions and how many you've done this week. A BMI calculator in US or metric units shows your BMI and its category.

FREE. FOR REAL.
- No paywall, subscription or in-app purchases
- No ads
- No account or sign-up
- No analytics or tracking
- Works offline, except the exercise videos
- Your equipment, workouts, history and measurements stay on your phone

My Gym My Way gives general fitness information for adults. It is not medical advice. Talk to a doctor before starting a new exercise program.
```

### Keywords (100 characters, comma-separated, no spaces)

```
workout,home,gym,dumbbell,barbell,kettlebell,strength,training,exercise,planner,free,fitness,lift
```

"gym" also appears in the name, and Apple indexes the name. Swap words here freely, but leave out other companies' trademarks.

## App Privacy questionnaire

App Store Connect → **App Privacy → Get Started**.

1. **Do you or your third-party partners collect data from this app?** No.
2. Click **Publish**.

The label then shows "Data Not Collected".

**Review before submitting:** the exercise videos are YouTube embeds in a web view, in privacy-enhanced mode. YouTube receives the viewer's IP address and may record views. That is the standard YouTube embed, not a third-party SDK in the app, and the privacy policy discloses it. Re-read Apple's current App Privacy guidance before answering, in case it now counts embedded web players.

Why this answer:
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
Attached: a recording on a physical iPhone running the latest iOS, starting from launch. It shows choosing equipment, generating a workout, an exercise video, completing a session, a guided cardio session, the history and the BMI calculator. The app has no account registration or login, no user-generated content shared with other users, and no paid content or in-app purchases.

2. PURPOSE AND AUDIENCE
My Gym My Way helps adults who train at home plan workouts with the equipment they own. Most workout apps assume a full commercial gym or hide plans behind a subscription. This app asks which equipment the user has, then generates or lets them build workouts that use only that equipment. Each exercise has form cues and a demonstration video embedded from YouTube. The app is free, with no paywall, ads, account or analytics, and everything except the videos works offline.

3. SETUP AND TEST INSTRUCTIONS
No login, credentials or sample files are needed.
a. Launch the app. On the Train tab, tap "Choose equipment", tick a few items (for example Dumbbells and Weight bench) and go back.
b. Tap "Generate". Pick a focus and a length. Tap "Shuffle" to get a new mix, or swap a single exercise. Tap "Save workout".
c. Tap any exercise to open its detail page with its YouTube demonstration video. Tap play. The credit line under the video opens it on YouTube.
d. From the saved workout, tap "Start workout". Tick off each exercise, then tap "Finish workout".
e. Open the Cardio tab, choose any session ("No-equipment HIIT" needs no gear) and tap "Start session". The timer shows each step with chimes and a spoken cue. Tap the skip button to move through steps, then the X and "Save and end".
f. Open the History tab to see the sessions. Open it and tap "Delete from history" to remove it.
g. Open the Me tab. Enter a height and weight to see the BMI and its category. Switch between US and metric units.
h. Me > Feedback has switches for sounds and voice. Me > About links to the privacy policy and support page.

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
3. Record this flow, slowly, in about 2 minutes:
   1. On the Home Screen, tap the app icon.
   2. Train tab: tap **Choose equipment**, tick a few items and go back.
   3. Tap **Generate**, pick a focus and length, tap **Shuffle** once, then **Save workout**.
   4. Tap an exercise and play its video.
   5. Tap **Start workout**, tick off every exercise and tap **Finish workout**.
   6. Cardio tab: open **No-equipment HIIT**, tap **Start session**, let one step change happen, then tap the X and **Save and end**.
   7. History tab: open the session, then tap **Delete from history** and confirm.
   8. Me tab: enter a height and weight to show the BMI, then **About → Privacy policy**.
4. Stop recording from the red status indicator. The video is saved to Photos.
5. AirDrop it to your Mac. Attach it to your reply in App Store Connect. If the upload is too large, export a smaller copy with QuickTime (File → Export As → 1080p) and try again.

## Screenshots

`store/screenshots/` now holds six iPhone 18 Pro shots (1206 × 2622) taken in Expo Go for the Play listing. They show Expo Go's blue developer button at the top right, so don't upload them to App Store Connect as they are. App Store Connect needs the 6.9-inch size, 1320 × 2868 pixels, from the Pro Max simulator. Save them in `store/screenshots/`. A suggested order, since the first three show in search results:

1. Train tab with saved workouts
2. Generate screen with a focus picked and the exercise list
3. Exercise detail with the video
4. Session checklist part way through
5. Recover tab with mobility and stretch sessions
6. History
7. Me tab with equipment and the BMI calculator

To take them, run the app on the iPhone Pro Max simulator, set the status bar with `xcrun simctl status_bar booted override --time 9:41 --batteryState discharging --batteryLevel 100`, and save each screen with `xcrun simctl io booted screenshot <file>.png`. Save the files outside the project folder while Metro is running. A new file in the project makes Metro reload the app mid-capture.

For the 6.1"/6.3" slot, resize to 1206 × 2622: `mkdir -p 6.3-inch && for f in 0*.png; do sips -z 2622 1206 "$f" --out "6.3-inch/$f"; done` from `store/screenshots/`.

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
