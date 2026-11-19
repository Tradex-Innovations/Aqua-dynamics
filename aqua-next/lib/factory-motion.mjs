const clamp = value => Math.max(0, Math.min(1, value));
const phase = (value, start, end) => clamp((value - start) / (end - start));
const smooth = value => value * value * (3 - 2 * value);
const mix = (start, end, amount) => start + (end - start) * amount;

export const factoryChapterStops = [.48, .70, .91];

export function factoryMotion(progress, width, height, reduced = false) {
  const p = clamp(progress);
  const lift = smooth(phase(p, .10, .22));
  const grow = smooth(phase(p, .22, .39));
  const thumbnailWidth = width * (width <= 760 ? .255 : .152);
  const gap = width * .008;
  const centreWidth = width * (width <= 760 ? .82 : .46);
  const centreHeight = Math.min(height * .52, centreWidth * .61);
  const active = p < .61 ? 0 : p < .80 ? 1 : 2;
  const opening = {
    x: width / 2,
    y: mix(mix(height * .965 - thumbnailWidth * 9 / 16, height * .36, lift), 0, grow),
    width: mix(mix(thumbnailWidth, centreWidth, lift), width, grow),
    height: mix(mix(thumbnailWidth * 9 / 16, centreHeight, lift), height, grow),
    radius: mix(6, 0, grow),
  };
  const cards = [0, 1, 2].map(index => {
    if (reduced || p >= .39) return { x: width / 2, y: 0, width, height, radius: 0, opacity: index === active || reduced ? 1 : 0 };
    if (index === 0) return { ...opening, opacity: 1 };
    return {
      x: width / 2 + (index === 1 ? -1 : 1) * (thumbnailWidth + gap),
      y: height * .965 - thumbnailWidth * 9 / 16 + lift * height * .06,
      width: thumbnailWidth, height: thumbnailWidth * 9 / 16, radius: 6,
      opacity: 1 - phase(p, .10, .18),
    };
  });
  return {
    active,
    cards,
    headlineReveal: reduced ? 0 : phase(p, .015, .09),
    introOpacity: reduced ? 0 : 1 - phase(p, .22, .28),
    overlayReveal: reduced ? 1 : phase(p, .40, .45),
    darkHeader: reduced || grow > .65,
  };
}
