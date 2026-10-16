from pathlib import Path
from PIL import Image, ImageDraw
source=Path('/private/tmp/render-home-duration-alternatives.py').read_text()
exec(source.split('a=base(); quick_grid(a)')[0])

wheel=base(); quick_grid(wheel)
tap=base(); quick_grid(tap)

for c in [wheel,tap]:
    c.text(24,486,'Adjust duration',16,weight=600)
    c.center(24,528,164,'Hours',13,C['muted'],500)
    c.center(202,528,164,'Minutes',13,C['muted'],500)
    c.text(24,704,'15-minute steps · Minimum 15 minutes',13,C['muted'])

wheel.box((24,606,366,662),C['tint'],12)
wheel.d.line((195*S,618*S,195*S,650*S),fill=C['border'],width=S)
wheel.centered_control(202,560,164,40,'15',24,'#8E95A2',400)
wheel.centered_control(24,606,164,56,'0',32,C['blue'],600)
wheel.centered_control(202,606,164,56,'30',32,C['blue'],600)
wheel.centered_control(24,665,164,32,'1',24,'#8E95A2',400)
wheel.centered_control(202,665,164,32,'45',24,'#8E95A2',400)

for x,value,disabled in [(24,'0',True),(202,'30',False)]:
    tap.box((x,560,x+164,616),C['white'],12,C['border'])
    tap.centered_control(x,560,44,56,'−',24,'#8E95A2' if disabled else C['blue'],400)
    tap.centered_control(x+44,560,76,56,value,24,C['text'],500)
    tap.centered_control(x+120,560,44,56,'+',24,C['blue'],400)

wheel.im.save('/private/tmp/home-wheel-15min.png')
tap.im.save('/private/tmp/home-tap-15min.png')
board=Image.new('RGB',(828*S,910*S),C['soft']); d=ImageDraw.Draw(board)
for x,label,im in [(12,'A  Wheel · 15-minute steps',wheel.im),(426,'B  Tap · 15-minute steps',tap.im)]:
    d.text((x*S,16*S),label,font=f(15,600),fill=C['text'],anchor='lt')
    board.paste(im,(x*S,54*S))
board.save('/private/tmp/home-wheel-vs-tap-15min.png')
