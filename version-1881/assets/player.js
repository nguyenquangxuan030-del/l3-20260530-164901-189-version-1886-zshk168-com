(function () {
    var attached = new WeakMap();

    function attach(video, stream) {
        if (!video || !stream || attached.has(video)) {
            return;
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = stream;
            attached.set(video, true);
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(stream);
            hls.attachMedia(video);
            attached.set(video, hls);
            return;
        }

        video.src = stream;
        attached.set(video, true);
    }

    document.querySelectorAll('[data-player]').forEach(function (shell) {
        var stream = shell.getAttribute('data-stream');
        var video = shell.querySelector('video');
        var button = shell.querySelector('.play-cover');

        function start() {
            attach(video, stream);
            shell.classList.add('is-playing');
            if (button) {
                button.setAttribute('aria-hidden', 'true');
            }
            if (video) {
                video.play().catch(function () {});
            }
        }

        if (button) {
            button.addEventListener('click', start);
        }

        if (video) {
            video.addEventListener('play', function () {
                shell.classList.add('is-playing');
            });
            video.addEventListener('ended', function () {
                shell.classList.remove('is-playing');
                if (button) {
                    button.removeAttribute('aria-hidden');
                }
            });
        }
    });
})();
