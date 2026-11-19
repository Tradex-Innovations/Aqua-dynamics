'use client';

import { useEffect, useRef, useState } from 'react';
import { getModelPose } from '../lib/journey.mjs';

function ProductFallback({ product }) {
  const isSail = product === 'sailing', isWing = product === 'wingfoil';
  return <svg className="product-fallback" viewBox="0 0 800 560" aria-hidden="true"><defs><linearGradient id="cloth" x1="0" y1="0" x2="1" y2=".8"><stop stopColor="#fffdf0" /><stop offset=".55" stopColor="#dfdfcd" /><stop offset="1" stopColor="#a7b6a6" /></linearGradient><filter id="cloth-shadow"><feDropShadow dx="10" dy="22" stdDeviation="16" floodColor="#193b2c" floodOpacity=".16" /></filter></defs><g filter="url(#cloth-shadow)" transform={isSail ? 'translate(80 -10)' : 'translate(0 55)'}>
    {isSail ? <><path d="M245 35 565 485 180 485Z" fill="url(#cloth)" stroke="#465b51" strokeWidth="3" /><path d="m245 35 246 450h57Z" fill="#4f827d" /><path d="m243 40-18 445M238 125l71 360M220 228l206 257M210 315l278 170M196 400l291 85" fill="none" stroke="#a4ac99" strokeWidth="1.5" /></> : isWing ? <><path d="M80 310Q110 90 400 75q290 15 320 235-145-20-320-65Q225 290 80 310Z" fill="url(#cloth)" stroke="#324e47" strokeWidth="18" strokeLinejoin="round" /><path d="M90 302q130-32 310-98 170 66 310 98l-9-25Q555 255 400 176 225 254 99 277Z" fill="#5b8981" /><path d="M400 85v157M155 194l33 85M251 116l38 132M549 116l-38 132M645 194l-33 85" fill="none" stroke="#81978a" strokeWidth="2" /><path d="M400 82v161" stroke="#284940" strokeWidth="18" /></> : <><path d="M75 215Q110 25 400 55q290-30 325 160-125-10-325-45-200 35-325 45Z" fill="url(#cloth)" stroke="#3d6258" strokeWidth="3" /><path d="M90 175Q400-10 710 175l-6-26Q400 3 96 149Z" fill="#5b8d83" />{Array.from({length:16}, (_,i)=><path key={i} d={`M${109+i*38} ${146-Math.sin(i/15*Math.PI)*73}L${112+i*38} ${208-Math.sin(i/15*Math.PI)*38}L${i<8?375:425} 420`} fill="none" stroke="#617c6d" strokeWidth="1" />)}</>}
  </g></svg>;
}

