import React, { useState } from 'react';
import { Icon } from '@iconify/react';
import PremiumDropdown from './PremiumDropdown';
import * as BookAppearanceHelpers from './bookAppearanceHelpers';
import { 
  CustomColorPicker, 
  EffectControlRow, 
  DraggableSpan 
} from './AppearanceShared';

const BookAppearanceSection = ({ 
  bookAppearanceSettings, 
  onUpdateBookAppearance 
}) => {
  const [showShadowColorPicker, setShowShadowColorPicker] = useState(false);
  const [shadowPickerPos, setShadowPickerPos] = useState({ x: 0, y: 0 });

  return (
    <div className="p-[1vw]">
      {/* Book Paper Texture */}
      <div className="space-y-[1vw]">
        <div className="flex items-center mb-[0.2vw]">
          <h3 className="text-[0.85vw] font-semibold text-gray-900 whitespace-nowrap">Book Paper Texture</h3>
          <div className="h-[1px] bg-gray-200 flex-grow mt-[0.2vw]"></div>
        </div>
        <p className="text-[0.6vw] text-gray-400 font-regular leading-relaxed mb-[0.5vw]">
          The chosen paper texture will be applied to every page of the flipbook.
        </p>
        
        <div className="flex items-center gap-[0.5vw] py-[0.5vw] pl-[0.3vw]">
          <div className="relative group">
            <div className="w-[4.5vw] h-[4.5vw] bg-white rounded-[1vw] shadow-sm border border-gray-200 overflow-hidden flex items-center justify-center transition-transform hover:scale-105 duration-300">
              {bookAppearanceSettings?.texture && bookAppearanceSettings.texture !== 'Plain White' ? (
                <div 
                   className="w-full h-full"
                   style={{
                      backgroundImage: BookAppearanceHelpers.processBookAppearanceSettings(bookAppearanceSettings).textureStyle.backgroundImage,
                      backgroundSize: 'cover',
                      opacity: 0.8
                   }}
                />
              ) : (
                <div className="w-full h-full bg-[#f3f4f6]" />
              )}
              <div className="absolute inset-0 shadow-[inset_0_0_1vw_rgba(0,0,0,0.05)] pointer-events-none" />
            </div>
          </div>
          
          <div className="flex-1 space-y-[1vw]">
            <div className="flex items-center ">
              <span className="text-[0.75vw] font-semibold text-gray-700 pr-[0.5vw]">Texture :</span>
              <PremiumDropdown 
                options={['Plain White', 'Soft Matte Paper', 'Premium Art Paper', 'Photo Album Paper', 'Soft Linen Paper', 'Light Grain Paper', 'Fine Texture Paper', 'Smooth Print Paper', 'Fiber Paper',  'Canvas Texture', 'Kraft Paper', 'Felt Paper', 'Watermarked Paper', 'Premium Vellum']}
                value={bookAppearanceSettings?.texture || 'Soft Matte Paper'}
                onChange={(opt) => onUpdateBookAppearance({...bookAppearanceSettings, texture: opt})}
                width="9vw"
                className="!border-gray-900 !rounded-[0.5vw]"
                align="right"
              />
            </div>
            
            <div className="flex items-center justify-between">
               <div className="flex items-center gap-[0.4vw]">
                  <span className="text-[0.75vw] font-semibold text-gray-700">Hard Cover Pages</span>
                  <div className="group relative">
                     <Icon icon="ph:info-bold" className="text-gray-900 w-[1vw] h-[1vw] cursor-help" />
                     <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-[10vw] p-2 bg-gray-800 text-white text-[0.65vw] rounded-[0.5vw] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-[100] shadow-xl">
                        Applies a thicker paper feel to the first and last pages.
                     </div>
                  </div>
               </div>
               <button 
                 onClick={() => onUpdateBookAppearance({...bookAppearanceSettings, hardCover: !bookAppearanceSettings?.hardCover})}
                 className={`w-[2.2vw] h-[1.1vw] rounded-full relative transition-all duration-300 ${bookAppearanceSettings?.hardCover ? 'bg-[#5551FF]' : 'bg-[#E5E7EB]'}`}
               >
                 <div className={`absolute top-[0.15vw] w-[0.8vw] h-[0.8vw] bg-white rounded-full shadow-sm transition-all duration-300 ${bookAppearanceSettings?.hardCover ? 'left-[1.25vw]' : 'left-[0.15vw]'}`} />
               </button>
            </div>
          </div>
        </div>
      </div>

      {/* Sliders Section */}
      <div className="space-y-[0.5vw] pb-[0.8vw] pt-[0.8vw] pl-[0.3vw]">
        {[
          { label: 'Grain Intensity', key: 'grainIntensity', min: -100, max: 100 },
          { label: 'Warmth', key: 'warmth', min: -100, max: 100 },
          { label: 'Texture Scale', key: 'textureScale', min: -50, max: 50 },
          { label: 'Opacity', key: 'opacity', min: 0, max: 100 }
        ].map((item) => {
          let val = bookAppearanceSettings?.[item.key] ?? (item.key === 'opacity' ? 100 : 0);
          
          return (
            <div key={item.key} className="space-y-[0.1vw] ">
              <div className="flex items-center">
                <DraggableSpan 
                  label={item.label} 
                  value={val} 
                  onChange={(v) => onUpdateBookAppearance({...bookAppearanceSettings, [item.key]: v})}
                  min={item.min} 
                  max={item.max} 
                  className="text-[0.75vw] font-semibold text-gray-700" 
                />
                <Icon 
                  icon="ix:reset" 
                  className="w-[0.9vw] h-[0.9vw] text-gray-400 cursor-pointer hover:text-gray-600 transition-colors" 
                  onClick={() => onUpdateBookAppearance({...bookAppearanceSettings, [item.key]: item.key === 'opacity' ? 100 : 0})} 
                />
              </div>
              
              <div className="flex items-center gap-[0.5vw]">
                <div className="flex-1 relative h-[0.8vw] flex items-center">
                  <input
                    type="range"
                    min={item.min}
                    max={item.max}
                    value={val}
                    onChange={(e) => onUpdateBookAppearance({...bookAppearanceSettings, [item.key]: parseInt(e.target.value)})}
                    className={`w-full h-[0.4vw] rounded-full appearance-none cursor-pointer accent-[#5551FF] z-10 bg-transparent`}
                  />
                  <div 
                    className="absolute inset-x-0 h-[0.2vw] rounded-full -z-0"
                    style={{ 
                      background: item.key === 'warmth' 
                        ? 'linear-gradient(to right, #4387f5ff 0%, #E5E7EB 50%, #FFE4B5 100%)' 
                        : '#E5E7EB'
                    }}
                  >
                    { (item.key === 'opacity') && (
                       <div 
                         className="h-full bg-[#5551FF] rounded-full" 
                         style={{ 
                           width: `${((val - item.min) / (item.max - item.min)) * 100}%` 
                         }} 
                       />
                    )}
                    {(item.key !== 'opacity' && item.key !== 'warmth') && (
                      <div 
                        className="absolute top-0 bottom-0 bg-[#5551FF] rounded-full" 
                        style={{ 
                          left: val >= 0 ? '50%' : `${50 - (Math.abs(val) / item.max * 50)}%`, 
                          width: `${(Math.abs(val) / item.max * 50)}%` 
                        }} 
                      />
                    )}
                  </div>
                </div>
                <div className="flex items-center">
                  <div 
                    className="w-[2.5vw] h-[1.2vw] flex items-center justify-between pl-[0.5vw]  cursor-ew-resize select-none text-[0.75vw] font-semibold text-gray-700"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      const startX = e.clientX;
                      const startVal = val;
                      const handleMove = (moveEvent) => {
                        const dx = moveEvent.clientX - startX;
                        const newVal = Math.max(item.min, Math.min(item.max, startVal + Math.round(dx)));
                        onUpdateBookAppearance({...bookAppearanceSettings, [item.key]: newVal});
                      };
                      const handleUp = () => { window.removeEventListener('mousemove', handleMove); window.removeEventListener('mouseup', handleUp); };
                      window.addEventListener('mousemove', handleMove);
                      window.addEventListener('mouseup', handleUp);
                    }}
                  >
                    {val}{item.key === 'opacity' ? '%' : ''}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="space-y-[0.75vw]">
        <div className="flex items-center gap-[1vw] ">
          <span className="text-[0.85vw] font-semibold text-gray-900 whitespace-nowrap">Page Flipping Styles</span>
          <div className="h-[1px] bg-gray-200 flex-grow mt-[0.2vw]"></div>
        </div>
        <div className="flex items-center justify-between mt-[1vw] pl-[0.5vw] ">
          <span className="text-[0.75vw] font-semibold text-gray-700">Flip Style :</span>
          <PremiumDropdown
            options={['Classic Flip', 'Smooth Flip', 'Fast Flip', 'Page Curl', '3D Flip', 'Slide Pages']}
            value={bookAppearanceSettings?.flipStyle || 'Classic Flip'}
            onChange={(opt) => onUpdateBookAppearance({ ...bookAppearanceSettings, flipStyle: opt })}
            width="10vw"
            align="right"
          />
        </div>
        <div className="flex items-center justify-between pl-[0.5vw]  pb-[1vw]">
          <span className="text-[0.75vw] font-semibold text-gray-700">Flip Speed :</span>
          <PremiumDropdown
            options={['Slow', 'Medium', 'Fast']}
            value={bookAppearanceSettings?.flipSpeed || 'Slow'}
            onChange={(opt) => onUpdateBookAppearance({ ...bookAppearanceSettings, flipSpeed: opt })}
            width="10vw"
            align="right"
          />
        </div>
      </div>

      <div className="space-y-[0.75vw]">
        <div className="flex items-center gap-[1vw]">
          <span className="text-[0.85vw] font-semibold text-gray-900 whitespace-nowrap">Book Corner Radius</span>
          <div className="h-[1px] bg-gray-200 flex-grow mt-[0.2vw]"></div>
        </div>
        <div className="flex items-center justify-between mt-[1vw] pl-[0.5vw] pb-[1vw]">
          <div className="flex items-center gap-[0.5vw]">
            <Icon icon="material-symbols:rounded-corner" className="w-[1vw] h-[1vw] text-gray-400" />
            <span className="text-[0.75vw] font-semibold text-gray-700">Corner Radius :</span>
          </div>
          <PremiumDropdown
            options={['Sharp', 'Soft', 'Round']}
            value={bookAppearanceSettings?.corner || 'Sharp'}
            onChange={(opt) => onUpdateBookAppearance({ ...bookAppearanceSettings, corner: opt })}
            width="10vw"
            align="right"
          />
        </div>
      </div>

      <div className="space-y-[0.75vw]">
        <div className="flex items-center gap-[1vw]">
          <span className="text-[0.85vw] font-semibold text-gray-900 whitespace-nowrap">Drop Shadow</span>
          <div className="h-[1px] bg-gray-200 flex-grow mt-[0.2vw]"></div>
        </div>
        <div className="flex items-center gap-[0.75vw]">
          <div
            className="w-[4vw] h-[4vw] bg-gray-800 rounded-[0.5vw] flex items-center justify-center text-white/50 text-[0.6vw] cursor-pointer"
            style={{ background: `linear-gradient(135deg, ${bookAppearanceSettings?.dropShadow?.color || '#000'}, transparent)` }}
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              setShadowPickerPos({ x: rect.left - 100, y: rect.top - 100 });
              setShowShadowColorPicker(true);
            }}
          >
            {bookAppearanceSettings?.dropShadow?.opacity || 0}%
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between px-2 py-1 border rounded bg-gray-50">
               <span className="text-[0.7vw] font-mono">{bookAppearanceSettings?.dropShadow?.color || '#000000'}</span>
               <Icon icon="mdi:pipette-varian" className="w-3 h-3 text-gray-400" />
            </div>
            <input
              type="range"
              min="0" max="100"
              value={bookAppearanceSettings?.dropShadow?.opacity || 0}
              onChange={(e) => onUpdateBookAppearance({ ...bookAppearanceSettings, dropShadow: { ...bookAppearanceSettings.dropShadow, opacity: parseInt(e.target.value) } })}
              className="w-full h-1 accent-[#5551FF]"
            />
          </div>
        </div>
        
        <div className="space-y-1">
          {['X Axis', 'Y Axis', 'Blur %', 'Spread'].map((label, idx) => {
            const keys = ['xAxis', 'yAxis', 'blur', 'spread'];
            const key = keys[idx];
            return (
              <EffectControlRow
                key={key}
                label={label}
                value={bookAppearanceSettings?.dropShadow?.[key] || 0}
                onChange={(v) => onUpdateBookAppearance({ ...bookAppearanceSettings, dropShadow: { ...bookAppearanceSettings.dropShadow, [key]: v } })}
                min={key === 'spread' ? -20 : -50} 
                max={50}
              />
            );
          })}
        </div>
      </div>

      <div className="space-y-[1.2vw] pt-[1vw]">
        <div className="flex items-center gap-[1vw]">
          <span className="text-[0.85vw] font-semibold text-gray-900 whitespace-nowrap">Flipbook Instructions</span>
          <div className="h-[1px] bg-gray-200 flex-grow mt-[0.2vw]"></div>
        </div>
        <div className="space-y-[1vw] pl-[0.5vw] ">
          {['first', 'every'].map((type) => (
            <label key={type} className="flex items-center gap-[0.8vw] cursor-pointer">
              <div className={`w-[1vw] h-[1vw] rounded-full border flex items-center justify-center ${bookAppearanceSettings?.instructions === type ? 'border-[#5551FF]' : 'border-gray-200'}`}>
                {bookAppearanceSettings?.instructions === type && <div className="w-[0.6vw] h-[0.6vw] bg-[#5551FF] rounded-full" />}
              </div>
              <input type="radio" checked={bookAppearanceSettings?.instructions === type} onChange={() => onUpdateBookAppearance({ ...bookAppearanceSettings, instructions: type })} className="hidden" />
              <span className="text-[0.75vw] text-gray-700">{type === 'first' ? 'Provide on Very first time only' : 'Provide on Every time they open'}</span>
            </label>
          ))}
        </div>
      </div>

      {showShadowColorPicker && (
        <CustomColorPicker
          color={bookAppearanceSettings?.dropShadow?.color || '#000000'}
          onChange={(newColor) => onUpdateBookAppearance({ ...bookAppearanceSettings, dropShadow: { ...bookAppearanceSettings.dropShadow, color: newColor } })}
          onClose={() => setShowShadowColorPicker(false)}
          position={shadowPickerPos}
        />
      )}
    </div>
  );
};

export default BookAppearanceSection;
