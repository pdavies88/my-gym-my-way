import * as Linking from 'expo-linking';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView, type WebViewNavigation } from 'react-native-webview';

import { Icon } from '@/components/icon';
import { PressableScale } from '@/components/pressable-scale';
import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { ExerciseVideo as Video } from '@/lib/videos';

/**
 * YouTube rejects embeds that have no referring page, so the player loads inside a tiny HTML page
 * with this origin. It is the app's public website, which also hosts the privacy policy.
 */
const PLAYER_ORIGIN = 'https://pdavies88.github.io';

function playerHtml(video: Video, background: string): string {
  const params = new URLSearchParams({ playsinline: '1', rel: '0', modestbranding: '1' });
  if (video.start) params.set('start', String(video.start));
  // youtube-nocookie.com is YouTube's privacy-enhanced mode: no tracking cookies until playback starts.
  const src = `https://www.youtube-nocookie.com/embed/${video.videoId}?${params}`;
  return `<!doctype html><html><head>
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
<meta name="referrer" content="strict-origin-when-cross-origin">
<style>html,body{margin:0;height:100%;background:${background};overflow:hidden}iframe{border:0;width:100%;height:100%}</style>
</head><body>
<script>
  // The page itself always loads, even offline, so tell the app when the network is missing.
  function report() { if (!navigator.onLine) window.ReactNativeWebView.postMessage('offline'); }
  window.addEventListener('offline', report);
  report();
</script>
<iframe src="${src}" title="${video.title.replace(/"/g, '&quot;')}"
  allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen
  referrerpolicy="strict-origin-when-cross-origin"></iframe>
</body></html>`;
}

export function watchUrl(video: Video): string {
  return `https://www.youtube.com/watch?v=${video.videoId}${video.start ? `&t=${video.start}s` : ''}`;
}

/** An embedded YouTube demonstration, credited to its channel, with a link out to YouTube. */
export function ExerciseVideo({ video }: { video: Video }) {
  const theme = useTheme();
  const [failed, setFailed] = useState(false);

  // Keep the embed in place. Anything that tries to leave it (the YouTube logo, "Watch on YouTube",
  // related links) opens in the YouTube app or the browser instead.
  const onNavigate = (request: WebViewNavigation & { isTopFrame?: boolean }) => {
    const { url } = request;
    if (url.startsWith('about:') || url.startsWith(PLAYER_ORIGIN)) return true;
    if (request.isTopFrame === false) return true;
    Linking.openURL(url).catch(() => {});
    return false;
  };

  return (
    <View style={styles.wrap}>
      <View style={[styles.frame, { borderColor: theme.border, backgroundColor: theme.card }]}>
        {failed ? (
          <View style={styles.fallback}>
            <Icon name={{ ios: 'wifi.slash', android: 'wifi_off' }} size={26} color={theme.textSecondary} />
            <ThemedText type="small" themeColor="textSecondary" style={styles.center}>
              The video needs an internet connection. The steps below still work offline.
            </ThemedText>
          </View>
        ) : (
          <WebView
            source={{ html: playerHtml(video, theme.card), baseUrl: PLAYER_ORIGIN }}
            style={styles.web}
            originWhitelist={['*']}
            allowsInlineMediaPlayback
            allowsFullscreenVideo
            mediaPlaybackRequiresUserAction
            scrollEnabled={false}
            bounces={false}
            setSupportMultipleWindows={false}
            onShouldStartLoadWithRequest={onNavigate}
            onError={() => setFailed(true)}
            onMessage={(event) => event.nativeEvent.data === 'offline' && setFailed(true)}
          />
        )}
      </View>
      <PressableScale
        accessibilityRole="link"
        accessibilityLabel={`Video by ${video.channel}. Open on YouTube`}
        onPress={() => Linking.openURL(watchUrl(video)).catch(() => {})}
        style={styles.credit}>
        <Icon name={{ ios: 'play.rectangle.fill', android: 'smart_display' }} size={16} color={theme.accent} />
        <ThemedText type="small" themeColor="textSecondary" numberOfLines={1} style={styles.creditText}>
          Video by <ThemedText type="smallBold">{video.channel}</ThemedText> on YouTube
        </ThemedText>
        <Icon name={{ ios: 'arrow.up.right', android: 'open_in_new' }} size={13} color={theme.textSecondary} />
      </PressableScale>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: Spacing.two },
  frame: {
    aspectRatio: 16 / 9,
    borderRadius: Radius.card,
    borderWidth: 1,
    overflow: 'hidden',
  },
  web: { flex: 1, backgroundColor: 'transparent' },
  fallback: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.two, padding: Spacing.four },
  center: { textAlign: 'center' },
  credit: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  creditText: { flex: 1 },
});
