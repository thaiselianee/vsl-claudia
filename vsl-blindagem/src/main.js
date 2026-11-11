import * as THREE from 'three';
import { gsap } from 'gsap';
import videoUrl from './assets/vsl-demo1.mp4';
import './style.css';

/* ==========================================
   ELEMENTOS
========================================== */

const stage = document.querySelector('#stage');
const canvas = document.querySelector('#scene');

const introScene = document.querySelector('#introScene');
const methodScene = document.querySelector('#methodScene');
const bonusesScene = document.querySelector('#bonusesScene');
const faqScene = document.querySelector('#faqScene');
const offerScene = document.querySelector('#offerScene');
const footerScene = document.querySelector('#footerScene');

const video = document.querySelector('#claudiaVideo');
const videoFrame = document.querySelector('#videoFrame');
const videoPlayButton = document.querySelector('#videoPlayButton');
const soundButton = document.querySelector('#soundButton');
const soundIcon = document.querySelector('#soundIcon');
const soundText = document.querySelector('#soundText');
const videoStatus = document.querySelector('#videoStatus');
const videoStatusText = document.querySelector('#videoStatusText');
const videoEndedMessage = document.querySelector('#videoEndedMessage');

const videoExpandButton = document.querySelector('#videoExpandButton');
const expandIcon = document.querySelector('#expandIcon');
const videoReplayButton = document.querySelector('#videoReplayButton');
const videoBackdrop = document.querySelector('#videoBackdrop');

const cursorGlow = document.querySelector('#cursorGlow');

const progressNumber = document.querySelector('#progressNumber');
const progressTotal = document.querySelector('#progressTotal');
const progressBar = document.querySelector('#progressBar');
const scrollHint = document.querySelector('#scrollHint');

const scenes = [
    introScene,
    methodScene,
    bonusesScene,
    faqScene,
    offerScene,
    footerScene
];

let currentScene = 0;
let videoUnlocked = false;
let videoStarted = false;
let changingScene = false;
let wheelAmount = 0;
let touchStartY = 0;
let videoExpanded = false;
let firstVideoCompletion = true;

progressTotal.textContent = String(scenes.length).padStart(2, '0');

/* ==========================================
   VÍDEO
========================================== */

video.src = videoUrl;
video.load();
video.muted = true;

function updateSoundButton() {
    if (video.muted) {
        soundIcon.textContent = '◖';
        soundText.textContent = 'ATIVAR SOM';
        soundButton.setAttribute('aria-label', 'Ativar som');
    } else {
        soundIcon.textContent = '◗';
        soundText.textContent = 'SOM ATIVADO';
        soundButton.setAttribute('aria-label', 'Silenciar vídeo');
    }
}

soundButton.addEventListener('click', () => {
    video.muted = !video.muted;
    updateSoundButton();
});

/* INICIAR VÍDEO */

videoPlayButton.addEventListener('click', async () => {
    try {
        video.muted = true;
        await video.play();

        videoStarted = true;
        videoPlayButton.classList.add('hidden');

        videoStatusText.textContent = 'Assista até o final para continuar';

    } catch (error) {
        console.error('Erro ao iniciar o vídeo:', error);
        videoStatusText.textContent = 'Não foi possível iniciar o vídeo. Tente novamente.';
    }
});

/* REPRODUZIR NOVAMENTE */

videoReplayButton.addEventListener('click', async () => {
    try {
        video.pause();
        video.currentTime = 0;

        videoReplayButton.classList.remove('visible');
        videoEndedMessage.classList.remove('visible');

        await video.play();

        videoStarted = true;
        videoStatusText.textContent = 'Reproduzindo apresentação novamente';

    } catch (error) {
        console.error('Erro ao reproduzir novamente:', error);
        videoStatusText.textContent = 'Não foi possível reproduzir o vídeo.';
        videoReplayButton.classList.add('visible');
    }
});

/* AMPLIAR E REDUZIR */

function toggleVideoSize() {
    if (!videoUnlocked) return;

    videoExpanded = !videoExpanded;

    videoFrame.classList.toggle('expanded', videoExpanded);
    videoBackdrop.classList.toggle('visible', videoExpanded);

    if (videoExpanded) {
        expandIcon.textContent = '×';
        videoExpandButton.setAttribute('aria-label', 'Reduzir vídeo');
        videoExpandButton.setAttribute('title', 'Reduzir vídeo');
    } else {
        expandIcon.textContent = '⛶';
        videoExpandButton.setAttribute('aria-label', 'Ampliar vídeo');
        videoExpandButton.setAttribute('title', 'Ampliar vídeo');
    }
}

