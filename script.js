
document.addEventListener("DOMContentLoaded", () => {

    const phone = document.querySelector("#phone");
    const phoneNotice = document.querySelector("#phoneNotice");

    const mainVideoOverlay = document.querySelector("#mainVideoOverlay");
    const mainVideoContainer = document.querySelector("#mainVideoContainer");
    const mainVslVideo = document.querySelector("#mainVslVideo");

    const soundButton = document.querySelector("#soundButton");
    const soundOffIcon = document.querySelector("#soundOffIcon");
    const soundOnIcon = document.querySelector("#soundOnIcon");

    const videoProgressFill = document.querySelector("#videoProgressFill");


    // ANIMAÇÃO INICIAL DO CELULAR

    if (phone) {

        phone.addEventListener("animationend", () => {
            phone.classList.add("phone-ready");
        }, { once: true });

    }


    // ATUALIZAR ÍCONE DO SOM

    function updateSoundButton() {

        if (mainVslVideo.muted) {

            soundOffIcon.hidden = false;
            soundOnIcon.hidden = true;

            soundButton.setAttribute("aria-label", "Ativar som");

        } else {

            soundOffIcon.hidden = true;
            soundOnIcon.hidden = false;

            soundButton.setAttribute("aria-label", "Desativar som");

        }

    }


    // ABRIR VÍDEO

    async function openMainVideo() {

        mainVideoOverlay.classList.add("active");

        document.body.style.overflow = "hidden";

        mainVslVideo.pause();
        mainVslVideo.currentTime = 0;
        mainVslVideo.muted = false;

        videoProgressFill.style.width = "0%";

        updateSoundButton();

        // Tentar abrir em tela cheia

        try {

            if (mainVideoOverlay.requestFullscreen) {

                await mainVideoOverlay.requestFullscreen();

            }

        } catch (error) {

            console.log("Tela cheia não disponível. Usando tela cheia visual.");

        }


        // Tentar deixar o celular na horizontal

        try {

            if (
                screen.orientation &&
                screen.orientation.lock &&
                document.fullscreenElement
            ) {

                await screen.orientation.lock("landscape");

            }

        } catch (error) {

            console.log("O navegador não permite bloquear a orientação horizontal.");

        }


        // Reproduzir vídeo

        try {

            await mainVslVideo.play();

        } catch (error) {

            console.log("Não foi possível iniciar o vídeo automaticamente.");

        }

    }


    phoneNotice.addEventListener("click", openMainVideo);


    // BOTÃO DE SOM

    soundButton.addEventListener("click", () => {

        mainVslVideo.muted = !mainVslVideo.muted;

        updateSoundButton();

    });


    // BARRA DE PROGRESSO - SOMENTE VISUALIZAÇÃO

    mainVslVideo.addEventListener("timeupdate", () => {

        if (!mainVslVideo.duration) return;

        const percentage =
            (mainVslVideo.currentTime / mainVslVideo.duration) * 100;

        videoProgressFill.style.width = percentage + "%";

    });


    // IMPEDIR MENU DE CONTEXTO NO VÍDEO

    mainVslVideo.addEventListener("contextmenu", (event) => {

        event.preventDefault();

    });


    // BLOQUEAR TECLAS DE AVANÇO E RETROCESSO

    document.addEventListener("keydown", (event) => {

        if (!mainVideoOverlay.classList.contains("active")) return;

        if (
            event.code === "Space" ||
            event.code === "ArrowRight" ||
            event.code === "ArrowLeft" ||
            event.code === "ArrowUp" ||
            event.code === "ArrowDown" ||
            event.key.toLowerCase() === "k"
        ) {

            event.preventDefault();

        }

    });


    // QUANDO O VÍDEO TERMINAR

    mainVslVideo.addEventListener("ended", async () => {

        mainVslVideo.pause();

        mainVideoOverlay.classList.remove("active");

        document.body.style.overflow = "";

        // Liberar a orientação normal do aparelho

        try {

            if (screen.orientation && screen.orientation.unlock) {
                screen.orientation.unlock();
            }

        } catch (error) {

            console.log("Não foi necessário desbloquear a orientação.");

        }


        // Sair da tela cheia

        try {

            if (document.fullscreenElement) {
                await document.exitFullscreen();
            }

        } catch (error) {

            console.log("A tela cheia já foi encerrada.");

        }


        // FUTURAMENTE:
        // Aqui vamos conectar a próxima página HTML
        // que terá os cards de valores.

    });


    // SE O VÍDEO FOR REINICIADO

    mainVslVideo.addEventListener("play", updateSoundButton);

});
