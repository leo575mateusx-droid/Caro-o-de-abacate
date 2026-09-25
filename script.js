const header = document.getElementById("header");
const audio = document.getElementById("audio");
const playBtn = document.getElementById("playBtn");
const progress = document.getElementById("progress");
const progressBar = progress ? progress.querySelector("i") : null;
const playerTitle = document.getElementById("playerTitle");
const playerArtist = document.getElementById("playerArtist");
const playerCover = document.getElementById("playerCover");
const tracks = [...document.querySelectorAll(".track")];
const yearEl = document.getElementById("year");

if(yearEl) yearEl.textContent = new Date().getFullYear();

// Header ao rolar — usando requestAnimationFrame para não travar o scroll
let scrollTicking = false;
window.addEventListener("scroll", () => {
  if(scrollTicking) return;
  scrollTicking = true;
  requestAnimationFrame(() => {
    header.classList.toggle("scrolled", window.scrollY > 35);
    scrollTicking = false;
  });
}, {passive:true});

// ─────────────────────────────────────────────────────────────
// ESPAÇO PARA OS MP3s
// Cada faixa lê o áudio do atributo data-file no HTML, ex.:
//   <div class="track" data-file="mp3/faixa01.mp3" ...>
// Basta colocar os arquivos .mp3 na pasta "mp3/" do projeto
// (ou trocar o caminho em cada data-file) que o player já toca.
// ─────────────────────────────────────────────────────────────

function loadTrack(track, autoplay=false){
  if(!track) return;

  tracks.forEach(t => t.classList.remove("active"));
  track.classList.add("active");

  const coverSrc = track.querySelector(".track-cover")?.src || track.dataset.cover || playerCover.src;

  if(!track.dataset.file){
    playerTitle.textContent = track.dataset.title;
    playerArtist.textContent = "Arquivo MP3 ainda não adicionado";
    playerCover.src = coverSrc;
    playBtn.textContent = "▶";
    return;
  }

  audio.src = track.dataset.file;
  playerTitle.textContent = track.dataset.title;
  playerArtist.textContent = "Caroço De Abacate";
  playerCover.src = coverSrc;

  if(autoplay){
    audio.play()
      .then(() => playBtn.textContent = "❚❚")
      .catch(() => {
        // Arquivo ainda não existe na pasta mp3/, ou o navegador bloqueou o autoplay
        playBtn.textContent = "▶";
        playerArtist.textContent = "Não foi possível tocar este MP3";
      });
  }else{
    playBtn.textContent = "▶";
  }
}

tracks.forEach(track => {
  track.addEventListener("click", () => loadTrack(track, true));
});

if(playBtn){
  playBtn.addEventListener("click", () => {
    const activeTrack = document.querySelector(".track.active");
    if(!activeTrack || !activeTrack.dataset.file){
      playerTitle.textContent = "Nenhuma faixa carregada";
      playerArtist.textContent = "Adicione os arquivos MP3 na pasta mp3/";
      return;
    }
    if(audio.paused){
      audio.play()
        .then(() => playBtn.textContent = "❚❚")
        .catch(() => { playerArtist.textContent = "Não foi possível tocar este MP3"; });
    }else{
      audio.pause();
      playBtn.textContent = "▶";
    }
  });
}

const featurePlayBtn = document.getElementById("featurePlay");
if(featurePlayBtn){
  featurePlayBtn.addEventListener("click", () => {
    if(tracks.length){
      loadTrack(tracks[0], true);
    }
    document.getElementById("musicas")?.scrollIntoView({behavior:"smooth"});
  });
}

audio.addEventListener("timeupdate", () => {
  if(audio.duration && progressBar){
    const pct = (audio.currentTime / audio.duration) * 100;
    progressBar.style.width = `${pct}%`;
    progress.setAttribute("aria-valuenow", Math.round(pct));
  }
});

audio.addEventListener("ended", () => {
  if(!tracks.length) return;
  const index = tracks.indexOf(document.querySelector(".track.active"));
  const next = tracks[(index + 1) % tracks.length];
  loadTrack(next, true);
});

if(progress){
  progress.addEventListener("click", e => {
    if(!audio.duration) return;
    const rect = progress.getBoundingClientRect();
    audio.currentTime = ((e.clientX - rect.left) / rect.width) * audio.duration;
  });

  // Progresso navegável também pelo teclado (setas esquerda/direita)
  progress.addEventListener("keydown", e => {
    if(!audio.duration) return;
    if(e.key === "ArrowRight") audio.currentTime = Math.min(audio.duration, audio.currentTime + 5);
    if(e.key === "ArrowLeft") audio.currentTime = Math.max(0, audio.currentTime - 5);
  });
}

// Reveal ao rolar
const revealEls = document.querySelectorAll(".reveal");
if(revealEls.length){
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, {threshold:.12});

  revealEls.forEach(el => observer.observe(el));
}

// Lightbox
const lightbox = document.getElementById("lightbox");
const lightboxImage = document.getElementById("lightboxImage");

document.querySelectorAll(".gallery button").forEach(btn => {
  btn.addEventListener("click", () => {
    lightboxImage.src = btn.dataset.image;
    lightbox.classList.add("open");
  });
});

function closeLightbox(){ lightbox.classList.remove("open"); }
document.getElementById("closeLightbox")?.addEventListener("click", closeLightbox);
lightbox?.addEventListener("click", e => { if(e.target === lightbox) closeLightbox(); });
document.addEventListener("keydown", e => { if(e.key === "Escape") closeLightbox(); });

// Movimento sutil no hero (desativado para quem prefere menos animação)
const prefersReducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
if(matchMedia("(pointer:fine)").matches && !prefersReducedMotion){
  const art = document.querySelector(".hero-art");
  let moveTicking = false;
  window.addEventListener("mousemove", e => {
    if(moveTicking) return;
    moveTicking = true;
    requestAnimationFrame(() => {
      const x = (e.clientX / innerWidth - .5) * 10;
      const y = (e.clientY / innerHeight - .5) * 8;
      art.style.transform = `scale(1.03) translate(${x}px,${y}px)`;
      moveTicking = false;
    });
  });
}