videoExpandButton.addEventListener('click', toggleVideoSize);

videoBackdrop.addEventListener('click', () => {
    if (videoExpanded) {
        toggleVideoSize();
    }
});

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && videoExpanded) {
        toggleVideoSize();
    }
});

/* VÍDEO EM REPRODUÇÃO */

video.addEventListener('playing', () => {
    videoStarted = true;
    videoStatusText.textContent = 'Assista até o final para continuar';
});

/* VÍDEO FINALIZADO */

video.addEventListener('ended', () => {

    videoReplayButton.classList.add('visible');
    videoStatusText.textContent = 'Apresentação concluída';

    // O primeiro término libera a navegação.
    if (firstVideoCompletion) {

        firstVideoCompletion = false;
        videoUnlocked = true;

        videoEndedMessage.classList.add('visible');

        // Mantém o vídeo disponível nas próximas cenas.
        stage.appendChild(videoFrame);
        stage.appendChild(videoStatus);

        videoFrame.classList.add('docked');
        videoStatus.classList.add('docked-status');

        scrollHint.classList.add('visible');

        setTimeout(() => {
            videoEndedMessage.classList.remove('visible');
            showScene(1);
            scrollHint.classList.add('visible');
        }, 1300);

    } else {

        // Nas reproduções seguintes, não volta para a primeira cena.
        videoStatusText.textContent = 'Você pode continuar navegando pela apresentação.';
    }
});

/* ERRO DE CARREGAMENTO */

video.addEventListener('error', () => {
    console.error('Erro ao carregar o vídeo:', video.error);
    videoStatusText.textContent = 'Erro ao carregar o vídeo. Verifique o arquivo.';
});

updateSoundButton();


/* ==========================================
   BRILHO DO MOUSE + RASTRO DE GLITTER
========================================== */

let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;
let lastGlitterTime = 0;

function createMouseGlitter(x, y) {

    const sparkle = document.createElement('span');

    sparkle.textContent = Math.random() > 0.35 ? '✦' : '✧';

    const size = 9 + Math.random() * 12;

    sparkle.style.position = 'fixed';
    sparkle.style.left = `${x}px`;
    sparkle.style.top = `${y}px`;
    sparkle.style.fontSize = `${size}px`;
    sparkle.style.color = Math.random() > 0.4 ? '#f4dfaa' : '#d8b56c';
    sparkle.style.textShadow = '0 0 5px #f4dfaa, 0 0 12px #d8b56c';
    sparkle.style.pointerEvents = 'none';
    sparkle.style.zIndex = '99999';
    sparkle.style.transform = 'translate(-50%, -50%)';
    sparkle.style.opacity = '1';

    document.body.appendChild(sparkle);

    gsap.to(sparkle, {
        x: (Math.random() - 0.5) * 55,
        y: -15 - Math.random() * 45,
        rotation: Math.random() * 180,
        scale: 0,
        opacity: 0,
        duration: 0.65 + Math.random() * 0.45,
        ease: 'power2.out',
        onComplete: () => sparkle.remove()
    });
}

window.addEventListener('mousemove', (event) => {

    mouseX = event.clientX;
    mouseY = event.clientY;

    /* LUZ QUE ACOMPANHA O CURSOR */

    if (cursorGlow) {
        gsap.to(cursorGlow, {
            left: mouseX,
            top: mouseY,
            duration: 0.65,
            ease: 'power2.out',
            overwrite: true
        });
    }

    /* RASTRO DE PURPURINA */

    const now = Date.now();

    if (now - lastGlitterTime > 28) {

        createMouseGlitter(mouseX, mouseY);

        if (Math.random() > 0.45) {
            createMouseGlitter(
                mouseX + (Math.random() - 0.5) * 20,
                mouseY + (Math.random() - 0.5) * 20
            );
        }

        lastGlitterTime = now;
    }
});



//

/* ==========================================
   CENA 3D — CORAÇÃO EM RECONSTRUÇÃO
========================================== */

const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true
});

renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;

const scene3D = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
    40,
    window.innerWidth / window.innerHeight,
    0.1,
    100
);

camera.position.set(0, 0, 11);

/* GRUPO PRINCIPAL */

const worldGroup = new THREE.Group();
worldGroup.position.set(0, 0, -1.4);
scene3D.add(worldGroup);

/* GRUPO DO CORAÇÃO */

const structureGroup = new THREE.Group();
worldGroup.add(structureGroup);

/* PARTÍCULAS */

const particleGroup = new THREE.Group();
worldGroup.add(particleGroup);

