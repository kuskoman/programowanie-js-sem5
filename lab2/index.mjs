const createSlider = () => {
  const SELECTORS = {
    SLIDES: ".slide",
    SLIDES_CONTAINER: ".slides",
    TOGGLE_PLAY: ".toggle-play",
    NEXT: ".next",
    PREV: ".prev",
    SLIDE_NAV: ".slide-nav",
  };

  const TEXT = {
    PLAY: "▶",
    PAUSE: "❚❚",
  };

  const elements = {
    slides: document.querySelectorAll(SELECTORS.SLIDES),
    slidesContainer: document.querySelector(SELECTORS.SLIDES_CONTAINER),
    togglePlayButton: document.querySelector(SELECTORS.TOGGLE_PLAY),
    nextButton: document.querySelector(SELECTORS.NEXT),
    prevButton: document.querySelector(SELECTORS.PREV),
    slideNavContainer: document.querySelector(SELECTORS.SLIDE_NAV),
  };

  let currentSlide = 0;
  let autoSlideInterval;
  let isPlaying = true;

  const updateSlide = (slideIndex) => {
    const offset = -slideIndex * 100;
    requestAnimationFrame(() => {
      elements.slidesContainer.style.transform = `translateX(${offset}%)`;
    });
    elements.slideNavContainer
      .querySelectorAll("button")
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
      currentSlide = (currentSlide + 1) % elements.slides.length;
      updateSlide(currentSlide);
    }, 2000);
    elements.togglePlayButton.textContent = TEXT.PAUSE;
  };

  const stopAutoSlide = () => {
    clearInterval(autoSlideInterval);
    elements.togglePlayButton.textContent = TEXT.PLAY;
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
    currentSlide = (currentSlide + 1) % elements.slides.length;
    updateSlide(currentSlide);
  };

  const prevSlide = () => {
    currentSlide =
      currentSlide === 0 ? elements.slides.length - 1 : currentSlide - 1;
    updateSlide(currentSlide);
  };

  const init = () => {
    startAutoSlide();
    elements.togglePlayButton.addEventListener("click", togglePlayPause);
    elements.nextButton.addEventListener("click", nextSlide);
    elements.prevButton.addEventListener("click", prevSlide);

    elements.slides.forEach((_, index) => {
      const button = document.createElement("button");
      button.addEventListener("click", () => goToSlide(index));
      elements.slideNavContainer.appendChild(button);
    });
  };

  return {
    init,
  };
};

const slider = createSlider();
slider.init();
