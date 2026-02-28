import React, { useState } from 'react';
import { Icon } from '@iconify/react';
import PremiumDropdown from './PremiumDropdown';
import * as BookAppearanceHelpers from './bookAppearanceHelpers';
import { 
  CustomColorPicker, 
  AdjustmentSlider, 
  SectionLabel 
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
        <SectionLabel label="Book Paper Texture" />
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
      <div className="space-y-[0.4vw] pb-[0.8vw] pt-[0.8vw]">
        {[
          { label: 'Grain Intensity', key: 'grainIntensity', min: -100, max: 100 },
          { label: 'Warmth', key: 'warmth', min: -100, max: 100 },
          { label: 'Texture Scale', key: 'textureScale', min: -50, max: 50 },
          { label: 'Opacity', key: 'opacity', min: 0, max: 100, unit: '%' }
        ].map((item) => (
          <AdjustmentSlider 
            key={item.key}
            label={item.label}
            value={bookAppearanceSettings?.[item.key] ?? (item.key === 'opacity' ? 100 : 0)}
            onChange={(v) => onUpdateBookAppearance({...bookAppearanceSettings, [item.key]: v})}
            onReset={() => onUpdateBookAppearance({...bookAppearanceSettings, [item.key]: item.key === 'opacity' ? 100 : 0})}
            min={item.min}
            max={item.max}
            unit={item.unit || ""}
          />
        ))}
      </div>

      <div className="space-y-[0.75vw] mt-[1vw]">
        <SectionLabel label="Page Flipping Styles" />
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

      <div className="space-y-[0.75vw] mt-[1.5vw]">
        <SectionLabel label="Book Corner Radius" />
        <div className="flex items-center justify-between pb-[1vw]">
          <div className="flex items-center gap-[0.75vw] text-gray-600 pl-[0.2vw]">
            <Icon icon="material-symbols:rounded-corner" className="w-[1.2vw] h-[1.2vw]" />
            <span className="text-[0.85vw] font-bold text-[#1a1c3d]">Corner Radius :</span>
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

      <div className="space-y-[0.75vw] mt-[1vw]">
        <SectionLabel label="Drop Shadow" />
        <div className="flex items-start gap-[1.25vw] pl-[0.2vw] py-[0.5vw]">
          {/* Shadow Preview Box */}
          <div
            className="w-[5.5vw] h-[5.5vw] rounded-[0.5vw] flex items-center justify-center text-white text-[0.85vw] font-bold cursor-pointer transition-transform hover:scale-105"
            style={{ 
              background: `linear-gradient(to bottom, ${bookAppearanceSettings?.dropShadow?.color || '#000000'} 0%, transparent 100%)`,
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0'
            }}
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              setShadowPickerPos({ x: rect.left - 200, y: rect.top - 100 });
              setShowShadowColorPicker(true);
            }}
          >
            {bookAppearanceSettings?.dropShadow?.opacity || 0} %
          </div>
          
          <div className="flex-1 space-y-[1.2vw]">
            {/* Hex Code Input */}
            <div className="flex items-center justify-between">
              <span className="text-[0.85vw] font-bold text-[#1a1c3d]">Code :</span>
              <div 
                className="flex items-center justify-between w-[10vw] px-[0.75vw] py-[0.5vw] border border-gray-200 rounded-[0.5vw] bg-white cursor-pointer hover:border-blue-400 transition-colors"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  setShadowPickerPos({ x: rect.left - 200, y: rect.top - 100 });
                  setShowShadowColorPicker(true);
                }}
              >
                <span className="text-[0.85vw] font-mono text-gray-500 uppercase tracking-tighter">
                  {bookAppearanceSettings?.dropShadow?.color || '#000000'}
                </span>
                <Icon icon="mdi:pipette" className="w-[1.1vw] h-[1.1vw] text-gray-400" />
              </div>
            </div>

            {/* Opacity Row */}
            <div className="flex items-center justify-between gap-[0.5vw]">
               <span className="text-[0.85vw] font-bold text-[#1a1c3d] whitespace-nowrap">Opacity :</span>
               <div className="flex-1 flex items-center gap-[0.75vw]">
                  <input
                    type="range"
                    min="0" max="100"
                    value={bookAppearanceSettings?.dropShadow?.opacity || 0}
                    onChange={(e) => onUpdateBookAppearance({ ...bookAppearanceSettings, dropShadow: { ...bookAppearanceSettings.dropShadow, opacity: parseInt(e.target.value) } })}
                    className="flex-1 h-[0.35vw] bg-[#f1f5f9] rounded-full appearance-none cursor-pointer slider-custom"
                    style={{ 
                      background: `linear-gradient(to right, #5551FF 0%, #5551FF ${bookAppearanceSettings?.dropShadow?.opacity || 0}%, #f1f5f9 ${bookAppearanceSettings?.dropShadow?.opacity || 0}%, #f1f5f9 100%)` 
                    }}
                  />
                  <span className="text-[0.85vw] font-bold text-[#1a1c3d] w-[2.2vw] text-right">
                    {bookAppearanceSettings?.dropShadow?.opacity || 0} %
                  </span>
               </div>
            </div>
          </div>
        </div>
        
        {/* Additional Shadow Controls */}
        <div className="space-y-[0.1vw] mt-[0.5vw]">
          {['X Axis', 'Y Axis', 'Blur %', 'Spread'].map((label, idx) => {
            const keys = ['xAxis', 'yAxis', 'blur', 'spread'];
            const key = keys[idx];
            return (
              <AdjustmentSlider
                key={key}
                label={label}
                value={bookAppearanceSettings?.dropShadow?.[key] || 0}
                onChange={(v) => onUpdateBookAppearance({ ...bookAppearanceSettings, dropShadow: { ...bookAppearanceSettings.dropShadow, [key]: v } })}
                onReset={() => onUpdateBookAppearance({ ...bookAppearanceSettings, dropShadow: { ...bookAppearanceSettings.dropShadow, [key]: 0 } })}
                min={key === 'spread' ? -20 : -50} 
                max={50}
              />
            );
          })}
        </div>
      </div>

      <div className="space-y-[1.2vw] mt-[1.5vw]">
        <SectionLabel label="Flipbook Instructions" />
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