/* LUZES */

const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
scene3D.add(ambientLight);

const goldLight = new THREE.PointLight(0xe8c77e, 42, 22);
goldLight.position.set(3, 3, 5);
scene3D.add(goldLight);

const wineLight = new THREE.PointLight(0x8d3657, 35, 22);
wineLight.position.set(-4, -3, 4);
scene3D.add(wineLight);

const centerLight = new THREE.PointLight(0xf4dfaa, 0, 12);
centerLight.position.set(0, 0, 3);
scene3D.add(centerLight);

const backLight = new THREE.DirectionalLight(0xffffff, 2);
backLight.position.set(0, 4, -4);
scene3D.add(backLight);

/* MATERIAIS */

const heartMaterials = [
    new THREE.MeshStandardMaterial({
        color: 0xd8b56c,
        metalness: 0.85,
        roughness: 0.22,
        emissive: 0x533516,
        emissiveIntensity: 0.3,
        transparent: true,
        opacity: 0.95
    }),

    new THREE.MeshStandardMaterial({
        color: 0xf4dfaa,
        metalness: 0.8,
        roughness: 0.2,
        emissive: 0x80602d,
        emissiveIntensity: 0.35,
        transparent: true,
        opacity: 0.95
    }),

    new THREE.MeshStandardMaterial({
        color: 0x713047,
        metalness: 0.7,
        roughness: 0.28,
        emissive: 0x260b18,
        emissiveIntensity: 0.25,
        transparent: true,
        opacity: 0.95
    }),

    new THREE.MeshStandardMaterial({
        color: 0x321522,
        metalness: 0.75,
        roughness: 0.25,
        emissive: 0x160710,
        emissiveIntensity: 0.3,
        transparent: true,
        opacity: 0.95
    })
];

/* ==========================================
   FORMATO DO CORAÇÃO
========================================== */

const heartPieces = [];

const heartWidth = 2.65;
const heartHeight = 2.65;

function getHeartPoint(angle, radius) {

    const x = 16 * Math.pow(Math.sin(angle), 3);

    const y =
        13 * Math.cos(angle) -
        5 * Math.cos(2 * angle) -
        2 * Math.cos(3 * angle) -
        Math.cos(4 * angle);

    return {
        x: (x / 17) * heartWidth * radius,
        y: (y / 17) * heartHeight * radius
    };
}

/* POSIÇÕES ESPALHADAS AO REDOR DA TELA */

function createScatteredPosition() {

    let x;
    let y;

    do {
        x = (Math.random() - 0.5) * 14;
        y = (Math.random() - 0.5) * 9;
    } while (
        x > -2.7 &&
        x < 2.7 &&
        y > -2.1 &&
        y < 2.1
    );

    return {
        x,
        y,
        z: (Math.random() - 0.5) * 5
    };
}

/* ==========================================
   CRIAÇÃO DOS FRAGMENTOS
========================================== */

const ringCount = 9;
const piecesPerRing = 14;

let pieceOrder = 0;

for (let ring = 0; ring < ringCount; ring++) {

    const radius = 0.22 + (ring / ringCount) * 0.78;

    for (let i = 0; i < piecesPerRing; i++) {

        const angle =
            (i / piecesPerRing) * Math.PI * 2 +
            (ring % 2) * 0.13;

        const point = getHeartPoint(angle, radius);

        const targetPosition = {
            x: point.x + (Math.random() - 0.5) * 0.09,
            y: point.y + (Math.random() - 0.5) * 0.09,
            z: (Math.random() - 0.5) * 0.55
        };

        const scatteredPosition = createScatteredPosition();

        const geometry = new THREE.TetrahedronGeometry(
            0.19 + Math.random() * 0.11,
            0
        );

        const material = heartMaterials[
            Math.floor(Math.random() * heartMaterials.length)
        ].clone();

        const mesh = new THREE.Mesh(geometry, material);

        mesh.position.set(
            scatteredPosition.x,
            scatteredPosition.y,
            scatteredPosition.z
        );

        const scatteredRotation = {
            x: Math.random() * Math.PI * 2,
            y: Math.random() * Math.PI * 2,
            z: Math.random() * Math.PI * 2
        };

        mesh.rotation.set(
            scatteredRotation.x,
            scatteredRotation.y,
            scatteredRotation.z
        );

        const finalScale = 0.9 + Math.random() * 0.45;

        mesh.scale.setScalar(finalScale);

        structureGroup.add(mesh);

        heartPieces.push({
            mesh,
            targetPosition,
            scatteredPosition,
            scatteredRotation,
            finalScale,
            order: pieceOrder++
        });
    }
}

