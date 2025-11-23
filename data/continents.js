(() => {
  const CONTINENT_SHAPES = [
    {
      name: 'North America',
      points: [
        [-168, 65], [-120, 60], [-120, 50], [-125, 40], [-110, 25], // West Coast
        [-90, 15],  [-80, 10],  [-80, 25],  [-65, 45], // Florida/East Coast
        [-55, 50],  [-60, 60],  [-80, 65],  [-90, 70], // Canada/Greenland area
        [-110, 70], [-140, 70], [-168, 65]
      ]
    },
    {
      name: 'South America',
      points: [
        [-78, 10], [-75, -5],  [-73, -15], [-75, -40], // West Coast
        [-70, -55], [-65, -55], // Tip
        [-60, -40], [-50, -30], [-40, -20], [-35, -5], // East Coast (Brazil)
        [-50, 5],   [-60, 10],  [-70, 12],  [-78, 10]  // North Coast
      ]
    },
    {
      name: 'Europe',
      points: [
        [-10, 36],  [-5, 42],   [-5, 48],   [5, 52],    // Spain/France
        [-5, 55],   [-5, 58],   [5, 60],    [10, 60],   [20, 70], // UK/Scandinavia
        [30, 70],   [40, 65],   [40, 45],   [25, 35],   // Eastern Europe/Turkey
        [15, 38],   [10, 40],   [0, 36],    [-10, 36]   // Italy/Med
      ]
    },
    {
      name: 'Africa',
      points: [
        [-15, 35],  [0, 35],    [20, 30],   [35, 30],   // North Africa
        [40, 15],   [52, 12],   [40, -5],   [40, -15],  // Horn of Africa/East
        [35, -30],  [20, -35],  [15, -30],  [10, -5],   // South/West
        [0, 5],     [-18, 15],  [-15, 35]
      ]
    },
    {
      name: 'Asia',
      points: [
        [26, 35],   [40, 45],   [50, 60],   [60, 70],   // Ural/Russia
        [100, 75],  [140, 70],  [170, 65],  [160, 50],  // Siberia/Kamchatka
        [140, 35],  [120, 30],  [120, 20],  [100, 10],  // China/SE Asia
        [80, 5],    [70, 20],   [60, 25],   [50, 15],   [40, 15], // India/Arabia
        [35, 25],   [26, 35]
      ]
    },
    {
      name: 'Oceania',
      points: [
        [115, -20], [130, -12], [145, -10], [150, -25], // North/East Aus
        [150, -38], [140, -38], [130, -32], [115, -35], // South Aus
        [112, -25], [115, -20]
      ]
    },
    {
      name: 'Antarctica', // Added for completeness
      points: [
        [-180, -75], [-90, -75], [0, -75], [90, -75], [180, -75],
        [180, -89], [-180, -89], [-180, -75]
      ]
    }
  ];

  window.XGlobeContinents = CONTINENT_SHAPES;
})();