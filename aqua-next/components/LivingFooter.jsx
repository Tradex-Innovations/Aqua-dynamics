'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { assetPath } from '../lib/asset-path';

const artwork = assetPath('/images/wingfoil-deep-ocean-footer-v3.webp');

// Animate the existing photograph in image coordinates, keeping the sky clear
// and the wing, rider and foil together as one gently floating subject.
const fragmentShader = `
  uniform sampler2D photograph;
  uniform vec2 cropScale;
  uniform vec2 cropOffset;
  uniform vec2 pointer;
  uniform float time;
  varying vec2 vUv;

  void main() {
    vec2 uv = vec2(vUv.x, 1.0 - vUv.y) * cropScale + cropOffset;
    float rider = smoothstep(.665, .72, uv.x) * (1.0 - smoothstep(.88, .925, uv.x));
    rider *= smoothstep(.26, .31, uv.y) * (1.0 - smoothstep(.76, .81, uv.y));
    vec2 subject = uv - vec2(.76, .63);
    float lean = sin(time * .72) * .004;
    vec2 floating = vec2(-subject.y, subject.x) * lean;
    floating.y += sin(time * .94) * .0035;
    floating.x += sin(time * .49) * .0015;
    uv -= floating * rider;

    float water = smoothstep(.605, .68, uv.y);
    float openWater = water * (1.0 - rider * .96);
    float wave = sin(uv.x * 55.0 + time * 1.25 + sin(uv.y * 19.0 - time * .52));
    float ripple = sin(uv.x * 132.0 - time * 1.7 + uv.y * 46.0);
    uv.y += (wave * .0023 + ripple * .0006) * openWater;
    uv.x += sin(uv.y * 68.0 + time * .8) * .0015 * openWater;
    uv += pointer * .002 * water;
    vec3 color = texture2D(photograph, vec2(uv.x, 1.0 - uv.y)).rgb;

    // Restrained moving sunlight beneath the surface, fading into deep water.
    float shallow = smoothstep(.63, .70, uv.y) * (1.0 - smoothstep(.72, .94, uv.y));
    float light = pow(max(0.0, sin(uv.x * 34.0 + uv.y * 42.0 + time * .6)
      * sin(uv.x * 21.0 - uv.y * 31.0 - time * .45)), 5.0);
    color += vec3(.06, .14, .11) * light * shallow * (1.0 - rider);
    gl_FragColor = vec4(color, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

export default function LivingFooter() {
  const container = useRef(null), canvas = useRef(null), paused = useRef(false);
  const [ready, setReady] = useState(false), [isPaused, setPaused] = useState(false);

  useEffect(() => {
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    const host = container.current;
    let disposed = false, generation = 0, release = () => {};

    async function initialize() {
      const current = ++generation;
      release(); release = () => {};
      setReady(false);
      if (preference.matches || disposed) return;
      const THREE = await import('three');
      if (disposed || preference.matches || current !== generation) return;
      let renderer;
      try {
        renderer = new THREE.WebGLRenderer({ canvas: canvas.current, alpha: true, antialias: false, powerPreference: 'low-power' });
      } catch { return; }
      renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      const scene = new THREE.Scene(), camera = new THREE.Camera();
      const geometry = new THREE.PlaneGeometry(2, 2);
      const uniforms = {
        photograph: { value: null }, cropScale: { value: new THREE.Vector2(1, 1) },
        cropOffset: { value: new THREE.Vector2() }, pointer: { value: new THREE.Vector2() }, time: { value: 0 },
      };
      const material = new THREE.ShaderMaterial({
        uniforms, fragmentShader,
        vertexShader: 'varying vec2 vUv; void main(){vUv=uv; gl_Position=vec4(position.xy,0.,1.);}',
        depthTest: false, depthWrite: false,
      });
      scene.add(new THREE.Mesh(geometry, material));
      let frame = 0, last = 0, clock = 0, visible = false, loaded = false, destroyed = false;
      let texture;
      const target = new THREE.Vector2();
      const canPlay = () => visible && !document.hidden && !paused.current && !preference.matches && loaded && !destroyed;

      function render() { renderer.render(scene, camera); }
      function animate(now) {
        frame = 0;
        if (!canPlay()) { last = 0; return; }
        if (!last || now - last >= 1000 / 30) {
          if (last) clock += Math.min((now - last) / 1000, .08);
          last = now;
          uniforms.time.value = clock;
          uniforms.pointer.value.lerp(target, .045);
          render();
        }
        frame = requestAnimationFrame(animate);
      }
      function sync() {
        cancelAnimationFrame(frame); frame = 0; last = 0;
        if (canPlay()) frame = requestAnimationFrame(animate);
      }
      function resize() {
        if (!loaded || destroyed) return;
        const width = host.clientWidth, height = host.clientHeight;
        if (!width || !height) return;
        renderer.setSize(width, height, false);
        const scale = Math.max(width / texture.image.width, height / texture.image.height);
        const x = width / (texture.image.width * scale), y = height / (texture.image.height * scale);
        const position = width <= 600 ? .79 : width <= 900 ? .80 : .78;
        uniforms.cropScale.value.set(x, y);
        uniforms.cropOffset.value.set((1 - x) * position, 1 - y);
        render();
      }
      function move(event) {
        if (event.pointerType === 'touch') return;
        const rect = host.getBoundingClientRect();
        target.set((event.clientX - rect.left) / rect.width - .5, (event.clientY - rect.top) / rect.height - .5);
      }
      const footer = host.closest('footer');
      const reset = () => target.set(0, 0);
      const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); });
      const resizer = new ResizeObserver(resize);
      observer.observe(host); resizer.observe(host);
      footer.addEventListener('pointermove', move, { passive: true });
      footer.addEventListener('pointerleave', reset);
      host.addEventListener('footer-motion-change', sync);
      document.addEventListener('visibilitychange', sync);
      function contextLost(event) { event.preventDefault(); setReady(false); loaded = false; sync(); }
      canvas.current.addEventListener('webglcontextlost', contextLost);
      const surface = canvas.current;

      release = () => {
        destroyed = true; cancelAnimationFrame(frame);
        observer.disconnect(); resizer.disconnect();
        footer.removeEventListener('pointermove', move); footer.removeEventListener('pointerleave', reset);
        host.removeEventListener('footer-motion-change', sync); document.removeEventListener('visibilitychange', sync);
        surface.removeEventListener('webglcontextlost', contextLost);
        texture?.dispose(); material.dispose(); geometry.dispose(); renderer.dispose();
      };
      new THREE.TextureLoader().load(artwork, image => {
        if (destroyed) { image.dispose(); return; }
        texture = image; texture.colorSpace = THREE.SRGBColorSpace;
        uniforms.photograph.value = texture; loaded = true;
        resize(); setReady(true); sync();
      }, undefined, () => { if (!destroyed) { setReady(false); release(); } });
    }
    initialize().catch(() => { release(); setReady(false); });
    const update = () => initialize().catch(() => { release(); setReady(false); });
    preference.addEventListener('change', update);
    return () => { disposed = true; preference.removeEventListener('change', update); release(); };
  }, []);

  function toggle() {
    paused.current = !paused.current;
    setPaused(paused.current);
    container.current.dispatchEvent(new Event('footer-motion-change'));
  }

  return <>
    <div ref={container} className="closing-artwork">
      <Image src={artwork} alt="A wingfoil rider beneath a teal and ivory wing, above a deep teal ocean" fill sizes="100vw" quality={85} />
      <canvas ref={canvas} className={`closing-live-canvas${ready ? ' is-ready' : ''}`} aria-hidden="true" />
    </div>
    {ready && <button className="closing-motion-toggle" onClick={toggle} aria-label={isPaused ? 'Play ocean animation' : 'Pause ocean animation'} aria-pressed={isPaused}>
      {isPaused ? <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 5 10 7-10 7Z" fill="currentColor" /></svg> : <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 6v12M16 6v12" stroke="currentColor" strokeWidth="2" /></svg>}
    </button>}
  </>;
}
