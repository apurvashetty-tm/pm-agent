// Prescription viewer — the d-rx-failed state of screens/prescribe.json
// ("The prescription image failed to load … a notice with Try again shows inside the viewer;
// ✕ still closes it"). The loaded viewer's zoom / rotate tools live in case.json (a-rx-viewer)
// and are out of scope here: when loaded we show the image only.
import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { messages, text, tokens } from '../theme';
import { Button } from '../components/Button';
import { ActionBar, Notice } from '../components/Blocks';

export type RxViewerProps = {
  status: 'loading' | 'loaded' | 'failed';
  imageUri?: string;
  onRetry: () => void;
  onClose: () => void;
};

export function RxViewer({ status, imageUri, onRetry, onClose }: RxViewerProps) {
  const insets = useSafeAreaInsets();
  return (
    <View style={styles.screen} accessibilityViewIsModal accessibilityLabel={messages['rx.title']}>
      <View style={[styles.header, { paddingTop: tokens.space.md + insets.top }]}>
        <Button variant="iconOnDark" icon="x" onPress={onClose} accessibilityLabel={messages['common.close']} style={styles.close} />
        <Text style={styles.title} accessibilityRole="header">{messages['rx.title']}</Text>
      </View>
      <View style={styles.body}>
        {status === 'failed' ? (
          <View style={styles.stack}>
            <Notice tone="error">{messages['rx.loadFailed']}</Notice>
          </View>
        ) : null}
        {status === 'loaded' && imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.image} resizeMode="contain" accessibilityLabel={messages['rx.title']} />
        ) : null}
        {/* 'loading': the kit has no loading state for the viewer (report Q24) — empty body. */}
      </View>
      {status === 'failed' ? (
        <ActionBar>
          {/* The kit's element uses offer.retry ("Try again"); common.tryAgain has the same words. */}
          <Button variant="primary" label={messages['offer.retry']} onPress={onRetry} />
        </ActionBar>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: tokens.color.surface.brand.dark },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.space.sm,
    minHeight: tokens.target.min + tokens.space.lg,
    paddingHorizontal: tokens.space.lg,
    paddingBottom: tokens.space.md,
    backgroundColor: tokens.color.surface.inverse,
  },
  close: { marginLeft: tokens.space['2xs'] - tokens.space.lg },
  title: { ...text.bodyLgStrong, color: tokens.color.content.inverse, flex: 1 },
  body: { flex: 1, paddingTop: tokens.space.lg },
  stack: { gap: tokens.space.lg, paddingHorizontal: tokens.space.lg },
  image: { flex: 1 },
});
