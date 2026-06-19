(function () {
  function getConfig() {
    const node = document.getElementById('player-config');
    if (!node) {
      return null;
    }
    try {
      return JSON.parse(node.textContent || '{}');
    } catch (error) {
      return null;
    }
  }

  function startPlayer(video, overlay, url) {
    if (!video || !url) {
      return;
    }
    if (overlay) {
      overlay.classList.add('is-hidden');
    }
    if (window.Hls && window.Hls.isSupported()) {
      if (!video.__hlsInstance) {
        const hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(url);
        hls.attachMedia(video);
        video.__hlsInstance = hls;
      }
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      if (!video.src) {
        video.src = url;
      }
    }
    const playPromise = video.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {});
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    const config = getConfig();
    const video = document.getElementById('movie-player');
    const overlay = document.querySelector('.play-overlay');
    if (!config || !video) {
      return;
    }
    if (config.poster) {
      video.poster = config.poster;
    }
    if (overlay) {
      overlay.addEventListener('click', function () {
        startPlayer(video, overlay, config.url);
      });
    }
    video.addEventListener('click', function () {
      if (video.paused) {
        startPlayer(video, overlay, config.url);
      }
    });
    video.addEventListener('play', function () {
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
    });
  });
}());
