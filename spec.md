# Specification

## Summary
**Goal:** Build "Void Metal Studio" – a dark fantasy-themed visual music studio web app with Internet Identity authentication, canvas-based media management, AI generation via Red Hat shepherd-main backend, content protection, and custom dragon emoji picker.

**Planned changes:**

### Theme & Layout
- Full dark mythical UI: cracked black stone background with glowing ember red-orange vein cracks, dragon scale texture on panels, cinematic dark lighting
- Large Gargoyle Dragon face with glowing red eyes rendered in the upper background area
- Blood-red primary accent color for all text, borders, and interactive elements; heavy gothic typography throughout

### Authentication
- Internet Identity login required before upload or generation actions (using `useInternetIdentity` hook)
- Display short principal ID in UI after login
- On load, check ban status from backend; show ban overlay if banned

### Toolbar & Controls
- Top toolbar with 5 forged-metal cracked-stone styled buttons: Upload Photo, Upload Video, Music Gen, Video Gen, Export
- Effects button below toolbar, horizontally centered, with dragon eye icon
- Bottom panel: prominent IGNITE button with fire glow animation, Dragon Power slider (0–100, default 75), status display (default "AWAITING COMMAND")

### Central Canvas
- Large cracked stone panel with glowing fire vein overlay
- Empty state: blood-red gothic "Drop your creation here" text
- Drag-and-drop and button-triggered upload for images (jpg/png/gif/webp), video (mp4/webm), audio (mp3/wav), and text (.txt)
- Previews: image thumbnails, HTML5 video player, audio waveform visualization, scrollable text view
- Multiple files supported

### Effects Panel
- Clicking Effects opens a menu with 7 dragon-themed CSS effects: Fire Glow, Chain Overlay, Stone Crack, Dragon Breath, Ember Pulse, Shadow Veil, Blood Drip
- Effects are toggleable and apply CSS filter/overlay to active canvas content

### Music Gen / Video Gen
- Each button opens a text seed input modal
- On submit, POST to shepherd-main endpoint with seed text and Dragon Power value
- Canvas shows "GENERATING..." status; result renders as audio waveform player or video player
- Console logs "shepherd-main endpoint connected" on each call

### IGNITE Button
- Collects canvas content metadata + seed text (prompts user if none loaded) + Dragon Power value
- POSTs to shepherd-main endpoint; renders result in canvas
- Console confirms shepherd-main connection on each call

### Export
- Downloads active canvas content with session ID encoded in filename as watermark
- Status updates to "EXPORT COMPLETE"; disabled when canvas is empty

### Content Protection
- Right-click disabled over canvas and media previews
- Ctrl+S, Ctrl+C, Ctrl+P intercepted and blocked on canvas
- CSS `user-select: none` on all canvas content
- On detected violation: full-screen ban overlay with exact message: "The Dragon caught you stealing. Account permanently removed. Created by Skulls for the people who wanna stay real."
- Calls backend to permanently ban the user's principal

### Motoko Backend
- Stable map of principal → ban status (boolean) + ban timestamp
- `setBan(principal)` update function
- `isBanned(principal)` query function
- Ban persists across canister upgrades

### Custom Emoji Picker
- Dragon-icon button opens picker with 15 ForeverRaw Gargoyle Dragon emoji image assets: Dragon Eye, Ember, Chain Link, Skull, Raw Heart, Lightning Strike, Stone, Blade, Void, Dragon Shield, Raw Rage, Burning Heart, Prayer, Watching, Steel
- Each emoji has stone/metal dragon-scale style with red-orange glow
- Clicking an emoji inserts it into the active text/seed input field

**User-visible outcome:** Users log in with Internet Identity, upload or drag-drop media onto a dark fantasy canvas, apply dragon-themed visual effects, generate music/video via AI prompt, export watermarked creations, and are permanently banned if they attempt to steal content.
