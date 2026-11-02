# Volhard Dog Nutrition: Creative Review

A public, single-page review site for The Volhard Pack video series, prepared by
AdVenture Media Group. A headline, then the current episode's video, dark background
throughout, minimal design. Every episode not currently in the player appears below it as a
thumbnail; clicking one swaps it into the player, without leaving the page, and starts it
playing with sound.

Anyone with the link can view this page; there's no password.

## Adding a new episode

Edit `api/_episodes.js`:

1. Flip the current episode's `current: true` to `current: false`.
2. Add a new episode object at the top of the array with `current: true`, a `label`
   (shown under its archive thumbnail) and a `headline` (shown above the video).
3. Add a `poster`: a still from the video saved in `posters/`, used as the main video's
   cover and as the archive thumbnail. With ffmpeg:
   `ffmpeg -ss 5 -i videos/your-file.mp4 -frames:v 1 -vf scale=1280:-1 -q:v 4 posters/your-file.jpg`
   (pick a frame that looks different from the other episodes' thumbnails).
4. Video can be hosted two ways:
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
- `posters/`: one still per episode, the cover image and archive thumbnail
- `api/content.js`: returns the episodes array, `Cache-Control: no-store`
- `api/_episodes.js`: the episode data (the underscore keeps it from being a route)
