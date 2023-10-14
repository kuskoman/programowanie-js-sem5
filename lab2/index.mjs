const createSlider = () => {
  const SLIDES_SELECTOR = ".slide";
  const SLIDES_CONTAINER_SELECTOR = ".slides";
  const TOGGLE_PLAY_SELECTOR = ".toggle-play";
  const NEXT_SELECTOR = ".next";
  const PREV_SELECTOR = ".prev";
  const SLIDE_NAV_SELECTOR = ".slide-nav";
  const PLAY_TEXT = "▶";
  const PAUSE_TEXT = "❚❚";

  const slides = document.querySelectorAll(SLIDES_SELECTOR);
  let currentSlide = 0;
  let autoSlideInterval;
  let isPlaying = true;

  const updateSlide = (slideIndex) => {
    const offset = -slideIndex * 100;
    requestAnimationFrame(() => {
      document.querySelector(
        SLIDES_CONTAINER_SELECTOR
      ).style.transform = `translateX(${offset}%)`;
    });
    document
      .querySelectorAll(`${SLIDE_NAV_SELECTOR} button`)
      .forEach((btn, index) => {
        btn.classList.toggle("active", index === slideIndex);
      });
  };

  const goToSlide = (index) => {
    currentSlide = index;
    updateSlide(index);
  };

  const startAutoSlide = () => {
    autoSlideInterval = setInterval(() => {
      currentSlide = (currentSlide + 1) % slides.length;
      updateSlide(currentSlide);
    }, 2000);
    document.querySelector(TOGGLE_PLAY_SELECTOR).textContent = PAUSE_TEXT;
  };

  const stopAutoSlide = () => {
    clearInterval(autoSlideInterval);
    document.querySelector(TOGGLE_PLAY_SELECTOR).textContent = PLAY_TEXT;
  };

  const togglePlayPause = () => {
    if (isPlaying) {
      stopAutoSlide();
      isPlaying = false;
    } else {
      startAutoSlide();
      isPlaying = true;
    }
  };

  const nextSlide = () => {
    currentSlide = (currentSlide + 1) % slides.length;
    updateSlide(currentSlide);
  };

  const prevSlide = () => {
    currentSlide = currentSlide === 0 ? slides.length - 1 : currentSlide - 1;
    updateSlide(currentSlide);
  };

  const init = () => {
    startAutoSlide();
    document
      .querySelector(TOGGLE_PLAY_SELECTOR)
      .addEventListener("click", togglePlayPause);
    document.querySelector(NEXT_SELECTOR).addEventListener("click", nextSlide);
    document.querySelector(PREV_SELECTOR).addEventListener("click", prevSlide);

    slides.forEach((_, index) => {
      const button = document.createElement("button");
      button.addEventListener("click", () => goToSlide(index));
      document.querySelector(SLIDE_NAV_SELECTOR).appendChild(button);
    });
  };

  return {
    init,
  };
};

const slider = createSlider();
slider.init();
