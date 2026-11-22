#!/usr/bin/env python3
"""usage: sheet.py out.png cols img1 img2 ...  -> labelled contact sheet"""
import sys
from PIL import Image, ImageDraw
out, cols, imgs = sys.argv[1], int(sys.argv[2]), sys.argv[3:]
ims = [Image.open(p).convert("RGB") for p in imgs]; w, h = ims[0].size
rows = (len(ims) + cols - 1) // cols; S = Image.new("RGB", (w * cols, h * rows))
for i, im in enumerate(ims):
    S.paste(im, ((i % cols) * w, (i // cols) * h)); ImageDraw.Draw(S).text(((i % cols) * w + 6, (i // cols) * h + 6), imgs[i].split("/")[-1], fill="yellow")
S.save(out)
