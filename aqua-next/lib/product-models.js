import * as THREE from 'three';

function surface(sample, uSteps = 48, vSteps = 30) {
  const vertices = [], uv = [], indices = [];
  for (let j = 0; j <= vSteps; j++) {
    for (let i = 0; i <= uSteps; i++) {
      const u = i / uSteps, v = j / vSteps;
      vertices.push(...sample(u, v)); uv.push(u, v);
      if (i < uSteps && j < vSteps) {
        const a = j * (uSteps + 1) + i, b = a + 1, c = a + uSteps + 1, d = c + 1;
        indices.push(a, b, c, b, d, c);
      }
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  geometry.setIndex(indices); geometry.computeVertexNormals();
  return geometry;
}

function mesh(group, geometry, material) {
  const object = new THREE.Mesh(geometry, material);
  object.castShadow = true; group.add(object); return object;
}

function tube(group, points, radius, material, segments = 64) {
  const curve = new THREE.CatmullRomCurve3(points.map(point => new THREE.Vector3(...point)));
  return mesh(group, new THREE.TubeGeometry(curve, segments, radius, 7, false), material);
}

function path(sample, fixed, vertical = false, zOffset = 0.012) {
  return Array.from({ length: 33 }, (_, i) => {
    const point = vertical ? sample(fixed, i / 32) : sample(i / 32, fixed);
    return [point[0], point[1], point[2] + zOffset];
  });
}

function overlay(sample, u, v) {
  const point = sample(u, v);
  return [point[0], point[1], point[2] + 0.012];
}

function sail(materials) {
  const group = new THREE.Group(); group.name = 'Sailing textile form';
  const sample = (u, v) => [
    -1.25 + u * 2.9 * (1 - v * 0.97) ** 0.88 + v * 0.12,
    -2.25 + v * 4.5,
    Math.sin(u * Math.PI) * (0.12 + Math.sin(v * Math.PI) * 0.42),
  ];
  mesh(group, surface(sample), materials.fabric);
  mesh(group, surface((u, v) => overlay(sample, 0.73 + u * 0.15, v), 16, 30), materials.accent);
  mesh(group, surface((u, v) => overlay(sample, 0.9 + u * 0.07, v), 8, 30), materials.dark);
  for (const v of [0.16, 0.32, 0.49, 0.66, 0.82]) {
    tube(group, path(sample, v), 0.008, materials.seam);
    tube(group, path(sample, v + 0.009), 0.003, materials.thread);
  }
  for (const u of [0, 0.37, 0.7, 1]) tube(group, path(sample, u, true), u === 0 || u === 1 ? 0.019 : 0.005, materials.seam);
  tube(group, path(sample, 0), 0.025, materials.edge);
  group.userData.anchors = [sample(0.42, 0.7), sample(0.5, 0.49), sample(0.18, 0.17)];
  return group;
}

function wing(materials) {
  const group = new THREE.Group(); group.name = 'Wing foil textile form';
  const sample = (u, v) => {
    const x = (u - 0.5) * 6.2, tip = Math.abs(x) / 3.1;
    const leading = 0.95 - 1.25 * tip ** 1.7;
    const chord = 1.65 - tip ** 1.5 * 1.05;
    return [x, leading - chord * v, Math.sin(v * Math.PI) * 0.32 * (1 - tip * 0.3) + tip * 0.16];
  };
  mesh(group, surface(sample, 64, 28), materials.fabric);
  mesh(group, surface((u, v) => overlay(sample, u, 0.72 + v * 0.23), 64, 8), materials.accent);
  mesh(group, surface((u, v) => overlay(sample, u, v * 0.1), 64, 5), materials.dark);
  tube(group, path(sample, 0, false, 0.025), 0.115, materials.dark, 96);
  tube(group, path(sample, 1), 0.026, materials.edge);
  tube(group, path(sample, 0.5, true, 0.06), 0.085, materials.dark);
  for (const u of [0.08, 0.19, 0.31, 0.43, 0.57, 0.69, 0.81, 0.92]) {
    tube(group, path(sample, u, true), 0.009, materials.seam);
    tube(group, path(sample, u + 0.003, true), 0.003, materials.thread);
  }
  for (const y of [0.32, -0.26]) tube(group, [[0, y + 0.12, 0.13], [0, y + 0.08, 0.28], [0, y - 0.12, 0.28], [0, y - 0.16, 0.13]], 0.025, materials.edge, 20);
  group.userData.anchors = [sample(0.72, 0.38), sample(0.31, 0.6), sample(0.5, 0.13)];
  return group;
}

function paraglider(materials) {
  const group = new THREE.Group(); group.name = 'Paraglider textile form';
  const sample = (u, v) => {
    const x = (u - 0.5) * 6.4, tip = Math.abs(x) / 3.2;
    const cells = Math.sin(u * Math.PI * 22) ** 2;
    return [x, 1.65 - tip ** 1.6 * 1.1 - v * (1.2 - tip * 0.32), 0.12 + Math.sin(v * Math.PI) * (0.23 + cells * 0.04)];
  };
  mesh(group, surface(sample, 110, 24), materials.fabric);
  mesh(group, surface((u, v) => { const point = sample(u, v); return [point[0], point[1], point[2] - 0.19 * Math.sin(v * Math.PI) - 0.025]; }, 88, 18), materials.underside);
  mesh(group, surface((u, v) => overlay(sample, u, 0.06 + v * 0.21), 88, 9), materials.accent);
  mesh(group, surface((u, v) => overlay(sample, u, 0.83 + v * 0.13), 88, 6), materials.dark);
  for (let i = 1; i < 22; i++) tube(group, path(sample, i / 22, true), 0.006, materials.seam, 24);
  tube(group, path(sample, 0), 0.047, materials.edge, 96);
  tube(group, path(sample, 1), 0.019, materials.edge, 96);
  for (let i = 1; i <= 12; i++) {
    const u = i / 13, endX = u < 0.5 ? -0.24 : 0.24;
    const start = sample(u, 0.98), middle = [start[0] * 0.42, -0.4, -0.06];
    tube(group, [start, middle, [endX, -1.8, 0]], 0.0035, materials.line, 20);
  }
  for (const x of [-0.24, 0.24]) tube(group, [[x, -1.68, 0], [x, -1.99, 0]], 0.026, materials.edge, 8);
  group.userData.anchors = [sample(0.65, 0.46), sample(0.32, 0.72), sample(0.49, 0.12)];
  return group;
}

export function createProductModels(texture = null) {
  const fabric = new THREE.MeshPhysicalMaterial({ color: '#eee9da', roughness: 0.84, metalness: 0, side: THREE.DoubleSide, sheen: 0.65, sheenColor: '#ffffff', sheenRoughness: 0.8, map: texture });
  const materials = {
    fabric,
    underside: new THREE.MeshStandardMaterial({ color: '#d2d3bf', roughness: 0.92, side: THREE.DoubleSide }),
    accent: new THREE.MeshPhysicalMaterial({ color: '#548a88', roughness: 0.73, side: THREE.DoubleSide, sheen: 0.5, map: texture, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }),
    dark: new THREE.MeshStandardMaterial({ color: '#284640', roughness: 0.65, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: -3, polygonOffsetUnits: -3 }),
    seam: new THREE.MeshStandardMaterial({ color: '#b3b3a0', roughness: 0.92 }),
    thread: new THREE.MeshStandardMaterial({ color: '#f9f5df', roughness: 0.92 }),
    edge: new THREE.MeshStandardMaterial({ color: '#34524c', roughness: 0.68 }),
    line: new THREE.MeshStandardMaterial({ color: '#586760', transparent: true, opacity: 0.72, roughness: 0.9 }),
  };
  return { sailing: sail(materials), wingfoil: wing(materials), paragliding: paraglider(materials) };
}

export function disposeModels(models) {
  const geometries = new Set(), materials = new Set();
  Object.values(models).forEach(group => group.traverse(object => {
    if (object.geometry) geometries.add(object.geometry);
    if (object.material) (Array.isArray(object.material) ? object.material : [object.material]).forEach(item => materials.add(item));
  }));
  geometries.forEach(geometry => geometry.dispose()); materials.forEach(material => material.dispose());
}
