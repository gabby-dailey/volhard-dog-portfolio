// Each episode's video can be hosted two ways:
//   { type: 'youtube', youtubeId: '...' }  a YouTube embed via the IFrame Player API
//   { type: 'file', src: '/videos/...' }   a self-hosted file served as a plain <video>
//
// `poster` is a still from the video (in /posters/), used as the main video's
// cover image and as the episode's thumbnail in the archive. YouTube episodes
// can leave it out and fall back to YouTube's own thumbnail.
//
// `note` is optional: a short label shown above the headline and on the
// archive thumbnail, e.g. 'Revised Cut' when a video is replaced after feedback.
//
// Exactly one episode should have `current: true`. When a new episode ships,
// flip the old current episode to `current: false` and add the new one at the top.

module.exports = [
  {
    id: 'ep2',
    label: 'The Volhard Pack Episode 2',
    current: true,
    headline: 'The Volhard Pack Episode 2',
    note: 'Revised Cut',
    poster: '/posters/the-volhard-pack-episode-2-revised.jpg',
    video: {
      type: 'file',
      src: '/videos/the-volhard-pack-episode-2-revised.mp4',
    },
  },
  {
    id: 'ep1',
    label: 'The Volhard Pack Episode 1',
    current: false,
    headline: 'The Volhard Pack Episode 1',
    poster: '/posters/the-volhard-pack-episode-1.jpg',
    video: {
      type: 'file',
      src: '/videos/the-volhard-pack-episode-1-v6.mp4',
    },
  },
];
