# Volhard Dog Nutrition: Creative Review

A public, single-page review site for The Volhard Pack video series, prepared by
AdVenture Media Group. A headline, then the current episode's video, dark background
throughout, minimal design. Past episodes appear in an archive strip at the bottom once
there is more than one; clicking one swaps the video and headline without leaving the page.

Anyone with the link can view this page; there's no password.

## Adding a new episode

Edit `api/_episodes.js`:

1. Flip the current episode's `current: true` to `current: false`.
2. Add a new episode object at the top of the array with `current: true`, a `label`
   (shown in the archive strip) and a `headline` (shown above the video).
3. Video can be hosted two ways:
   - `{ type: 'file', src: '/videos/your-file.mp4' }`, a self-hosted file committed into
     the `videos/` folder and served as a plain `<video>` with native controls
   - `{ type: 'youtube', youtubeId: '...' }`, embedded via the YouTube IFrame Player API

GitHub warns on files over 50MB and blocks files over 100MB.

## Video playback

Once the viewer has pressed play, an `IntersectionObserver` at `threshold: 1.0` pauses the
video whenever any edge scrolls out of view and resumes it once all four edges are back on
screen. If the viewer pauses it themselves, it stays paused when they scroll.

## Structure

- `index.html`, `styles.css`, `app.js`: the static page
- `videos/`: self-hosted episode video files
- `api/content.js`: returns the episodes array, `Cache-Control: no-store`
- `api/_episodes.js`: the episode data (the underscore keeps it from being a route)