/* ==========================================
   PARTÍCULAS DOURADAS
========================================== */

const particleCount = 260;
const particlePositions = new Float32Array(particleCount * 3);

for (let i = 0; i < particleCount; i++) {

    const i3 = i * 3;

    particlePositions[i3] = (Math.random() - 0.5) * 14;
    particlePositions[i3 + 1] = (Math.random() - 0.5) * 9;
    particlePositions[i3 + 2] = -2 + Math.random() * 4;
}

const particleGeometry = new THREE.BufferGeometry();

particleGeometry.setAttribute(
    'position',
    new THREE.BufferAttribute(particlePositions, 3)
);

const particleMaterial = new THREE.PointsMaterial({
    color: 0xe8c77e,
    size: 0.035,
    transparent: true,
    opacity: 0.55,
    sizeAttenuation: true
});

const particles = new THREE.Points(
    particleGeometry,
    particleMaterial
);

particleGroup.add(particles);

/* ==========================================
   ANIMAÇÃO DA RECONSTRUÇÃO
========================================== */

function structureSceneAnimation(index) {

    const progress = index / (scenes.length - 1);

    const totalPieces = heartPieces.length;
    const assembledCount = Math.floor(totalPieces * progress);

    heartPieces.forEach((part, i) => {

        const mesh = part.mesh;
        const assembled = i < assembledCount;

        const target = assembled
            ? part.targetPosition
            : part.scatteredPosition;

        const targetRotation = assembled
            ? { x: 0, y: 0, z: 0 }
            : part.scatteredRotation;

        const delay = assembled
            ? (i % 14) * 0.035
            : (i % 14) * 0.018;

        gsap.to(mesh.position, {
            x: target.x,
            y: target.y,
            z: target.z,
            duration: assembled ? 1.5 : 0.9,
            delay,
            ease: assembled ? 'power3.inOut' : 'power2.inOut',
            overwrite: true
        });

        gsap.to(mesh.rotation, {
            x: targetRotation.x,
            y: targetRotation.y,
            z: targetRotation.z,
            duration: assembled ? 1.4 : 0.9,
            delay,
            ease: 'power3.out',
            overwrite: true
        });

        gsap.to(mesh.scale, {
            x: assembled ? part.finalScale : part.finalScale * 0.9,
            y: assembled ? part.finalScale : part.finalScale * 0.9,
            z: assembled ? part.finalScale : part.finalScale * 0.9,
            duration: 1.1,
            delay,
            ease: 'back.out(1.5)',
            overwrite: true
        });

        gsap.to(mesh.material, {
            opacity: assembled ? 1 : 0.82,
            duration: 0.8,
            delay,
            overwrite: true
        });
    });

    /* LUZ CENTRAL AUMENTA CON A MONTAGEM */

    gsap.to(centerLight, {
        intensity: progress * 30,
        duration: 1.5,
        ease: 'power2.out'
    });

    /* ILUMINAÇÃO DOURADA */

    gsap.to(goldLight, {
        intensity: 35 + progress * 25,
        duration: 1.5,
        ease: 'power2.out'
    });

    /* BRILHO DO CORAÇÃO COMPLETO */

    gsap.to(heartMaterials[1], {
        emissiveIntensity: 0.35 + progress * 0.45,
        duration: 1.5
    });

    gsap.to(particleMaterial, {
        opacity: 0.45 + progress * 0.35,
        duration: 1.5
    });
}

/* COMEÇA COM OS FRAGMENTOS ESPALHADOS */

structureSceneAnimation(0);

/* ==========================================
   ANIMAÇÃO CONTÍNUA
========================================== */

let animationTime = 0;

