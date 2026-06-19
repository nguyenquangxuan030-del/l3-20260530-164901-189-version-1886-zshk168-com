(function () {
  window.initMoviePlayer = function (streamUrl, posterPath) {
    var video = document.getElementById("movie-player");
    var cover = document.getElementById("player-cover");
    var button = document.getElementById("player-start");
    var loading = document.getElementById("player-loading");
    var errorBox = document.getElementById("player-error");
    var hls = null;
    var readyPromise = null;

    if (!video) {
      return;
    }

    if (posterPath) {
      video.setAttribute("poster", posterPath);
    }

    function setLoading(active) {
      if (loading) {
        loading.classList.toggle("is-visible", Boolean(active));
      }
    }

    function showError(message) {
      setLoading(false);
      if (errorBox) {
        errorBox.textContent = message;
        errorBox.classList.add("is-visible");
      }
    }

    function hideCover() {
      if (cover) {
        cover.classList.add("is-hidden");
      }
    }

    function prepareVideo() {
      if (readyPromise) {
        return readyPromise;
      }
      setLoading(true);
      readyPromise = new Promise(function (resolve, reject) {
        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
          hls.loadSource(streamUrl);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            setLoading(false);
            resolve();
          });
          hls.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              showError("视频加载遇到问题，请稍后再试。 ");
              reject(data);
            }
          });
          return;
        }
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = streamUrl;
          video.addEventListener("loadedmetadata", function () {
            setLoading(false);
            resolve();
          }, { once: true });
          video.addEventListener("error", function () {
            showError("视频加载遇到问题，请稍后再试。 ");
            reject(new Error("load error"));
          }, { once: true });
          video.load();
          return;
        }
        showError("当前浏览器暂不支持此视频播放。 ");
        reject(new Error("unsupported"));
      });
      return readyPromise;
    }

    function playVideo(event) {
      if (event) {
        event.preventDefault();
        event.stopPropagation();
      }
      prepareVideo().then(function () {
        hideCover();
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(function () {
            hideCover();
          });
        }
      }).catch(function () {});
    }

    if (button) {
      button.addEventListener("click", playVideo);
    }
    if (cover) {
      cover.addEventListener("click", playVideo);
      cover.addEventListener("keydown", function (event) {
        if (event.key === "Enter" || event.key === " ") {
          playVideo(event);
        }
      });
    }
    video.addEventListener("click", function () {
      if (video.paused) {
        playVideo();
      }
    });
    window.addEventListener("pagehide", function () {
      if (hls) {
        hls.destroy();
        hls = null;
      }
    });
  };
})();
