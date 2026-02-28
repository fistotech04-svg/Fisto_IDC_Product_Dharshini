import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Icon } from '@iconify/react';
import { X, Pipette, Trash2, Plus, ChevronDown, RefreshCw, RotateCcw } from 'lucide-react';
import PremiumDropdown from './PremiumDropdown';

// Helper Functions
export const rgbToHex = (r, g, b) => {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
};

export const hexToRgb = (hex) => {
  if (!hex) return { r: 255, g: 255, b: 255 };
  let normalized = hex.replace('#', '');
  if (normalized.length === 3) {
    normalized = normalized.split('').map(char => char + char).join('');
  }
  const result = /^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(normalized);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 255, g: 255, b: 255 };
};

export const rgbToHsv = (r, g, b) => {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, v = max;
  const d = max - min;
  s = max === 0 ? 0 : d / max;
  if (max === min) {
    h = 0;
  } else {
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return { h: h * 360, s: s * 100, v: v * 100 };
};

export const hsvToRgb = (h, s, v) => {
  h /= 360; s /= 100; v /= 100;
  let r, g, b;
  const i = Math.floor(h * 6);
  const f = h * 6 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);
  switch (i % 6) {
    case 0: r = v; g = t; b = p; break;
    case 1: r = q; g = v; b = p; break;
    case 2: r = p; g = v; b = t; break;
    case 3: r = p; g = q; b = v; break;
    case 4: r = t; g = p; b = v; break;
    case 5: r = v; g = p; b = q; break;
  }
  // Ensure we cover all cases or use default
  // The original code handled 0-5. 'h * 6' logic usually produces 0-6 range?
  // Original code:
  // switch (i % 6) {
  //   case 0: r = v; g = t; b = p; break;
  //   case 1: r = q; g = v; b = p; break;
  //   case 2: r = p; g = v; b = t; break;
  //   case 3: r = p; g = q; b = v; break;
  //   case 4: r = t; g = p; b = v; break;
  //   case 5: r = v; g = p; b = q; break;
  // }
  // I will stick to original logic.
  if (i % 6 === 0) { r = v; g = t; b = p; }
  else if (i % 6 === 1) { r = q; g = v; b = p; }
  else if (i % 6 === 2) { r = p; g = v; b = t; }
  else if (i % 6 === 3) { r = p; g = q; b = v; }
  else if (i % 6 === 4) { r = t; g = p; b = v; }
  else if (i % 6 === 5) { r = v; g = p; b = q; }
  
  return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
};

export const getColorAtOffset = (offset, stops) => {
    if (!stops || stops.length === 0) return '#FFFFFF';
    const sorted = [...stops].sort((a, b) => a.offset - b.offset);
    if (offset <= sorted[0].offset) return sorted[0].color;
    if (offset >= sorted[sorted.length - 1].offset) return sorted[sorted.length - 1].color;
    for (let i = 0; i < sorted.length - 1; i++) {
        const s1 = sorted[i]; const s2 = sorted[i + 1];
        if (offset >= s1.offset && offset <= s2.offset) {
            const ratio = (offset - s1.offset) / (s2.offset - s1.offset);
            const c1 = hexToRgb(s1.color); const c2 = hexToRgb(s2.color);
            const r = Math.round(c1.r + (c2.r - c1.r) * ratio);
            const g = Math.round(c1.g + (c2.g - c1.g) * ratio);
            const b = Math.round(c1.b + (c2.b - c1.b) * ratio);
            return rgbToHex(r, g, b);
        }
    }
    return '#FFFFFF';
};

export const generateGradientString = (type, stops, angle = 0, radius = 100) => {
    if (!stops || stops.length < 2) return '';
    const sortedStops = [...stops].sort((a, b) => a.offset - b.offset);

    const stopsStr = (scale = 100) => sortedStops.map(s => {
        const rgb = hexToRgb(s.color);
        const opacity = (s.opacity || 100) / 100;
        return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity}) ${s.offset * (scale / 100)}%`;
    }).join(', ');

    switch (type) {
        case 'Radial': 
            return `radial-gradient(circle at center, ${stopsStr(radius)})`;
        case 'Angular': 
            return `conic-gradient(from ${angle}deg at center, ${stopsStr(100)})`;
        case 'Diamond': {
            // A realistic Diamond gradient using 4 quadrants of mirrored linear gradients
            // This creates the midpoint-vertex diamond shown in the user's reference.
            const sStr = stopsStr(radius);
            return `
                linear-gradient(to top left, ${sStr}) 0 0/51% 51% no-repeat,
                linear-gradient(to top right, ${sStr}) 100% 0/51% 51% no-repeat,
                linear-gradient(to bottom left, ${sStr}) 0 100%/51% 51% no-repeat,
                linear-gradient(to bottom right, ${sStr}) 100% 100%/51% 51% no-repeat
            `.replace(/\s+/g, ' ').trim();
        }
        default: 
            return `linear-gradient(${angle}deg, ${stopsStr(100)})`;
    }
};

import ColorPicker from './ColorPallet';

export const CustomColorPicker = React.memo(({ color, onChange, onClose, position, opacity, onOpacityChange }) => {
  return (
    <ColorPicker
      color={color}
      onChange={onChange}
      onClose={onClose}
      opacity={opacity}
      onOpacityChange={onOpacityChange}
      style={{ top: position?.y, left: position?.x, position: 'fixed' }}
    />
  );
});

export const SectionLabel = ({ label }) => (
  <div className="flex items-center gap-[0.3vw] mb-[1.25vw] ">
    <span className="text-[0.85vw] font-semibold text-gray-900 whitespace-nowrap">{label}</span>
    <div className="h-[0.1vw] flex-grow bg-gray-100 "></div>
  </div>
);

export const AdjustmentSlider = ({ label, value, onChange, onReset, min = -100, max = 100, unit = "", color = "#5551FF" }) => {
  const percentage = ((value - min) / (max - min)) * 100;
  return (
    <div className="flex flex-col pt-[0.1vw] py-[0.1vw] pl-[1vw] pr-[1vw]">
      <div className="flex items-center justify-between px-[0.1vw]">
        <div className="flex items-center gap-[0.5vw]">
          <span className="text-[0.75vw] font-semibold text-gray-700 ">{label}</span>
          <button 
            onClick={onReset || (() => onChange(0))}
            className="text-gray-400 hover:text-indigo-600 transition-colors"
            title="Reset"
          >
            <Icon icon="ix:reset" className="w-[1.1vw] h-[1.1vw]" />
          </button>
        </div>
        <span className="text-[0.75vw] font-semibold text-gray-700">
          {value}{unit}
        </span>
      </div>
      <div className="relative flex items-center h-[1.2vw]">
        <input 
          type="range" 
          min={min} 
          max={max} 
          value={value} 
          onChange={(e) => onChange(parseInt(e.target.value))}
          className="w-full h-[0.25vw] bg-[#f8fafc] rounded-full appearance-none cursor-pointer slider-custom"
          style={{ 
            background: `linear-gradient(to right, ${color} 0%, ${color} ${percentage}%, #f1f5f9 ${percentage}%, #f1f5f9 100%)` 
          }}
        />
      </div>
    </div>
  );
};

