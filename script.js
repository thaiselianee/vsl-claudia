
import * as THREE from "three";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);


/* ==========================================
   CONFIGURAÇÃO DA CENA 3D
========================================== */

const canvas = document.querySelector("#threeCanvas");

const scene = new THREE.Scene();

scene.background = new THREE.Color("#19090e");

const camera = new THREE.PerspectiveCamera(
    38,
    window.innerWidth / window.innerHeight,
    0.1,
    100
);

camera.position.set(0, 0, 12);

const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.35;


/* ==========================================
   ILUMINAÇÃO
========================================== */

const ambientLight = new THREE.AmbientLight("#f5d7b2", 1.5);
scene.add(ambientLight);

const goldLight = new THREE.PointLight("#e9b66f", 160, 30);
goldLight.position.set(3, 4, 5);
scene.add(goldLight);

const wineLight = new THREE.PointLight("#8c2948", 100, 25);
wineLight.position.set(-4, -2, 3);
scene.add(wineLight);

const backLight = new THREE.PointLight("#f8d9a9", 120, 30);
backLight.position.set(0, 2, -5);
scene.add(backLight);


/* ==========================================
   GRUPO PRINCIPAL
========================================== */

const construction = new THREE.Group();
scene.add(construction);

const pieces = [];


/* MATERIAIS */

const goldMaterial = new THREE.MeshPhysicalMaterial({
    color: "#d5a66b",
    metalness: 0.78,
    roughness: 0.24,
    clearcoat: 1,
    clearcoatRoughness: 0.15
});

const glassMaterial = new THREE.MeshPhysicalMaterial({
    color: "#72253b",
    metalness: 0.35,
    roughness: 0.12,
    transmission: 0.18,
    thickness: 0.8,
    transparent: true,
    opacity: 0.94,
    clearcoat: 1
});

const darkMaterial = new THREE.MeshStandardMaterial({
    color: "#35101c",
    metalness: 0.7,
    roughness: 0.3
});


/* ==========================================
   BASE 3D
========================================== */

const baseGeometry = new THREE.CylinderGeometry(
    1.9,
    2.15,
    0.12,
    96
);

const base = new THREE.Mesh(baseGeometry, darkMaterial);
base.position.y = -1.65;
base.scale.set(1, 1, 0.65);
construction.add(base);

const baseRing = new THREE.Mesh(
    new THREE.TorusGeometry(2, 0.025, 12, 100),
    goldMaterial
);

baseRing.rotation.x = Math.PI / 2;
baseRing.position.y = -1.56;
baseRing.scale.set(1, 0.65, 1);
construction.add(baseRing);


/* ==========================================
   CRIAÇÃO DAS PEÇAS DA ESTRUTURA
========================================== */

function createShard(width, height, material) {

    const shape = new THREE.Shape();

    shape.moveTo(-width / 2, -height / 2);
    shape.lineTo(width / 2, -height / 2);
    shape.lineTo(width * 0.35, height / 2);
    shape.lineTo(-width * 0.35, height / 2);
    shape.closePath();

    const geometry = new THREE.ExtrudeGeometry(shape, {
        depth: 0.12,
        bevelEnabled: true,
        bevelSegments: 3,
        steps: 1,
        bevelSize: 0.035,
        bevelThickness: 0.035
    });

    geometry.center();

    const mesh = new THREE.Mesh(geometry, material);

    construction.add(mesh);

    return mesh;
}


/* POSIÇÕES FINAIS DA FORMA */

const finalPositions = [
    [-0.85, 0.95, 0.2],
    [0, 1.35, 0.35],
    [0.85, 0.95, 0.2],
    [-1.05, 0.05, 0.35],
    [0, 0.25, 0.75],
    [1.05, 0.05, 0.35],
    [-0.55, -0.9, 0.45],
    [0.55, -0.9, 0.45],
    [0, -1.35, 0.65]
];

