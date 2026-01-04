document.addEventListener('DOMContentLoaded', () => {
    const sliders = document.querySelectorAll('[data-slider]');

    sliders.forEach((slider) => {
        const images = slider.querySelectorAll('.slider-track img');
        let currentIndex = 0;

        const updateGallery = () => {
            images.forEach((img, index) => {
                img.classList.toggle('is-active', index === currentIndex);
            });
        };

        const prevButton = slider.querySelector('.slider-btn.prev');
        const nextButton = slider.querySelector('.slider-btn.next');

        prevButton?.addEventListener('click', (event) => {
            event.preventDefault();
            currentIndex = (currentIndex - 1 + images.length) % images.length;
            updateGallery();
        });

        nextButton?.addEventListener('click', (event) => {
            event.preventDefault();
            currentIndex = (currentIndex + 1) % images.length;
            updateGallery();
        });

        updateGallery();
    });
});

