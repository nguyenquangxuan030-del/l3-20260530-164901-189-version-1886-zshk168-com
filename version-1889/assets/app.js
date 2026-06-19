(function () {
    function selectAll(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function initMenu() {
        var toggle = document.querySelector('[data-menu-toggle]');
        var nav = document.querySelector('[data-mobile-nav]');
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener('click', function () {
            nav.classList.toggle('is-open');
        });
    }

    function initHero() {
        var slider = document.querySelector('[data-hero-slider]');
        if (!slider) {
            return;
        }
        var slides = selectAll('[data-hero-slide]', slider);
        var dots = selectAll('[data-hero-dot]', slider);
        var prev = slider.querySelector('[data-hero-prev]');
        var next = slider.querySelector('[data-hero-next]');
        if (!slides.length) {
            return;
        }
        var current = 0;
        var timer;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === current);
            });
        }

        function restart() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                show(index);
                restart();
            });
        });
        if (prev) {
            prev.addEventListener('click', function () {
                show(current - 1);
                restart();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(current + 1);
                restart();
            });
        }
        show(0);
        restart();
    }

    function initRails() {
        selectAll('[data-rail-left], [data-rail-right]').forEach(function (button) {
            button.addEventListener('click', function () {
                var id = button.getAttribute('data-rail-left') || button.getAttribute('data-rail-right');
                var rail = document.getElementById(id);
                if (!rail) {
                    return;
                }
                var dir = button.hasAttribute('data-rail-left') ? -1 : 1;
                rail.scrollBy({ left: dir * 420, behavior: 'smooth' });
            });
        });
    }

    function initFilters() {
        selectAll('[data-filter-scope]').forEach(function (scope) {
            var input = scope.querySelector('[data-search-input]');
            var selects = selectAll('[data-select-filter]', scope);
            var cards = selectAll('[data-movie-card]', scope);

            function apply() {
                var query = input ? input.value.trim().toLowerCase() : '';
                var filters = selects.map(function (select) {
                    return {
                        key: select.getAttribute('data-select-filter'),
                        value: select.value
                    };
                });
                cards.forEach(function (card) {
                    var text = ((card.getAttribute('data-title') || '') + ' ' + (card.getAttribute('data-keywords') || '')).toLowerCase();
                    var passQuery = !query || text.indexOf(query) !== -1;
                    var passSelects = filters.every(function (filter) {
                        if (!filter.value) {
                            return true;
                        }
                        return (card.getAttribute('data-' + filter.key) || '') === filter.value;
                    });
                    card.classList.toggle('is-hidden', !(passQuery && passSelects));
                });
            }

            if (input) {
                input.addEventListener('input', apply);
            }
            selects.forEach(function (select) {
                select.addEventListener('change', apply);
            });
        });
    }

    window.startMoviePlayer = function (sourceUrl) {
        var video = document.querySelector('[data-player]');
        var overlay = document.querySelector('.player-overlay');
        var instance = null;
        var attached = false;

        if (!video || !sourceUrl) {
            return;
        }

        function attachSource() {
            if (attached) {
                return;
            }
            attached = true;
            if (window.Hls && window.Hls.isSupported()) {
                instance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
                instance.loadSource(sourceUrl);
                instance.attachMedia(video);
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = sourceUrl;
            }
        }

        function begin() {
            attachSource();
            if (overlay) {
                overlay.classList.add('is-hidden');
            }
            var playTask = video.play();
            if (playTask && typeof playTask.catch === 'function') {
                playTask.catch(function () {});
            }
        }

        attachSource();
        if (overlay) {
            overlay.addEventListener('click', begin);
        }
        video.addEventListener('click', function () {
            if (video.paused) {
                begin();
            }
        });
        video.addEventListener('play', function () {
            if (overlay) {
                overlay.classList.add('is-hidden');
            }
        });
        window.addEventListener('pagehide', function () {
            if (instance) {
                instance.destroy();
                instance = null;
            }
        });
    };

    document.addEventListener('DOMContentLoaded', function () {
        initMenu();
        initHero();
        initRails();
        initFilters();
    });
})();
