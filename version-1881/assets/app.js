(function () {
    var navButton = document.querySelector('[data-nav-toggle]');
    var nav = document.querySelector('[data-site-nav]');

    if (navButton && nav) {
        navButton.addEventListener('click', function () {
            nav.classList.toggle('is-open');
        });
    }

    document.querySelectorAll('[data-carousel]').forEach(function (carousel) {
        var slides = Array.prototype.slice.call(carousel.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll('.hero-dot'));
        var prev = carousel.querySelector('[data-carousel-prev]');
        var next = carousel.querySelector('[data-carousel-next]');
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }

            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }

        function play() {
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            play();
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                restart();
            });
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                show(dotIndex);
                restart();
            });
        });

        show(0);
        play();
    });

    document.querySelectorAll('[data-filter-form]').forEach(function (panel) {
        var scope = panel.closest('main') || document;
        var input = panel.querySelector('[data-search-input]');
        var selects = Array.prototype.slice.call(panel.querySelectorAll('[data-filter-select]'));
        var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-search]'));
        var empty = scope.querySelector('[data-empty-state]');

        function apply() {
            var query = input ? input.value.trim().toLowerCase() : '';
            var visible = 0;

            cards.forEach(function (card) {
                var matched = true;
                var text = (card.getAttribute('data-search') || '').toLowerCase();

                if (query && text.indexOf(query) === -1) {
                    matched = false;
                }

                selects.forEach(function (select) {
                    var value = select.value;
                    var key = select.getAttribute('data-filter-key');
                    var current = card.getAttribute('data-' + key) || '';

                    if (value && current.indexOf(value) === -1) {
                        matched = false;
                    }
                });

                card.classList.toggle('is-hidden', !matched);

                if (matched) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.classList.toggle('is-visible', visible === 0);
            }
        }

        if (input) {
            input.addEventListener('input', apply);
        }

        selects.forEach(function (select) {
            select.addEventListener('change', apply);
        });
    });
})();
