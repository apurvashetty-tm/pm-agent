import React, { useEffect, useRef, useState } from 'react';
import { Keyboard, Text, TextInput, View } from 'react-native';
import { Frame, Body, Logo, Button, Link, Notice, s, t, type Insets, type Action } from './ui';
import { countdown, normaliseMobile } from './logic';
import { message } from './messages';
export const signInStates = ['default','keyboard-open','empty-tap','too-short','wrong-first-digit','pasted-cleaned','sending','not-registered','offline','couldnt-send','too-many-tries','inactive'] as const;
export type SignInState = typeof signInStates[number];
export interface SignInProps {
  insets: Insets; state: SignInState; mobile: string; retrySeconds: number;
  onMobileChange(value: string): void; onSendOTP: Action; onCallOps: () => void; onSignUp: () => void; onActionError?(error: unknown): void;
}
export function SignInScreen(p: SignInProps) {
  const input = useRef<React.ElementRef<typeof TextInput>>(null); const [keyboard, setKeyboard] = useState(false);
  useEffect(() => { const a=Keyboard.addListener('keyboardDidShow',()=>setKeyboard(true)); const b=Keyboard.addListener('keyboardDidHide',()=>setKeyboard(false)); return()=>{a.remove();b.remove()}; },[]);
  useEffect(() => { if (['keyboard-open','empty-tap','too-short','wrong-first-digit','pasted-cleaned'].includes(p.state)) input.current?.focus(); else if (p.state !== 'sending') Keyboard.dismiss(); },[p.state]);
  const errors: Partial<Record<SignInState,string>> = {'empty-tap':message('signin.empty'),'too-short':message('signin.short'),'wrong-first-digit':message('signin.prefix')};
  const notices: Partial<Record<SignInState,string>> = {'not-registered':message('signin.notRegistered'),offline:message('signin.offline'),'couldnt-send':message('signin.couldntSend'),'too-many-tries':message('signin.tooMany'),inactive:message('signin.inactive')};
  const busy=p.state==='sending', inactive=p.state==='inactive', locked=p.state==='too-many-tries';
  return <Frame insets={p.insets}><Body><View style={s.intro}><Logo/><Text style={[s.title,{marginTop:t.space['2xl']}]}>Welcome, Doctor.</Text><Text style={s.subtitle}>Your partner in thoughtful, affordable care.</Text></View>
    <View style={s.panel}><Text style={s.label}>Mobile number</Text><View style={s.row}><Text style={s.label}>+91</Text><TextInput ref={input} accessibilityLabel="Mobile number" value={p.mobile} onChangeText={v=>p.onMobileChange(normaliseMobile(v))} keyboardType="phone-pad" autoComplete="tel-national" textContentType="telephoneNumber" editable={!busy} placeholder="10-digit mobile number" placeholderTextColor={t.color.content.tertiary} style={[s.input,{flex:1},errors[p.state]?{borderColor:t.color.content.error}:null]}/></View>
    {errors[p.state]?<Text accessibilityLiveRegion="polite" style={[t.text.bodySm,{color:t.color.content.error}]}>{errors[p.state]}</Text>:!notices[p.state]&&<Text style={[t.text.bodySm,{color:t.color.content.secondary}]}>{message('signin.smsHelper')}</Text>}
    {notices[p.state]&&<Notice tone={p.state==='offline'||locked?'warning':p.state==='not-registered'?'neutral':'error'}>{notices[p.state]}</Notice>}
    <Button title={inactive?'Call Doctor Ops':busy?'Sending OTP…':locked?`Try again in ${countdown(p.retrySeconds)}`:'Send OTP'} busy={busy} disabled={locked} onPress={inactive?p.onCallOps:p.onSendOTP} onError={p.onActionError}/>
    {!keyboard&&<View style={{marginTop:'auto',alignItems:'center',paddingTop:t.space.xl}}><Text style={s.subtitle}>New to Truemeds?</Text><Link title="Sign up" onPress={p.onSignUp}/></View>}</View></Body></Frame>;
}
