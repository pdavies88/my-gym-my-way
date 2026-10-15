/**
 * Checks that every exercise video still exists and still allows embedding, using YouTube's oEmbed
 * endpoint (no API key needed). Videos can be removed or have embedding turned off at any time, so
 * run this before each release: `npm run check-videos`.
 */
import { EXERCISE_VIDEOS } from '../src/lib/videos.ts';

let failures = 0;
for (const [exerciseId, video] of Object.entries(EXERCISE_VIDEOS)) {
  const url = `https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(`https://www.youtube.com/watch?v=${video.videoId}`)}`;
  const response = await fetch(url);
  if (response.status === 200) {
    const { title, author_name: channel } = await response.json();
    const changed = title !== video.title || channel !== video.channel ? `  (now "${title}" by ${channel})` : '';
    console.log(`ok    ${exerciseId}${changed}`);
  } else {
    failures += 1;
    const reason = response.status === 401 ? 'embedding disabled' : response.status === 404 ? 'not found' : `HTTP ${response.status}`;
    console.log(`FAIL  ${exerciseId}  ${video.videoId}  ${reason}`);
  }
}
console.log(failures ? `\n${failures} video(s) need replacing.` : '\nAll videos are available.');
process.exit(failures ? 1 : 0);