finalPositions.forEach((position, index) => {

    const material = index % 2 === 0
        ? goldMaterial
        : glassMaterial;

    const piece = createShard(
        index === 4 ? 1.1 : 0.9,
        index === 4 ? 0.85 : 0.95,
        material
    );

    const finalPosition = new THREE.Vector3(
        position[0],
        position[1],
        position[2]
    );

    const initialPosition = new THREE.Vector3(
        position[0] * 2.7 + (Math.random() - 0.5) * 3,
        position[1] * 2.4 + (Math.random() - 0.5) * 3,
        position[2] - 4 - Math.random() * 3
    );

    piece.position.copy(initialPosition);

    piece.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
    );

    pieces.push({
        mesh: piece,
        initialPosition,
        finalPosition,
        initialRotation: piece.rotation.clone()
    });

});


/* ==========================================
   ANÉIS E DETALHES
========================================== */

const rings = [];

for (let i = 0; i < 3; i++) {

    const ring = new THREE.Mesh(
        new THREE.TorusGeometry(1.8 + i * 0.35, 0.012, 10, 120),
        goldMaterial
    );

    ring.position.z = -0.8 - i * 0.2;
    ring.rotation.x = Math.PI / 2.8;
    ring.scale.set(1, 0.7, 1);

    construction.add(ring);
    rings.push(ring);

}


/* ==========================================
   PARTÍCULAS
========================================== */

const particleGeometry = new THREE.BufferGeometry();

const particlePositions = [];

for (let i = 0; i < 450; i++) {

    particlePositions.push(
        (Math.random() - 0.5) * 13,
        (Math.random() - 0.5) * 9,
        (Math.random() - 0.5) * 7
    );

}

particleGeometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(particlePositions, 3)
);

const particleMaterial = new THREE.PointsMaterial({
    color: "#e7bb82",
    size: 0.025,
    transparent: true,
    opacity: 0.65
});

const particles = new THREE.Points(
    particleGeometry,
    particleMaterial
);

scene.add(particles);


/* ==========================================
   ANIMAÇÃO CONTROLADA PELO SCROLL
========================================== */

const timeline = gsap.timeline({
    scrollTrigger: {
        trigger: ".experience",
        start: "top top",
        end: "bottom bottom",
        scrub: 1.3
    }
});


/* AS PEÇAS SE APROXIMAM */

pieces.forEach((piece, index) => {

    timeline.to(
        piece.mesh.position,
        {
            x: piece.finalPosition.x,
            y: piece.finalPosition.y,
            z: piece.finalPosition.z,
            duration: 1,
            ease: "power2.inOut"
        },
        0.3 + index * 0.055
    );

    timeline.to(
        piece.mesh.rotation,
        {
            x: 0,
            y: 0,
            z: 0,
            duration: 1,
            ease: "power2.inOut"
        },
        0.3 + index * 0.055
    );

});


/* ESTRUTURA SE APROXIMA DA CÂMERA */

timeline.to(
    construction.scale,
    {
        x: 1.12,
        y: 1.12,
        z: 1.12,
        duration: 1.2
    },
    1.5
);

timeline.to(
    construction.rotation,
    {
        y: Math.PI * 0.18,
        duration: 1.5
    },
    1.3
);

timeline.to(
    camera.position,
    {
        z: 9.5,
        duration: 1.5
    },
    1.5
);


/* BRILHO FINAL */

timeline.to(
    goldLight,
    {
        intensity: 240,
        duration: 1
    },
    2.3
);

timeline.to(
    rings[0].rotation,
    {
        z: Math.PI * 1.5,
        duration: 1.5
    },
    2
);

timeline.to(
    rings[1].rotation,
    {
        z: -Math.PI * 1.2,
        duration: 1.5
    },
    2
);

timeline.to(
    construction.scale,
    {
        x: 1.3,
        y: 1.3,
        z: 1.3,
        duration: 1
    },
    2.5
);


