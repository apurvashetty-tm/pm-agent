from PIL import Image, ImageDraw, ImageFont

S=2
W,H=390,844
FONT='/Users/mac/src/pm-agent/design-system/fonts/plus-jakarta-sans-latin-wght-normal.woff2'
C={'blue':'#266CE1','tint':'#EBF8FF','white':'#FFFFFF','text':'#383A42','muted':'#5B616E','border':'#D8DBE1','soft':'#F7F8F8'}
def f(size,weight=400):
    obj=ImageFont.truetype(FONT,round(size*S)); obj.set_variation_by_axes([weight]); return obj
class Canvas:
    def __init__(self):
        self.im=Image.new('RGB',(W*S,H*S),C['tint']); self.d=ImageDraw.Draw(self.im)
    def box(self,b,fill,r=0,stroke=None):
        self.d.rounded_rectangle(tuple(round(v*S) for v in b),radius=r*S,fill=fill,outline=stroke,width=S)
    def text(self,x,y,t,size=14,color=None,weight=400):
        self.d.text((x*S,y*S),t,font=f(size,weight),fill=color or C['text'],anchor='lt')
    def center(self,x,y,w,t,size=16,color=None,weight=600):
        ft=f(size,weight); b=self.d.textbbox((0,0),t,font=ft)
        self.d.text((x*S+(w*S-(b[2]-b[0]))/2,y*S),t,font=ft,fill=color or C['text'],anchor='lt')
    def centered_control(self,x,y,w,h,t,size=16,color=None,weight=600):
        ft=f(size,weight); b=self.d.textbbox((0,0),t,font=ft,anchor='lt')
        self.d.text((x*S+(w*S-(b[2]-b[0]))/2,y*S+(h*S-(b[3]-b[1]))/2),t,font=ft,fill=color or C['text'],anchor='lt')
    def icon(self,name,x,y,size=24):
        a=Image.open('/private/tmp/home-'+name+'.png').convert('RGBA').resize((size*S,size*S),Image.Resampling.LANCZOS)
        self.im.paste(a,(x*S,y*S),a)
    def header(self):
        a=Image.open('/private/tmp/home-logo.png').convert('RGBA')
        self.im.paste(a,(16*S,24*S),a)
        for name,x in [('bell',234),('help-circle',280),('user-circle',326)]: self.icon(name,x,32)
    def panel(self):
        self.box((0,238,390,870),C['white'],24)
    def button(self,y,text):
        self.box((24,y,366,y+56),C['blue'],16)
        self.centered_control(24,y,342,56,text,18,C['white'])
    def progress(self,y):
        self.d.line((24*S,y*S,366*S,y*S),fill=C['border'],width=S)
        self.icon('prescription',24,y+29,20)
        self.text(56,y+30,'Prescriptions today',14,C['muted'],500)
        self.text(350,y+24,'0',24,C['text'],600)

idle=Canvas(); idle.header()
idle.text(24,126,'Consult on your schedule.',24,weight=600)
idle.text(24,170,'Choose how long you’re available',14,C['muted'])
idle.text(24,192,'to consult.',14,C['muted'])
idle.panel(); idle.button(286,'Set availability'); idle.progress(390)
default=idle.im.copy()
overlay=Image.new('RGBA',idle.im.size,(56,58,66,80))
idle.im=Image.alpha_composite(idle.im.convert('RGBA'),overlay).convert('RGB'); idle.d=ImageDraw.Draw(idle.im)
idle.box((0,370,390,870),C['white'],24)
idle.box((175,382,215,386),C['border'],2)
idle.text(24,414,'How long are you available?',20,weight=600)
idle.text(24,454,'Choose a duration of 15 minutes or more.',14,C['muted'])
for x,y,label,selected in [(24,500,'15 min',False),(199,500,'30 min',True),(24,568,'1 hour',False),(199,568,'2 hours',False)]:
    idle.box((x,y,x+167,y+52),C['tint'] if selected else C['white'],12,C['blue'] if selected else C['border'])
    idle.centered_control(x,y,167,52,label,16,C['blue'] if selected else C['text'],600 if selected else 500)
idle.box((24,636,366,688),C['white'],12,C['border'])
idle.text(40,654,'Custom duration',16,weight=500)
idle.d.line([(344*S,655*S),(350*S,661*S),(344*S,667*S)],fill=C['muted'],width=2*S)
idle.button(744,'Start availability')

active=Canvas(); active.header()
active.text(24,118,'Ready for your',24,weight=600)
active.text(24,150,'next patient?',24,weight=600)
active.text(24,198,'Request a case when you’re ready to consult.',14,C['muted'])
active.panel()
active.icon('clock',24,277,20)
active.text(56,279,'Time remaining',14,C['muted'],500)
active.text(24,318,'30 min',40,weight=600)
active.text(258,332,'Add more time',14,C['blue'],600)
active.button(398,'Request next case')
active.centered_control(24,466,342,44,'End availability',14,C['muted'],500)
active.progress(552)

default.save('/private/tmp/home-copy-idle.png')
idle.im.save('/private/tmp/home-copy-duration.png')
active.im.save('/private/tmp/home-copy-active.png')
board=Image.new('RGB',(1242*S,910*S),C['soft']); bd=ImageDraw.Draw(board)
for x,label,im in [(12,'1  Set availability',default),(426,'2  Choose duration',idle.im),(840,'3  Request a case',active.im)]:
    bd.text((x*S,16*S),label,font=f(16,600),fill=C['text'],anchor='lt')
    board.paste(im,(x*S,54*S))
board.save('/private/tmp/home-copy-flow-review.png')
