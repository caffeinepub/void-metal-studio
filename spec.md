# VOID-METAL Forge Studio

## Current State
- Project Hub (Kanban board with 5 pipeline stages) accessible via FORGE HUB
- AI Forge Scribe sidebar accessible via AI SCRIBE button
- Design Canvas accessible via DESIGN button
- Studio view with file upload, effects, and generation
- AppView type: "studio" | "hub" | "canvas"

## Requested Changes (Diff)

### Add
- VideoTimeline component: import video/audio, basic timeline tracks (video, audio, text overlay), caption generation (mock/placeholder), export with platform presets (9:16, 16:9, 1:1)
- New AppView: "video" for the Video Timeline section
- Nav button in header: 🎬 VIDEO

### Modify
- App.tsx: add `video` to AppView type, add nav button, render VideoTimeline when view === "video"

### Remove
- Nothing

## Implementation Plan
1. Create VideoTimeline.tsx component with:
   - File import (video/audio via input)
   - Visual timeline with video and audio tracks
   - Text overlay track
   - Caption generation (placeholder/mock Whisper-style)
   - Platform preset export options (TikTok 9:16, YouTube 16:9, Instagram 1:1)
   - Playback controls (play/pause/scrub)
2. Update App.tsx to add `video` view and nav button
