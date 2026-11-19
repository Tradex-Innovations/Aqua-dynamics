'use client';

import Image from 'next/image';
import { assetPath } from '../lib/asset-path';
import { useCallback, useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import ProductCanvas from './ProductCanvas';
import { productIds, featureNames, getJourneyState, progressForProduct } from '../lib/journey.mjs';
import { productDetails } from '../lib/product-details';
import { products } from '../lib/content';

gsap.registerPlugin(ScrollTrigger);

export function ProductGlyph({ id }) {
  return <svg viewBox="0 0 64 44" fill="none" aria-hidden="true">{id === 'sailing' ? <><path d="M27 3 52 36H13Z" fill="currentColor" opacity=".2" /><path d="M27 3 52 36H13L27 3Zm0 0 9 33M20 20h20M16 29h31" stroke="currentColor" strokeWidth="1.2" /><path d="M8 40h47" stroke="currentColor" /></> : id === 'wingfoil' ? <><path d="M4 32Q9 7 32 9q23-2 28 23-13-3-28-10Q17 29 4 32Z" fill="currentColor" opacity=".2" /><path d="M4 32Q9 7 32 9q23-2 28 23-13-3-28-10Q17 29 4 32Zm28-23v13M14 17l5 10M50 17l-5 10" stroke="currentColor" strokeWidth="1.4" /></> : <><path d="M3 20Q7 2 32 5q25-3 29 15-17-4-29-3-12-1-29 3Z" fill="currentColor" opacity=".25" /><path d="M3 20Q7 2 32 5q25-3 29 15-17-4-29-3-12-1-29 3Zm5-1 21 21M16 17l13 23M25 17l4 23M56 19 35 40M48 17 35 40M39 17l-4 23" stroke="currentColor" strokeWidth="1" /></>}</svg>;
}

export default function ProductExperience() {
  const section = useRef(null), engine = useRef(null), trigger = useRef(null);
  const pins = useRef([]), connector = useRef(null), callout = useRef(null), stage = useRef(null), photoDialog = useRef(null);
  const motion = useRef({ id: 'sailing', local: 0.06, reduced: false });
  const latest = useRef({ index: 0, phase: -1 });
  const [state, setState] = useState({ index: 0, phase: -1 });
  const [reduced, setReduced] = useState(false);
  const product = products[state.index], details = productDetails[product.id];
  const feature = featureNames[Math.max(0, state.phase)];

  const applyProgress = useCallback(progress => {
    const next = getJourneyState(progress);
    motion.current = { ...motion.current, id: next.id, local: next.local };
    stage.current?.style.setProperty('--chapter-progress', next.local);
    if (next.index !== latest.current.index || next.phase !== latest.current.phase) {
      latest.current = { index: next.index, phase: next.phase };
      setState(latest.current);
    }
    engine.current?.invalidate();
  }, []);

  const select = useCallback((id, phase = -1, updateHash = true) => {
    const progress = progressForProduct(id, phase);
    if (progress === null) return;
    applyProgress(progress);
    if (!motion.current.reduced) {
      const top = section.current.getBoundingClientRect().top + window.scrollY;
      const distance = section.current.offsetHeight - window.innerHeight;
      window.scrollTo({ top: top + Math.max(0, distance) * progress, behavior: 'instant' });
    }
    if (updateHash) history.replaceState(null, '', `#${id}`);
  }, [applyProgress]);

  useEffect(() => {
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    function setup() {
      trigger.current?.kill();
      motion.current.reduced = preference.matches; setReduced(preference.matches);
      if (!preference.matches) {
        trigger.current = ScrollTrigger.create({
          trigger: section.current, start: 'top top', end: 'bottom bottom',
          onUpdate: self => applyProgress(self.progress),
          onRefresh: self => { if (self.isActive) applyProgress(self.progress); },
        });
      }
      engine.current?.invalidate();
    }
    function followHash() {
      const id = window.location.hash.slice(1);
      if (productIds.includes(id)) select(id, -1, false);
    }
    setup();
    let disposed = false;
    document.fonts.ready.then(() => { if (!disposed) { ScrollTrigger.refresh(); followHash(); } });
    preference.addEventListener('change', setup); window.addEventListener('hashchange', followHash);
    return () => { disposed = true; trigger.current?.kill(); preference.removeEventListener('change', setup); window.removeEventListener('hashchange', followHash); };
  }, [applyProgress, select]);

  const receiveEngine = useCallback(api => { engine.current = api; api?.invalidate(); }, []);
  const projectPins = useCallback((points, width, height) => {
    points.forEach((point, index) => {
      if (pins.current[index]) pins.current[index].style.transform = `translate(${point.x}px, ${point.y}px) translate(-50%, -50%)`;
    });
    const active = Math.max(0, latest.current.phase), point = points[active];
    if (connector.current && point) {
      connector.current.setAttribute('x1', point.x); connector.current.setAttribute('y1', point.y);
      connector.current.setAttribute('x2', callout.current?.offsetLeft - 15 || width * 0.75);
      connector.current.setAttribute('y2', height * 0.4 + 28);
    }
  }, []);

  return <section ref={section} id="products" className={`product-journey ${reduced ? 'reduced-journey' : ''}`} aria-label="Explore our products through materials, stitching and construction">
    {productIds.map((id, i) => <span id={id} key={id} className="journey-anchor" style={{ top: `${i * 100 / 3}%` }} aria-hidden="true" />)}
    <div ref={stage} className={`product-stage ${state.phase < 0 ? 'is-reveal' : ''}`} data-header-theme="light" data-product={product.id} data-phase={state.phase < 0 ? 'reveal' : feature.toLowerCase()} style={{ '--scene-bg': details.background, '--scene-ink': details.ink, '--scene-accent': details.accent }}>
      <div className="stage-grain" aria-hidden="true" />
      <div className="product-heading page-gutter"><h2 key={product.id}>{details.title}</h2></div>
      <div className="feature-tabs" role="group" aria-label="Explore product construction">{featureNames.map((label, i) => <button key={label} onClick={() => select(product.id, i)} aria-pressed={state.phase === i} aria-controls="feature-description">{label}</button>)}</div>
      <div className="product-visual-area">
        <ProductCanvas motion={motion} product={product.id} onEngine={receiveEngine} onProject={projectPins} />
        <svg className="feature-connector" aria-hidden="true"><line ref={connector} x1="50%" y1="50%" x2="75%" y2="40%" /></svg>
        {featureNames.map((name, i) => <button ref={element => { pins.current[i] = element; }} key={name} className={`feature-pin ${state.phase === i ? 'is-active' : ''}`} onClick={() => select(product.id, i)} aria-label={`Explore ${name.toLowerCase()}`} aria-pressed={state.phase === i} style={{ transform: `translate(${43 + i * 5}vw, ${22 + i * 5}vh) translate(-50%, -50%)` }}><span aria-hidden="true" /></button>)}
        <div ref={callout} id="feature-description" className="feature-callout" aria-live="polite"><h3>{state.phase >= 0 ? feature : ''}</h3></div>
      </div>
      <button className="product-inset" onClick={() => photoDialog.current.showModal()} aria-label={`View ${product.name} in the elements`}><span className="product-inset-photo"><Image src={assetPath(`/images/${product.image}`)} alt={product.alt} fill sizes="180px" quality={85} /><span aria-hidden="true">↗</span></span></button>
      <div className="stage-utilities"><button onClick={() => engine.current?.reset()} aria-label="Reset product rotation"><span aria-hidden="true">⟲</span></button><a href="#factory" aria-label="Continue to the factory"><span aria-hidden="true">↓</span></a></div>
      <div className="stage-footer page-gutter"><nav className="product-dock" aria-label="Select product">{products.map(item => <a key={item.id} href={`#${item.id}`} onClick={event => { event.preventDefault(); select(item.id); }} aria-current={item.id === product.id ? 'true' : undefined} className={item.id === product.id ? 'active' : ''}><ProductGlyph id={item.id} /><span>{item.name}</span></a>)}</nav></div>
      <div className="stage-progress" aria-hidden="true"><span /></div>
    </div>
    <dialog ref={photoDialog} className="product-photo-dialog" aria-labelledby="product-photo-title"><button className="dialog-x" onClick={() => photoDialog.current.close()} aria-label="Close product photograph">×</button><div className="product-photo-large"><Image src={assetPath(`/images/${product.image}`)} alt={product.alt} fill sizes="90vw" quality={85} /></div><div className="product-photo-caption"><h2 id="product-photo-title">{product.name}</h2></div></dialog>
  </section>;
}