export const EffectControlRow = ({ label, value, onChange, min = -100, max = 100 }) => {
  const [isDragging, setIsDragging] = useState(false);
  const startXRef = useRef(0);
  const startValRef = useRef(0);

  useEffect(() => {
    if (!isDragging) return;
    const handleMove = (e) => {
      const dx = e.clientX - startXRef.current;
      const newVal = Math.max(min, Math.min(max, startValRef.current + Math.round(dx)));
      onChange(newVal);
    };
    const handleUp = () => { setIsDragging(false); document.body.style.cursor = ''; };
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    document.body.style.cursor = 'ew-resize';
    return () => { window.removeEventListener('mousemove', handleMove); window.removeEventListener('mouseup', handleUp); document.body.style.cursor = ''; };
  }, [isDragging, onChange, min, max]);

  const onMouseDown = (e) => {
    e.preventDefault(); setIsDragging(true);
    startXRef.current = e.clientX; startValRef.current = Number(value);
  };

  return (
    <div className="flex items-center justify-start ">
      <span className="text-[0.625vw] font-medium text-gray-600 w-[3vw] cursor-ew-resize select-none" onMouseDown={onMouseDown}>{label} :</span>
      <div className="flex items-center gap-[0.75vw]">
        <button onClick={() => onChange(Math.max(min, value - 1))} className="text-gray-400 hover:text-gray-600  p-[0.125vw]"><Icon icon="lucide:chevron-left" className="w-[0.75vw] h-[0.75vw]" /></button>
        <div 
           onMouseDown={onMouseDown} 
           className="w-[3vw] h-[1.95vw] border border-gray-200 rounded-[0.25vw] flex items-center justify-center bg-white cursor-ew-resize select-none text-[0.6875vw] text-gray-600 font-medium"
        >
           {value}
        </div>
        <button onClick={() => onChange(Math.min(max, value + 1))} className="text-gray-400 hover:text-gray-600 p-[0.125vw]"><Icon icon="lucide:chevron-right" className="w-[0.75vw] h-[0.75vw]" /></button>
      </div>
    </div>
  );
};

export const DraggableSpan = ({ label, value, onChange, min = 0, max = 100, className }) => {
  const [isDragging, setIsDragging] = useState(false);
  const startXRef = useRef(0);
  const startValRef = useRef(0);

  useEffect(() => {
    if (!isDragging) return;
    const handleMove = (e) => {
      const dx = e.clientX - startXRef.current;
      const newVal = Math.max(min, Math.min(max, startValRef.current + Math.round(dx)));
      onChange(newVal);
    };
    const handleUp = () => { setIsDragging(false); document.body.style.cursor = ''; };
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    document.body.style.cursor = 'ew-resize';
    return () => { window.removeEventListener('mousemove', handleMove); window.removeEventListener('mouseup', handleUp); document.body.style.cursor = ''; };
  }, [isDragging, onChange, min, max]);

  const onMouseDown = (e) => {
    e.preventDefault(); setIsDragging(true);
    startXRef.current = e.clientX; startValRef.current = Number(value);
  };

  return (
    <span className={`${className} cursor-ew-resize select-none`} onMouseDown={onMouseDown}>{label}</span>
  );
};

export const solidPalette = [
  '#FFFFFF', '#FF0000', '#FF9F00', '#C13030', '#FFFF00', '#9EE100', 
  '#2E7D32', '#1B5E20', '#63D0CD', '#00BFA5', '#006064', '#BBDEFB', 
  '#42A5F5', '#2979FF', '#304FFE', '#1A237E', '#D1C4E9', '#FF4081', 
  '#F50057', '#9E9E9E', '#E0E0E0', '#F5F5F5', '#424242', '#000000'
];
