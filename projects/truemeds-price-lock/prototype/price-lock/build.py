#!/usr/bin/env python3
# Inlines styles.css + app.js into index.html -> price-lock-walkthrough.html (self-contained).
# Never hand-edit price-lock-walkthrough.html; edit index.html / styles.css / app.js and re-run.
import os
here=os.path.dirname(os.path.abspath(__file__))
idx=open(os.path.join(here,'index.html')).read()
css=open(os.path.join(here,'styles.css')).read()
js=open(os.path.join(here,'app.js')).read()
out=idx.replace('<link rel="stylesheet" href="styles.css">', '<style>\n'+css+'</style>')
out=out.replace('<script src="app.js"></script>', '<script>\n'+js+'</script>')
open(os.path.join(here,'price-lock-walkthrough.html'),'w').write(out)
print('built price-lock-walkthrough.html', len(out), 'bytes')
