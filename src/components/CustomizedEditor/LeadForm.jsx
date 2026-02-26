import React, { useState } from 'react';
import { Icon } from '@iconify/react';
import PremiumDropdown from './PremiumDropdown';

const fontFamilies = [
  'Arial', 'Times New Roman', 'Courier New', 'Georgia', 'Verdana',
  'Helvetica', 'Poppins', 'Roboto', 'Open Sans', 'Lato', 'Montserrat',
  'Inter', 'Playfair Display', 'Oswald', 'Merriweather'
];

const Switch = ({ enabled, onChange }) => (
  <button
    onClick={(e) => {
      e.stopPropagation();
      onChange(!enabled);
    }}
    className={`group relative inline-flex items-center h-[1vw] w-[2.8vw] shrink-0 cursor-pointer rounded-[1vw] transition-all duration-200 ease-in-out border outline-none ${
              enabled ? 'bg-[#4A3AFF] border-[#4A3AFF]' : 'bg-transparent border-[#4A3AFF]'
            }`}
          >
            <div
              className={`pointer-events-none flex items-center justify-center h-[1.3vw] w-[1.3vw] rounded-full bg-[#4A3AFF] shadow-sm transition-all duration-200 ease-in-out absolute  ${
                enabled ? 'left-[1.5vw]' : 'right-[1.5vw]'
              }`}
            >
              {enabled && (
                <Icon icon="lucide:check" className="w-[0.9vw] h-[0.9vw] text-white " />
              )}
    </div>
  </button>
);

