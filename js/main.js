import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { add } from 'three/examples/jsm/nodes/Nodes.js';




// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('threedee');
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: false });
    container.appendChild(renderer.domElement);

    let widthnum = container.clientWidth;
    let heightnum = container.clientHeight;


    // Set the initial size of the renderer
    const setSize = () => {
        renderer.setSize(widthnum, heightnum);
        camera.aspect = widthnum / heightnum;
        camera.updateProjectionMatrix();
    };

    // Set size initially and on resize
    setSize();
    window.addEventListener('resize', setSize);

    // Add lights
    const MainLighty = new THREE.DirectionalLight(0xffffff, 1);
    const BackLighty = new THREE.DirectionalLight(0x114488, 1);
    MainLighty.position.set(5, 5, 5);
    BackLighty.position.set(-5, 5, 0);
    scene.add(MainLighty);
    scene.add(BackLighty);

    camera.position.z = 4;
    camera.position.x = 0;
    camera.position.y = 2;

    // Variables to store mouse position
   let mouse = new THREE.Vector2();
   let targetObject;
   let mycube;
   let hourhand;
   let minutehand;

    // Load the GLTF model
    const loader = new GLTFLoader();
    loader.load('box.gltf', (gltf) => {
        scene.add(gltf.scene);
        targetObject = gltf.scene.getObjectByName('switch');
        mycube = gltf.scene.getObjectByName('mycube');
        hourhand = gltf.scene.getObjectByName('hourhand');
        minutehand = gltf.scene.getObjectByName('minutehand');

        if (!targetObject) console.error('Object not found: switch');
        if (!mycube) console.error('Object not found: mycube');
        if (!hourhand) console.error('Object not found: hourhand');
        if (!minutehand) console.error('Object not found: minutehand');
        else updateClockHands();
    }, undefined, (error) => {
        console.error(error);
    });

    // Add raycaster for hover and click detection
    const raycaster = new THREE.Raycaster();
    const onMouseMove = (event) => {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };
    document.addEventListener('mousemove', onMouseMove, false);
    window.addEventListener('click', onMouseClick, false);

    let light_is_on = true;
    function switchyOff(object) {
        const duration = 100;
        const startTime = performance.now();
        let targetRotation;

        if (light_is_on) {
            targetRotation = THREE.MathUtils.degToRad(9);
            MainLighty.intensity = 0.1;
            light_is_on = false;
        } else {
            targetRotation = THREE.MathUtils.degToRad(0);
            MainLighty.intensity = 1.0;
            light_is_on = true;
        }

        const animateRotation = () => {
            const currentTime = performance.now();
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            object.rotation.z = THREE.MathUtils.lerp(object.rotation.z, targetRotation, progress);
            if (progress < 1) requestAnimationFrame(animateRotation);
        };

        animateRotation();
    }

    function updateClockHands() {
        const now = new Date().toLocaleString("en-US", { timeZone: "Europe/Dublin" });
        const currentTime = new Date(now);
        const hours = currentTime.getHours() % 12;
        const minutes = currentTime.getMinutes();
        const minuteRotation = (minutes / 60) * 360;
        const hourRotation = (hours / 12) * 360 + (minutes / 60) * 30;

        if (minutehand) minutehand.rotation.z = THREE.MathUtils.degToRad(-minuteRotation);
        if (hourhand) hourhand.rotation.z = THREE.MathUtils.degToRad(-hourRotation);
    }

    function animate() {
        requestAnimationFrame(animate);
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(scene.children, true);
        const isIntersected = intersects.length > 0 && intersects[0].object && (intersects[0].object === targetObject || (intersects[0].object.parent && targetObject.parent === intersects[0].object.parent));
        document.body.style.cursor = isIntersected ? 'pointer' : 'default';
        renderer.render(scene, camera);
    }

    function onMouseClick(event) {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(scene.children, true);
        if (intersects.length > 0) {
            for (let i = 0; i < intersects.length; i++) {
                if (intersects[i].object === targetObject || (intersects[i].object.parent && targetObject.parent === intersects[i].object.parent)) {
                    switchyOff(targetObject);
                    break;
                }
            }
        }
    }

    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    document.addEventListener('mousedown', (event) => {
        if (event.button === 1) {
            isDragging = true;
            previousMousePosition = { x: event.clientX, y: event.clientY };
        }
    });

    document.addEventListener('mousemove', (event) => {
        if (isDragging && mycube) {
            const deltaMove = { x: event.clientX - previousMousePosition.x, y: event.clientY - previousMousePosition.y };
            mycube.rotation.y += deltaMove.x * 0.005;
            mycube.rotation.x += deltaMove.y * 0.005;
            previousMousePosition = { x: event.clientX, y: event.clientY };
        }
    });

    document.addEventListener('mouseup', (event) => {
        if (event.button === 1) {
            isDragging = false;
        }
    });

    animate();

    // Manually trigger resize event to ensure initial setup
    window.dispatchEvent(new Event('resize'));
});
