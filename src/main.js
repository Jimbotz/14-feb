import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

// 1. VARIABLES GLOBALES Y RELOJ
const clock = new THREE.Clock();
let mixer1, mixer2;
let action1, action2;
let modelo, robotsito, robotsita;
let comenzoCaminata = false;

// NUEVA VARIABLE: Para controlar cuándo empieza la secuencia
let tiempoInicioSecuencia = 0; 

// 2. TEXTURA GRADIENTE (TOON)
function crearTexturaGradiente() {
  const canvas = document.createElement("canvas");
  canvas.width = 3;
  canvas.height = 1;
  const context = canvas.getContext("2d");
  context.fillStyle = "#000000";
  context.fillRect(0, 0, 1, 1);
  context.fillStyle = "#780300";
  context.fillRect(1, 0, 1, 1);
  context.fillStyle = "#D30B00";
  context.fillRect(2, 0, 1, 1);
  const texture = new THREE.CanvasTexture(canvas);
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  return texture;
}
const miGradiente = crearTexturaGradiente();

// 3. ESCENA
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x050505);

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000,
);
camera.position.set(0, 5, 12); // Un poco más lejos

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

// 4. LUCES
scene.add(new THREE.AmbientLight(0xffffff, 0.6));
const dirLight = new THREE.DirectionalLight(0xffffff, 2.5);
dirLight.position.set(5, 10, 5);
scene.add(dirLight);

// 5. SUELO
const plane = new THREE.Mesh(
  new THREE.PlaneGeometry(50, 50),
  new THREE.MeshStandardMaterial({ color: 0x2d5a27 }),
);
plane.rotation.x = -Math.PI / 2;
plane.position.y = -0.5;
scene.add(plane);

const loader = new GLTFLoader();

// --- FUNCIONES DE CARGA (Arboles, Teddy, etc.) ---
function cargarObjetoAmbiente(ruta, escala, posX, posZ, rotY = 0) {
  loader.load(ruta, (gltf) => {
    const obj = gltf.scene;
    obj.traverse((child) => {
      if (child.isMesh) {
        child.material = new THREE.MeshToonMaterial({
          color: child.material.color,
          gradientMap: miGradiente,
        });
      }
    });
    obj.scale.set(escala, escala, escala);
    obj.position.set(posX, -0.5, posZ);
    obj.rotation.y = rotY;
    scene.add(obj);
  });
}

function cargarArbolPersonalizado(ruta, escala, posX, posZ) {
  loader.load(ruta, (gltf) => {
    const arbol = gltf.scene;
    arbol.traverse((child) => {
      if (child.isMesh) {
        const materialToon = new THREE.MeshToonMaterial({
          gradientMap: miGradiente,
        });
        const nombre = child.name.toLowerCase();
        const nombreMat = child.material.name.toLowerCase();

        if (nombre.includes("leaves") || nombre.includes("hoja")) {
          materialToon.color.setHex(0x2d5a27);
        } else if (
          nombre.includes("trunk") ||
          nombre.includes("tronco") ||
          nombreMat.includes("material_0")
        ) {
          materialToon.color.setHex(0x5d4037);
        } else if (nombre.includes("base")) {
          materialToon.color.setHex(0x33691e);
        }
        child.material = materialToon;
      }
    });
    arbol.scale.set(escala, escala, escala);
    // Árboles hundidos en Y=-2.5
    arbol.position.set(posX, -0.7, posZ); 
    scene.add(arbol);
  });
}

