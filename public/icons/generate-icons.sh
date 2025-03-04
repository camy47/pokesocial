#!/bin/bash

# Check if ImageMagick is installed
if ! command -v convert &> /dev/null; then
    echo "Error: ImageMagick is required but not installed."
    echo "Please install ImageMagick first:"
    echo "On Windows (with Chocolatey): choco install imagemagick"
    echo "On macOS: brew install imagemagick"
    echo "On Linux: sudo apt-get install imagemagick"
    exit 1
fi

# Source image should be at least 512x512
SOURCE_IMAGE="logo.png"

# Check if source image exists
if [ ! -f "$SOURCE_IMAGE" ]; then
    echo "Error: Source image '$SOURCE_IMAGE' not found."
    echo "Please place a logo.png file (at least 512x512px) in the same directory as this script."
    exit 1
fi

# Generate icons
convert "$SOURCE_IMAGE" -resize 72x72 icon-72x72.png
convert "$SOURCE_IMAGE" -resize 96x96 icon-96x96.png
convert "$SOURCE_IMAGE" -resize 128x128 icon-128x128.png
convert "$SOURCE_IMAGE" -resize 144x144 icon-144x144.png
convert "$SOURCE_IMAGE" -resize 152x152 icon-152x152.png
convert "$SOURCE_IMAGE" -resize 192x192 icon-192x192.png
convert "$SOURCE_IMAGE" -resize 384x384 icon-384x384.png
convert "$SOURCE_IMAGE" -resize 512x512 icon-512x512.png

echo "Icons generated successfully!" 