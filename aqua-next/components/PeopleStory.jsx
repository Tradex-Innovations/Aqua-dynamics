'use client';

import Image from 'next/image';
import { assetPath } from '../lib/asset-path';
import { useEffect, useRef, useState } from 'react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const stories = [
  {
    value: 2100, unit: '', label: 'People',
    title: 'One team. Many talents.',
    copy: 'Behind every sail, wing and paraglider is a team bringing care, precision and pride to their work. More than 2,100 people contribute to every stage of making.',
    image: 'teamwork', alt: 'Aqua Dynamics employees assembling textile components together',
  },
  {
    value: 35, unit: 'years', label: 'Manufacturing expertise',
    title: 'Experience in every detail.',
    copy: 'Complex products depend on experienced hands. Our teams combine technical knowledge with the attention to detail that keeps quality consistent across production runs.',
    image: 'craftsmanship', alt: 'An Aqua Dynamics employee sewing technical fabric at an industrial machine',
  },
  {
    value: 10, unit: 'years', label: 'Tenure of most employees',
    title: 'Knowledge that grows together.',
    copy: 'Most employees have grown with Aqua Dynamics for more than a decade. Skills are passed on, craftsmanship is refined, and people develop through training and long-term career opportunities.',
    image: 'experience', alt: 'An Aqua Dynamics team member in the workshop',
  },
];

const numberFormat = new Intl.NumberFormat('en-US');

function FactCount({ value, unit }) {
  const element = useRef(null);
  const [count, setCount] = useState(value);

  useEffect(() => {
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    if (preference.matches || !('IntersectionObserver' in window)) return;

    let frame = 0;
    setCount(0);
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      let start;
      function tick(time) {
        start ??= time;
        const progress = Math.min((time - start) / 1800, 1);
        setCount(Math.round(value * (1 - (1 - progress) ** 3)));
        if (progress < 1) frame = requestAnimationFrame(tick);
      }
      frame = requestAnimationFrame(tick);
    }, { threshold: .5 });
    observer.observe(element.current);

    function reduceMotion() {
      if (!preference.matches) return;
      observer.disconnect();
      cancelAnimationFrame(frame);
      setCount(value);
    }
    preference.addEventListener('change', reduceMotion);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      preference.removeEventListener('change', reduceMotion);
    };
  }, [value]);

  return <span ref={element} className="people-fact-value" aria-hidden="true">{numberFormat.format(count)}+{unit && <> <span>{unit}</span></>}</span>;
}

export default function PeopleStory() {
  const [active, setActive] = useState(0), [expanded, setExpanded] = useState(false);
  const panel = useRef(null), exploreButton = useRef(null), moveToPanel = useRef(false);
  const story = stories[active];

  useEffect(() => {
    ScrollTrigger.refresh();
    if (!expanded || !moveToPanel.current) return;
    moveToPanel.current = false;
    panel.current?.scrollIntoView({ block: 'nearest', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  }, [expanded]);

  function explore() {
    moveToPanel.current = !expanded;
    setExpanded(previous => !previous);
  }

  function select(index) {
    setActive(index);
    setExpanded(true);
  }

  return <section id="people" className="people-story" data-header-theme="light" aria-labelledby="people-title">
    <div className="people-story-main">
      <div className="people-story-photo"><Image src={assetPath('/images/people/teamwork.webp')} alt="Aqua Dynamics employees in blue shirts carefully assembling textile components together at a workshop table" fill sizes="100vw" quality={85} /></div>
      <div className="people-story-shade" />
      <div className="people-story-copy page-gutter">
        <h2 id="people-title" data-reveal>Behind every seam.<br /><em>Someone extraordinary.</em></h2>
        <p>More than 2,100 people bring skill, experience and care to everything we make.</p>
        <button ref={exploreButton} className="text-link people-explore" aria-expanded={expanded} aria-controls="people-details" onClick={explore}>Meet our people</button>
      </div>
    </div>
    <div className="people-story-facts page-gutter" role="group" aria-label="Explore our people through three facts">
      {stories.map((item, index) => <button key={item.label} className={`people-fact${expanded && active === index ? ' is-active' : ''}`} aria-label={`${numberFormat.format(item.value)}+ ${item.unit ? `${item.unit} ` : ''}${item.label}`} aria-pressed={expanded && active === index} aria-controls="people-details" onClick={() => select(index)}>
        <FactCount value={item.value} unit={item.unit} />
        <span className="people-fact-label">{item.label}</span>
      </button>)}
    </div>
    <div ref={panel} id="people-details" className="people-details page-gutter" hidden={!expanded}>
      <div className="people-details-inner">
        <div className="people-details-copy" role="region" aria-label={story.label} aria-live="polite">
          <h3 key={story.title}>{story.title}</h3>
          <p>{story.copy}</p>
        </div>
        <div className="people-details-photo">
          {stories.map((item, index) => <div key={item.image} className={`people-detail-image${active === index ? ' is-active' : ''}`} aria-hidden={active !== index}>
            <Image src={assetPath(`/images/people/${item.image}.webp`)} alt={item.alt} fill sizes="(max-width:760px) 90vw, 46vw" quality={85} />
          </div>)}
        </div>
        <button className="people-details-close" onClick={() => { setExpanded(false); exploreButton.current?.focus({ preventScroll: true }); }} aria-label="Close people story"><span aria-hidden="true">×</span></button>
      </div>
    </div>
  </section>;
}