function cargarTeddyPersonalizado(ruta, escala, posX, posZ, rotY = 0) {
  loader.load(ruta, (gltf) => {
    const teddy = gltf.scene;
    teddy.traverse((child) => {
      if (child.isMesh) {
        const materialToon = new THREE.MeshToonMaterial({
          gradientMap: miGradiente,
        });
        const nombreMalla = child.name.toLowerCase();

        if (nombreMalla.includes("eye")) {
          materialToon.color.setHex(0x222222); 
        } else if (nombreMalla.includes("nose")) {
          materialToon.color.setHex(0xe5c298); 
        } else if (nombreMalla.includes("bear")) {
          materialToon.color.setHex(0x91613d); 
        } else if (
          nombreMalla.includes("plane") ||
          nombreMalla.includes("ribbon") ||
          nombreMalla.includes("bow")
        ) {
          materialToon.color.setHex(0xd30b00); 
        } else {
          materialToon.color.setHex(0x91613d); 
        }
        child.material = materialToon;
      }
    });
    teddy.scale.set(escala, escala, escala);
    teddy.position.set(posX, -0.5, posZ);
    teddy.rotation.y = rotY;
    scene.add(teddy);
  });
}

// 6. CARGA DE OBJETOS SECUNDARIOS
cargarArbolPersonalizado("/low_poly_tree_3d_model_with_grass.glb", 0.03, 7, -7);
cargarArbolPersonalizado("/low_poly_tree_3d_model_with_grass.glb", 0.03, -7, -7);
cargarArbolPersonalizado("/low_poly_tree_3d_model_with_grass.glb", 0.03, -7, 7);
cargarArbolPersonalizado("/low_poly_tree_3d_model_with_grass.glb", 0.03, 7, 7);

cargarTeddyPersonalizado("/low_poly_asset_teddy_bear.glb", 5, 5, -6.5);
cargarObjetoAmbiente("/sanrio_tuxedo_sam_3d_model.glb", 1, -5.5, -6.5);

loader.load("/blue_cloud_icon.glb", (gltf) => {
  const nube1 = gltf.scene;
  nube1.scale.set(10, 10, 10);
  nube1.position.set(-12, 15, -3);
  scene.add(nube1);
  const nube2 = nube1.clone(); nube2.position.set(12, 15, -8); scene.add(nube2);
  const nube3 = nube1.clone(); nube3.position.set(-12, 15, 8); scene.add(nube3);
  const nube4 = nube1.clone(); nube4.position.set(12, 15, 3); scene.add(nube4);
});

// 7. CARGA DEL CORAZÓN
loader.load("/heart.glb", (gltf) => {
  modelo = gltf.scene;
  modelo.traverse((child) => {
    if (child.isMesh) {
      child.material = new THREE.MeshToonMaterial({
        color: 0xd30b00,
        gradientMap: miGradiente,
      });
    }
  });
  modelo.position.set(0, 1.5, -4);
  modelo.scale.set(0.06, 0.06, 0.06);
  scene.add(modelo);
});

// 8. ROBOTSITO (DERECHA)
loader.load("/robotsito.glb", (gltf) => {
  robotsito = gltf.scene;
  if (gltf.animations.length > 0) {
    mixer1 = new THREE.AnimationMixer(robotsito);
    action1 = mixer1.clipAction(gltf.animations[0]);
    action1.play();
    action1.paused = true;
  }
  robotsito.traverse((child) => {
    if (child.isMesh) {
      const c = child.material.color.clone();
      const n = child.material.name;
      child.material = new THREE.MeshToonMaterial({ color: c, gradientMap: miGradiente });
      if (n === "Mat_piernas_luces" || n === "Mat_ojos") {
        child.material.emissive.setHex(0x00ffff);
        child.material.emissiveIntensity = 2.0;
      }
    }
  });
  // Posición inicial LEJOS (6)
  robotsito.position.set(6, -0.5, 0);
  robotsito.rotation.y = -Math.PI / 2;
  scene.add(robotsito);
});

