import { GLView, type ExpoWebGLRenderingContext } from 'expo-gl';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useSharedValue } from 'react-native-reanimated';
import * as THREE from 'three';

import { createDemoScene } from '@/components/demo/demo-scene';
import { IconButton } from '@/components/icon-button';
import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { getMotion, type MotionId } from '@/lib/motion/motions';

/**
 * expo-gl gives us a WebGL context but no DOM canvas. Three.js only needs a few canvas fields,
 * so this stub supplies them.
 */
function canvasFor(gl: ExpoWebGLRenderingContext): HTMLCanvasElement {
  const stub = {
    width: gl.drawingBufferWidth,
    height: gl.drawingBufferHeight,
    clientWidth: gl.drawingBufferWidth,
    clientHeight: gl.drawingBufferHeight,
    style: {},
    addEventListener: () => {},
    removeEventListener: () => {},
    getContext: () => gl,
  };
  return stub as unknown as HTMLCanvasElement;
}

/** A looping 3D demonstration of an exercise. Drag sideways to turn the view. */
export function ExerciseDemo({ motionId, height = 320 }: { motionId: MotionId; height?: number }) {
  const theme = useTheme();
  const yaw = useSharedValue(0.6);
  const playback = useRef({ playing: true, speed: 1 });
  const frame = useRef<number | null>(null);
  const cleanup = useRef<(() => void) | null>(null);
  const [playing, setPlaying] = useState(true);
  const [slow, setSlow] = useState(false);
  const [failed, setFailed] = useState(false);

  // Stop the render loop and free GPU memory when the screen closes.
  useEffect(
    () => () => {
      if (frame.current !== null) cancelAnimationFrame(frame.current);
      cleanup.current?.();
    },
    [],
  );

  const onContextCreate = (gl: ExpoWebGLRenderingContext) => {
    try {
      const width = gl.drawingBufferWidth;
      const heightPx = gl.drawingBufferHeight;
      // Three.js asks the canvas for its context. Passing `context` directly fails its WebGL 1 check,
      // because expo-gl contexts are instances of WebGLRenderingContext.
      const canvas = canvasFor(gl);
      // Three.js reads `gl.canvas` when it resets its state cache. expo-gl contexts don't have one.
      Object.assign(gl, { canvas });
      const renderer = new THREE.WebGLRenderer({ canvas, antialias: false });
      renderer.setPixelRatio(1);
      renderer.setSize(width, heightPx, false);

      const demo = createDemoScene(getMotion(motionId), theme, width / heightPx);
      cleanup.current = () => {
        demo.dispose();
        renderer.dispose();
      };

      let seconds = 0;
      let last: number | null = null;
      const loop = (now: number) => {
        const delta = last === null ? 0 : Math.min((now - last) / 1000, 0.1);
        last = now;
        if (playback.current.playing) seconds += delta * playback.current.speed;
        demo.update(seconds, yaw.get());
        // expo-gl changes the framebuffer binding when it presents a frame, but Three.js caches the
        // binding and won't rebind. Rebinding the default framebuffer here lets every frame reach the screen.
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        renderer.render(demo.scene, demo.camera);
        gl.endFrameEXP();
        frame.current = requestAnimationFrame(loop);
      };
      frame.current = requestAnimationFrame(loop);
    } catch (error) {
      console.warn('3D demo failed to start', error);
      setFailed(true);
    }
  };

  const pan = Gesture.Pan()
    .runOnJS(true)
    .activeOffsetX([-8, 8])
    .onChange((event) => {
      yaw.set(yaw.get() - event.changeX * 0.012);
    });

  const togglePlaying = () => {
    playback.current.playing = !playing;
    setPlaying(!playing);
  };
  const toggleSlow = () => {
    playback.current.speed = slow ? 1 : 0.4;
    setSlow(!slow);
  };

  if (failed) {
    return (
      <View style={[styles.frame, styles.fallback, { height, borderColor: theme.border, backgroundColor: theme.card }]}>
        <ThemedText type="small" themeColor="textSecondary">
          The 3D demo isn’t available on this device. Follow the steps below.
        </ThemedText>
      </View>
    );
  }

  return (
    <View style={[styles.frame, { height, borderColor: theme.border, backgroundColor: theme.card }]}>
      <GestureDetector gesture={pan}>
        <View style={styles.fill} collapsable={false}>
          {/* Multisampling is off: in testing, expo-gl's multisample resolve dropped every Three.js frame. */}
          <GLView style={styles.fill} msaaSamples={0} onContextCreate={onContextCreate} />
        </View>
      </GestureDetector>
      <View style={styles.controls} pointerEvents="box-none">
        <IconButton
          icon={playing ? { ios: 'pause.fill', android: 'pause' } : { ios: 'play.fill', android: 'play_arrow' }}
          label={playing ? 'Pause demo' : 'Play demo'}
          onPress={togglePlaying}
        />
        <IconButton
          icon={{ ios: 'tortoise.fill', android: 'slow_motion_video' }}
          label={slow ? 'Normal speed' : 'Slow motion'}
          tone={slow ? 'tint' : 'neutral'}
          onPress={toggleSlow}
        />
      </View>
      <View style={styles.hint} pointerEvents="none">
        <ThemedText type="eyebrow" themeColor="textSecondary" style={styles.hintText}>
          Drag to rotate
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: { borderRadius: Radius.card, borderWidth: 1, overflow: 'hidden' },
  fill: { flex: 1 },
  fallback: { alignItems: 'center', justifyContent: 'center', padding: Spacing.four },
  controls: { position: 'absolute', right: Spacing.two, bottom: Spacing.two, flexDirection: 'row', gap: Spacing.two },
  hint: { position: 'absolute', left: Spacing.three, bottom: Spacing.three },
  hintText: { fontSize: 10 },
});
