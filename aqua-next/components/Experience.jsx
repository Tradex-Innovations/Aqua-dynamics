'use client';

import Image from 'next/image';
import { assetPath } from '../lib/asset-path';
import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import ProductExperience from './ProductExperience';
import FactoryFilms from './FactoryFilms';
import PeopleStory from './PeopleStory';
import LivingFooter from './LivingFooter';
import { sectors } from '../lib/content';
import { siteConfig } from '../lib/site-config';

gsap.registerPlugin(ScrollTrigger);

function Arrow({ diagonal = false }) {
  return <svg width="23" height="23" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d={diagonal ? 'M5 19 19 5M5 5h14v14' : 'M4 12h15m-6-6 6 6-6 6'} stroke="currentColor" strokeWidth="1.5" /></svg>;
}
function CTA({ children, href, onClick, dark = false }) {
  const content = <><span>{children}</span><span className="cta-icon"><Arrow /></span></>;
  return href ? <a className={`cta ${dark ? 'cta-dark' : ''}`} href={href}>{content}</a> : <button className={`cta ${dark ? 'cta-dark' : ''}`} onClick={onClick}>{content}</button>;
}

function HeroMedia() {
  const video = useRef(null);
  const [available, setAvailable] = useState(false), [playing, setPlaying] = useState(false), [loaded, setLoaded] = useState(false);
  useEffect(() => {
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setAvailable(Boolean(siteConfig.heroVideo) && !preference.matches);
    update(); preference.addEventListener('change', update);
    return () => preference.removeEventListener('change', update);
  }, []);
  async function toggle() {
    if (video.current.paused) {
      try { await video.current.play(); setPlaying(true); } catch { setPlaying(false); }
    } else { video.current.pause(); setPlaying(false); }
  }
  return <><div className="hero-parallax"><div className="hero-media"><Image src={siteConfig.heroPoster} alt="A sailing yacht crossing the ocean in soft morning light" fill sizes="100vw" quality={85} loading="eager" fetchPriority="high" />{available && <video ref={video} className={loaded ? 'is-loaded' : ''} src={siteConfig.heroVideo} poster={siteConfig.heroPoster} autoPlay muted loop playsInline preload="auto" aria-hidden="true" onLoadedData={() => { setLoaded(true); setPlaying(!video.current.paused); }} onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onError={() => { setAvailable(false); setLoaded(false); }} />}</div></div>{available && loaded && <button className="hero-playback" onClick={toggle} aria-label={playing ? 'Pause video' : 'Play video'}><span aria-hidden="true">{playing ? 'Ⅱ' : '▷'}</span></button>}</>;
}

