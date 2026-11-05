
document.addEventListener("DOMContentLoaded", () => {
  gsap.registerPlugin(ScrollTrigger);

  const video = document.querySelector("#vslVideo");
  const soundButton = document.querySelector("#soundButton");
  const soundIcon = document.querySelector("#soundIcon");
  const videoProgressFill = document.querySelector("#videoProgressFill");

  const introScene = document.querySelector("#introScene");
  const transitionStage = document.querySelector("#transitionStage");
  const videoScreen = document.querySelector("#videoScreen");
  const offerCard = document.querySelector("#offerCard");
  const guaranteeCard = document.querySelector("#guaranteeCard");

  // CONTROLE DO ESTADO DO ÁUDIO.
  let audioEnabled = false;

  // CONTROLE DA TRANSIÇÃO DO VÍDEO.
  let videoTransitionProgress = 0;
  let videoShouldPlay = true;

  // ========================================
  // VÍDEO: AUTOPLAY E PROGRESSO
  // ========================================

  if (video) {
    video.muted = true;
    video.volume = 1;

    // Impede que a barra fique escondida no início.
    if (videoScreen) {
      videoScreen.classList.add("is-fully-open");
    }

    const playVideo = () => {
      const playPromise = video.play();

      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // O navegador pode bloquear o autoplay.
          // O vídeo poderá ser iniciado posteriormente.
        });
      }
    };

    playVideo();

    // ATUALIZA A BARRA DE PROGRESSO.
    const updateVideoProgress = () => {
      if (
        !videoProgressFill ||
        !video.duration ||
        !Number.isFinite(video.duration)
      ) {
        return;
      }

      const percentage =
        (video.currentTime / video.duration) * 100;

      videoProgressFill.style.width = `${percentage}%`;
    };

    video.addEventListener("timeupdate", updateVideoProgress);

    video.addEventListener("loadedmetadata", updateVideoProgress);

    video.addEventListener("ended", updateVideoProgress);
  }


  // ========================================
  // CONTROLE DE SOM
  // ========================================

  if (soundButton && video) {
    soundButton.classList.add("is-muted");

    soundButton.addEventListener("click", () => {
      audioEnabled = !audioEnabled;

      // O som só é liberado se a pessoa ativar.
      video.muted = !audioEnabled;

      // Mantém o volume sincronizado com a rolagem.
      video.volume = audioEnabled
        ? Math.max(0, 1 - videoTransitionProgress)
        : 1;

      soundButton.classList.toggle(
        "is-muted",
        !audioEnabled
      );

      if (soundIcon) {
        soundIcon.textContent = "";
      }

      soundButton.setAttribute(
        "aria-label",
        audioEnabled ? "Desativar som" : "Ativar som"
      );
    });
  }


  // ========================================
  // ABERTURA, VÍDEO E TRANSIÇÃO
  // ========================================

  const openingTimeline = gsap.timeline({
    scrollTrigger: {
      trigger: introScene,
      start: "top top",
      end: () => `+=${window.innerHeight * 1.45}`,
      scrub: 1,
      pin: true,
      pinSpacing: true,
      anticipatePin: 1,
      invalidateOnRefresh: true
    }
  });

  openingTimeline

    // FECHAMENTO CIRCULAR DO VÍDEO.
    .to(videoScreen, {
      clipPath: "circle(0% at 50% 50%)",
      ease: "none",
      duration: 1
    }, 0)

    // APARECIMENTO DO CARD DE INVESTIMENTO.
    .to(offerCard, {
      opacity: 1,
      y: 0,
      ease: "power2.out",
      duration: 0.38
    }, 0.48)

    // APARECIMENTO DO CARD DE GARANTIA.
    .to(guaranteeCard, {
      opacity: 1,
      y: 0,
      ease: "power2.out",
      duration: 0.3
    }, 0.72)

    // TRANSIÇÃO GRADUAL DO FUNDO.
    .to(transitionStage, {
      backgroundColor: "#260F19",
      ease: "none",
      duration: 0.30
    }, 0.72);


  // ========================================
  // SINCRONIZA ÁUDIO COM A TRANSIÇÃO
  // ========================================

  const syncVideoWithScroll = () => {
    if (!video || !videoScreen) return;

    // A animação circular tem duração de 1 segundo.
    videoTransitionProgress = gsap.utils.clamp(
      0,
      1,
      openingTimeline.time()
    );

    // VOLUME DIMINUI CONFORME O CÍRCULO FECHA.
    if (audioEnabled) {
      video.volume = 1 - videoTransitionProgress;
    } else {
      video.volume = 1;
    }

    // A BARRA SÓ APARECE COM O VÍDEO TOTALMENTE ABERTO.
    videoScreen.classList.toggle(
      "is-fully-open",
      videoTransitionProgress <= 0.001
    );

    // QUANDO O VÍDEO DESAPARECE, O ÁUDIO PARA TAMBÉM.
    if (videoTransitionProgress >= 0.999) {

      if (!video.paused) {
        video.pause();
      }

      videoShouldPlay = false;

    } else {

      // AO VOLTAR PARA CIMA, O VÍDEO PODE REAPARECER.
      if (!videoShouldPlay && !video.ended) {
        video.play().catch(() => {});
        videoShouldPlay = true;
      }
    }
  };

  // ACOMPANHA O PLAYHEAD REAL DA ANIMAÇÃO GSAP.
  openingTimeline.eventCallback(
    "onUpdate",
    syncVideoWithScroll
  );

  // ESTADO INICIAL.
  syncVideoWithScroll();


  // ========================================
  // ANIMAÇÕES SUAVES DOS ELEMENTOS
  // ========================================

  gsap.utils.toArray(".reveal").forEach((element) => {
    gsap.fromTo(
      element,
      {
        opacity: 0,
        y: 35
      },
      {
        opacity: 1,
        y: 0,
        duration: 0.9,
        ease: "power2.out",
        scrollTrigger: {
          trigger: element,
          start: "top 88%",
          once: true
        }
      }
    );
  });


  // ========================================
  // MOVIMENTO HORIZONTAL DO MÉTODO
  // EM TELAS GRANDES
  // ========================================

  const media = gsap.matchMedia();

  media.add("(min-width: 901px)", () => {
    const track = document.querySelector("#methodTrack");
    const section = document.querySelector("#metodo");

    if (!track || !section) return;

    const getDistance = () => {
      return Math.max(
        0,
        track.scrollWidth - window.innerWidth
      );
    };

    gsap.to(track, {
      x: () => -getDistance(),
      ease: "none",
      scrollTrigger: {
        trigger: section,
        start: "top top",
        end: () => `+=${getDistance()}`,
        pin: true,
        scrub: 1,
        anticipatePin: 1,
        invalidateOnRefresh: true
      }
    });
  });


  // ========================================
  // FAIXA DO MÉTODO: MOVIMENTO CONTÍNUO
  // ========================================

  const floatingTrack = document.querySelector(
    ".floating-phrase-track"
  );

  const floatingGroups = document.querySelectorAll(
    ".floating-phrase-group"
  );

  if (floatingTrack && floatingGroups.length >= 2) {
    const firstGroup = floatingGroups[0];

    gsap.to(floatingTrack, {
      x: () => -firstGroup.offsetWidth,
      duration: 25,
      ease: "none",
      repeat: -1,
      repeatRefresh: true
    });
  }


  // ========================================
  // ATUALIZA CÁLCULOS DEPOIS DO CARREGAMENTO
  // ========================================

  window.addEventListener("load", () => {
    ScrollTrigger.refresh();
  });


  // ========================================
  // RECALCULA AO REDIMENSIONAR A TELA
  // ========================================

  let resizeTimeout;

  window.addEventListener("resize", () => {
    clearTimeout(resizeTimeout);

    resizeTimeout = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 250);
  });

});
