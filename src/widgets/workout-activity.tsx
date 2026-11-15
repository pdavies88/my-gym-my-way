import { HStack, Image, Spacer, Text, VStack } from '@expo/ui/swift-ui';
import { font, foregroundStyle, monospacedDigit, multilineTextAlignment, padding } from '@expo/ui/swift-ui/modifiers';
import { createLiveActivity, type LiveActivityEnvironment } from 'expo-widgets';

export type WorkoutActivityProps = {
  /** The session, for example "Box and plyo 9". */
  session: string;
  /** The current step and the next one, for example "Squats" and "Push-ups". */
  step: string;
  next?: string;
  /** When the current step started and ends, in milliseconds since 1970. */
  stepStartedAt: number;
  stepEndsAt: number;
  /** While paused, the countdown stops and shows this time left instead, such as "0:42". */
  pausedLeft?: string;
};

/**
 * The timed session on the Lock Screen and in the Dynamic Island. The countdown runs on the system
 * clock, so it stays right between the app's updates.
 *
 * This function runs in the widget's own runtime: it can't use anything declared outside it.
 */
const WorkoutActivity = (props: WorkoutActivityProps, environment: LiveActivityEnvironment) => {
  'widget';
  const accent = environment.isLuminanceReduced ? '#FFFFFF' : '#C8FF2E';
  const interval = { lower: new Date(props.stepStartedAt), upper: new Date(props.stepEndsAt) };
  const countdown = (size: number) =>
    props.pausedLeft ? (
      <Text modifiers={[font({ weight: 'bold', size }), monospacedDigit(), foregroundStyle('secondary')]}>
        {props.pausedLeft}
      </Text>
    ) : (
      <Text
        timerInterval={interval}
        countsDown
        modifiers={[
          font({ weight: 'bold', size }),
          monospacedDigit(),
          multilineTextAlignment('trailing'),
          foregroundStyle(accent),
        ]}
      />
    );

  return {
    banner: (
      <HStack modifiers={[padding({ all: 16 })]}>
        <Image systemName={props.pausedLeft ? 'pause.fill' : 'figure.run'} color={accent} />
        <VStack alignment="leading">
          <Text modifiers={[font({ weight: 'bold', size: 17 })]}>{props.step}</Text>
          <Text modifiers={[font({ size: 13 }), foregroundStyle('secondary')]}>
            {props.pausedLeft ? 'Paused' : props.next ? `Next: ${props.next}` : props.session}
          </Text>
        </VStack>
        <Spacer />
        {countdown(26)}
      </HStack>
    ),
    compactLeading: <Image systemName={props.pausedLeft ? 'pause.fill' : 'figure.run'} color={accent} />,
    compactTrailing: countdown(15),
    minimal: <Image systemName="figure.run" color={accent} />,
    expandedLeading: (
      <VStack alignment="leading" modifiers={[padding({ all: 8 })]}>
        <Text modifiers={[font({ weight: 'bold', size: 15 })]}>{props.step}</Text>
        <Text modifiers={[font({ size: 12 }), foregroundStyle('secondary')]}>{props.session}</Text>
      </VStack>
    ),
    expandedTrailing: <VStack modifiers={[padding({ all: 8 })]}>{countdown(24)}</VStack>,
    expandedBottom: (
      <Text modifiers={[font({ size: 13 }), foregroundStyle('secondary'), padding({ horizontal: 8 })]}>
        {props.pausedLeft ? 'Paused' : props.next ? `Next: ${props.next}` : 'Last step'}
      </Text>
    ),
  };
};

export default createLiveActivity('WorkoutActivity', WorkoutActivity);
