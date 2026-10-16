import React, { useEffect, useRef, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { s, t } from './ui';
import { presets, validMinutes } from './logic';
export interface DurationPickerProps { value: number; variant?: 'wheel'; disabled?: boolean; onChange(value: number): void; }
function Wheel({label,value,values,onChange,disabled,onMore}:{label:string;value:number;values:number[];onChange(n:number):void;disabled:boolean;onMore?:()=>void}) {
  const list=useRef<FlatList<number>>(null); const {fontScale}=useWindowDimensions(); const rowHeight=Math.max(48,Math.ceil(36*fontScale));
  const index=Math.max(0,values.indexOf(value));
  useEffect(()=>{list.current?.scrollToOffset({offset:index*rowHeight,animated:false});},[index,rowHeight]);
  const select=(offset:number)=>{const i=Math.max(0,Math.min(values.length-1,Math.round(offset/rowHeight)));if(values[i]!==value)onChange(values[i]);};
  return <View accessible accessibilityRole="adjustable" accessibilityLabel={label} accessibilityValue={{min:values[0],now:value,text:String(value)}} accessibilityState={{disabled}} accessibilityActions={[{name:'increment'},{name:'decrement'}]}
    onAccessibilityAction={e=>{if(disabled)return;const i=index+(e.nativeEvent.actionName==='increment'?1:-1);if(i>=0&&i<values.length)onChange(values[i]);if(i>=values.length-2)onMore?.();}} style={{height:rowHeight*3}}>
    <View pointerEvents="none" style={{position:'absolute',top:rowHeight,left:0,right:0,height:rowHeight,borderRadius:t.radius.md,backgroundColor:t.color.surface.brand.subtle}}/>
    <FlatList ref={list} data={values} scrollEnabled={!disabled} keyExtractor={n=>String(n)} showsVerticalScrollIndicator={false} snapToInterval={rowHeight} decelerationRate="fast" contentContainerStyle={{paddingVertical:rowHeight}} getItemLayout={(_,i)=>({length:rowHeight,offset:rowHeight*i,index:i})}
      onScrollEndDrag={e=>{if(!e.nativeEvent.velocity?.y)select(e.nativeEvent.contentOffset.y);}} onMomentumScrollEnd={e=>select(e.nativeEvent.contentOffset.y)} onEndReached={onMore} onEndReachedThreshold={0.2}
      renderItem={({item})=><Pressable accessible={false} disabled={disabled} onPress={()=>onChange(item)} style={{height:rowHeight,justifyContent:'center',alignItems:'center'}}><Text style={{...t.text.h1,fontSize:item===value?32:24,color:item===value?t.color.content.brand:t.color.content.secondary}}>{String(item)}</Text></Pressable>}/>
  </View>;
}
export function DurationPicker({value,disabled=false,onChange}:DurationPickerProps) {
  if(!validMinutes(value))throw new Error('DurationPicker requires minutes >=15, divisible by15');
  const hours=Math.floor(value/60),minutes=value%60;const [range,setRange]=useState(Math.max(24,hours+12));const {fontScale}=useWindowDimensions();
  const accept=(n:number)=>{if(!disabled)onChange(Math.max(15,n));};
  return <View style={{gap:t.space.xl}}><View style={styles.presets}>{presets.map(n=><Pressable key={n} disabled={disabled} accessibilityRole="button" accessibilityState={{selected:n===value,disabled}} onPress={()=>accept(n)} style={[styles.preset,{width:fontScale>1.3?'47%':'30%'},n===value&&{borderColor:t.color.border.selected,backgroundColor:t.color.surface.brand.subtle}]}><Text style={[t.text.bodyMdStrong,{color:n===value?t.color.content.brand:t.color.content.primary}]}>{n<60?`${n} min`:`${n/60} ${n===60?'hour':'hours'}`}</Text></Pressable>)}</View>
    <Text style={t.text.bodyLgStrong}>Adjust duration</Text><View style={[s.row,{alignItems:'flex-start'}]}>{[{label:'Hours',number:hours,step:60},{label:'Minutes',number:minutes,step:15}].map(({label,number,step})=><View key={label} style={{flex:1,gap:t.space.lg}}><Text style={[s.label,{textAlign:'center',color:t.color.content.secondary}]}>{label}</Text>{<Wheel label={label} value={number} disabled={disabled} values={step===60?Array.from({length:Math.max(range,hours+12)+1},(_,i)=>i):(hours===0?[15,30,45]:[0,15,30,45])} onChange={n=>accept(step===60?n*60+minutes:hours*60+n)} onMore={step===60?()=>setRange(n=>n+24):undefined}/>}</View>)}</View></View>;
}
const styles=StyleSheet.create({presets:{flexDirection:'row',flexWrap:'wrap',justifyContent:'space-between',gap:t.space.md},preset:{minHeight:48,padding:t.space.sm,borderWidth:1,borderColor:t.color.border.default,borderRadius:t.radius.md,alignItems:'center',justifyContent:'center'}});
