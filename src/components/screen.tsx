import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { KeyboardAwareScrollView } from '@/components/keyboard-aware-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/** A tab screen: safe-area aware, scrolling, with an uppercase title block. */
export function Screen({
  eyebrow,
  title,
  children,
  tab = true,
}: {
  eyebrow?: string;
  title?: string;
  children: ReactNode;
  /** Adds room for the tab bar. */
  tab?: boolean;
}) {
  const theme = useTheme();
  return (
    <View style={[styles.fill, { backgroundColor: theme.background }]}>
      <SafeAreaView edges={tab ? ['top'] : []} style={styles.fill}>
        <KeyboardAwareScrollView
          contentContainerStyle={[styles.content, { paddingBottom: (tab ? BottomTabInset : 0) + Spacing.six }]}>
          {title && (
            <Animated.View entering={FadeInDown.duration(380)} style={styles.titleBlock}>
              {eyebrow && (
                <ThemedText type="eyebrow" themeColor="tint">
                  {eyebrow}
                </ThemedText>
              )}
              <ThemedText type="title">{title}</ThemedText>
            </Animated.View>
          )}
          {children}
        </KeyboardAwareScrollView>
      </SafeAreaView>
    </View>
  );
}

export function SectionHeader({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <View style={styles.sectionHeader}>
      <ThemedText type="eyebrow" themeColor="textSecondary">
        {title}
      </ThemedText>
      {action}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  content: {
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.three,
    gap: Spacing.four,
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
  },
  titleBlock: { gap: Spacing.one, paddingTop: Spacing.two },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: -Spacing.two,
  },
});
