/* ============================================
   PowerLine Electrical Wellington
   Main JavaScript — Multi-Page
   ============================================ */

(function () {
    'use strict';

    /* ---------- Custom Cursor ---------- */
    const cursorDot = document.querySelector('.cursor-dot');
    const cursorRing = document.querySelector('.cursor-ring');
    if (cursorDot && cursorRing && window.matchMedia('(pointer: fine)').matches) {
        let mx = 0, my = 0, rx = 0, ry = 0;
        document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
        document.addEventListener('mousedown', () => { cursorDot.classList.add('active'); cursorRing.classList.add('active'); });
        document.addEventListener('mouseup', () => { cursorDot.classList.remove('active'); cursorRing.classList.remove('active'); });
        (function loop() {
            rx += (mx - rx) * 0.15; ry += (my - ry) * 0.15;
            cursorDot.style.transform = `translate(${mx - 3}px, ${my - 3}px)`;
            cursorRing.style.transform = `translate(${rx - 18}px, ${ry - 18}px)`;
            requestAnimationFrame(loop);
        })();
    }

    /* ---------- Navigation ---------- */
    const nav = document.getElementById('nav');
    const hamburger = document.getElementById('navHamburger');
    const navMenu = document.getElementById('navMenu');

    // Scroll effects — sticky nav bg
    window.addEventListener('scroll', () => {
        nav.classList.toggle('scrolled', window.scrollY > 50);
    }, { passive: true });

    // Hamburger toggle
    hamburger?.addEventListener('click', () => {
        const open = hamburger.classList.toggle('active');
        navMenu.classList.toggle('open');
        hamburger.setAttribute('aria-expanded', open);
        document.body.style.overflow = open ? 'hidden' : '';
    });

    // Close mobile menu on link click
    document.querySelectorAll('.nav__link').forEach(link => link.addEventListener('click', () => {
        hamburger?.classList.remove('active');
        navMenu?.classList.remove('open');
        document.body.style.overflow = '';
    }));

    /* ---------- Hero Canvas — Electric Sparks ---------- */
    const canvas = document.getElementById('heroCanvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let w, h, particles = [], bolts = [];

        function resize() {
            w = canvas.width = canvas.offsetWidth;
            h = canvas.height = canvas.offsetHeight;
        }
        resize();
        window.addEventListener('resize', resize);

        class Particle {
            constructor() { this.reset(); }
            reset() {
                this.x = Math.random() * w;
                this.y = Math.random() * h;
                this.vx = (Math.random() - 0.5) * 0.4;
                this.vy = (Math.random() - 0.5) * 0.4;
                this.r = Math.random() * 2 + 0.5;
                this.alpha = Math.random() * 0.5 + 0.1;
            }
            update() {
                this.x += this.vx; this.y += this.vy;
                if (this.x < 0 || this.x > w || this.y < 0 || this.y > h) this.reset();
            }
            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(251, 191, 36, ${this.alpha})`;
                ctx.fill();
            }
        }

        class Bolt {
            constructor() {
                this.x = Math.random() * w;
                this.segments = [];
                let x = this.x, y = 0;
                const end = h * (0.3 + Math.random() * 0.5);
                while (y < end) {
                    const nx = x + (Math.random() - 0.5) * 80;
                    const ny = y + 10 + Math.random() * 20;
                    this.segments.push({ x1: x, y1: y, x2: nx, y2: ny });
                    x = nx; y = ny;
                }
                this.alpha = 1;
                this.decay = 0.03 + Math.random() * 0.03;
            }
            update() { this.alpha -= this.decay; }
            draw() {
                if (this.alpha <= 0) return;
                ctx.strokeStyle = `rgba(251, 191, 36, ${this.alpha})`;
                ctx.lineWidth = 1.5;
                ctx.shadowColor = '#FBBF24';
                ctx.shadowBlur = 15;
                ctx.beginPath();
                this.segments.forEach(s => { ctx.moveTo(s.x1, s.y1); ctx.lineTo(s.x2, s.y2); });
                ctx.stroke();
                ctx.shadowBlur = 0;
            }
        }

        const count = Math.min(80, Math.floor(w * h / 10000));
        for (let i = 0; i < count; i++) particles.push(new Particle());

        function animate() {
            ctx.clearRect(0, 0, w, h);
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const d = Math.sqrt(dx * dx + dy * dy);
                    if (d < 120) {
                        ctx.strokeStyle = `rgba(251, 191, 36, ${0.06 * (1 - d / 120)})`;
                        ctx.lineWidth = 0.5;
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                    }
                }
            }
            particles.forEach(p => { p.update(); p.draw(); });
            if (Math.random() < 0.008) bolts.push(new Bolt());
            bolts.forEach(b => { b.update(); b.draw(); });
            bolts = bolts.filter(b => b.alpha > 0);
            requestAnimationFrame(animate);
        }
        animate();
    }

    /* ---------- Scroll Reveal ---------- */
    const reveals = document.querySelectorAll('.reveal-up');
    const revealObs = new IntersectionObserver((entries) => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                e.target.classList.add('visible');
                revealObs.unobserve(e.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(el => revealObs.observe(el));

    /* ---------- Counter Animation ---------- */
    const counters = document.querySelectorAll('.stat-card__number');
    const counterObs = new IntersectionObserver((entries) => {
        entries.forEach(e => {
            if (!e.isIntersecting) return;
            const el = e.target;
            const target = parseFloat(el.dataset.target);
            const decimals = parseInt(el.dataset.decimals) || 0;
            const duration = 2000;
            const start = performance.now();
            function tick(now) {
                const progress = Math.min((now - start) / duration, 1);
                const eased = 1 - Math.pow(1 - progress, 3);
                const current = eased * target;
                el.textContent = decimals ? current.toFixed(decimals) : Math.floor(current).toLocaleString();
                if (progress < 1) requestAnimationFrame(tick);
            }
            requestAnimationFrame(tick);
            counterObs.unobserve(el);
        });
    }, { threshold: 0.5 });
    counters.forEach(el => counterObs.observe(el));

    /* ---------- Reviews Carousel (if present) ---------- */
    const track = document.getElementById('reviewsTrack');
    const prevBtn = document.getElementById('reviewPrev');
    const nextBtn = document.getElementById('reviewNext');
    const dotsContainer = document.getElementById('reviewDots');
    if (track) {
        const cards = track.querySelectorAll('.review-card');
        let current = 0, perView = 1, autoTimer;

        function getPerView() {
            if (window.innerWidth >= 1024) return 3;
            if (window.innerWidth >= 768) return 2;
            return 1;
        }

        function maxIndex() { return Math.max(0, cards.length - perView); }

        function buildDots() {
            dotsContainer.innerHTML = '';
            const count = maxIndex() + 1;
            for (let i = 0; i < count; i++) {
                const dot = document.createElement('button');
                dot.className = 'reviews__dot' + (i === current ? ' active' : '');
                dot.setAttribute('aria-label', `Review ${i + 1}`);
                dot.addEventListener('click', () => goTo(i));
                dotsContainer.appendChild(dot);
            }
        }

        function goTo(i) {
            current = Math.max(0, Math.min(i, maxIndex()));
            const pct = (current * 100) / perView;
            track.style.transform = `translateX(-${pct}%)`;
            dotsContainer.querySelectorAll('.reviews__dot').forEach((d, idx) => d.classList.toggle('active', idx === current));
            resetAuto();
        }

        function resetAuto() {
            clearInterval(autoTimer);
            autoTimer = setInterval(() => goTo(current >= maxIndex() ? 0 : current + 1), 5000);
        }

        function init() {
            perView = getPerView();
            if (current > maxIndex()) current = maxIndex();
            buildDots();
            goTo(current);
        }

        prevBtn?.addEventListener('click', () => goTo(current - 1));
        nextBtn?.addEventListener('click', () => goTo(current >= maxIndex() ? 0 : current + 1));
        window.addEventListener('resize', init);

        let tx = 0, isDragging = false;
        track.addEventListener('touchstart', e => { tx = e.touches[0].clientX; isDragging = true; }, { passive: true });
        track.addEventListener('touchend', e => {
            if (!isDragging) return;
            isDragging = false;
            const diff = tx - e.changedTouches[0].clientX;
            if (Math.abs(diff) > 50) goTo(current + (diff > 0 ? 1 : -1));
        }, { passive: true });

        init();
    }

    /* ---------- Contact Form ---------- */
    const form = document.getElementById('contactForm');
    form?.addEventListener('submit', e => {
        e.preventDefault();
        const btn = form.querySelector('button[type="submit"]');
        const orig = btn.innerHTML;
        btn.innerHTML = '✓ Quote Request Sent!';
        btn.style.background = '#22C55E';
        btn.disabled = true;
        setTimeout(() => {
            btn.innerHTML = orig;
            btn.style.background = '';
            btn.disabled = false;
            form.reset();
        }, 3000);
    });

    /* ---------- Smooth scroll for same-page anchors ---------- */
    document.querySelectorAll('a[href^="#"]').forEach(a => {
        a.addEventListener('click', e => {
            const target = document.querySelector(a.getAttribute('href'));
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

})();
