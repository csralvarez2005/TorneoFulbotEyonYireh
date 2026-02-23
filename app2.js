class VideoCarousel {

    constructor() {
        this.carousel = document.querySelector(".video-carousel");
        this.items = Array.from(document.querySelectorAll(".video-item"));
        this.btnLeft = document.querySelector(".carousel-btn.left");
        this.btnRight = document.querySelector(".carousel-btn.right");

        this.current = Math.floor(this.items.length / 2);
        this.interval = null;
        this.intervalTime = 4500;

        this.init();
    }

    init() {
        if (!this.carousel || !this.items.length) return;

        this.update();
        this.start();
        this.events();
    }

    /* ========================= */
    /* CREAR IFRAME SOLO ACTIVO  */
    /* ========================= */

    createIframe(item) {
        if (item.querySelector("iframe")) return;

        const iframe = document.createElement("iframe");
        iframe.src = item.dataset.src;
        iframe.loading = "lazy";
        iframe.allow =
            "autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share";
        iframe.allowFullscreen = true;
        iframe.referrerPolicy = "strict-origin-when-cross-origin";

        item.appendChild(iframe);
    }

    destroyIframe(item) {
        const iframe = item.querySelector("iframe");
        if (iframe) iframe.remove();
    }

    /* ========================= */
    /* ACTUALIZAR COVERFLOW      */
    /* ========================= */

    update() {

        const total = this.items.length;
        const width = this.items[0].offsetWidth;
        const spacing = width * 0.6;

        this.items.forEach((item, index) => {

            let offset = index - this.current;

            if (offset > total / 2) offset -= total;
            if (offset < -total / 2) offset += total;

            const abs = Math.abs(offset);

            // Solo ocultamos los muy lejanos
            if (abs > 2) {
                item.style.opacity = "0";
                item.style.pointerEvents = "none";
                this.destroyIframe(item);
                return;
            }

            const translateX = offset * spacing;
            const scale = 1 - (abs * 0.1);
            const rotateY = offset * -25;

            // 🔥 Menos profundidad para que no se vean apagados
            const translateZ = abs === 0 ? 0 : -30 * abs;

            item.style.opacity = "1"; // 🔥 Siempre visibles
            item.style.zIndex = 100 - abs;
            item.style.pointerEvents = abs === 0 ? "auto" : "none";

            item.style.transform = `
            translate(-50%, -50%)
            translateX(${translateX}px)
            translateZ(${translateZ}px)
            rotateY(${rotateY}deg)
            scale(${scale})
        `;

            // 🔥 ELIMINAMOS COMPLETAMENTE brightness
            item.style.filter = "none";

            // Mostramos el iframe en todos los elementos visibles (no solo el centro)
            this.createIframe(item);
        });
    }


    /* ========================= */
    /* NAVEGACIÓN                */
    /* ========================= */

    next() {
        this.current = (this.current + 1) % this.items.length;
        this.update();
    }

    prev() {
        this.current =
            (this.current - 1 + this.items.length) % this.items.length;
        this.update();
    }

    /* ========================= */
    /* AUTOPLAY INTELIGENTE      */
    /* ========================= */

    start() {
        this.stop();
        this.interval = setInterval(() => this.next(), this.intervalTime);
    }

    stop() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
    }

    /* ========================= */
    /* EVENTOS                   */
    /* ========================= */

    events() {

        // Pausa en hover
        this.carousel.addEventListener("mouseenter", () => this.stop());
        this.carousel.addEventListener("mouseleave", () => this.start());

        // Pausa si pestaña no está visible
        document.addEventListener("visibilitychange", () => {
            if (document.hidden) {
                this.stop();
            } else {
                this.start();
            }
        });

        // Botón derecho
        if (this.btnRight) {
            this.btnRight.addEventListener("click", () => {
                this.stop();
                this.next();
                this.start();
            });
        }

        // Botón izquierdo
        if (this.btnLeft) {
            this.btnLeft.addEventListener("click", () => {
                this.stop();
                this.prev();
                this.start();
            });
        }

        // Resize optimizado con debounce
        let resizeTimeout;
        window.addEventListener("resize", () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.update();
            }, 200);
        });
    }
}

/* ========================= */
/* INICIALIZAR               */
/* ========================= */

document.addEventListener("DOMContentLoaded", () => {
    new VideoCarousel();
});








