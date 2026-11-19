export const products = [
  {
    id: 'sailing', name: 'Sailing', number: '01', image: 'sailing.jpg', tone: 'green',
    alt: 'Racing yachts with technical sails on open water',
    line: 'Every panel. Every seam. Made to catch the wind.',
    brief: 'Your design, brought to life through precision cutting and specialist sailmaking.',
    traits: [['Precise', 'Considered in every cut.'], ['Skilled', 'Craft in every seam.'], ['Consistent', 'From prototype to production.']],
    points: [
      { x: 43, y: 29, title: 'Panel construction', copy: 'Carefully cut panels, assembled to your design.' },
      { x: 64, y: 49, title: 'Specialist stitching', copy: 'Skilled sewing for demanding textile constructions.' },
      { x: 37, y: 69, title: 'Attention to detail', copy: 'Quality checks throughout the making process.' },
    ],
    specs: [['Element', 'Wind + water'], ['Speciality', 'Sail manufacturing'], ['Process', 'Cut · sew · finish'], ['Partnership', 'Development to production']],
  },
  {
    id: 'wingfoil', name: 'Wing foil', number: '02', image: 'wingfoil.jpg', tone: 'orange',
    alt: 'Wing foiler lifting above the turquoise sea',
    line: 'Light in your hands. Freedom under your feet.',
    brief: 'Specialist textile manufacturing for a new way to move across the water.',
    traits: [['Considered', 'Details that make a difference.'], ['Collaborative', 'Built around your design.'], ['Adaptable', 'Ready for your next idea.']],
    points: [
      { x: 43, y: 23, title: 'Technical textiles', copy: 'Material handling that respects your product design.' },
      { x: 57, y: 39, title: 'Complex construction', copy: 'Specialist sewing brings demanding shapes together.' },
      { x: 37, y: 52, title: 'Development support', copy: 'A close partnership from first sample to production.' },
    ],
    specs: [['Element', 'Wind + water'], ['Speciality', 'Wing foil'], ['Process', 'Develop · craft · scale'], ['Partnership', 'Your vision, our craft']],
  },
  {
    id: 'paragliding', name: 'Paragliding', number: '03', image: 'paragliding.jpg', tone: 'blue',
    alt: 'Paraglider soaring over a mountain coastline',
    line: 'A little closer to the sky. A lot of care on the ground.',
    brief: 'Complex textile designs, crafted with precision for the world above.',
    traits: [['Detailed', 'Every panel has a purpose.'], ['Experienced', 'People who know their craft.'], ['Connected', 'Working with your team.']],
    points: [
      { x: 50, y: 22, title: 'Complex panel designs', copy: 'Precision cutting for technically demanding forms.' },
      { x: 65, y: 36, title: 'Careful assembly', copy: 'Skilled hands bring the smallest details together.' },
      { x: 49, y: 53, title: 'Quality throughout', copy: 'Attention at every step, from material to finished product.' },
    ],
    specs: [['Element', 'Air'], ['Speciality', 'Paragliding'], ['Process', 'Precision textile assembly'], ['Partnership', 'Prototype to production']],
  },
];

export const sectors = [
  { name: 'Sailing', image: 'sailing.jpg', category: 'water', target: 'sailing', copy: 'Precision sailmaking. Ready for the wind.' },
  { name: 'Paragliding', image: 'paragliding.jpg', category: 'air', target: 'paragliding', copy: 'Complex textiles, carefully brought together.' },
  { name: 'Wing foil', image: 'wingfoil.jpg', category: 'water', target: 'wingfoil', copy: 'Specialist craft for a new kind of freedom.' },
  { name: 'Kitesurf', image: 'kitesurf.jpg', category: 'water', copy: 'Technical soft goods, built around your design.' },
  { name: 'Windsurf', image: 'windsurf.jpg', category: 'water', copy: 'Material expertise. Precision construction.' },
  { name: 'Emerging industries', image: 'emerging.jpg', category: 'beyond', copy: 'Taking textile expertise into new territory.' },
  { name: 'Tents & accessories', image: 'tents.webp', category: 'beyond', copy: 'Considered textile manufacturing for life outside.' },
];

export const chapters = [
  { title: 'Imagine it.', image: 'factory.jpg', label: '01 / DEVELOPMENT', copy: 'Your idea. A shared starting point.', details: ['Design collaboration', 'Prototype development'] },
  { title: 'Make it.', image: 'craft.png', label: '02 / MANUFACTURING', copy: 'Precision in every cut and seam.', details: ['Specialist textile craft', 'Quality throughout'] },
  { title: 'Move the world.', image: 'people.jpg', label: '03 / PARTNERSHIP', copy: 'Made in Sri Lanka. In motion everywhere.', details: ['Skilled people', 'Long-term partnerships'] },
];
