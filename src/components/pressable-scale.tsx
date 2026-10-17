import { Pressable, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type Props = Omit<PressableProps, 'style'> & { style?: StyleProp<ViewStyle>; scaleTo?: number };

/** A Pressable that shrinks slightly while held, for tactile feedback. */
export function PressableScale({ style, scaleTo = 0.97, onPressIn, onPressOut, disabled, ...rest }: Props) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.get() }] }));

  return (
    <AnimatedPressable
      disabled={disabled}
      onPressIn={(event) => {
        scale.set(withTiming(scaleTo, { duration: 90 }));
        onPressIn?.(event);
      }}
      onPressOut={(event) => {
        scale.set(withTiming(1, { duration: 120 }));
        onPressOut?.(event);
      }}
      style={[style, animatedStyle]}
      {...rest}
    />
  );
}
