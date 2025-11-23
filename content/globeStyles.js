(() => {
  if (document.getElementById('xglobe-style')) return;
  const style = document.createElement('style');
  style.id = 'xglobe-style';
  style.textContent = `
    :root {
      --xglobe-tooltip-bg: rgba(7, 14, 24, 0.96);
      --xglobe-tooltip-color: #f5f8ff;
      --xglobe-ring-shadow: rgba(0, 0, 0, 0.45);
    }

    @media (prefers-color-scheme: light) {
      :root {
        --xglobe-tooltip-bg: rgba(255, 255, 255, 0.97);
        --xglobe-tooltip-color: #0f172a;
        --xglobe-ring-shadow: rgba(15, 23, 42, 0.2);
      }
    }

    .xglobe-with-marker {
      position: relative;
      overflow: visible;
    }

    .xglobe-marker-slot {
      --xglobe-size: 24px;
      position: absolute;
      top: 100%;
      left: 50%;
      transform: translate(-50%, 4px);
      z-index: 5;
      width: var(--xglobe-size);
      height: var(--xglobe-size);
      pointer-events: none;
    }

    .xglobe-marker-slot--inline {
      position: absolute;
      top: 50%;
      left: 100%;
      transform: translate(8px, -50%);
      width: var(--xglobe-size);
      height: var(--xglobe-size);
      pointer-events: none;
    }

    .xglobe-marker {
      width: var(--xglobe-size);
      height: var(--xglobe-size);
      border-radius: 50%;
      cursor: pointer;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      pointer-events: auto;
    }

    .xglobe-marker__canvas {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      display: block;
    }

    .xglobe-marker__label {
      position: absolute;
      top: 50%;
      left: 100%;
      transform: translateY(-50%);
      margin-left: 12px;
      padding: 8px 12px;
      border-radius: 8px;
      background: rgba(0, 0, 0, 0.9);
      color: #ffffff;
      font-size: 13px;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      white-space: nowrap;
      max-width: 280px;
      overflow: hidden;
      text-overflow: ellipsis;
      opacity: 0;
      transition: opacity 0.2s ease;
      pointer-events: none;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.5);
      z-index: 1000000;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .xglobe-marker__label::before {
      content: '';
      position: absolute;
      top: 50%;
      left: -8px;
      transform: translateY(-50%);
      border-width: 8px;
      border-style: solid;
      border-color: transparent rgba(0, 0, 0, 0.9) transparent transparent;
    }

    #xglobe-tooltip-portal {
      position: fixed;
      z-index: 2147483647;
      pointer-events: none;
      top: 0;
      left: 0;
      padding: 8px 12px;
      border-radius: 8px;
      background: var(--xglobe-tooltip-bg);
      color: var(--xglobe-tooltip-color);
      border: 1px solid rgba(255, 255, 255, 0.1);
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.5);
      font-size: 13px;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      white-space: nowrap;
      opacity: 0;
      transition: opacity 0.15s ease;
      will-change: transform, opacity;
    }

    .xglobe-marker__vpn {
      position: absolute;
      top: -6px;
      right: -6px;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: #f97316;
      color: #0b111a;
      font-weight: 700;
      font-size: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.38);
      border: 2px solid #0b111a;
    }
  `;
  document.head.appendChild(style);
})();
