(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobileMenu = document.querySelector('[data-mobile-menu]');

    if (menuButton && mobileMenu) {
        menuButton.addEventListener('click', function () {
            mobileMenu.classList.toggle('open');
        });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var index = 0;

        var activate = function (nextIndex) {
            index = nextIndex % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === index);
            });
        };

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                activate(Number(dot.getAttribute('data-hero-dot')) || 0);
            });
        });

        if (slides.length > 1) {
            window.setInterval(function () {
                activate(index + 1);
            }, 5200);
        }
    }

    var input = document.querySelector('[data-filter-input]');
    var select = document.querySelector('[data-filter-select]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
    var quickFilters = Array.prototype.slice.call(document.querySelectorAll('[data-quick-filter]'));

    var filterCards = function () {
        var keyword = input ? input.value.trim().toLowerCase() : '';
        var year = select ? select.value : '';

        cards.forEach(function (card) {
            var text = [
                card.getAttribute('data-title'),
                card.getAttribute('data-year'),
                card.getAttribute('data-region'),
                card.getAttribute('data-genre'),
                card.getAttribute('data-type'),
                card.textContent
            ].join(' ').toLowerCase();
            var matchKeyword = keyword === '' || text.indexOf(keyword) !== -1;
            var matchYear = year === '' || card.getAttribute('data-year') === year;
            card.style.display = matchKeyword && matchYear ? '' : 'none';
        });
    };

    if (input) {
        input.addEventListener('input', filterCards);
    }

    if (select) {
        select.addEventListener('change', filterCards);
    }

    quickFilters.forEach(function (button) {
        button.addEventListener('click', function () {
            if (input) {
                input.value = button.getAttribute('data-quick-filter') || '';
                filterCards();
            }
        });
    });

    var players = Array.prototype.slice.call(document.querySelectorAll('[data-player-wrap]'));

    players.forEach(function (wrap) {
        var video = wrap.querySelector('video');
        var button = wrap.querySelector('[data-play-button]');
        var status = wrap.querySelector('[data-player-status]');
        var started = false;
        var hlsInstance = null;

        var setStatus = function (message) {
            if (status) {
                status.textContent = message;
            }
        };

        var playVideo = function () {
            if (!video) {
                return;
            }

            var source = video.getAttribute('data-src');

            if (!source) {
                setStatus('播放暂不可用');
                return;
            }

            setStatus('正在加载影片');

            if (!started) {
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = source;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        maxBufferLength: 30,
                        enableWorker: true
                    });
                    hlsInstance.loadSource(source);
                    hlsInstance.attachMedia(video);
                } else {
                    video.src = source;
                }
                started = true;
            }

            var request = video.play();

            if (request && typeof request.then === 'function') {
                request.then(function () {
                    wrap.classList.add('is-playing');
                    setStatus('正在播放');
                }).catch(function () {
                    setStatus('再次点击播放');
                });
            } else {
                wrap.classList.add('is-playing');
                setStatus('正在播放');
            }
        };

        if (button) {
            button.addEventListener('click', function (event) {
                event.preventDefault();
                event.stopPropagation();
                playVideo();
            });
        }

        wrap.addEventListener('click', function (event) {
            if (event.target === video) {
                return;
            }
            playVideo();
        });

        if (video) {
            video.addEventListener('play', function () {
                wrap.classList.add('is-playing');
            });

            video.addEventListener('pause', function () {
                if (!video.ended) {
                    wrap.classList.remove('is-playing');
                    setStatus('点击继续播放');
                }
            });

            video.addEventListener('ended', function () {
                wrap.classList.remove('is-playing');
                setStatus('重新播放');
            });
        }

        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    });
})();