// 9. ROBOTSITA (IZQUIERDA)
loader.load("/robotsita.glb", (gltf) => {
  robotsita = gltf.scene;
  if (gltf.animations.length > 0) {
    mixer2 = new THREE.AnimationMixer(robotsita);
    action2 = mixer2.clipAction(gltf.animations[0]);
    action2.play();
    action2.paused = true;
  }
  robotsita.traverse((child) => {
    if (child.isMesh) {
      const c = child.material.color.clone();
      const n = child.material.name;
      child.material = new THREE.MeshToonMaterial({ color: c, gradientMap: miGradiente });
      if (n === "Mat_ojosRosas" || n === "Mat_piesRosas") {
        child.material.emissive.setHex(0xff00ff);
        child.material.emissiveIntensity = 2.0;
      }
    }
  });
  // Posición inicial LEJOS (-6)
  robotsita.position.set(-6, -0.5, 0);
  robotsita.rotation.y = Math.PI / 2;
  scene.add(robotsita);
});

// ----------------------------------------------------
// --- NUEVO: CREACIÓN DEL BOTÓN DE RECARGA ---
// ----------------------------------------------------
const botonRecarga = document.createElement('button');
botonRecarga.innerText = "Reiniciar Animación";
botonRecarga.style.position = 'absolute';
botonRecarga.style.top = '20px';
botonRecarga.style.left = '50%';
botonRecarga.style.transform = 'translateX(-50%)';
botonRecarga.style.padding = '10px 20px';
botonRecarga.style.fontSize = '16px';
botonRecarga.style.backgroundColor = '#d30b00'; // Rojo a juego
botonRecarga.style.color = 'white';
botonRecarga.style.border = 'none';
botonRecarga.style.borderRadius = '5px';
botonRecarga.style.cursor = 'pointer';
botonRecarga.style.fontFamily = 'Arial, sans-serif';
botonRecarga.style.zIndex = '1000'; // Asegurar que esté encima del canvas

document.body.appendChild(botonRecarga);

// --- LÓGICA DEL BOTÓN ---
botonRecarga.addEventListener('click', () => {
    // 1. Resetear bandera y tiempo de referencia
    comenzoCaminata = false;
    tiempoInicioSecuencia = clock.getElapsedTime(); // El "0" ahora es el momento actual

    // 2. Resetear Robotsito
    if (robotsito && action1) {
        robotsito.position.x = 6; // Volver al inicio
        action1.reset(); // Reiniciar el clip de animación
        action1.play();
        action1.paused = true; // Pausar esperando el segundo
    }

    // 3. Resetear Robotsita
    if (robotsita && action2) {
        robotsita.position.x = -6; // Volver al inicio
        action2.reset();
        action2.play();
        action2.paused = true;
    }
});

// ----------------------------------------------------

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// 10. ANIMACIÓN
function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();
  const tiempoTotal = clock.getElapsedTime(); // Tiempo absoluto

  // Calculamos el tiempo transcurrido DESDE la última vez que iniciamos (o reiniciamos)
  const tiempoRelativo = tiempoTotal - tiempoInicioSecuencia;

  // Lógica de inicio: esperar 1 segundo relativo
  if (!comenzoCaminata && tiempoRelativo > 1.0) {
    if (action1 && action2) {
      action1.paused = false;
      action2.paused = false;
      comenzoCaminata = true;
    }
  }

  // Lógica de movimiento
  if (comenzoCaminata) {
    const velocidad = 2.5 * delta;
    const stopDist = 1.2;

    if (robotsito && robotsito.position.x > stopDist) {
      robotsito.position.x -= velocidad;
    } else if (action1) {
      action1.paused = true;
    }

    if (robotsita && robotsita.position.x < -stopDist) {
      robotsita.position.x += velocidad;
    } else if (action2) {
      action2.paused = true;
    }
  }

  if (mixer1) mixer1.update(delta);
  if (mixer2) mixer2.update(delta);
  
  if (modelo) {
    modelo.rotation.y += 0.005;
    modelo.position.y = 1.5 + Math.sin(tiempoTotal * 2) * 0.2;
  }

  controls.update();
  renderer.render(scene, camera);
}

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();