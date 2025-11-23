(() => {
  const renderer = {
    render(container, entry, options = {}) {
      if (!container || !entry?.location) return;
      const size = sanitizeSize(options.size);
      container.style.setProperty('--xglobe-size', `${size}px`);

      const marker = ensureMarker(container);
      const canvas = ensureCanvas(marker);
      const accent = options.accent || '#1d9bf0';

      draw(canvas, entry, { accent, size });
      applyLabel(marker, entry.location);
      applyVpnBadge(marker, entry.vpnLikely);
    },
  };

  function sanitizeSize(value) {
    if (!Number.isFinite(value)) return 48;
    return Math.min(72, Math.max(36, Math.round(value)));
  }

  function ensureMarker(container) {
    let marker = container.querySelector('.xglobe-marker');
    if (marker) return marker;

    marker = document.createElement('div');
    marker.className = 'xglobe-marker';

    const canvas = document.createElement('canvas');
    canvas.className = 'xglobe-marker__canvas';
    marker.appendChild(canvas);

    const label = document.createElement('div');
    label.className = 'xglobe-marker__label';
    marker.appendChild(label);

    container.appendChild(marker);
    return marker;
  }

  function ensureCanvas(marker) {
    let canvas = marker.querySelector('canvas');
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.className = 'xglobe-marker__canvas';
      marker.insertBefore(canvas, marker.firstChild || null);
    }
    return canvas;
  }

  function applyLabel(marker, text) {
    const label = marker.querySelector('.xglobe-marker__label');
    if (label) {
      label.textContent = text;
      marker.setAttribute('aria-label', text);
    }
  }

  function applyVpnBadge(marker, vpnLikely) {
    let badge = marker.querySelector('.xglobe-marker__vpn');
    if (!vpnLikely) {
      if (badge) badge.remove();
      return;
    }

    if (!badge) {
      badge = document.createElement('div');
      badge.className = 'xglobe-marker__vpn';
      badge.textContent = 'VPN';
      marker.appendChild(badge);
    }
  }

  function draw(canvas, entry, { accent, size }) {
    const dpr = window.devicePixelRatio || 1;
    const pxSize = size;
    if (canvas.width !== Math.round(pxSize * dpr) || canvas.height !== Math.round(pxSize * dpr)) {
      canvas.width = Math.round(pxSize * dpr);
      canvas.height = Math.round(pxSize * dpr);
      canvas.style.width = `${pxSize}px`;
      canvas.style.height = `${pxSize}px`;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, pxSize, pxSize);

    const center = pxSize / 2;
    const radius = center - 1;
    const palette = getPalette();

    renderGlobe(ctx, center, radius, entry, accent, palette);
  }

  function renderGlobe(ctx, center, radius, entry, accent, palette) {
    ctx.save();

    // Clip to circle
    ctx.beginPath();
    ctx.arc(center, center, radius, 0, Math.PI * 2);
    ctx.clip();

    // Subtle ocean background so the globe is visible on light themes
    if (palette.ocean) {
      ctx.fillStyle = palette.ocean;
      ctx.fillRect(center - radius, center - radius, radius * 2, radius * 2);
    }

    // Draw continents as filled polygons
    drawContinents(ctx, center, radius, entry, accent, palette);

    // Draw location pin
    drawCountryPin(ctx, center, radius, entry, accent, palette);

    ctx.restore();
  }

  function drawContinents(ctx, center, radius, entry, accent, palette) {
    const continents = window.XGlobeContinents || [];
    const lonOffset = 0; // static world orientation
    const centroid = entry?.centroid || null;
    const entryContinent = (entry?.continent || '').toLowerCase();
    const regionOnly = Boolean(entry?.regionOnly);
    const highlightThreshold = 10; // degrees

    for (const shape of continents) {
      const poly = shape.points;
      if (!poly || poly.length < 3) continue;

      // Check if continent should be highlighted
      //  - For specific countries (with centroid, regionOnly === false), we DO NOT
      //    highlight an entire continent; the pin is enough.
      //  - For region-only entries ("Europe", "East Asia & Pacific", etc.), we
      //    highlight by matching the continent name.
      let isHighlighted = false;

      if (regionOnly) {
        if (entryContinent && shape.name && shape.name.toLowerCase() === entryContinent) {
          isHighlighted = true;
        }
      }

      // Draw filled continent
      ctx.beginPath();
      for (let i = 0; i < poly.length; i++) {
        const [lon, lat] = poly[i];
        const [x, y] = project(lat, lon, lonOffset, center, radius);
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.closePath();
      // Make highlighted continents noticeably brighter than the base landmass
      let fillStyle;
      if (isHighlighted) {
        fillStyle = hexToRgba(accent, 0.95);
      } else if (regionOnly) {
        // For pure region selections (e.g. "Caribbean", "North America"),
        // dim non-selected continents so the chosen one really pops.
        fillStyle = palette.regionDim || palette.baseDot;
      } else {
        fillStyle = palette.baseDot;
      }
      ctx.fillStyle = fillStyle;
      ctx.fill();
      
      // Stronger outline on highlighted regions for extra clarity
      ctx.strokeStyle = isHighlighted ? hexToRgba(accent, 0.7) : 'rgba(255,255,255,0.1)';
      ctx.lineWidth = isHighlighted ? 1 : 0.5;
      ctx.stroke();
    }
  }

  function getContinentCenter(shape) {
    if (!shape.points || shape.points.length === 0) return null;
    let sumLat = 0, sumLon = 0;
    for (const [lon, lat] of shape.points) {
      sumLat += lat;
      sumLon += lon;
    }
    return {
      lat: sumLat / shape.points.length,
      lon: sumLon / shape.points.length
    };
  }

  function drawCountryPin(ctx, center, radius, entry, accent, palette) {
    if (!entry?.centroid) return;
    // Keep pin aligned with static world orientation (no extra rotation)
    const [x, y] = project(entry.centroid.lat, entry.centroid.lon, 0, center, radius);
    const pinRadius = Math.max(2.5, radius * 0.08);
    const glow = ctx.createRadialGradient(x, y, 1, x, y, pinRadius * 2.3);
    glow.addColorStop(0, hexToRgba(accent, 0.65));
    glow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(x, y, pinRadius * 1.9, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(x, y, pinRadius, 0, Math.PI * 2);
    ctx.fillStyle = accent;
    ctx.fill();
    ctx.lineWidth = 1;
    ctx.strokeStyle = palette.pinStroke;
    ctx.stroke();
  }

  function getPalette() {
    let light = false;
    try {
      const root = document.documentElement;
      if (root) {
        let scheme = root.style.colorScheme || '';
        if (!scheme) {
          const cs = getComputedStyle(root).getPropertyValue('color-scheme');
          if (cs) scheme = cs;
        }
        scheme = scheme.toLowerCase();
        if (scheme.includes('light')) {
          light = true;
        } else if (scheme.includes('dark')) {
          light = false;
        }
      }
    } catch (e) {}

    if (!light && window.matchMedia?.('(prefers-color-scheme: light)').matches) {
      light = true;
    }
    if (light) {
      return {
        baseDot: 'rgba(15, 20, 25, 0.85)',
        ring: 'rgba(15, 20, 25, 0.18)',
        ringWidth: 0,
        pinStroke: 'rgba(255, 255, 255, 0.9)',
        regionDim: 'rgba(15, 20, 25, 0.6)',
        ocean: 'rgba(0, 0, 0, 0)',
      };
    }
    return {
      baseDot: 'rgba(255, 255, 255, 0.3)', // lighter continents in dark mode
      ring: 'rgba(255, 255, 255, 0.1)',
      ringWidth: 1,
      pinStroke: 'rgba(0, 0, 0, 0.9)',
      // Slightly brighter non-selected continents in dark mode so the globe
      // doesn't look "switched off" when a region is highlighted.
      regionDim: 'rgba(255, 255, 255, 0.16)',
      ocean: 'rgba(0, 0, 0, 0)',
    };
  }

  function project(lat, lon, offsetLon, center, radius) {
    const shiftedLon = normalizeLongitude(lon - offsetLon);
    const x = center + (shiftedLon / 180) * radius;
    const y = center + (-lat / 90) * radius;
    return [x, y];
  }

  function normalizeLongitude(value) {
    return ((value + 540) % 360) - 180;
  }

  function geoDistance(lat1, lon1, lat2, lon2) {
    const toRad = (deg) => (deg * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return (c * 180) / Math.PI; // convert radians back to degrees for easy thresholds
  }

  function hexToRgba(color, alpha) {
    if (!color) return `rgba(29,155,240,${alpha})`;
    if (color.startsWith('rgb')) {
      const values = color
        .replace(/rgba?\(/, '')
        .replace(')', '')
        .split(',')
        .map((v) => Number(v.trim()));
      const [r = 29, g = 155, b = 240] = values;
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    const hex = color.replace('#', '');
    const bigint = parseInt(hex.length === 3 ? hex.repeat(2) : hex, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  window.XGlobeRenderer = renderer;
})();
