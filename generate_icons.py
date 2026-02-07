#!/usr/bin/env python3
"""
Generate simple placeholder icons for the Chrome extension.
Requires: pip install pillow
"""

try:
    from PIL import Image, ImageDraw, ImageFont
except ImportError:
    print("Error: Pillow is not installed.")
    print("Install it with: pip install pillow")
    exit(1)

import os

# Icon sizes needed
SIZES = [16, 48, 128]

# Colors
BG_COLOR = (102, 126, 234)  # Purple
TEXT_COLOR = (255, 255, 255)  # White

def create_icon(size, output_path):
    """Create a simple icon with the target emoji."""
    # Create image with purple background
    img = Image.new('RGB', (size, size), color=BG_COLOR)
    draw = ImageDraw.Draw(img)

    # Try to draw text/emoji (may not work on all systems)
    # Alternative: just create a simple geometric shape

    # Draw a simple circle (target symbol)
    padding = size // 8
    draw.ellipse(
        [padding, padding, size - padding, size - padding],
        outline=TEXT_COLOR,
        width=max(2, size // 16)
    )

    # Draw inner circle
    padding2 = size // 4
    draw.ellipse(
        [padding2, padding2, size - padding2, size - padding2],
        outline=TEXT_COLOR,
        width=max(1, size // 24)
    )

    # Draw center dot
    center = size // 2
    dot_size = size // 8
    draw.ellipse(
        [center - dot_size, center - dot_size, center + dot_size, center + dot_size],
        fill=TEXT_COLOR
    )

    # Save
    img.save(output_path, 'PNG')
    print(f"✓ Created {output_path}")

def main():
    # Get script directory
    script_dir = os.path.dirname(os.path.abspath(__file__))
    icons_dir = os.path.join(script_dir, 'icons')

    # Create icons directory if it doesn't exist
    os.makedirs(icons_dir, exist_ok=True)

    print("Generating extension icons...")

    # Generate each size
    for size in SIZES:
        output_path = os.path.join(icons_dir, f'icon{size}.png')
        create_icon(size, output_path)

    print("\n✅ All icons generated successfully!")
    print(f"📁 Icons saved to: {icons_dir}")
    print("\nYou can now load the extension in Chrome!")

if __name__ == '__main__':
    main()
