import { HStack, Image, Link, Spacer, Text, VStack } from '@expo/ui/swift-ui';
import { containerBackground, font, foregroundStyle, lineLimit, padding, widgetURL } from '@expo/ui/swift-ui/modifiers';
import { createWidget, type WidgetEnvironment } from 'expo-widgets';

export type NextWorkoutWidgetProps = {
  /** The next program workout, or missing when there is no program. */
  next?: { title: string; detail: string };
  weekStreak: number;
  thisWeek: number;
  /** Guided sessions to start with one tap, for example Quiet morning. */
  quick: { id: string; name: string }[];
};

/**
 * The home screen widget. The small size starts your next program workout. The medium size adds
 * your week streak and two guided sessions. Each tap opens the app through a mygymmyway://start link.
 *
 * This function runs in the widget's own runtime: it can't use anything declared outside it.
 */
const NextWorkoutWidget = (props: NextWorkoutWidgetProps, environment: WidgetEnvironment) => {
  'widget';
  const background = '#0A0B0A';
  const accent = environment.isLuminanceReduced ? '#FFFFFF' : '#C8FF2E';
  const text = '#F4F5F0';
  const secondary = '#9AA096';
  const nextUrl = props.next ? 'mygymmyway://start?program=next' : 'mygymmyway://program';
  const title = props.next?.title ?? 'Build your plan';
  const detail = props.next?.detail ?? 'A 4-week program from your gear';

  const nextBlock = (
    <VStack alignment="leading" spacing={2}>
      <Text modifiers={[font({ weight: 'bold', size: 11 }), foregroundStyle(accent)]}>
        {props.next ? 'UP NEXT' : 'MY GYM MY WAY'}
      </Text>
      <Text modifiers={[font({ weight: 'heavy', size: 17 }), foregroundStyle(text), lineLimit(2)]}>{title}</Text>
      <Text modifiers={[font({ size: 12 }), foregroundStyle(secondary), lineLimit(2)]}>{detail}</Text>
    </VStack>
  );

  if (environment.widgetFamily !== 'systemMedium') {
    return (
      <VStack
        alignment="leading"
        modifiers={[padding({ all: 4 }), containerBackground(background, 'widget'), widgetURL(nextUrl)]}>
        <HStack>
          <Image systemName="dumbbell.fill" color={accent} />
          <Spacer />
          <Image systemName={props.next ? 'play.circle.fill' : 'plus.circle.fill'} color={accent} />
        </HStack>
        <Spacer />
        {nextBlock}
      </VStack>
    );
  }

  return (
    <HStack spacing={12} modifiers={[padding({ all: 4 }), containerBackground(background, 'widget')]}>
      <Link destination={nextUrl}>
        <VStack alignment="leading">
          <Image systemName="dumbbell.fill" color={accent} />
          <Spacer />
          {nextBlock}
        </VStack>
      </Link>
      <Spacer />
      <VStack alignment="leading" spacing={6}>
        <HStack spacing={4}>
          <Image systemName="flame.fill" color={accent} />
          <Text modifiers={[font({ weight: 'bold', size: 13 }), foregroundStyle(text)]}>
            {`${props.weekStreak} wk streak`}
          </Text>
        </HStack>
        <Text modifiers={[font({ size: 11 }), foregroundStyle(secondary)]}>{`${props.thisWeek} this week`}</Text>
        <Spacer />
        {props.quick.slice(0, 2).map((session) => (
          <Link key={session.id} destination={`mygymmyway://start?session=${session.id}`}>
            <HStack spacing={4}>
              <Image systemName="play.fill" color={accent} />
              <Text modifiers={[font({ weight: 'semibold', size: 12 }), foregroundStyle(text), lineLimit(1)]}>
                {session.name}
              </Text>
            </HStack>
          </Link>
        ))}
      </VStack>
    </HStack>
  );
};

export default createWidget<NextWorkoutWidgetProps>('NextWorkoutWidget', NextWorkoutWidget, {
  weekStreak: 0,
  thisWeek: 0,
  quick: [],
});
