import React from 'react';
import { Text, View } from 'react-native';
import { Frame, Body, Logo, Icon, Button, Link, Notice, s, t, type Insets, type Action } from './ui';
import { message } from './messages';
export const unlockVariants = {fingerprint:{icon:'fingerprint',label:'Unlock with fingerprint'},'face-id':{icon:'face-id',label:'Unlock with Face ID'},'screen-lock':{icon:'lock',label:'Unlock with screen lock'}} as const;
export interface UnlockProps { insets: Insets; doctorName: string; variant: keyof typeof unlockVariants; busy?: boolean; unavailable?: boolean; onActionError?(error:unknown):void; onUnlock: Action; onUseOTP(): void; onSwitchAccount(): void; }
export function UnlockScreen(p: UnlockProps) {
  const v=unlockVariants[p.variant];
  return <Frame insets={p.insets}><Body><View style={[s.intro,{paddingBottom:t.space['3xl']}]}><Logo/><Text style={[s.title,{fontSize:32,lineHeight:40,marginTop:t.space.xl}]}>Hello, {p.doctorName}.</Text><Text style={[s.subtitle,t.text.bodyXl]}>Let’s check in on your patients today.</Text></View><View style={[s.panel,{paddingTop:t.space['3xl']}]}><View style={{alignItems:'center',gap:t.space.lg,marginBottom:t.space['3xl']}}><View style={{padding:t.space.lg,backgroundColor:t.color.surface.brand.subtle,borderRadius:t.radius.lg}}><Icon name={v.icon} size={32} color={t.color.content.brand}/></View><Text style={t.text.bodyXlStrong}>Ready when you are</Text></View>{p.unavailable&&<Notice tone="error">{message('unlock.unavailable')}</Notice>}<Button title={v.label} onPress={p.onUnlock} busy={p.busy} disabled={p.unavailable} onError={p.onActionError}/><Button title="Use OTP instead" quiet onPress={p.onUseOTP} disabled={p.busy}/><View style={{marginTop:'auto',alignItems:'center'}}><Link title="Not you? Switch account" onPress={p.onSwitchAccount} disabled={p.busy}/></View></View></Body></Frame>;
}