/* ==========================================
   TEXTOS E ETAPAS
========================================== */

const steps = gsap.utils.toArray(".step-content");

steps.forEach((step, index) => {

    if (index === 0) return;

    gsap.fromTo(
        step,
        {
            opacity: 0,
            y: 55
        },
        {
            opacity: 1,
            y: 0,
            duration: 0.7,
            scrollTrigger: {
                trigger: step.closest(".step"),
                start: "top 65%",
                end: "top 20%",
                scrub: true
            }
        }
    );

});


/* NÚMERO DA ETAPA */

const sceneNumber = document.querySelector("#sceneNumber");

steps.forEach((step, index) => {

    ScrollTrigger.create({
        trigger: step.closest(".step"),
        start: "top center",
        end: "bottom center",

        onEnter: () => {
            sceneNumber.textContent = `0${index + 1} / 04`;
        },

        onEnterBack: () => {
            sceneNumber.textContent = `0${index + 1} / 04`;
        }
    });

});


/* ==========================================
   ANIMAÇÃO CONTÍNUA
========================================== */

function animate() {

    requestAnimationFrame(animate);

    particles.rotation.y += 0.00035;

    rings.forEach((ring, index) => {
        ring.rotation.z += 0.0005 * (index + 1);
    });

    renderer.render(scene, camera);

}

animate();


/* ==========================================
   RESPONSIVIDADE DA CENA
========================================== */

window.addEventListener("resize", () => {

    camera.aspect = window.innerWidth / window.innerHeight;

    camera.position.z = window.innerWidth < 700 ? 13 : 12;

    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    ScrollTrigger.refresh();

});


/* ==========================================
   VÍDEO DA CLAUDIA
========================================== */

const video = document.querySelector("#mainVideo");

const videoStart = document.querySelector("#videoStart");

const muteButton = document.querySelector("#muteButton");

const muteIcon = document.querySelector("#muteIcon");

const progressFill = document.querySelector("#progressFill");

const videoTime = document.querySelector("#videoTime");

const videoFrame = document.querySelector(".video-frame");

const videoControls = document.querySelector("#videoControls");

const offerSection = document.querySelector("#offerSection");


/* INICIAR VÍDEO */

videoStart.addEventListener("click", () => {

    video.muted = false;

    video.play();

    videoStart.style.display = "none";

    videoFrame.classList.add("playing");

    updateMuteIcon();

});


/* MUDO E SOM */

function updateMuteIcon() {

    muteIcon.textContent = video.muted ? "◖×" : "◖";

}

muteButton.addEventListener("click", () => {

    video.muted = !video.muted;

    updateMuteIcon();

});


/* TEMPO E PROGRESSO */

function formatTime(seconds) {

    if (!Number.isFinite(seconds)) return "00:00";

    const minutes = Math.floor(seconds / 60);

    const remainingSeconds = Math.floor(seconds % 60);

    return (
        String(minutes).padStart(2, "0") +
        ":" +
        String(remainingSeconds).padStart(2, "0")
    );

}

video.addEventListener("timeupdate", () => {

    const progress = video.duration
        ? (video.currentTime / video.duration) * 100
        : 0;

    progressFill.style.width = `${progress}%`;

    videoTime.textContent = formatTime(video.currentTime);

});


/* NÃO PERMITIR AVANÇO PELA BARRA */

videoControls.addEventListener("click", (event) => {

    if (event.target.closest("button")) return;

    event.stopPropagation();

});

video.addEventListener("contextmenu", (event) => {
    event.preventDefault();
});


/* FINALIZAÇÃO */

video.addEventListener("ended", () => {

    videoFrame.classList.remove("playing");

    offerSection.classList.add("unlocked");

    setTimeout(() => {

        offerSection.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    }, 700);

});


/* NÃO MOSTRAR A OFERTA ANTES DO VÍDEO */

offerSection.classList.remove("unlocked");
