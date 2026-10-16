import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { SvgXml } from 'react-native-svg';
import t from '../../../../design-system/native/tokens';
import icons from '../../../../design-system/native/icons';
import { logoXml } from './logo';
export { t };
export type Insets = { top: number; bottom: number; left?: number; right?: number };
export type Action = () => void | Promise<void>;
export function Icon({ name, size = 24, color = t.color.content.secondary }: { name: keyof typeof icons; size?: number; color?: string }) {
  return <SvgXml xml={icons[name]} width={size} height={size} color={color} accessible={false} />;
}
export function Logo() { return <View accessibilityLabel="Truemeds for doctors" accessible><SvgXml xml={logoXml} width={168} height={48} /></View>; }
export function Button({ title, onPress, onError, busy = false, disabled = false, quiet = false, testID }: { title: string; onPress: Action; onError?: (error: unknown) => void; busy?: boolean; disabled?: boolean; quiet?: boolean; testID?: string }) {
  const gate = useRef(false); const mounted = useRef(true); const [localBusy, setBusy] = useState(false);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  const blocked = disabled || busy || localBusy;
  async function press() {
    if (gate.current || blocked) return;
    gate.current = true; setBusy(true);
    try { await onPress(); } catch (error) { onError?.(error); } finally { gate.current = false; if (mounted.current) setBusy(false); }
  }
  // Host callbacks must catch/report request failures through controlled error props.
  return <View><Pressable testID={testID} accessibilityRole="button" accessibilityState={{ disabled: blocked, busy: busy || localBusy }} disabled={blocked}
    onPress={() => { void press(); }} style={({ pressed }) => [s.button, quiet ? s.quiet : s.primary, disabled && !busy && s.disabled, pressed && { opacity: 0.8 }]}>
    {(busy || localBusy) && <ActivityIndicator style={{position:'absolute',left:t.space.lg}} color={quiet ? t.color.content.brand : t.color.content.inverse} />}
    <Text style={[t.text.buttonLg, { color: quiet ? t.color.content.brand : t.color.content.inverse }, disabled && !busy && { color: t.color.content.disabled }]}>{title}</Text>
  </Pressable></View>;
}
export function Link({ title, onPress, disabled = false }: { title: string; onPress: () => void; disabled?: boolean }) {
  return <Pressable accessibilityRole="button" accessibilityState={{ disabled }} disabled={disabled} onPress={onPress} style={s.link}><Text style={[t.text.bodyMdStrong, { color: disabled ? t.color.content.disabled : t.color.content.brand }]}>{title}</Text></Pressable>;
}
export function Notice({ children, tone = 'info' }: { children: React.ReactNode; tone?: 'info' | 'neutral' | 'error' | 'warning' }) {
  const color = tone === 'error' ? t.color.content.error : tone === 'warning' ? t.color.content.warning : tone === 'neutral' ? t.color.content.secondary : t.color.content.brand;
  const backgroundColor = tone === 'error' ? t.color.feedback.error.surface : tone === 'warning' ? t.color.feedback.warning.surface : tone === 'neutral' ? t.color.surface.secondary : t.color.surface.brand.subtle;
  const borderColor = tone === 'error' ? t.color.feedback.error.border : tone === 'warning' ? t.color.feedback.warning.border : tone === 'neutral' ? t.color.border.default : t.color.border.brand.subtle;
  return <View accessibilityLiveRegion="polite" style={[s.notice, { backgroundColor, borderColor }]}><Icon name={tone === 'error' ? 'alert-circle' : tone === 'warning' ? 'alert-triangle' : 'info-circle'} color={color} size={20} /><Text style={[t.text.bodySm, { color: t.color.content.primary, flex: 1 }]}>{children}</Text></View>;
}
export function Toast({ children }: { children: React.ReactNode }) { return <View accessibilityLiveRegion="polite" style={s.toast}><Text style={[t.text.bodySmStrong,{color:t.color.content.inverse}]}>{children}</Text></View>; }
export function Frame({ insets, children }: { insets: Insets; children: React.ReactNode }) {
  return <KeyboardAvoidingView style={[s.frame, { paddingTop: insets.top, paddingBottom: insets.bottom, paddingLeft: insets.left ?? 0, paddingRight: insets.right ?? 0 }]} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>{children}</KeyboardAvoidingView>;
}
export function Body({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={[{ flexGrow: 1 }, style]}>{children}</ScrollView>;
}
export const s = StyleSheet.create({
  frame: { flex: 1, backgroundColor: t.color.surface.brand.subtle },
  intro: { padding: t.space.xl, gap: t.space.lg },
  title: { fontFamily: t.text.h1.fontFamily, fontWeight: '600', fontSize: t.font.size.title.md, lineHeight: t.font.lineHeight.xl, color: t.color.content.primary },
  subtitle: { ...t.text.bodyLg, lineHeight: t.font.lineHeight.md, color: t.color.content.secondary },
  panel: { flexGrow: 1, backgroundColor: t.color.surface.primary, borderTopLeftRadius: t.radius['2xl'], borderTopRightRadius: t.radius['2xl'], padding: t.space.xl, gap: t.space.lg },
  label: { ...t.text.bodyMdStrong, color: t.color.content.primary },
  input: { ...t.text.bodyLg, color: t.color.content.primary, minHeight: 48, paddingHorizontal: t.space.md, borderWidth: 1, borderColor: t.color.border.default, borderRadius: t.radius.md },
  button: { minHeight: 56, padding: t.space.lg, borderRadius: t.radius.lg, flexDirection: 'row', gap: t.space.sm, alignItems: 'center', justifyContent: 'center' },
  primary: { backgroundColor: t.color.surface.brand.default }, quiet: { backgroundColor: 'transparent' }, disabled: { backgroundColor: t.color.surface.interactive.disabled },
  link: { minHeight: 44, justifyContent: 'center', paddingVertical: t.space.sm },
  notice: { padding: t.space.md, borderWidth: 1, borderRadius: t.radius.md, flexDirection: 'row', gap: t.space.sm, alignItems: 'flex-start' },
  toast: { alignSelf: 'center', backgroundColor: t.color.surface.inverse, paddingHorizontal: t.space.sm, paddingVertical: t.space.xs, borderRadius: t.radius.xs },
  row: { flexDirection: 'row', alignItems: 'center', gap: t.space.md },
});