export default function Experience() {
  const root = useRef(null), header = useRef(null), menu = useRef(null), contact = useRef(null);
  const [interest, setInterest] = useState('General enquiry'), [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    function updatePage() {
      const region = document.elementFromPoint(innerWidth / 2, 75)?.closest('[data-header-theme]');
      header.current?.classList.toggle('on-light', region?.dataset.headerTheme === 'light');
      const available = document.documentElement.scrollHeight - innerHeight;
      root.current?.style.setProperty('--reading-progress', available > 0 ? scrollY / available : 0);
    }
    updatePage(); window.addEventListener('scroll', updatePage, { passive: true }); window.addEventListener('resize', updatePage);
    return () => { window.removeEventListener('scroll', updatePage); window.removeEventListener('resize', updatePage); };
  }, []);

  useEffect(() => {
    const media = gsap.matchMedia();
    const ctx = gsap.context(() => {
      media.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.from('.hero-title span', { yPercent: 16, stagger: 0.12, duration: 1.15, ease: 'power3.out', clearProps: 'all' });
        gsap.to('.hero-media', { yPercent: 12, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
        gsap.utils.toArray('[data-reveal]').forEach(element => gsap.from(element, { y: 35, duration: 1, ease: 'power2.out', scrollTrigger: { trigger: element, start: 'top 92%', once: true } }));
        gsap.fromTo('.people-story-photo', { yPercent: -3, scale: 1.06 }, { yPercent: 3, scale: 1.06, ease: 'none', scrollTrigger: { trigger: '.people-story-main', start: 'top bottom', end: 'bottom top', scrub: true } });
        gsap.utils.toArray('.photographic-scene .scene-image').forEach(element => gsap.fromTo(element, { scale: 1.08, yPercent: -4 }, { scale: 1, yPercent: 4, ease: 'none', scrollTrigger: { trigger: element.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } }));
        gsap.fromTo('.closing-artwork', { scale: 1, transformOrigin: '80% bottom' }, { scale: 1.035, ease: 'none', scrollTrigger: { trigger: '.closing-scene', start: 'top bottom', end: 'bottom bottom', scrub: true } });
      });
    }, root);
    let leave = () => {};
    if (matchMedia('(pointer: fine) and (prefers-reduced-motion: no-preference)').matches) {
      const hero = root.current.querySelector('.hero');
      const x = gsap.quickTo('.hero-parallax', 'x', { duration: 0.8, ease: 'power2.out' });
      const y = gsap.quickTo('.hero-parallax', 'y', { duration: 0.8, ease: 'power2.out' });
      const move = event => { x((event.clientX / innerWidth - 0.5) * 20); y((event.clientY / innerHeight - 0.5) * 12); };
      const reset = () => { x(0); y(0); };
      hero.addEventListener('pointermove', move); hero.addEventListener('pointerleave', reset);
      leave = () => { hero.removeEventListener('pointermove', move); hero.removeEventListener('pointerleave', reset); x.tween.kill(); y.tween.kill(); };
    }
    let disposed = false;
    document.fonts.ready.then(() => { if (!disposed) ScrollTrigger.refresh(); });
    return () => { disposed = true; leave(); media.revert(); ctx.revert(); };
  }, []);

  function enquire(value = 'General enquiry') {
    setInterest(value); setSubmitted(false); menu.current?.close(); contact.current.showModal();
  }
  function sendEnquiry(event) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const body = `Name: ${data.get('name')}\nEmail: ${data.get('email')}\nCompany: ${data.get('company') || '—'}\nInterest: ${data.get('interest')}\n\n${data.get('message')}`;
    window.location.href = `mailto:info@aquadynamics.lk?subject=${encodeURIComponent(`Aqua Dynamics — ${data.get('interest')}`)}&body=${encodeURIComponent(body)}`;
    setSubmitted(true);
  }
  function closeOnBackdrop(event) {
    if (event.target !== event.currentTarget) return;
    const rect = event.currentTarget.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) event.currentTarget.close();
  }

  return <div ref={root} className="experience">
    <a className="skip-link" href="#main">Skip to content</a>
    <header ref={header} className="site-header"><a href="#home" className="brand" aria-label="Aqua Dynamics home"><Image src={assetPath('/images/logo-white.png')} alt="Aqua Dynamics" width={170} height={52} preload /></a><button className="menu-button" onClick={() => menu.current.showModal()} aria-label="Open navigation" aria-haspopup="dialog" aria-controls="navigation-dialog"><span className="menu-lines" aria-hidden="true"><i /><i /></span></button></header>
    <nav className="progress-rail" aria-label="Page chapters"><a href="#home" title="Opening" aria-label="Opening" /><a href="#products" title="Our elements" aria-label="Our elements" /><a href="#factory" title="The making" aria-label="The making" /><a href="#people" title="Our people" aria-label="Our people" /><a href="#contact" title="Contact" aria-label="Contact" /><span /></nav>
    <main id="main">
      <section id="home" className="hero" data-header-theme="dark"><HeroMedia /><div className="hero-shade" /><h1 className="hero-title"><span>Made for what</span><span><em>moves you.</em></span></h1><div className="hero-footer page-gutter"><CTA href="#products">Explore</CTA></div></section>
      <ProductExperience />
      <FactoryFilms />
      <PeopleStory />
    </main>
    <footer id="contact" className="closing-scene" data-header-theme="light">
      <LivingFooter />
      <div className="closing-contact page-gutter">
        <h2 data-reveal>Your next move.<br /><em>Starts here.</em></h2>
        <CTA dark onClick={() => enquire()}>Get in touch</CTA>
        <a className="closing-email" href="mailto:info@aquadynamics.lk">info@aquadynamics.lk</a>
      </div>
      <div className="closing-brand page-gutter" data-header-theme="dark"><a href="#home" className="back-top" aria-label="Back to top"><span aria-hidden="true">↑</span></a><div className="footer-wordmark" aria-hidden="true">Aqua Dynamics</div></div>
    </footer>
    <dialog ref={menu} id="navigation-dialog" className="menu-dialog" aria-label="Main navigation"><div className="menu-dialog-header"><button className="close-button" onClick={() => menu.current.close()} aria-label="Close navigation"><span aria-hidden="true">×</span></button></div><nav>{[['Home', 'home'], ['Our elements', 'products'], ['The making', 'factory'], ['Our people', 'people'], ['Get in touch', 'contact']].map(([label, id]) => <a key={id} href={`#${id}`} onClick={() => menu.current.close()}><span>{label}</span><Arrow diagonal /></a>)}</nav></dialog>
    <dialog ref={contact} className="contact-dialog" aria-labelledby="contact-title" onClick={closeOnBackdrop}><button className="dialog-x" onClick={() => contact.current.close()} aria-label="Close enquiry form">×</button><h2 id="contact-title">What’s your<br /><em>next move?</em></h2><form onSubmit={sendEnquiry}><div className="form-row"><label>Name<input name="name" autoComplete="name" required maxLength={100} /></label><label>Email<input name="email" type="email" autoComplete="email" required maxLength={160} /></label></div><label>Company <span className="optional">(optional)</span><input name="company" autoComplete="organization" maxLength={150} /></label><label>Interest<select name="interest" value={interest} onChange={event => setInterest(event.target.value)}><option>General enquiry</option>{sectors.map(sector => <option key={sector.name}>{sector.name}</option>)}</select></label><label>Message<textarea name="message" required rows={3} maxLength={3000} /></label><button className="cta cta-dark" type="submit"><span>Open email draft</span><span className="cta-icon"><Arrow /></span></button>{submitted && <p className="form-note" role="status">Draft opened in your email app.</p>}</form><a className="direct-email" href="mailto:info@aquadynamics.lk">info@aquadynamics.lk</a></dialog>
  </div>;
}