export default function ProductCanvas({ motion, product, onEngine, onProject }) {
  const host = useRef(null);
  const [ready, setReady] = useState(false);
  const callbacks = useRef({ onEngine, onProject });
  callbacks.current = { onEngine, onProject };

  useEffect(() => {
    let cancelled = false, teardown = () => {};
    async function initialize() {
      try {
        const [THREE, { createProductModels, disposeModels }] = await Promise.all([import('three'), import('../lib/product-models')]);
        if (cancelled || !host.current) return;
        const element = host.current;
        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, window.innerWidth < 700 ? 1.4 : 1.8));
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.05;
        renderer.setClearColor(0x000000, 0);
        renderer.domElement.setAttribute('aria-hidden', 'true');
        renderer.domElement.className = 'product-webgl';
        element.appendChild(renderer.domElement);

        const swatch = document.createElement('canvas'); swatch.width = swatch.height = 256;
        const paint = swatch.getContext('2d');
        paint.fillStyle = '#f5f3e9'; paint.fillRect(0, 0, 256, 256);
        for (let i = 0; i < 256; i += 3) {
          paint.strokeStyle = i % 2 ? '#e9e7de' : '#fdfcf8'; paint.lineWidth = 0.6;
          paint.beginPath(); paint.moveTo(i, 0); paint.lineTo(i, 256); paint.stroke();
          paint.beginPath(); paint.moveTo(0, i); paint.lineTo(256, i); paint.stroke();
        }
        const texture = new THREE.CanvasTexture(swatch);
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping; texture.repeat.set(4, 5);
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
        const models = createProductModels(texture);
        const scene = new THREE.Scene();
        Object.values(models).forEach(model => scene.add(model));
        scene.add(new THREE.HemisphereLight('#fff9e8', '#6f8777', 2.3));
        const key = new THREE.DirectionalLight('#fff8e5', 3.5); key.position.set(-3, 5, 7); scene.add(key);
        const fill = new THREE.DirectionalLight('#d7eeee', 1.5); fill.position.set(5, 1, -3); scene.add(fill);
        const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 80); camera.position.set(0, 0, 9);
        const projected = new THREE.Vector3();
        let frame = 0, visible = true, width = 1, height = 1, lastProduct = '', pointer = { x: 0, y: 0 }, turn = 0;
        let current = { x: 0, y: -1, scale: 0.7, rotationX: 0, rotationY: -0.8, rotationZ: 0.1 };
        let dragging = false, lastX = 0;

        function draw() {
          frame = 0;
          if (cancelled || !visible) return;
          const state = motion.current;
          const animate = !state.reduced && document.visibilityState === 'visible' && document.hasFocus();
          const model = models[state.id];
          if (!model) return;
          const compact = width < 750;
          const target = getModelPose(state.id, state.local, compact, state.reduced);
          if (lastProduct !== state.id) {
            Object.entries(models).forEach(([id, object]) => { object.visible = id === state.id; });
            lastProduct = state.id; turn = 0;
            current = getModelPose(state.id, state.reduced ? 0.35 : 0, compact, state.reduced);
          }
          target.rotationY += state.reduced ? 0 : pointer.x * 0.13 + turn;
          target.rotationX += state.reduced ? 0 : pointer.y * 0.07;
          let settling = false;
          Object.keys(current).forEach(key => {
            const delta = target[key] - current[key];
            if (animate && Math.abs(delta) > 0.0007) settling = true;
            current[key] += delta * (animate ? 0.14 : 1);
          });
          model.position.set(current.x, current.y, 0);
          model.scale.setScalar(current.scale);
          model.rotation.set(current.rotationX, current.rotationY, current.rotationZ);
          const fitHeight = state.id === 'sailing' ? 5.6 : state.id === 'paragliding' ? 4.4 : 3.5;
          const fitWidth = state.id === 'sailing' ? 4.7 : compact ? 7.3 : 10.4;
          const distance = Math.max(fitHeight, fitWidth / camera.aspect) / (2 * Math.tan(THREE.MathUtils.degToRad(17)));
          camera.position.z += (distance - camera.position.z) * (animate ? 0.14 : 1);
          if (animate && Math.abs(distance - camera.position.z) > 0.001) settling = true;
          model.updateMatrixWorld(true); camera.updateMatrixWorld();
          renderer.render(scene, camera);
          const points = model.userData.anchors.map(point => {
            projected.set(...point); model.localToWorld(projected); projected.project(camera);
            return { x: (projected.x + 1) * width / 2, y: (1 - projected.y) * height / 2 };
          });
          callbacks.current.onProject?.(points, width, height);
          if (settling) frame = requestAnimationFrame(draw);
        }
        function invalidate() {
          if (!visible || cancelled) return;
          cancelAnimationFrame(frame);
          frame = 0;
          // Render the current selection immediately, even in a background tab.
          // Further frames are only needed to settle the camera and rotation.
          draw();
        }
        function resize() {
          width = Math.max(1, element.clientWidth); height = Math.max(1, element.clientHeight);
          renderer.setSize(width, height); camera.aspect = width / height; camera.updateProjectionMatrix(); invalidate();
        }
        function onPointerMove(event) {
          if (event.pointerType !== 'mouse') return;
          const rect = element.getBoundingClientRect();
          pointer = { x: (event.clientX - rect.left) / width * 2 - 1, y: (event.clientY - rect.top) / height * 2 - 1 };
          if (dragging) { turn += (event.clientX - lastX) * 0.006; lastX = event.clientX; }
          invalidate();
        }
        function onPointerDown(event) {
          if (event.pointerType !== 'mouse' || event.button !== 0) return;
          dragging = true; lastX = event.clientX; element.setPointerCapture(event.pointerId); element.classList.add('is-turning');
        }
        function onPointerUp(event) {
          dragging = false; element.classList.remove('is-turning');
          if (element.hasPointerCapture(event.pointerId)) element.releasePointerCapture(event.pointerId);
        }
        function onPointerLeave() { pointer = { x: 0, y: 0 }; invalidate(); }
        function onContextLost(event) { event.preventDefault(); setReady(false); }
        const resizeObserver = new ResizeObserver(resize); resizeObserver.observe(element);
        const visibility = new IntersectionObserver(entries => {
          visible = entries[0].isIntersecting;
          if (visible) invalidate(); else { cancelAnimationFrame(frame); frame = 0; }
        }); visibility.observe(element);
        element.addEventListener('pointermove', onPointerMove);
        element.addEventListener('pointerdown', onPointerDown);
        element.addEventListener('pointerup', onPointerUp);
        element.addEventListener('pointercancel', onPointerUp);
        element.addEventListener('pointerleave', onPointerLeave);
        renderer.domElement.addEventListener('webglcontextlost', onContextLost);
        callbacks.current.onEngine?.({ invalidate, reset: () => { turn = 0; pointer = { x: 0, y: 0 }; invalidate(); } });
        resize(); draw(); setReady(true);
        teardown = () => {
          cancelAnimationFrame(frame); resizeObserver.disconnect(); visibility.disconnect();
          element.removeEventListener('pointermove', onPointerMove); element.removeEventListener('pointerdown', onPointerDown);
          element.removeEventListener('pointerup', onPointerUp); element.removeEventListener('pointercancel', onPointerUp); element.removeEventListener('pointerleave', onPointerLeave);
          renderer.domElement.removeEventListener('webglcontextlost', onContextLost);
          disposeModels(models); texture.dispose(); renderer.dispose(); renderer.domElement.remove();
        };
      } catch {
        if (!cancelled) setReady(false);
      }
    }
    initialize();
    return () => { cancelled = true; callbacks.current.onEngine?.(null); teardown(); };
  }, [motion]);

  return <div className="model-view" data-renderer={ready ? 'webgl' : 'illustration'}><div className={`product-fallback-wrap ${ready ? 'is-hidden' : ''}`}><ProductFallback product={product} /></div><div ref={host} className="product-renderer" /></div>;
}
