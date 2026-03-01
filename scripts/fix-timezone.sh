#!/bin/bash
# Script to add timezone indicator to memory files
# Format: _Timezone: UTC_ on the second line

MEMORY_DIR="/root/.openclaw/workspace/memory"

# Files to fix (10 most recent 2026-02-*.md daily files)
FILES=(
  "$MEMORY_DIR/2026-02-21.md"
  "$MEMORY_DIR/2026-02-22.md"
  "$MEMORY_DIR/2026-02-23.md"
  "$MEMORY_DIR/2026-02-24.md"
  "$MEMORY_DIR/2026-02-25.md"
  "$MEMORY_DIR/2026-02-26.md"
  "$MEMORY_DIR/2026-02-27.md"
  "$MEMORY_DIR/2026-02-28.md"
  "$MEMORY_DIR/2026-02-27-api-maximization-report.md"
  "$MEMORY_DIR/2026-02-28-api-maximization-final-report.md"
)

for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "Processing: $file"
    # Create temp file with timezone indicator as second line
    first_line=$(head -n1 "$file")
    # Remove any existing _Timezone: line if present
    content=$(sed '/^_Timezone:.*$/d' "$file")
    # Get the first line again after removal
    first_line=$(echo "$content" | head -n1)
    
    # Write: first line, timezone indicator, rest of content
    echo "$first_line" > "$file.tmp"
    echo "_Timezone: UTC_" >> "$file.tmp"
    tail -n +2 "$file" >> "$file.tmp"  # Skip first line when appending
    
    # Replace original
    mv "$file.tmp" "$file"
    echo "  Fixed: $file"
  else
    echo "  Missing: $file"
  fi
done

echo "Done!"
