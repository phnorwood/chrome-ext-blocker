# Extension Icons

You need to create three PNG icon files for the extension to work:

- `icon16.png` - 16x16 pixels (toolbar icon)
- `icon48.png` - 48x48 pixels (extension management page)
- `icon128.png` - 128x128 pixels (Chrome Web Store)

## Quick Options

### Option 1: Use an Online Generator (Easiest)
1. Visit [Favicon Generator](https://www.favicon-generator.org/)
2. Upload any image or use an emoji screenshot
3. Download all sizes
4. Rename them to match the required names above

### Option 2: Use ImageMagick (Command Line)
If you have ImageMagick installed:

```bash
# Create a simple icon with text (requires ImageMagick)
convert -size 128x128 xc:purple -fill white -pointsize 72 -gravity center -draw "text 0,0 '🎯'" icon128.png
convert icon128.png -resize 48x48 icon48.png
convert icon128.png -resize 16x16 icon16.png
```

### Option 3: Use Python (Generate Simple Icons)
Run the script below if you have Pillow installed:

```bash
pip install pillow
python generate_icons.py
```

## Design Suggestions

Good icon ideas for Focus Guard:
- 🎯 Target/bullseye (focus)
- 🚫 Prohibition sign (blocking)
- 🧘 Meditation (mindfulness)
- 💪 Strong arm (discipline)
- ⏸️ Pause button (intentional pause)

Keep it simple and recognizable at small sizes!
