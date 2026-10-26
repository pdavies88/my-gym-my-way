# Google Play: release kit

Answers and files for the Play Console. The steps follow `react-native-expo-playbook.md`, section 10. The first release goes to **internal testing**, which needs no 12-tester closed test.

## Files

| Play Console field | File | Size |
| --- | --- | --- |
| App icon | `play-icon-512.png` | 512 × 512 |
| Feature graphic | `feature-graphic-1024x500.png` | 1024 × 500 |
| Phone screenshots | `screenshots/01-train.png` to `08-session-videos.png` | 1206 × 2412 |

`node scripts/generate-play-assets.mjs` makes the feature graphic and the screenshots. It crops the iPhone shots in `store/screenshots/` to Play's 2:1 limit and paints out Expo Go's developer button. `node scripts/generate-brand-assets.mjs` makes the icon.

## Create the app

**Home → Create app**

| Field | Answer |
| --- | --- |
| App name | My Gym My Way |
| Default language | English (United States) |
| App or game | App |
| Free or paid | Free. This can't be changed to paid later. |
| Declarations | Tick the developer program policies and US export laws boxes |

The package name comes from the first upload: `com.pdavies.mygymmyway`. It is permanent.

## First upload (by hand)

1. Download the `.aab` from the EAS build page.
2. **Test and release → Testing → Internal testing → Create new release.**
3. Accept **Play App Signing**. EAS keeps the upload key, and every update must be signed with it.
4. Upload the `.aab`. Release name: `1.1.0 (2)`. Release notes:

```
<en-US>
Workouts built from the equipment you own, with bootcamps, guided cardio, mobility and stretching. Free, no account.
</en-US>
```

5. **Testers** tab: create a list and add emails, or upload a CSV with one email per line and no header. Keep the CSV out of git.
6. Save. After review, copy the **Join on the web** link and send it to testers yourself. Google doesn't email them.

Later builds can go up with `npx eas-cli@latest submit --platform android` once a Google service account key is set up. `eas.json` already sends them to the internal track as a draft.

## Main store listing

**Grow users → Store presence → Main store listing**

| Field | Value |
| --- | --- |
| App name | My Gym My Way |
| Short description (80) | Free home gym workouts built from the equipment you own. No paywall. |
| Full description (4,000) | The App Store description in `store/README.md` |
| Graphics | The files in the table above |

**Store settings:** category **Health & Fitness**. Contact email `preston5@protonmail.com`. Website `https://pdavies88.github.io/my-gym-my-way/`.

## App content

**Policy and programs → App content.** Answer each card.

| Card | Answer |
| --- | --- |
| Privacy policy | `https://pdavies88.github.io/my-gym-my-way/privacy/` |
| App access | All functionality is available without special access. There is no login. |
| Ads | No, the app doesn't contain ads. |
| Content rating | Category **All other app types**. Answer No to every question. Expected result: Everyone / PEGI 3. |
| Target audience | **18 and over** only. This keeps the app out of the Families policy. |
| News app | No |
| Government app | No |
| Financial features | None |
| Health apps | Tick **Activity and fitness** only. It is not a medical device. |
| Data safety | See below |

### Data safety

1. **Does your app collect or share any of the required user data types?** No.
2. That ends the form. The listing shows "No data collected".

Why this answer:
- Equipment, workouts, history, height, weight and settings stay in on-device storage. Nothing is sent to a server.
- The app has no analytics, crash reporting, advertising or account.
- Exercise videos are YouTube embeds in privacy-enhanced mode. YouTube sees the viewer's IP address when a video plays, and the privacy policy says so. Google's guidance treats data that goes straight from the user to a third-party web view as the third party's collection, but re-read the current Data safety help page before submitting, in case that changed.

## Send for review

**Publishing overview → Send changes for review.** A new app's first release is reviewed, even on internal testing. Review usually takes a few hours to a few days.

## If testers see "Item not found"

- The release is still in review, or it wasn't sent.
- The tester list isn't ticked on the release.
- The tester's phone uses a different Google account.
- The tester hasn't accepted the invite on the web link yet.
- Clearing the Play Store app's cache sometimes helps.
