// Each episode's video can be hosted two ways:
//   { type: 'youtube', youtubeId: '...' }  a YouTube embed via the IFrame Player API
//   { type: 'file', src: '/videos/...' }   a self-hosted file served as a plain <video>
//
// Exactly one episode should have `current: true`. When a new episode ships,
// flip the old current episode to `current: false` and add the new one at the top.

module.exports = [
  {
    id: 'ep1',
    label: 'The Volhard Pack Episode 1',
    current: true,
    headline: 'The Volhard Pack Episode 1',
    video: {
      type: 'file',
      src: '/videos/the-volhard-pack-episode-1.mp4',
    },
  },
];
