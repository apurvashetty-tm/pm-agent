from pathlib import Path
from PIL import Image, ImageDraw

source=Path('/private/tmp/render-home-continuity.py').read_text()
exec(source.split('idle=Canvas(); idle.header()')[0])

def base():
    c=Canvas(); c.header()
    c.text(24,126,'Consult on your schedule.',24,weight=600)
    c.text(24,170,'Choose how long you’re available today.',14,C['muted'])
    c.panel(); c.icon('prescription',24,271,20)
    c.text(56,274,'Prescriptions today',14,C['muted'],500)
    c.centered_control(338,263,28,36,'0',20,C['text'],600)
    c.d.line((24*S,314*S,366*S,314*S),fill=C['border'],width=S)
    c.button(764,'Set availability')
    return c

def quick_grid(c):
    for row,labels in enumerate([['15 min','30 min','45 min'],['1 hour','2 hours','3 hours']]):
        y=346+row*60
        for i,label in enumerate(labels):
            x=24+i*118; selected=label=='30 min'
            c.box((x,y,x+106,y+48),C['tint'] if selected else C['white'],12,C['blue'] if selected else C['border'])
            c.centered_control(x,y,106,48,label,14,C['blue'] if selected else C['text'],600 if selected else 500)

a=base(); quick_grid(a)
a.text(24,496,'Adjust duration',16,weight=600)
for x,label,value in [(24,'Hours','0'),(202,'Minutes','30')]:
    a.text(x,536,label,13,C['muted'],500)
    a.box((x,560,x+164,616),C['white'],12,C['border'])
    a.centered_control(x,560,164,56,value,24,C['text'],500)
a.text(24,640,'Minimum 15 minutes',13,C['muted'])

b=base(); quick_grid(b)
b.text(24,496,'Adjust duration',16,weight=600)
for x,label,value in [(24,'Hours','0'),(202,'Minutes','30')]:
    b.text(x,536,label,13,C['muted'],500)
    b.box((x,560,x+164,616),C['white'],12,C['border'])
    b.centered_control(x,560,44,56,'−',24,'#8E95A2' if label=='Hours' else C['blue'],400)
    b.centered_control(x+44,560,76,56,value,24,C['text'],500)
    b.centered_control(x+120,560,44,56,'+',24,C['blue'],400)
b.text(24,640,'Minimum 15 minutes · Tap a number to edit',13,C['muted'])

a.im.save('/private/tmp/home-duration-fields.png')
b.im.save('/private/tmp/home-duration-steppers.png')
board=Image.new('RGB',(828*S,910*S),C['soft']); d=ImageDraw.Draw(board)
for x,label,im in [(12,'A  Quick picks + editable fields',a.im),(426,'B  Quick picks + step controls',b.im)]:
    d.text((x*S,16*S),label,font=f(15,600),fill=C['text'],anchor='lt')
    board.paste(im,(x*S,54*S))
board.save('/private/tmp/home-duration-alternatives.png')
