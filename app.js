const main = document.getElementById('main');

const PLAY_ICON =
  '<svg viewBox="0 0 24 24" width="56" height="56" aria-hidden="true"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>';

let episodes = [];
let ytPlayer = null;
let currentObserver = null;

function loadYouTubeApi() {
  return new Promise((resolve) => {
    if (window.YT && window.YT.Player) {
      resolve();
      return;
    }
    const previous = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      if (previous) previous();
      resolve();
    };
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    document.head.appendChild(tag);
  });
}

function teardownVideo() {
  if (currentObserver) {
    currentObserver.disconnect();
    currentObserver = null;
  }
  if (ytPlayer && ytPlayer.destroy) {
    ytPlayer.destroy();
  }
  ytPlayer = null;
}

// Calls onFullyVisible when all four edges of the panel are on screen,
// and onPartlyOrNotVisible as soon as any edge leaves the viewport.
function watchPanelVisibility(onFullyVisible, onPartlyOrNotVisible) {
  const panel = document.getElementById('video-panel');
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.intersectionRatio >= 0.999) {
          onFullyVisible();
        } else {
          onPartlyOrNotVisible();
        }
      });
    },
    { threshold: 1.0 }
  );
  observer.observe(panel);
  currentObserver = observer;
}

function posterFor(episode) {
  if (episode.poster) return episode.poster;
  if (episode.video.type === 'youtube') {
    return `https://i.ytimg.com/vi/${episode.video.youtubeId}/hqdefault.jpg`;
  }
  return '';
}

function buildYoutubeVideo(mount, episode, autoplay) {
  const youtubeId = episode.video.youtubeId;

  const poster = document.createElement('img');
  poster.className = 'video-poster';
  poster.alt = '';
  poster.src = posterFor(episode);

  const playBtn = document.createElement('button');
  playBtn.className = 'play-btn';
  playBtn.type = 'button';
  playBtn.setAttribute('aria-label', 'Play video');
  playBtn.innerHTML = PLAY_ICON;

  const frame = document.createElement('div');
  frame.className = 'video-frame';
  frame.hidden = true;

  mount.appendChild(poster);
  mount.appendChild(playBtn);
  mount.appendChild(frame);

  // wantsPlay is true while the viewer intends the video to be playing.
  // scrollPausing marks a pause we caused, so it isn't read as the viewer pausing.
  let wantsPlay = false;
  let scrollPausing = false;

  async function start() {
    poster.hidden = true;
    playBtn.hidden = true;
    wantsPlay = true;

    await loadYouTubeApi();
    frame.innerHTML = '<div id="yt-player"></div>';
    frame.hidden = false;

    ytPlayer = new YT.Player('yt-player', {
      videoId: youtubeId,
      playerVars: { autoplay: 1, rel: 0, modestbranding: 1, playsinline: 1 },
      events: {
        onReady: () => {
          watchPanelVisibility(
            () => {
              if (ytPlayer && wantsPlay) ytPlayer.playVideo();
            },
            () => {
              if (ytPlayer && ytPlayer.getPlayerState() === YT.PlayerState.PLAYING) {
                scrollPausing = true;
                ytPlayer.pauseVideo();
              }
            }
          );
        },
        onStateChange: (e) => {
          if (e.data === YT.PlayerState.PLAYING) {
            wantsPlay = true;
          } else if (e.data === YT.PlayerState.PAUSED) {
            if (scrollPausing) {
              scrollPausing = false;
            } else {
              wantsPlay = false;
            }
          } else if (e.data === YT.PlayerState.ENDED) {
            wantsPlay = false;
          }
        },
      },
    });
  }

  playBtn.addEventListener('click', start);
  if (autoplay) start();
}

function buildFileVideo(mount, episode, autoplay) {
  const video = document.createElement('video');
  video.src = episode.video.src;
  video.poster = posterFor(episode);
  video.controls = true;
  video.preload = 'metadata';
  video.playsInline = true;

  // Same idea as the YouTube player: only resume on scroll-back if the viewer
  // was watching, never after they paused it themselves or it finished.
  let wantsPlay = false;
  let scrollPausing = false;

  video.addEventListener('play', () => {
    wantsPlay = true;
  });
  video.addEventListener('pause', () => {
    if (scrollPausing) {
      scrollPausing = false;
    } else {
      wantsPlay = false;
    }
  });

  mount.appendChild(video);

  watchPanelVisibility(
    () => {
      if (wantsPlay && video.paused) video.play().catch(() => {});
    },
    () => {
      if (!video.paused) {
        scrollPausing = true;
        video.pause();
      }
    }
  );

  // Picking an episode from the archive is a click, so it can start with sound.
  if (autoplay) video.play().catch(() => {});
}

// Shows `episode` in the main player. `autoplay` is only set when the viewer
// picked it from the archive, which counts as pressing play.
function renderEpisode(episode, autoplay) {
  teardownVideo();

  const mount = document.getElementById('video-mount');
  mount.innerHTML = '';

  if (episode.video.type === 'youtube') {
    buildYoutubeVideo(mount, episode, autoplay);
  } else if (episode.video.type === 'file') {
    buildFileVideo(mount, episode, autoplay);
  }

  document.getElementById('headline').textContent = episode.headline;
  const noteEl = document.getElementById('headline-note');
  noteEl.textContent = episode.note || '';
  noteEl.hidden = !episode.note;
  renderArchive(episode);
}

// The archive lists every episode except the one in the player, newest first,
// so the latest episode is always one click away while watching an older one.
function renderArchive(showing) {
  const section = document.getElementById('archive-section');
  const heading = document.getElementById('archive-heading');
  const list = document.getElementById('archive-list');
  list.innerHTML = '';

  const others = episodes.filter((e) => e.id !== showing.id);
  section.hidden = others.length === 0;
  heading.textContent = showing.current ? 'Past Episodes' : 'More Episodes';

  others.forEach((episode) => {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'archive-card';
    card.setAttribute('aria-label', `Watch ${episode.label}`);

    const thumb = document.createElement('span');
    thumb.className = 'archive-thumb';
    const img = document.createElement('img');
    img.src = posterFor(episode);
    img.alt = '';
    const icon = document.createElement('span');
    icon.className = 'archive-play';
    icon.innerHTML = PLAY_ICON;
    thumb.appendChild(img);
    thumb.appendChild(icon);

    card.appendChild(thumb);

    const tags = [episode.current ? 'Latest' : null, episode.note].filter(Boolean);
    if (tags.length) {
      const tag = document.createElement('span');
      tag.className = 'archive-tag';
      tag.textContent = tags.join(' · ');
      card.appendChild(tag);
    }

    const label = document.createElement('span');
    label.className = 'archive-label';
    label.textContent = episode.label;
    card.appendChild(label);

    card.addEventListener('click', () => {
      // Jump (no smooth scroll) back up as far as possible while keeping the
      // whole player on screen, so the visibility rule doesn't pause it at once.
      const panel = document.getElementById('video-panel');
      const panelBottom = panel.getBoundingClientRect().bottom + window.scrollY;
      window.scrollTo({ top: Math.max(0, panelBottom - window.innerHeight + 24), behavior: 'instant' });
      renderEpisode(episode, true);
    });

    list.appendChild(card);
  });
}

async function init() {
  const res = await fetch('/api/content', { cache: 'no-store' });
  if (!res.ok) return;
  const data = await res.json();
  episodes = data.episodes;
  const current = episodes.find((e) => e.current) || episodes[0];
  main.hidden = false;
  renderEpisode(current, false);
}
init();