function animate() {

    requestAnimationFrame(animate);

    animationTime += 0.005;

    /* MOVIMENTO SUAVE DO CORAÇÃO */


/* MOVIMENTO CONTÍNUO DO CORAÇÃO */

/* MOVIMENTO CONTÍNUO DO CORAÇÃO */

structureGroup.position.y =
    Math.sin(animationTime * 1.8) * 0.09;

structureGroup.position.x =
    Math.sin(animationTime * 1.5) * 0.25;

structureGroup.rotation.y =
    Math.sin(animationTime * 1.6) * 0.16;

structureGroup.rotation.z =
    Math.sin(animationTime * 1.2) * 0.045;
    /* PARTÍCULAS */

    particles.rotation.z = Math.sin(animationTime * 0.25) * 0.035;

    /* LUZ ACOMPANHA O MOUSE */

    const normalizedX = (mouseX / window.innerWidth - 0.5) * 2;
    const normalizedY = (mouseY / window.innerHeight - 0.5) * 2;

    goldLight.position.x = THREE.MathUtils.lerp(
        goldLight.position.x,
        normalizedX * 4 + 2,
        0.025
    );

    goldLight.position.y = THREE.MathUtils.lerp(
        goldLight.position.y,
        -normalizedY * 3 + 2,
        0.025
    );

    /* MOVIMENTO SUTIL DA CÂMERA */

    camera.position.x = THREE.MathUtils.lerp(
        camera.position.x,
        normalizedX * 0.12,
        0.025
    );

    camera.position.y = THREE.MathUtils.lerp(
        camera.position.y,
        -normalizedY * 0.1,
        0.025
    );

    camera.lookAt(0, 0, 0);

    renderer.render(scene3D, camera);
}

animate();

/* ==========================================
   RESPONSIVIDADE 3D
========================================== */

function resizeScene() {

    const width = window.innerWidth;
    const height = window.innerHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    if (width <= 650) {

        worldGroup.scale.setScalar(0.72);
        worldGroup.position.set(0, 0, -1.5);

    } else if (width <= 900) {

        worldGroup.scale.setScalar(0.86);
        worldGroup.position.set(0, 0, -1.5);

    } else {

        worldGroup.scale.setScalar(1);
        worldGroup.position.set(0, 0, -1.4);

    }
}

window.addEventListener('resize', resizeScene);
resizeScene();




/* ==========================================
   TROCA DE CENAS
========================================== */

function updateProgress() {

    progressNumber.textContent = String(currentScene + 1).padStart(2, '0');

    const percentage = ((currentScene + 1) / scenes.length) * 100;

    progressBar.style.width = `${percentage}%`;
}

function showScene(index) {

    if (index < 0 || index >= scenes.length || changingScene) {
        return;
    }

    changingScene = true;

    const previousScene = scenes[currentScene];
    const nextScene = scenes[index];

    if (previousScene === nextScene) {
        changingScene = false;
        return;
    }

    gsap.to(previousScene, {
        opacity: 0,
        y: -15,
        duration: 0.4,
        ease: 'power2.inOut',

        onComplete: () => {

            previousScene.classList.remove('active');
            previousScene.style.visibility = 'hidden';
            previousScene.style.transform = '';

            nextScene.classList.add('active');
            nextScene.style.visibility = 'visible';

            currentScene = index;

            updateProgress();
            structureSceneAnimation(index);

            gsap.fromTo(
                nextScene,
                {
                    opacity: 0,
                    y: 25
                },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.7,
                    ease: 'power3.out',

                    onComplete: () => {
                        changingScene = false;
                    }
                }
            );

        }
    });
}

/* ==========================================
   CONTROLE PELO MOUSE
========================================== */

function moveForward() {

    if (!videoUnlocked || changingScene) return;

    if (currentScene < scenes.length - 1) {
        showScene(currentScene + 1);
    }
}

function moveBackward() {

    if (!videoUnlocked || changingScene) return;

    if (currentScene > 1) {
        showScene(currentScene - 1);
    }
}

window.addEventListener('wheel', (event) => {

    event.preventDefault();

    if (!videoUnlocked || changingScene || videoExpanded) return;

    wheelAmount += event.deltaY;

    if (Math.abs(wheelAmount) < 45) return;

    if (wheelAmount > 0) {
        moveForward();
    } else {
        moveBackward();
    }

    wheelAmount = 0;

}, { passive: false });

/* ==========================================
   CONTROLE POR TOQUE
========================================== */

window.addEventListener('touchstart', (event) => {

    touchStartY = event.touches[0].clientY;

}, { passive: true });

window.addEventListener('touchend', (event) => {

    if (!videoUnlocked || changingScene || videoExpanded) return;

    const touchEndY = event.changedTouches[0].clientY;
    const difference = touchStartY - touchEndY;

    if (Math.abs(difference) < 40) return;

    if (difference > 0) {
        moveForward();
    } else {
        moveBackward();
    }

}, { passive: true });

/* ==========================================
   INICIALIZAÇÃO
========================================== */

scenes.forEach((item, index) => {

    if (index === 0) {

        item.classList.add('active');
        item.style.opacity = '1';
        item.style.visibility = 'visible';

    } else {

        item.classList.remove('active');
        item.style.opacity = '0';
        item.style.visibility = 'hidden';

    }

});

currentScene = 0;

updateProgress();

scrollHint.classList.remove('visible');