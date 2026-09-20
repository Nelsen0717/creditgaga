#!/usr/bin/env python3
"""Concatenate src/ parts into one self-contained index.html with card art inlined."""
import json, os, re
ROOT=os.path.dirname(os.path.abspath(__file__))
parts=['part1-head.html','part2-body.html','part3-data.js','part4-engine.js','part5a-ui.js','part5b-ui.js','part5c-galaxy.js','part6-claude.js']
html=''.join(open(os.path.join(ROOT,'src',p),encoding='utf-8').read() for p in parts)
art=json.load(open(os.path.join(ROOT,'assets','card-art.json')))
html=re.sub(r'/\*__CARD_ART_JSON__\*/\{\}/\*__END__\*/',lambda m:json.dumps(art),html,count=1)
open(os.path.join(ROOT,'index.html'),'w',encoding='utf-8').write(html)
print('index.html',len(html)//1024,'KB')
