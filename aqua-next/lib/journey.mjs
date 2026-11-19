export const productIds = ['sailing', 'wingfoil', 'paragliding'];
export const featureNames = ['Materials', 'Stitching', 'Construction'];
export const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, value));

export function getJourneyState(progress) {
  const chapter = clamp(progress) * productIds.length;
  const index = Math.min(productIds.length - 1, Math.floor(chapter));
  const local = clamp(chapter - index);
  return {
    index,
    id: productIds[index],
    local,
    phase: local < 0.22 ? -1 : Math.min(2, Math.floor((local - 0.22) / 0.26)),
  };
}

export function progressForProduct(id, phase = -1) {
  const index = productIds.indexOf(id);
  if (index < 0) return null;
  const local = phase < 0 ? 0.06 : 0.22 + clamp(phase, 0, 2) * 0.26 + 0.12;
  return (index + local) / productIds.length;
}

// All rotations are radians. Three.js applies these to real model geometry.
export function getModelPose(id, progress, compact = false, reduced = false) {
  const local = clamp(progress);
  const reveal = reduced ? 1 : clamp(local / 0.22);
  const eased = 1 - (1 - reveal) ** 3;
  const detail = reduced ? 0.25 : clamp((local - 0.22) / 0.78);
  return {
    x: compact ? 0 : -0.7 + (1 - eased) * 2,
    y: (1 - eased) * -1.5 + (id === 'paragliding' ? 0.12 : 0),
    scale: (0.65 + eased * 0.35) * (id === 'sailing' ? 0.9 : 1.05) * (1 + Math.sin(detail * Math.PI) * 0.13),
    rotationX: id === 'paragliding' ? -0.12 + detail * 0.28 : -0.12 + detail * 0.2,
    rotationY: reduced ? -0.15 : -0.65 + eased * 0.3 + detail * 0.95,
    rotationZ: (id === 'sailing' ? -0.13 : id === 'wingfoil' ? -0.17 : 0.08) + (1 - eased) * 0.25 - detail * 0.1,
  };
}
