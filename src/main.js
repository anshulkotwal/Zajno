
import * as THREE from 'three';
import LocomotiveScroll from 'locomotive-scroll';
import vertexShader from './shaders/vertexShader.glsl';
import gsap from 'gsap';
import fragmentShader from './shaders/fragmentShader.glsl';

const locomotiveScroll = new LocomotiveScroll();

// Check if device is mobile or window width is less than desktop
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
const isDesktop = window.innerWidth >= 1024;

if (!isMobile && isDesktop) {
    const scene = new THREE.Scene();
    const distance = 20;
    const fov = 2 * Math.atan((window.innerHeight/2) / distance) * (180/Math.PI);
    const camera = new THREE.PerspectiveCamera(fov, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = distance;
    const renderer = new THREE.WebGLRenderer({
        canvas: document.getElementById('canvas'),
        alpha: true,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const images=document.querySelectorAll('img');
    const planes=[];
    images.forEach(image=>{
        const imgbounds=image.getBoundingClientRect();
        const texture=new THREE.TextureLoader().load(image.src);
        const material=new THREE.ShaderMaterial({
            uniforms:{
                uTexture:{
                    value:texture
                },
                uMouse:{
                    value:new THREE.Vector2(0.5,0.5)
                },
                uHover:{
                    value:0
                }
            },
            vertexShader,
            fragmentShader
        });
        const geometry=new THREE.PlaneGeometry(imgbounds.width,imgbounds.height);
        const plane=new THREE.Mesh(geometry,material);
        plane.position.set(imgbounds.left - window.innerWidth/2 + imgbounds.width/2, -imgbounds.top + window.innerHeight/2 - imgbounds.height/2, 0);
        planes.push(plane);
        scene.add(plane);
    });

    function updatePlanesPosition(){
        planes.forEach((plane,index)=>{
            const image=images[index];
            const imgbounds=image.getBoundingClientRect();
            plane.geometry.dispose();
            plane.geometry = new THREE.PlaneGeometry(imgbounds.width, imgbounds.height);
            plane.position.set(imgbounds.left - window.innerWidth/2 + imgbounds.width/2, -imgbounds.top + window.innerHeight/2 - imgbounds.height/2, 0);
        })
    }

    function animate() {
        requestAnimationFrame(animate);
        updatePlanesPosition();
        renderer.render(scene, camera);
    }
    animate();

    window.addEventListener('resize', () => {
        if (window.innerWidth < 1024) {
            scene.clear();
            renderer.dispose();
            const images = document.querySelectorAll('img');
            images.forEach(image => {
                image.style.opacity = '1';
            });
            return;
        }

        camera.aspect = window.innerWidth / window.innerHeight;
        camera.fov = 2 * Math.atan((window.innerHeight/2) / distance) * (180/Math.PI);
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        updatePlanesPosition();
    });

    window.addEventListener('mousemove',(e)=>{
        mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
        
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(planes);
        
        planes.forEach(plane => {
            gsap.to(plane.material.uniforms.uHover, {
                value: 0,
                duration: 0.3,
                ease: "power2.out"
            });
        });
        
        if(intersects.length > 0) {
            const intersectedPlane = intersects[0];
            const uv = intersectedPlane.uv;
            gsap.to(intersectedPlane.object.material.uniforms.uMouse.value, {
                x: uv.x,
                y: uv.y,
                duration: 0.2,
                ease: "power2.out"
            });
            gsap.to(intersectedPlane.object.material.uniforms.uHover, {
                value: 1,
                duration: 0.2,
                ease: "power2.out"
            });
        }
    });
} 
else {
    const images = document.querySelectorAll('img');
    images.forEach(image => {
        image.style.opacity = '1';
    });
}

