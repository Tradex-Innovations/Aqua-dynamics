'use client';

import { useEffect, useRef, useState } from 'react';
import { factoryChapterStops, factoryMotion } from '../lib/factory-motion.mjs';

const films = [
  { title: 'Cut with precision.', file: 'Workers_unrolling_fabric_on_table_e223f5d2', description: 'Workers unrolling technical sailcloth across a factory table' },
  { title: 'Crafted with care.', file: 'Operator_sewing_fabric_in_factory_30b11f86', description: 'An operator stitching technical fabric at an industrial sewing machine' },
  { title: 'Made for the wind.', file: 'Technicians_lifting_sail_panel_175d7827', description: 'Technicians lifting a finished sail panel into the light' },
];

export default function FactoryFilms() {
  const section = useRef(null), stage = useRef(null), cards = useRef([]), videos = useRef([]);
  const [active, setActive] = useState(0), [near, setNear] = useState(false);
  const [visible, setVisible] = useState(false), [documentVisible, setDocumentVisible] = useState(true);
  const [reduced, setReduced] = useState(false), [paused, setPaused] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [ready, setReady] = useState({});

  useEffect(() => {
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0;
    function update() {
      frame = 0;
      const rect = section.current.getBoundingClientRect();
      const height = stage.current.clientHeight, width = stage.current.clientWidth;
      const range = Math.max(1, rect.height - height);
      const progress = Math.max(0, Math.min(1, -rect.top / range));
      const motion = factoryMotion(progress, width, height, preference.matches);
      const styles = stage.current.style;
      styles.setProperty('--headline-reveal', motion.headlineReveal);
      styles.setProperty('--intro-opacity', motion.introOpacity);
      styles.setProperty('--overlay-reveal', motion.overlayReveal);
      stage.current.dataset.headerTheme = motion.darkHeader ? 'dark' : 'light';
      cards.current.forEach((card, index) => {
        if (!card) return;
        const pose = motion.cards[index];
        card.style.left = `${pose.x}px`;
        card.style.top = `${pose.y}px`;
        card.style.width = `${pose.width}px`;
        card.style.height = `${pose.height}px`;
        card.style.borderRadius = `${pose.radius}px`;
        if (!preference.matches) card.style.opacity = pose.opacity;
      });
      if (!preference.matches) setActive(motion.active);
    }
    function schedule() { if (!frame) frame = requestAnimationFrame(update); }
    function changePreference() {
      setReduced(preference.matches);
      setPaused(preference.matches);
      schedule();
    }
    function changeVisibility() { setDocumentVisible(!document.hidden); }
    const preload = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setNear(true); preload.disconnect(); }
    }, { rootMargin: '300px' });
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
    preload.observe(section.current);
    observer.observe(stage.current);
    changePreference(); changeVisibility();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    preference.addEventListener('change', changePreference);
    document.addEventListener('visibilitychange', changeVisibility);
    return () => {
      cancelAnimationFrame(frame); preload.disconnect(); observer.disconnect();
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      preference.removeEventListener('change', changePreference);
      document.removeEventListener('visibilitychange', changeVisibility);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setBlocked(false);
    videos.current.forEach((video, index) => {
      if (!video) return;
      if (index === active && near && visible && documentVisible && !paused) {
        video.muted = true;
        video.play()?.then(() => { if (cancelled) video.pause(); }).catch(() => {
          if (!cancelled) setBlocked(true);
        });
      } else video.pause();
    });
    return () => { cancelled = true; videos.current.forEach(video => video?.pause()); };
  }, [active, near, visible, documentVisible, paused]);

  function choose(index) {
    setActive(index);
    if (reduced) return;
    const rect = section.current.getBoundingClientRect();
    window.scrollTo({ top: scrollY + rect.top + (rect.height - stage.current.clientHeight) * factoryChapterStops[index], behavior: 'smooth' });
  }

  function togglePlayback() {
    if (paused || blocked) {
      setPaused(false);
      videos.current[active]?.play()?.then(() => setBlocked(false)).catch(() => setBlocked(true));
    } else setPaused(true);
  }

  return <section ref={section} id="factory" className={`factory-films${reduced ? ' is-reduced' : ''}`} data-header-theme="light" aria-label="Where ideas take shape">
    <div ref={stage} className="factory-film-stage">
      <div className="factory-headline-viewport">
        <div className="factory-headlines">
          {films.map((film, index) => <h2 key={film.file} className={active === index ? 'is-active' : ''}><button onClick={() => choose(index)} aria-pressed={active === index}>{film.title}</button></h2>)}
        </div>
      </div>
      <div className="factory-film-window">
        {films.map((film, index) => <div ref={element => { cards.current[index] = element; }} key={film.file} className={`factory-film-layer film-${index}${active === index ? ' is-active' : ''}`} style={{ backgroundImage: `url('/videos/${film.file}.poster.jpg')` }} aria-hidden={active !== index}>
          <video ref={element => { videos.current[index] = element; }} className={ready[index] ? 'is-ready' : ''} onLoadedData={() => setReady(previous => ({ ...previous, [index]: true }))} src={near ? `/videos/${film.file}.mp4` : undefined} poster={`/videos/${film.file}.poster.jpg`} muted loop playsInline preload="auto" aria-label={film.description} />
        </div>)}
      </div>
      <div className="factory-film-shade" />
      <div className="factory-overlay-headings" aria-hidden="true">
          <div className="factory-overlay-roll" style={{ '--active-film': active }}>{films.map(film => <h2 key={film.file}>{film.title}</h2>)}</div>
        </div>
        <div className="factory-film-controls">
          <div className="factory-film-tabs" role="group" aria-label="Factory films">
            {films.map((film, index) => <button key={film.file} aria-label={film.title} aria-pressed={active === index} onClick={() => choose(index)}><span /></button>)}
          </div>
          <button className="factory-film-playback" onClick={togglePlayback} aria-label={paused || blocked ? 'Play factory film' : 'Pause factory film'}><span aria-hidden="true">{paused || blocked ? '▷' : 'Ⅱ'}</span></button>
        </div>
    </div>
  </section>;
}
