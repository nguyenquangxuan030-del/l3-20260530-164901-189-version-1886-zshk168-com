document.addEventListener("DOMContentLoaded", function () {
  var hlsPromise = null;

  function loadHls() {
    if (window.Hls) {
      return Promise.resolve(window.Hls);
    }

    if (hlsPromise) {
      return hlsPromise;
    }

    hlsPromise = new Promise(function (resolve, reject) {
      var script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/hls.js@1/dist/hls.min.js";
      script.async = true;
      script.onload = function () {
        if (window.Hls) {
          resolve(window.Hls);
        } else {
          reject(new Error("hls"));
        }
      };
      script.onerror = function () {
        reject(new Error("hls"));
      };
      document.head.appendChild(script);
    });

    return hlsPromise;
  }

  function playVideo(frame) {
    var video = frame.querySelector("video");

    if (!video) {
      return;
    }

    var stream = video.getAttribute("data-stream");

    if (!stream) {
      return;
    }

    frame.classList.add("is-playing");

    if (video.src) {
      video.play().catch(function () {});
      return;
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = stream;
      video.play().catch(function () {});
      return;
    }

    loadHls().then(function (Hls) {
      if (Hls.isSupported()) {
        var hls = new Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(stream);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(function () {});
        });
      } else {
        video.src = stream;
        video.play().catch(function () {});
      }
    }).catch(function () {
      video.src = stream;
      video.play().catch(function () {});
    });
  }

  Array.from(document.querySelectorAll("[data-player]")).forEach(function (frame) {
    var button = frame.querySelector(".player-cover");
    var video = frame.querySelector("video");

    if (button) {
      button.addEventListener("click", function () {
        playVideo(frame);
      });
    }

    if (video) {
      video.addEventListener("click", function () {
        if (!video.src) {
          playVideo(frame);
        }
      });
    }
  });
});