const LeadForm = ({ onBack, settings, onUpdate, pages = [] }) => {
  const [isColorOpen, setIsColorOpen] = useState(true);

  const updateNested = (category, field, value) => {
    onUpdate({
      ...settings,
      [category]: {
        ...settings[category],
        [field]: value
      }
    });
  };

  const updateAppearance = (field, value) => {
    onUpdate({
      ...settings,
      appearance: {
        ...settings.appearance,
        [field]: value
      }
    });
  };

  return (
    <div className="flex flex-col h-full bg-[#f8f9fa] text-[0.8vw] custom-scrollbar">
      {/* Header */}
      <div className="flex flex-col py-[1vw] px-[1.25vw] bg-white border-b border-gray-100">
        <div className="flex items-center justify-between mb-[0.5vw]">
          <div className="flex items-center gap-[0.75vw]">
            
              <Icon icon="fluent:form-48-regular" className="w-[1vw] h-[1vw]" />
           
            <span className="text-[1vw] font-semibold text-gray-900">Lead Form</span>
          </div>
          <button 
            onClick={onBack}
            className="p-[0.4vw] hover:bg-gray-100 rounded-full transition-colors"
          >
            <Icon icon="ic:round-arrow-back" className="w-[1.2vw] h-[1.2vw] text-gray-600" />
          </button>
        </div>
        
        <div className="flex items-center justify-between mt-[0.5vw]">
          <div className="flex flex-col">
            <span className="text-[0.85vw] font-semibold text-gray-900 whitespace-nowrap">Turn ON/OFF the Lead Form</span>
            <p className="text-[0.65vw] text-gray-400 max-w-[15vw]">
              Turning this OFF will disable all lead form settings below, and turning it ON will enable them again<span className="text-red-500">*</span>
            </p>
          </div>
          <Switch 
            enabled={settings.enabled} 
            onChange={(val) => onUpdate({ ...settings, enabled: val })} 
          />
        </div>
      </div>

      <div className={`flex-1 ${settings.enabled ? 'overflow-y-auto' : 'overflow-hidden'} p-[1vw] space-y-[1vw]`}>
        <div className={`space-y-[1vw] transition-all duration-300 ${!settings.enabled ? 'opacity-50 pointer-events-none' : ''}`}>
        
        {/* Customize your Form */}
        <div className="space-y-[1vw]">
          <div className="flex items-center gap-[0.5vw]">
            <h3 className="text-[0.85vw] font-semibold text-gray-900 whitespace-nowrap">Customize your Form</h3>
            <div className="h-[0.0925vw] bg-gray-200 w-full"></div>
          </div>
          
          <div className="space-y-[0.5vw]">
            <div className="flex items-start gap-[1vw]">
                <label className="text-[0.75vw] font-semibold text-gray-700">Lead Text :</label>
                <textarea 
                    value={settings.leadText}
                    onChange={(e) => onUpdate({ ...settings, leadText: e.target.value })}
                    className="flex-1 h-[6vw] border border-gray-300 rounded-[0.75vw] p-[0.75vw] text-[0.7vw] text-gray-500 focus:outline-none focus:border-indigo-500 resize-none bg-white shadow-sm"
                    placeholder='"Share your information to get personalized updates."'
                />
            </div>
          </div>
        </div>

        {/* Select Fields to Collect Leads */}
        <div className="space-y-[1vw]">
          <div className="flex items-center gap-[0.5vw]">
            <h3 className="text-[0.85vw] font-semibold text-gray-900 whitespace-nowrap">Select Fields to Collect Leads</h3>
            <div className="h-[0.0925vw] bg-gray-200 w-full"></div>
          </div>
          
          <div className="space-y-[0.75vw]">
            {[
              { id: 'name', label: 'Name' },
              { id: 'phone', label: 'Phone Number' },
              { id: 'email', label: 'Email Id' },
              { id: 'feedback', label: 'Feedback' }
            ].map(field => (
              <div key={field.id} className="flex items-center justify-between p-[0.8vw] bg-white border border-gray-100 rounded-[0.75vw] shadow-sm">
                <span className="text-[0.75vw] font-semibold text-gray-700">{field.label}</span>
                <Switch
                  enabled={settings.fields[field.id]}
                  onChange={() => updateNested('fields', field.id, !settings.fields[field.id])}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Lead form Timing */}
        <div className="space-y-[1vw]">
          <div className="flex items-center gap-[0.5vw]">
            <h3 className="text-[0.85vw] font-semibold text-gray-900 whitespace-nowrap">Lead form should Appears at</h3>
            <div className="h-[0.0925vw] bg-gray-200 w-full"></div>
          </div>

          <div className="rounded-[0.75vw]">
            {[
              { id: 'before', label: 'Before opening the flipbook' },
              { id: 'after-pages', label: 'After few pages' },
              { id: 'end', label: 'At the end of the flipbook' }
            ].map((opt, idx, arr) => (
              <div 
                key={opt.id} 
                className={`transition-colors flex flex-col p-[0.75vw] ${
                  settings.appearance.timing === opt.id ? 'bg-[#eeeffc]' : 'bg-transparent'
                } ${idx === 0 ? 'rounded-t-[0.75vw]' : ''} ${idx === arr.length - 1 ? 'rounded-b-[0.75vw]' : ''}`}
              >
                <label className="text-[0.75vw] font-semibold text-gray-700 flex items-center gap-[0.75vw] cursor-pointer group">
                  <div className="relative flex items-center justify-center">
                    <input 
                      type="radio" 
                      name="timing"
                      checked={settings.appearance.timing === opt.id}
                      onChange={() => updateAppearance('timing', opt.id)}
                      className="peer appearance-none w-[1.1vw] h-[1.1vw] border-2 border-gray-400 rounded-full checked:border-indigo-600 transition-all bg-white"
                    />
                    <div className="absolute w-[0.55vw] h-[0.55vw] bg-indigo-600 rounded-full scale-0 peer-checked:scale-100 transition-transform" />
                  </div>
                  <span className={`text-[0.75vw] font-medium ${settings.appearance.timing === opt.id ? 'text-indigo-900' : 'text-gray-600'}`}>{opt.label}</span>
                </label>
                
                {opt.id === 'after-pages' && settings.appearance.timing === 'after-pages' && (
                  <div className="ml-[1.85vw] mt-[1vw] flex items-center gap-[0.75vw]">
                    <span className="text-[0.75vw] font-semibold text-gray-700">Select Page :</span>
                    <PremiumDropdown 
                      options={Array.from({ length: pages.length || 10 }, (_, i) => ({ 
                        value: i + 1, 
                        label: `Page ${i + 1}`,
                        disabled: i === 0 || i === (pages.length || 10) - 1
                      }))}
                      value={settings.appearance.afterPages}
                      placeholder={`${settings.appearance.afterPages || 1}`}
                      onChange={(val) => updateAppearance('afterPages', parseInt(val))}
                      width="6vw"
                      align="right"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Other Customization Options */}
        <div className="space-y-[1vw]">
            <div className="flex items-center gap-[0.5vw]">
                <h3 className="text-[0.85vw] font-semibold text-gray-900 whitespace-nowrap">Other Customization options</h3>
                <div className="h-[0.0925vw] bg-gray-200 w-full"></div>
            </div>

            <div className="bg-white border border-gray-200 rounded-[0.75vw] shadow-sm">
                <button 
                    onClick={() => setIsColorOpen(!isColorOpen)}
                    className="w-full flex items-center justify-between p-[1vw] font-semibold text-gray-800"
                >
                    <span>Color Customization</span>
                    <Icon icon={isColorOpen ? "lucide:chevron-up" : "lucide:chevron-down"} className="w-[1.2vw] h-[1.2vw] text-gray-400" />
                </button>

                {isColorOpen && (
                    <div className="p-[1vw] pt-0 space-y-[1.25vw] animate-in fade-in slide-in-from-top-2">
                        {/* Text Properties */}
                        <div className="space-y-[0.75vw]">
                            <div className="flex items-center gap-[0.5vw]">
                                <h4 className="text-[0.85vw] font-semibold text-gray-900 whitespace-nowrap">Text Properties</h4>
                                <div className="h-[0.0925vw] bg-gray-200 w-full"></div>
                            </div>
                            
                            <div className="flex items-center justify-between">
                                <span className="text-[0.75vw] font-semibold text-gray-700">Choose the Text style :</span>
                                <PremiumDropdown 
                                    options={fontFamilies}
                                    value={settings.appearance.fontStyle}
                                    onChange={(val) => updateAppearance('fontStyle', val)}
                                    width="7vw"
                                    isFont={true}
                                    align="right"
                                />
                            </div>
                            <ColorPickerItem label="Fill :" color={settings.appearance.textFill} onChange={(val) => updateAppearance('textFill', val)} />
                            <ColorPickerItem label="Stoke :" color={settings.appearance.textStroke} onChange={(val) => updateAppearance('textStroke', val)} />
                        </div>

                        {/* Background Color */}
                        <div className="space-y-[0.75vw]">
                            <div className="flex items-center gap-[0.5vw]">
                                <h4 className="text-[0.85vw] font-semibold text-gray-900 whitespace-nowrap">Background Color</h4>
                                <div className="h-[0.0925vw] bg-gray-200 w-full"></div>
                            </div>
                            <ColorPickerItem label="Fill :" color={settings.appearance.bgFill} onChange={(val) => updateAppearance('bgFill', val)} />
                            <ColorPickerItem label="Stoke :" color={settings.appearance.bgStroke} onChange={(val) => updateAppearance('bgStroke', val)} />
                        </div>

                        {/* Button */}
                        <div className="space-y-[0.75vw]">
                            <div className="flex items-center gap-[0.5vw]">
                                <h4 className="text-[0.85vw] font-semibold text-gray-900 whitespace-nowrap">Button</h4>
                                <div className="h-[0.0925vw] bg-gray-200 w-full"></div>
                            </div>
                            <ColorPickerItem label="Fill :" color={settings.appearance.btnFill} onChange={(val) => updateAppearance('btnFill', val)} />
                            <ColorPickerItem label="Stoke :" color={settings.appearance.btnStroke} onChange={(val) => updateAppearance('btnStroke', val)} />
                            <ColorPickerItem label="Text :" color={settings.appearance.btnText} onChange={(val) => updateAppearance('btnText', val)} />
                        </div>
                    </div>
                )}
            </div>
            
            <div className="bg-white border border-gray-200 rounded-[0.75vw] shadow-sm p-[1vw] flex items-center justify-between">
                <span className="font-semibold text-gray-800">Allow Skip</span>
                <Switch
                    enabled={settings.appearance.allowSkip}
                    onChange={() => updateAppearance('allowSkip', !settings.appearance.allowSkip)}
                />
            </div>
        </div>
        </div>
      </div>
    </div>
  );
};

const ColorPickerItem = ({ label, color, onChange }) => (
    <div className="flex items-center gap-[0.75vw]">
        <span className="w-[4.5vw] text-[0.75vw] font-semibold text-gray-700 shrink-0">{label}</span>
        <div className="flex-1 flex items-center gap-[0.5vw]">
            <div 
                className="w-[2.2vw] h-[1.8vw] rounded-[0.4vw] border border-gray-300 cursor-pointer overflow-hidden relative shadow-sm"
                style={{ backgroundColor: color === '#' || !color || color === 'transparent' ? 'white' : color }}
            >
                {(color === '#' || !color || color === 'transparent') && (
                     <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[0.1vw] bg-red-500 rotate-45"></div>
                )}
                <input 
                    type="color" 
                    value={color && color.startsWith('#') && color.length === 7 ? color : '#ffffff'} 
                    onChange={(e) => onChange(e.target.value)}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                />
            </div>
            <div className="flex-1 flex items-center bg-white border border-gray-100 rounded-[0.4vw] px-[0.6vw] py-[0.2vw] h-[1.8vw] shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                <span className="text-[0.7vw] font-medium text-gray-600 flex-1">{color && color.length > 1 ? color.toUpperCase() : '#'}</span>
                <div className="w-[1px] h-[70%] bg-gray-100 mx-[0.4vw]"></div>
                <div className="text-[0.75vw] font-semibold text-gray-800 w-[2.5vw] text-right">100%</div>
            </div>
        </div>
    </div>
);

export default LeadForm;
