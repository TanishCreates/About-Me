const placeholders = {
  instagram: "https://www.instagram.com/tanish_saini_13/",
  spotify: "https://open.spotify.com/user/31qlqzol77sgph6zqffzguaxioj4",
  github: "https://github.com/TanishCreates/"
};

document.querySelectorAll("[data-placeholder]").forEach(link => {
  const key = link.dataset.placeholder;
  link.href = placeholders[key] || "#";
  link.target = "_blank";
  link.rel = "noreferrer";
});

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll(".reveal").forEach(el => observer.observe(el));

const glow = document.querySelector(".cursor-glow");
window.addEventListener("pointermove", e => {
  glow.style.left = `${e.clientX}px`;
  glow.style.top = `${e.clientY}px`;
});

document.querySelectorAll(".art").forEach((art, index) => {
  art.addEventListener("mouseenter", () => {
    art.textContent = `ARCHIVE_${String(index + 1).padStart(2, "0")}`;
  });
  art.addEventListener("mouseleave", () => {
    art.textContent = String(index + 1).padStart(2, "0");
  });
});

// Change these later to your real current track/watch.
const profile = {
  track: "Your Spotify profile",
  artist: "Open Spotify →",
  watching: "The Mentalist",
  watchDescription: "Currently watching — update this whenever the archive changes."
};

document.querySelector("#miniTrack").textContent = profile.track;
document.querySelector("#miniArtist").textContent = profile.artist;
document.querySelector("#watchTitle").textContent = profile.watching;
document.querySelector("#watchDescription").textContent = profile.watchDescription;

// =========================
// SCROLL CRAFT
// =========================

const scrollProgress = document.querySelector(".scroll-progress");

function updateScrollProgress() {
  const scrollTop = window.scrollY;
  const documentHeight =
    document.documentElement.scrollHeight - window.innerHeight;

  const progress =
    documentHeight > 0 ? (scrollTop / documentHeight) * 100 : 0;

  scrollProgress.style.width = `${progress}%`;
}

window.addEventListener("scroll", updateScrollProgress, {
  passive: true
});

updateScrollProgress();


// =========================
// SUBTLE PARALLAX
// =========================

const parallaxItems = document.querySelectorAll(
  ".portrait-wrap, .system-visual, .art"
);

function updateParallax() {
  const scrollY = window.scrollY;

  parallaxItems.forEach((item, index) => {
    const speed = 0.015 + (index % 3) * 0.008;
    const movement = scrollY * speed;

    item.style.transform = `translateY(${movement}px)`;
  });
}

window.addEventListener("scroll", updateParallax, {
  passive: true
});