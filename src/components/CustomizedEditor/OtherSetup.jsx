import React, { useState, useRef } from 'react';
import { Icon } from '@iconify/react';
import PremiumDropdown from './PremiumDropdown';
import axios from 'axios';
import { 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight, 
  Image as ImageIcon,
  ArrowRightLeft,
  MoreVertical,
  Replace,
  Upload,
  Trash2,
  X,
  Check,
  LayoutGrid
} from 'lucide-react';

const fontFamilies = [
  'Arial', 'Times New Roman', 'Courier New', 'Georgia', 'Verdana',
  'Helvetica', 'Poppins', 'Roboto', 'Open Sans', 'Lato', 'Montserrat',
  'Inter', 'Playfair Display', 'Oswald', 'Merriweather'
];

const DraggableSpan = ({ label, value, onChange, min = 0, max = 100, className }) => {
  const [isDragging, setIsDragging] = useState(false);
  const startXRef = useRef(0);
  const startValRef = useRef(0);

  React.useEffect(() => {
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


const RadioGroup = ({ options, value, onChange }) => (
  <div className="space-y-[0.75vw]">
    {options.map((opt) => (
      <label key={opt.id} className="text-[0.75vw] font-semibold text-gray-700">
        <div className="relative flex items-center justify-center">
          <input 
            type="radio" 
            name="radio-group"
            checked={value === opt.id}
            onChange={() => onChange(opt.id)}
            className="peer appearance-none w-[1vw] h-[1vw] border-2 border-gray-300 rounded-full checked:border-[#4A3AFF] transition-all bg-white"
          />
          <div className="absolute w-[0.3vw] h-[0.3vw] bg-[#4A3AFF] rounded-full scale-0 peer-checked:scale-100 transition-transform" />
        </div>
        <span className={`text-[0.85vw] font-medium ${value === opt.id ? 'text-gray-900' : 'text-gray-500'}`}>{opt.label}</span>
      </label>
    ))}
  </div>
);

const SectionHeader = ({ title }) => (
  <div className="flex items-center gap-[0.5vw] mb-[1vw] mt-[1vw]">
    <h4 className="text-[0.85vw] font-semibold text-gray-900 whitespace-nowrap">{title}</h4>
    <div className="h-[1px] bg-gray-200 w-full" />
  </div>
);

const ColorPickerItem = ({ label, color, opacity = 100, onChange, onOpacityChange }) => (
  <div className="flex items-center justify-between mb-[0.75vw] gap-[1vw]">
    <span className="text-[0.75vw] font-semibold text-gray-700">{label} :</span>
    <div className="flex items-center gap-[0.4vw] flex-1">
      <div 
        className="w-[2.2vw] h-[1.8vw] rounded-[0.4vw] border border-gray-300 cursor-pointer overflow-hidden relative shadow-sm shrink-0"
        style={{ backgroundColor: color === '#' || !color || color === 'transparent' ? 'white' : color }}
      >
        {(color === '#' || !color || color === 'transparent') && (
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[1px] bg-red-400 rotate-45"></div>
        )}
        <input 
          type="color" 
          value={color && color.startsWith('#') && color.length === 7 ? color : '#ffffff'} 
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 opacity-0 cursor-pointer"
        />
      </div>
      <div className="flex-1 flex items-center bg-white border border-gray-100 rounded-[0.4vw] px-[0.6vw] py-[0.2vw] h-[1.8vw] shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
        <input 
          type="text"
          value={color && color.length > 1 ? color.toUpperCase() : '#'}
          onChange={(e) => onChange(e.target.value)}
          className="text-[0.75vw] font-medium text-gray-600 flex-1 bg-transparent outline-none uppercase w-full"
        />
        <div className="w-[1px] h-[70%] bg-gray-100 mx-[0.4vw] shrink-0"></div>
        <div className="text-[0.8vw] font-semibold text-gray-800 w-[2.5vw] text-right shrink-0">{opacity}%</div>
      </div>
    </div>
  </div>
);

const Stepper = ({ value, onChange, unit = 's', min = 1, max = 20 }) => (
  <div className="flex items-center gap-[0.4vw]">
    <button 
      onClick={(e) => { e.stopPropagation(); onChange(Math.max(min, value - 1)); }}
      className="text-gray-300 hover:text-gray-500 transition-colors"
    >
      <Icon icon="lucide:chevron-left" className="w-[1vw] h-[1vw]" />
    </button>
    <div 
      className="w-[3.2vw] h-[2vw] border border-gray-100 rounded-[0.4vw] flex items-center justify-center bg-white cursor-ew-resize select-none text-[0.85vw] text-gray-800 font-semibold shadow-sm"
      onMouseDown={(e) => {
        e.preventDefault();
        const startX = e.clientX;
        const startVal = value;
        const handleMove = (moveEvent) => {
          const dx = moveEvent.clientX - startX;
          const newVal = Math.max(min, Math.min(max, startVal + Math.round(dx)));
          onChange(newVal);
        };
        const handleUp = () => { window.removeEventListener('mousemove', handleMove); window.removeEventListener('mouseup', handleUp); };
        window.addEventListener('mousemove', handleMove);
        window.addEventListener('mouseup', handleUp);
      }}
    >
      {value}{unit}
    </div>
    <button 
      onClick={(e) => { e.stopPropagation(); onChange(Math.min(max, value + 1)); }}
      className="text-gray-300 hover:text-gray-500 transition-colors"
    >
      <Icon icon="lucide:chevron-right" className="w-[1vw] h-[1vw]" />
    </button>
  </div>
);

const SettingRow = ({ label, children, className = "" }) => (
  <div className={`flex items-center justify-between mb-[0.8vw] gap-[1vw] ${className}`}>
    <span className="text-[0.75vw] pl-[0.5vw] font-medium text-gray-700 whitespace-nowrap">{label} :</span>
    {children}
  </div>
);

const AccordionItem = ({ title, isOpen, onToggle, children }) => (
  <div className="bg-white rounded-[1vw] border border-gray-100 shadow-[0_4px_15px_rgba(0,0,0,0.05)] mb-[0.5vw] overflow-hidden transition-all duration-300">
    <button
      onClick={onToggle}
      className={`w-full flex items-center justify-between px-[1.25vw] py-[1vw] text-[0.85vw] font-semibold text-gray-900 transition-colors ${
        isOpen ? 'bg-gray-50/50' : 'bg-white'
      }`}
    >
      <span className="whitespace-nowrap">{title}</span>
      <Icon 
        icon="lucide:chevron-down" 
        className={`w-[1.2vw] h-[1.2vw] text-gray-400 transition-transform duration-300 shrink-0 ${isOpen ? 'rotate-180' : ''}`} 
      />
    </button>
    <div 
      className={`transition-all duration-500 ease-in-out overflow-hidden ${
        isOpen ? 'max-h-[150vw] opacity-100' : 'max-h-0 opacity-0'
      }`}
    >
      <div className="px-[1.25vw] border-t border-gray-50 ">
        {children}
      </div>
    </div>
  </div>
);

const MAX_GALLERY_IMAGES = 12;

const OtherSetup = ({ onBack, settings, onUpdate, folderName, bookName }) => {
  const [openAccordion, setOpenAccordion] = useState('layout');
  
  // Gallery Logic State
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [showFitDropdown, setShowFitDropdown] = useState(false);
  const [showModeDropdown, setShowModeDropdown] = useState(false);
  const [dropUp, setDropUp] = useState(false);
  const [openContextMenu, setOpenContextMenu] = useState(null);
  const [showInfoTooltip, setShowInfoTooltip] = useState(false);
  // showGalleryPreview: triggers the inline gallery popup in preview (passed up via gallery.previewOpen)
  
  const fileInputRef = useRef(null);
  const replaceInputRef = useRef(null);
  const bgSoundInputRef = useRef(null);
  const [replaceTargetIndex, setReplaceTargetIndex] = useState(null);
  const [showLibrary, setShowLibrary] = useState(false);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [localLibrarySelected, setLocalLibrarySelected] = useState(null);
  const galleryInputRef = useRef(null);
  const [libraryTargetIndex, setLibraryTargetIndex] = useState(null);
  
  const updateNested = (section, field, value) => {
    onUpdate(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: typeof value === 'function' ? value(prev[section]?.[field]) : value
      }
    }));
  };

  const updateSectionField = (section, subSection, field, value) => {
    onUpdate(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [subSection]: {
          ...prev[section][subSection],
          [field]: typeof value === 'function' ? value(prev[section][subSection]?.[field]) : value
        }
      }
    }));
  };

  // Safe access helper for nested settings
  const getNestedValue = (section, field, fallback = {}) => {
    return settings?.[section]?.[field] ?? fallback;
  };

  // Gallery Helpers
  const gallery = settings.gallery || {};
  const slideshowImages = gallery.images || [];

  // Visible count: show uploaded images + 1 next empty slot (max 12)
  const visibleSlotCount = Math.min(MAX_GALLERY_IMAGES, slideshowImages.length + 1);

  const updateGallery = (field, value) => {
      updateNested('gallery', field, value);
  };

  const uploadFile = async (file, replacingVideoId = null) => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) return null;

    const user = JSON.parse(storedUser);
    const formData = new FormData();
    formData.append('emailId', user.emailId);
    
    // Provide defaults for unsaved books
    formData.append('folderName', folderName || 'My Flipbooks');
    formData.append('flipbookName', bookName || 'Untitled Document');
    
    formData.append('type', 'image');
    formData.append('assetType', 'Image');
    formData.append('page_v_id', 'popup_gallery'); // Using a fixed ID for popup gallery
    
    if (replacingVideoId) {
        formData.append('replacing_file_v_id', replacingVideoId);
    }
    formData.append('file', file);

    try {
        const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
        const res = await axios.post(`${backendUrl}/api/flipbook/upload-asset`, formData);
        if (res.data.url) {
            return {
                url: `${backendUrl}${res.data.url}`,
                file_v_id: res.data.file_v_id,
                name: res.data.filename
            };
        }
    } catch (err) {
        console.error("Slideshow image upload failed:", err);
    }
    return null;
  };

  const handleFileUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const remainingSlots = MAX_GALLERY_IMAGES - slideshowImages.length;
    const filesToUpload = Array.from(files).slice(0, remainingSlots);
    
    const optimisticImages = filesToUpload.filter(file => file.type.startsWith('image/')).map((file, idx) => ({
      id: Date.now() + idx + Math.random(), 
      url: URL.createObjectURL(file), 
      name: file.name,
      isUploading: true,
      file_orig: file
    }));

    if (optimisticImages.length === 0) return;

    // Add optimistic images
    updateGallery('images', current => [...(current || []), ...optimisticImages]);
    e.target.value = '';

    // Upload in Background and Update State
    for (const img of optimisticImages) {
        const uploadedData = await uploadFile(img.file_orig);
        
        updateGallery('images', current => 
            current.map(item => {
                if (item.id === img.id) {
                    if (uploadedData) {
                        return { ...item, url: uploadedData.url, file_v_id: uploadedData.file_v_id, name: uploadedData.name, isUploading: false };
                    }
                    return { ...item, isUploading: false };
                }
                return item;
            })
        );
    }
  };

  const handleReplaceFileChange = async (e) => {
      const file = e.target.files?.[0];
      if (!file || replaceTargetIndex === null) return;
      
      const targetImg = slideshowImages[replaceTargetIndex];
      if (!targetImg) return;

      // Optimistic update
      const optimisticUrl = URL.createObjectURL(file);
      updateGallery('images', current => {
          const updated = [...current];
          if (updated[replaceTargetIndex]) {
              updated[replaceTargetIndex] = { ...updated[replaceTargetIndex], url: optimisticUrl, isUploading: true };
          }
          return updated;
      });
      
      e.target.value = '';

      // Upload
      const uploadedData = await uploadFile(file, targetImg.file_v_id);
      
      // Final update
      updateGallery('images', current => 
          current.map((img, idx) => {
              if (idx === replaceTargetIndex) {
                  return uploadedData 
                      ? { ...img, url: uploadedData.url, file_v_id: uploadedData.file_v_id, name: uploadedData.name, isUploading: false }
                      : { ...img, isUploading: false };
              }
              return img;
          })
      );
      setReplaceTargetIndex(null);
  };

  const uploadAudioFile = async (file) => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) return null;

    const user = JSON.parse(storedUser);
    const formData = new FormData();
    formData.append('emailId', user.emailId);
    formData.append('folderName', folderName || 'My Flipbooks');
    formData.append('flipbookName', bookName || 'Untitled Document');
    formData.append('type', 'audio');
    formData.append('assetType', 'Audio');
    formData.append('page_v_id', 'background_audio'); 
    formData.append('file', file);

    try {
        const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
        const res = await axios.post(`${backendUrl}/api/flipbook/upload-asset`, formData);
        if (res.data.url) {
            return {
                url: `${backendUrl}${res.data.url}`,
                file_v_id: res.data.file_v_id,
                name: res.data.filename
            };
        }
    } catch (err) {
        console.error("Audio upload failed:", err);
    }
    return null;
  };

  const handleBgSoundUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    if (file.type.startsWith('audio/')) {
       updateNested('sound', 'isUploadingBg', true);
       const uploadedData = await uploadAudioFile(file);
       if (uploadedData) {
           onUpdate(prev => {
               const currentCustom = prev.sound?.customBgSounds || [];
               const nextIdNumber = 4 + currentCustom.length;
               const newCustomSound = {
                   id: `BG Sound ${nextIdNumber}`,
                   label: `BG Sound ${nextIdNumber}`,
                   url: uploadedData.url,
                   name: uploadedData.name
               };
               return {
                   ...prev,
                   sound: {
                       ...(prev.sound || {}),
                       customBgSounds: [...currentCustom, newCustomSound],
                       bgSound: newCustomSound.id
                   }
               };
           });
       }
       updateNested('sound', 'isUploadingBg', false);
    }
    e.target.value = '';
  };

  const deleteImage = async (index) => {
    const img = slideshowImages[index];
    if (!img) return;

    // Optimistic remove
    updateGallery('images', current => (current || []).filter((_, idx) => idx !== index));
    setOpenContextMenu(null);

    // Backend delete
    if (img.file_v_id) {
        try {
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                const user = JSON.parse(storedUser);
                const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
                await axios.post(`${backendUrl}/api/flipbook/delete-asset`, {
                    emailId: user.emailId,
                    file_v_id: img.file_v_id,
                    assetType: 'Image',
                    folderName: folderName || 'My Flipbooks',
                    bookName: bookName || 'Untitled Document'
                });
            }
        } catch (error) {
            console.error("Failed to delete asset from backend:", error);
        }
    }
  };

  const handleLibraryFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const newImageData = { id: Date.now(), url: event.target.result };
      setUploadedImages((prev) => [newImageData, ...prev]);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handlePlaceFromLibrary = () => {
    if (!localLibrarySelected) return;
    
    // If we have a specific target (from context menu)
    if (libraryTargetIndex !== null) {
      updateGallery('images', current => {
        const updated = [...(current || [])];
        if (updated[libraryTargetIndex]) {
          updated[libraryTargetIndex] = { ...updated[libraryTargetIndex], url: localLibrarySelected.url, name: localLibrarySelected.name || 'Library Image' };
        } else {
          // If the slot was empty, we need to push
          updated.push({ id: Date.now(), url: localLibrarySelected.url, name: localLibrarySelected.name || 'Library Image' });
        }
        return updated;
      });
    } else {
      // General "Add" - find first empty slot or push if not full
      if (slideshowImages.length < MAX_GALLERY_IMAGES) {
        updateGallery('images', current => [...(current || []), { id: Date.now(), url: localLibrarySelected.url, name: localLibrarySelected.name || 'Library Image' }]);
      }
    }
    
    setShowLibrary(false);
    setLocalLibrarySelected(null);
    setLibraryTargetIndex(null);
  };

  return (
    <div className="flex flex-col h-full bg-[#fcfcfc] font-sans">
      {/* Header */}
        <div className="h-[8vh] flex items-center justify-between px-[1.25vw] bg-white border-b border-gray-100 shadow-sm z-30">
        <div className="flex items-center gap-[0.75vw]">
          <Icon icon="lucide:settings" className="w-[1vw] h-[1vw] text-gray-800" />
          <span className="text-[1vw] font-semibold text-gray-900">Other Setup</span>
        </div>
        <button onClick={onBack} className="p-[0.5vw] rounded-full hover:bg-gray-100 transition-colors text-gray-600 hover:text-gray-900 group">
          <Icon icon="ic:round-arrow-back" className="w-[1.4vw] h-[1.4vw] group-hover:-translate-x-[0.1vw] transition-transform" />
          </button>
      </div>

      <div className="flex-1 overflow-y-auto p-[1.25vw] custom-scrollbar">
        {/* Layout Settings */}
        <AccordionItem 
          title="Layout Settings" 
          isOpen={openAccordion === 'layout'} 
          onToggle={() => setOpenAccordion(openAccordion === 'layout' ? null : 'layout')}
        >
          <div className="space-y-[0.5vw] pb-[1vw]">
            <div>
              <SectionHeader title="Toolbar Display Mode" />
              <div className="space-y-[0.5vw]">
                <SettingRow label="Add Text Below Icons">
                  <Switch 
                    enabled={settings.toolbar?.addTextBelowIcons ?? false} 
                    onChange={(val) => updateNested('toolbar', 'addTextBelowIcons', val)} 
                  />
                </SettingRow>
              </div>
            </div>

            <div>
              <SectionHeader title="Text Properties" />
              <SettingRow label="Text style">
                <PremiumDropdown 
                  options={fontFamilies}
                  value={settings.toolbar?.textProperties?.font || 'Poppins'}
                  onChange={(val) => updateSectionField('toolbar', 'textProperties', 'font', val)}
                  width="10vw"
                  className="shrink-0"
                  isFont={true}
                  align="right"
                />
              </SettingRow>
            </div>

            <div>
              <SectionHeader title="Auto Flip Properties" />
              <div className="space-y-[0.5vw]">
                <SettingRow label="Auto Play">
                  <Switch 
                    enabled={settings.toolbar?.autoFlipEnabled ?? true} 
                    onChange={(val) => updateNested('toolbar', 'autoFlipEnabled', val)} 
                  />
                </SettingRow>
                {(settings.toolbar?.autoFlipEnabled ?? true) && (
                  <>
                    <SettingRow label="Auto Flip Duration">
                      <Stepper 
                        value={settings.toolbar?.autoFlipDuration || 5} 
                        onChange={(val) => updateNested('toolbar', 'autoFlipDuration', val)} 
                      />
                    </SettingRow>
                    <SettingRow label="Next Flip Countdown">
                      <Switch 
                        enabled={settings.toolbar?.nextFlipCountdown ?? true} 
                        onChange={(val) => updateNested('toolbar', 'nextFlipCountdown', val)} 
                      />
                    </SettingRow>
                  </>
                )}
              </div>
            </div>

            <div>
              <SectionHeader title="Maximum Zoom" />
              <div className="space-y-[0.5vw]">
                <SettingRow label="Set Maximum Zoom">
                  <Stepper 
                    value={settings.toolbar?.maximumZoom || 4} 
                    unit="x"
                    min={1}
                    max={3}
                    onChange={(val) => updateNested('toolbar', 'maximumZoom', val)} 
                  />
                </SettingRow>
                <SettingRow label="Double tap to Zoom at Max">
                  <Switch 
                    enabled={settings.toolbar?.twoClickToZoom ?? true} 
                    onChange={(val) => updateNested('toolbar', 'twoClickToZoom', val)} 
                  />
                </SettingRow>
              </div>
            </div>
          </div>
        </AccordionItem>



        {/* Sound Settings */}
        <AccordionItem 
          title="Sound Settings" 
          isOpen={openAccordion === 'sound'} 
          onToggle={() => setOpenAccordion(openAccordion === 'sound' ? null : 'sound')}
        >
          <div className="space-y-[1.5vw] pb-[1vw]">
            <div>
              <SectionHeader title="Flip Sound" />
              <div className="space-y-[1vw] pl-[1vw]">
                {[
                  { id: 'Classic Book Flip', label: 'Classic Book Flip' },
                  { id: 'Soft Paper Flip', label: 'Soft cover page' },
                  { id: 'Hard Cover Flip', label: 'Hard Cover Page' }
                ].map((s) => (
                  <button 
                    key={s.id}
                    onClick={() => updateNested('sound', 'flipSound', s.id)}
                    className="w-full flex items-center gap-[1.25vw] bg-transparent transition-all group"
                  >
                    <div className={`w-[1.5vw] h-[1.5vw] flex items-center justify-center rounded-full transition-all ${
                      settings.sound?.flipSound === s.id 
                      ? 'bg-[#4A3AFF] text-white shadow-md border-transparent' 
                      : 'bg-white border-[1.5px] border-black text-white shadow-sm group-hover:border-[#4A3AFF]'
                    }`}>
                      <Icon icon={settings.sound?.flipSound === s.id ? 'icon-park:music-rhythm' : 'mdi:music'} className="w-[1.2vw] h-[1.2vw]" color={settings.sound?.flipSound === s.id ? 'white' : 'black'} />
                    </div>
                    <span className={`text-[0.75vw] font-semibold ${
                      settings.sound?.flipSound === s.id ? 'text-gray-900' : 'text-gray-500'
                    }`}>{s.label}</span>
                  </button>
                ))}
              </div>
              <div className="flex items-center justify-between mt-[1.5vw] pl-[0.2vw]">
                <span className="text-[0.75vw] font-semibold text-gray-700">Add specific sound effect for pages :</span>
                <Switch 
                  enabled={settings.sound?.pageSpecificSound} 
                  onChange={(val) => updateNested('sound', 'pageSpecificSound', val)} 
                />
              </div>
            </div>

            {settings.sound?.pageSpecificSound && (
              <div>
                <SectionHeader title="Background Sound" />
                <input type="file" ref={bgSoundInputRef} onChange={handleBgSoundUpload} accept=".mp3, .wav, .m4a" className="hidden" />
                <div 
                  className={`border-[2px] border-dashed rounded-[1.25vw] p-[0.4vw] flex flex-col items-center justify-center gap-[0.50vw] cursor-pointer hover:border-[#4A3AFF]/50 transition-all mb-[1.5vw] group/upload ${settings.sound?.bgSound?.startsWith('BG Sound') && parseInt(settings.sound.bgSound.split(' ')[2]) >= 4 ? 'border-[#4A3AFF] bg-[#4A3AFF]/5' : 'border-gray-300 bg-transparent'}`}
                  onClick={() => bgSoundInputRef.current?.click()}
                >
                  <Icon icon="lucide:upload" className="w-[1.2vw] h-[1.2vw]" />
                  
                  {settings.sound?.isUploadingBg ? (
                    <span className="text-[0.75vw] font-semibold text-gray-400 animate-pulse">Uploading...</span>
                  ) : (
                    <span className="text-[0.75vw] font-semibold text-[#9BA1A6]">Upload - MP3, WAV, M4A</span>
                  )}
                </div>
                <div className="space-y-[0.5vw]">
                  {[
                    { id: 'BG Sound 1', label: 'BG Sound 1' },
                    { id: 'BG Sound 2', label: 'BG Sound 2' },
                    { id: 'BG Sound 3', label: 'BG Sound 3' },
                    ...(settings.sound?.customBgSounds || [])
                  ].map((s) => (
                    <button 
                      key={s.id}
                      onClick={() => updateNested('sound', 'bgSound', s.id)}
                      className={`w-full flex items-center gap-[1.25vw] px-[1vw] py-[0.75vw] rounded-[1vw] transition-all group ${
                        settings.sound?.bgSound === s.id 
                        ? 'bg-[#F8F9FE] border border-blue-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)]' 
                        : 'bg-transparent border border-transparent hover:bg-gray-50/50'
                      }`}
                    >
                      <div className={`w-[1.5vw] h-[1.5vw] flex items-center justify-center rounded-full transition-all ${
                        settings.sound?.bgSound === s.id ? 'bg-[#4A3AFF] text-white shadow-md border-transparent' : 'bg-white border-[1.5px] border-black text-black shadow-sm group-hover:border-[#4A3AFF]'
                      }`}>
                        <Icon icon={settings.sound?.bgSound === s.id ? 'icon-park:music-rhythm' : 'mdi:music'} className="w-[1.2vw] h-[1.2vw]" color={settings.sound?.bgSound === s.id ? 'white' : 'black'} />
                      </div>
                      <span className={`text-[0.75vw] font-semibold ${
                        settings.sound?.bgSound === s.id ? 'text-gray-900' : 'text-gray-500'
                      }`}>{s.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </AccordionItem>

        {/* Gallery Option */}
        <AccordionItem 
          title="Gallery Option" 
          isOpen={openAccordion === 'gallery'} 
          onToggle={() => setOpenAccordion(openAccordion === 'gallery' ? null : 'gallery')}
        >
          <div className="space-y-[1.25vw] pt-[1vw] pb-[2vw]">
             
             {/* Top Controls: Mode & Fit */}
             <div className="flex items-center justify-between">
                {/* Mode Select Dropdown */}
                <div className="relative z-20">
                  <button 
                    onClick={(e) => {
                      if (!showModeDropdown) {
                          const rect = e.currentTarget.getBoundingClientRect();
                          const spaceBelow = window.innerHeight - rect.bottom;
                          setDropUp(spaceBelow < 120);
                      }
                      setShowModeDropdown(!showModeDropdown);
                    }}
                    className="flex items-center justify-between gap-[0.5vw] px-[0.75vw] py-[0.4vw] bg-[#F3F4F6] hover:bg-[#E5E7EB] rounded-[0.4vw] transition-colors text-[0.75vw] font-medium text-gray-700  min-w-[9vw]"
                  >
                    <span>{gallery.autoPlay !== false ? 'Auto Slide Mode' : 'Manual Slide Mode'}</span>
                    <ArrowRightLeft size="0.8vw" className="text-gray-500" />
                  </button>
                  {showModeDropdown && (
                    <>
                      <div className="fixed inset-0 z-[90]" onClick={() => setShowModeDropdown(false)} />
                      <div className={`absolute left-0 w-full min-w-[9.5vw] bg-white border border-gray-100 rounded-[0.6vw] shadow-xl overflow-hidden z-[100] py-[0.25vw] animate-in fade-in zoom-in-95 duration-100 ${dropUp ? 'bottom-full mb-[0.25vw] origin-bottom' : 'top-full mt-[0.25vw] origin-top'}`}>
                        {[
                          { label: 'Auto Slide Mode', value: true },
                          { label: 'Manual Slide Mode', value: false }
                        ].map((mode) => (
                          <button 
                            key={mode.label}
                            onClick={() => {
                              updateGallery('autoPlay', mode.value);
                              setShowModeDropdown(false);
                            }}
                            className="w-full text-left px-[1vw] py-[0.5vw] text-[0.7vw] font-medium text-gray-600 hover:bg-gray-50 hover:text-indigo-600 flex items-center justify-between"
                          >
                            {mode.label}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {/* Fit Dropdown */}
                <div className="relative z-20">
                    <button 
                      onClick={() => setShowFitDropdown(!showFitDropdown)}
                      className="flex items-center justify-between gap-[0.5vw] px-[0.75vw] py-[0.4vw] bg-white border border-gray-300 rounded-[0.4vw] hover:border-indigo-400 transition-all text-[0.75vw] font-medium text-gray-700 min-w-[5vw]"
                    >
                      <span>{gallery.imageFitType || 'Fill All'}</span>
                      <ChevronDown size="0.8vw" className={`text-gray-500 transition-transform ${showFitDropdown ? 'rotate-180' : ''}`} />
                    </button>
                    {showFitDropdown && (
                      <>
                        <div className="fixed inset-0 z-[90]" onClick={() => setShowFitDropdown(false)} />
                        <div className="absolute right-0 top-full mt-[0.25vw] w-full min-w-[5vw] bg-white border border-gray-200 rounded-[0.4vw] shadow-xl z-[100] py-[0.25vw] overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                          {['Fit All', 'Fill All'].map(type => (
                            <button 
                              key={type}
                              onClick={() => {
                                updateGallery('imageFitType', type);
                                setShowFitDropdown(false);
                              }}
                              className="w-full text-left px-[0.75vw] py-[0.5vw] text-[0.7vw] font-medium text-gray-600 hover:bg-gray-50 hover:text-indigo-600"
                            >
                              {type}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                </div>
             </div>

             {/* Info Row */}
             <div className="flex items-center gap-[0.4vw]">
               <div className="relative">
                 <button
                   className="w-[1.1vw] h-[1.1vw] rounded-full border border-gray-400 flex items-center justify-center text-gray-500 text-[0.6vw] font-semibold hover:bg-gray-100 transition-colors"
                   onMouseEnter={() => setShowInfoTooltip(true)}
                   onMouseLeave={() => setShowInfoTooltip(false)}
                 >
                   i
                 </button>
                 {showInfoTooltip && (
                   <div className="absolute left-[1.5vw] top-0 bg-gray-800 text-white text-[0.65vw] px-[0.75vw] py-[0.4vw] rounded-[0.4vw] whitespace-nowrap z-50 shadow-lg">
                     You can add up to 12 images in Gallery
                   </div>
                 )}
               </div>
               <span className="text-[0.7vw] text-gray-500">You can add up to 12 images in Gallery *</span>
             </div>

             {/* Images Grid - 3×4 (4 cols, up to 3 rows = 12 images) */}
             {/* Shows uploaded images + 1 next empty slot up to MAX_GALLERY_IMAGES */}
             <div className="grid grid-cols-4 gap-[0.65vw] px-[0.125vw] ">
               {Array.from({ length: visibleSlotCount }).map((_, i) => (
                 <div key={i} className="relative group/slot">
                   <div 
                     className={`aspect-[1/1] w-full rounded-[0.75vw] cursor-pointer border-[0.1vw] transition-all duration-300 relative flex items-center justify-center group/card hover:scale-[1.05] hover:-translate-y-[0.25vw] hover:z-20 ${
                       activeSlideIndex === i 
                         ? 'border-[#6366f1] shadow-[0_0.65vw_1.25vw_-0.4vw_rgba(99,102,241,0.3)]' 
                         : (slideshowImages[i] ? 'border-gray-200 hover:border-gray-400 hover:shadow-[0_0.75vw_1.5vw_-0.5vw_rgba(0,0,0,0.15)]' : 'border-gray-400 hover:border-indigo-400 shadow-sm')
                     } ${!slideshowImages[i] ? 'bg-gray-50/50 border-dashed' : 'bg-white shadow-sm'}`}
                     onClick={() => setActiveSlideIndex(i)}
                   >
                     {slideshowImages[i]?.isUploading ? (
                       <div className="flex flex-col items-center justify-center gap-[0.375vw] w-full h-full">
                         <div className="w-[1.2vw] h-[1.2vw] border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                       </div>
                     ) : slideshowImages[i] ? (
                       <img src={slideshowImages[i].url} className="w-full h-full object-cover rounded-[0.6vw]" alt="" />
                     ) : (
                       <div 
                         onClick={(e) => { 
                            e.stopPropagation(); 
                            setActiveSlideIndex(i); 
                            if(fileInputRef.current) fileInputRef.current.value = '';
                            fileInputRef.current?.click(); 
                         }}
                         className="flex flex-col items-center justify-center gap-[0.375vw] opacity-30 group-hover/card:opacity-70 transition-all duration-300 w-full h-full"
                       >
                         <Upload size="0.95vw" strokeWidth={1.5} className="text-gray-900" />
                         <span className="text-[0.6vw] font-semibold text-gray-900">Upload</span>
                       </div>
                     )}
    
                     {/* Actions Menu Trigger */}
                     <button 
                       onClick={(e) => { 
                         e.stopPropagation(); 
                         setOpenContextMenu(openContextMenu === i ? null : i); 
                       }}
                       className={`absolute -top-[0.375vw] -right-[0.375vw] w-[1.75vw] h-[1.75vw] rounded-full bg-white shadow-[0_0.1vw_0.5vw_rgba(0,0,0,0.15)] border-[0.1vw] border-gray-200 flex items-center justify-center transition-all duration-200 z-30 ${
                         openContextMenu === i ? 'opacity-100 scale-100' : 'opacity-0 scale-75 group-hover/card:opacity-100 group-hover/card:scale-100'
                       } hover:bg-gray-50 active:scale-95`}
                     >
                       <MoreVertical size="0.7vw" className="text-gray-600" strokeWidth={2.5} />
                     </button>
                   </div>

                   {/* Context Menu */}
                   {openContextMenu === i && (
                     <>
                       <div className="fixed inset-0 z-[105]" onClick={() => setOpenContextMenu(null)} />
                       <div                           className={`absolute top-[40%] mt-[0.25vw] w-[7.5vw] bg-white border border-gray-100 rounded-[0.6vw] shadow-2xl z-[110] overflow-hidden animate-in fade-in zoom-in-95 duration-150 ${
                            (i % 4) >= 2 ? 'right-0' : 'left-0'
                          }`}>
                         <button 
                           onClick={() => { 
                             if (slideshowImages[i]) {
                                setReplaceTargetIndex(i);
                                if(replaceInputRef.current) replaceInputRef.current.value = '';
                                replaceInputRef.current?.click();
                                setOpenContextMenu(null);
                             } else {
                                setActiveSlideIndex(i); 
                                if(fileInputRef.current) fileInputRef.current.value = '';
                                fileInputRef.current?.click(); 
                                setOpenContextMenu(null); 
                             }
                           }}
                           className="w-full px-[1vw] py-[0.65vw] text-[0.6vw] font-semibold text-gray-700 hover:bg-gray-50 text-left border-b border-gray-50 transition-colors flex items-center gap-[0.5vw]"
                         >
                           {slideshowImages[i] ? 'Replace Image' : 'Upload Image'}
                         </button>
                         <button 
                           onClick={() => { 
                              setLibraryTargetIndex(i);
                              setShowLibrary(true);
                              setOpenContextMenu(null);
                           }}
                           className="w-full px-[1vw] py-[0.65vw] text-[0.6vw] font-semibold text-gray-700 hover:bg-gray-50 text-left border-b border-gray-50 transition-colors flex items-center gap-[0.5vw]"
                         >
                             Image Gallery
                         </button>
                         {slideshowImages[i] && (
                           <button 
                             onClick={() => deleteImage(i)}
                             className="w-full px-[1vw] py-[0.65vw] text-[0.6vw] font-semibold text-red-500 hover:bg-red-50 text-left transition-colors flex items-center gap-[0.5vw]"
                           >
                             Delete Image
                           </button>
                         )}
                       </div>
                     </>
                   )}
                 </div>
               ))}
             </div>
              <input type="file" ref={fileInputRef} onChange={handleFileUpload} multiple accept="image/png, image/jpeg, image/jpg, .png, .jpg, .jpeg" className="hidden" />
              <input type="file" ref={replaceInputRef} onChange={handleReplaceFileChange} accept="image/png, image/jpeg, image/jpg, .png, .jpg, .jpeg" className="hidden" />
            
            {/* Library Access Button */}
              <button 
                           onClick={() => setShowGallery(true)}
                           className="relative w-full h-[3.5vw] bg-black rounded-[0.9vw] overflow-hidden group transition-all hover:scale-[1.01] active:scale-[0.98] shadow-lg flex items-center justify-center border border-white/5"
                         >
                           {/* Background Images Overlay */}
                           <div className="absolute inset-0 flex gap-[0.5vw] opacity-20 group-hover:opacity-40 transition-opacity">
                             <div className="flex-1 bg-cover bg-center" 
                             style={{ backgroundImage: "url('https://images.unsplash.com/photo-1493612276216-ee3925520721?q=80&w=300&auto=format&fit=crop')" }}>
                             </div>
                             <div className="flex-1 bg-cover bg-center" 
                              style={{ backgroundImage: "url('https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=300&auto=format&fit=crop')" }}>
                             </div>
                             <div className="flex-1 bg-cover bg-center" 
                                 style={{ backgroundImage: "url('https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=300&auto=format&fit=crop')" }}>
                             </div>
                           </div>
                           {/* Dark Gradient Overlay */}
                           <div className="absolute inset-0 bg-gradient-to-r from-gray/10 via-gray/20 to-gray/40 group-hover:via-gray/20 transition-all"></div>
                           
                           {/* Content */}
                           <div className="relative z-10 flex items-center gap-[0.75vw]">
                               <Icon icon="clarity:image-gallery-solid" className="w-[1vw] h-[1.2vw] text-white" />
                             <span className="text-[0.95vw] font-semibold text-white ">Image Gallery</span>
                           </div>
                         </button>
          
             {/* ── AUTO MODE SECTIONS ────────────────────────────────── */}
             {gallery.autoPlay !== false && (
               <>
                 {/* Slide Effect */}
                 <div className="space-y-[0.75vw]">
                   <div className="flex items-center gap-[0.5vw]">
                      <span className="text-[0.85vw] font-semibold text-gray-900 whitespace-nowrap">Slide Effect</span>
                      <div className="h-[1px] bg-gray-200 flex-1" />
                   </div>
                   <div className="flex items-center justify-between px-[0.5vw]">
                      <span className="text-[0.75vw] font-semibold text-gray-700">Select Slide Effects :</span>
                      <PremiumDropdown 
                        options={['Linear', 'Fade', 'Slide', 'Push', 'Flip', 'Reveal']}
                        value={gallery.transitionEffect || 'Linear'}
                        onChange={(val) => updateGallery('transitionEffect', val)}
                        width="6vw"
                        align="right"
                      />
                   </div>
                 </div>

                 {/* Auto Slide Duration */}
                 <div className="space-y-[0.75vw]">
                   <div className="flex items-center gap-[0.5vw]">
                     <span className="text-[0.85vw] font-semibold text-gray-900 whitespace-nowrap">Navigation Controls</span>
                     <div className="h-[1px] bg-gray-200 flex-1" />
                   </div>
                   <div className="flex items-center justify-between px-[0.5vw]">
                     <span className="text-[0.75vw] font-semibold text-gray-700">Auto Slide Duration</span>
                     <div className="flex-1 border-b border-dashed border-gray-200 mx-[0.75vw]" />
                     <div className="flex items-center gap-[0.375vw]">
                       <button 
                         onClick={() => updateGallery('speed', Math.max(1, (gallery.speed || 3) - 1))}
                        >
                         <ChevronLeft size="0.95vw" />
                       </button>
                       <div className="w-[2.75vw] h-[1.75vw] border border-gray-200 rounded-[0.3vw] text-[0.65vw] font-semibold text-gray-700 bg-white shadow-sm overflow-hidden">
                         <DraggableSpan 
                           label={`${gallery.speed || 3}s`}
                           value={gallery.speed || 3}
                           onChange={(v) => updateGallery('speed', v)}
                           min={1}
                           max={20}
                           className="w-full h-full flex items-center justify-center hover:bg-gray-50 transition-colors"
                         />
                       </div>
                       <button 
                         onClick={() => updateGallery('speed', Math.min(20, (gallery.speed || 3) + 1))}
                       >
                         <ChevronRight size="0.95vw" />
                       </button>
                     </div>
                   </div>
                 </div>

                 {/* Other Controls - Auto */}
                 <div className="space-y-[0.75vw]">
                   <div className="flex items-center gap-[0.5vw]">
                     <span className="text-[0.85vw] font-semibold text-gray-900 whitespace-nowrap">Other Controls</span>
                     <div className="h-[1px] bg-gray-200 flex-1" />
                   </div>

                   <div className="flex items-center justify-between px-[0.5vw]">
                      <span className="text-[0.75vw] font-semibold text-gray-700">Pagination Dots</span>
                      <div className="flex-1 border-b border-dashed border-gray-200 mx-[0.75vw]" />
                      <Switch enabled={gallery.showDots ?? true} onChange={(v) => updateGallery('showDots', v)} />
                   </div>
                   
                   {(gallery.showDots ?? true) && (
                       <div className="flex items-center justify-between px-[0.5vw]">
                          <span className="text-[0.75vw] font-semibold text-gray-700">Dot Color :</span>
                          <div className="flex items-center gap-[0.6vw]">
                             <div className="w-[1.75vw] h-[1.75vw] rounded-[0.25vw] border border-gray-200 overflow-hidden relative cursor-pointer shadow-sm">
                                <input type="color" value={gallery.dotColor || '#000000'} onChange={(e) => updateGallery('dotColor', e.target.value)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                                <div className="w-full h-full" style={{ backgroundColor: gallery.dotColor || '#000000' }} />
                             </div>
                             <div className="flex items-center border border-gray-300 rounded-[0.35vw] px-[0.5vw] py-[0.15vw] bg-white min-w-[7vw] justify-between">
                                <span className="text-[0.75vw] text-gray-500 font-mono uppercase">{gallery.dotColor || '#000000'}</span>
                                <span className="text-[0.75vw] text-gray-400 font-medium">100%</span>
                             </div>
                          </div>
                       </div>
                   )}
                   
                   <div className="flex items-center justify-between px-[0.5vw]">
                      <span className="text-[0.75vw] font-semibold text-gray-700">Infinity Loop Mode</span>
                      <div className="flex-1 border-b border-dashed border-gray-200 mx-[0.75vw]" />
                      <Switch enabled={gallery.infiniteLoop ?? true} onChange={(v) => updateGallery('infiniteLoop', v)} />
                   </div>
                 </div>
               </>
             )}

             {/* ── MANUAL MODE SECTIONS ─────────────────────────────── */}
             {gallery.autoPlay === false && (
               <>

              {/* Slide Effect */}
                 <div className="space-y-[0.75vw]">
                   <div className="flex items-center gap-[0.5vw]">
                      <span className="text-[0.85vw] font-semibold text-gray-900 whitespace-nowrap">Slide Effect</span>
                      <div className="h-[1px] bg-gray-200 flex-1" />
                   </div>
                   <div className="flex items-center justify-between px-[0.5vw]">
                      <span className="text-[0.75vw] font-semibold text-gray-700">Select Slide Effects :</span>
                      <PremiumDropdown 
                        options={['Linear', 'Fade', 'Slide', 'Push', 'Flip', 'Reveal']}
                        value={gallery.transitionEffect || 'Linear'}
                        onChange={(val) => updateGallery('transitionEffect', val)}
                        width="6vw"
                        align="right"
                      />
                   </div>
                 </div>


                 {/* Navigation Controls - Manual */}
                 <div className="space-y-[0.75vw]">
                   <div className="flex items-center gap-[0.5vw]">
                     <span className="text-[0.85vw] font-semibold text-gray-900 whitespace-nowrap">Navigation Controls</span>
                     <div className="h-[1px] bg-gray-200 flex-1" />
                   </div>
                   <div className="space-y-[0.6vw] px-[0.5vw]">
                     <div className="flex items-center gap-[0.75vw] cursor-pointer" onClick={() => updateGallery('dragToSlide', true)}>
                       <div className={`w-[1.25vw] h-[1.25vw] rounded-full border-2 flex items-center justify-center bg-white transition-all ${(gallery.dragToSlide ?? true) ? 'border-[#4F46E5]' : 'border-gray-300'}`}>
                           {(gallery.dragToSlide ?? true) && <div className="w-[0.65vw] h-[0.65vw] rounded-full bg-[#4F46E5]" />}
                       </div>
                       <span className="text-[0.75vw] font-semibold text-gray-700">Drag to Slide</span>
                     </div>
                     <div className="flex items-center gap-[0.75vw] cursor-pointer" onClick={() => updateGallery('dragToSlide', false)}>
                       <div className={`w-[1.25vw] h-[1.25vw] rounded-full border-2 flex items-center justify-center bg-white transition-all ${!(gallery.dragToSlide ?? true) ? 'border-[#4F46E5]' : 'border-gray-300'}`}>
                           {!(gallery.dragToSlide ?? true) && <div className="w-[0.65vw] h-[0.65vw] rounded-full bg-[#4F46E5]" />}
                       </div>
                       <span className="text-[0.75vw] font-semibold text-gray-700">Add Navigation Buttons</span>
                     </div>
                   </div>
                 </div>

                 <div className="space-y-[0.75vw]">
                   <div className="flex items-center gap-[0.5vw]">
                     <span className="text-[0.85vw] font-semibold text-gray-900 whitespace-nowrap">Other Controls</span>
                     <div className="h-[1px] bg-gray-200 flex-1" />
                   </div>

                   <div className="flex items-center justify-between px-[0.5vw]">
                      <span className="text-[0.75vw] font-semibold text-gray-700">Pagination Dots</span>
                      <div className="flex-1 border-b border-dashed border-gray-200 mx-[0.75vw]" />
                      <Switch enabled={gallery.showDots ?? true} onChange={(v) => updateGallery('showDots', v)} />
                   </div>
                   
                   {(gallery.showDots ?? true) && (
                       <div className="flex items-center justify-between px-[0.5vw]">
                          <span className="text-[0.75vw] font-semibold text-gray-700">Dot Color :</span>
                          <div className="flex items-center gap-[0.6vw]">
                             <div className="w-[1.75vw] h-[1.75vw] rounded-[0.25vw] border border-gray-200 overflow-hidden relative cursor-pointer shadow-sm">
                                <input type="color" value={gallery.dotColor || '#000000'} onChange={(e) => updateGallery('dotColor', e.target.value)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                                <div className="w-full h-full" style={{ backgroundColor: gallery.dotColor || '#000000' }} />
                             </div>
                             <div className="flex items-center border border-gray-300 rounded-[0.35vw] px-[0.5vw] py-[0.15vw] bg-white min-w-[7vw] justify-between">
                                <span className="text-[0.75vw] text-gray-500 font-mono uppercase">{gallery.dotColor || '#000000'}</span>
                                <span className="text-[0.75vw] text-gray-400 font-medium">100%</span>
                             </div>
                          </div>
                       </div>
                   )}
                   
                   <div className="flex items-center justify-between px-[0.5vw]">
                      <span className="text-[0.75vw] font-semibold text-gray-700">Infinity Loop Mode</span>
                      <div className="flex-1 border-b border-dashed border-gray-200 mx-[0.75vw]" />
                      <Switch enabled={gallery.infiniteLoop ?? true} onChange={(v) => updateGallery('infiniteLoop', v)} />
                   </div>
                 </div>


               </>
             )}

          </div>
        </AccordionItem>

        {/* Image Library Pop-up (Library of uploaded images) */}
        {showLibrary && (
           <div className="fixed z-[1000] bg-white border border-gray-100 rounded-[0.8vw] shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200" 
                 style={{ width: '320px', height: '540px', top: '50%', left: '24vw', transform: 'translate(-50%, -50%)' }}>
             <div className="flex items-center justify-between px-[1vw] py-[1vw] border-b border-gray-100">
               <h2 className="text-[1vw] font-semibold text-gray-900">Image Gallery</h2>
               <button onClick={() => setShowLibrary(false)} className="w-[1.8vw] h-[1.8vw] flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
                  <X className="w-[1.2vw] h-[1.2vw] text-gray-400" />
               </button>
             </div>

             <div className="px-[1vw] py-[0.5vw]">
               <h3 className="text-[0.85vw] font-semibold text-gray-900 mb-[0.2vw]">Upload your Image</h3>
               <p className="text-[0.7vw] text-gray-400 mb-[1vw]">
                 <span>You Can Reuse The File Which Is Uploaded In Gallery</span>
                 <span className="text-red-500">*</span>
               </p>
               <div
                 onClick={() => galleryInputRef.current?.click()}
                 onDragOver={(e) => e.preventDefault()}
                 onDrop={(e) => {
                   e.preventDefault();
                   const file = e.dataTransfer.files[0];
                   if (file && file.type.startsWith('image/')) {
                     handleLibraryFileUpload({ target: { files: [file] } });
                   }
                 }}
                 className="w-full h-[6vw] border-[0.15vw] border-dashed border-gray-300 rounded-[0.8vw] flex flex-col items-center justify-center bg-white hover:bg-gray-50 transition-all cursor-pointer group mb-[0.5vw]"
               >
                 <p className="text-[0.8vw] text-gray-500 font-normal mb-[0.6vw]">Drag & Drop or <span className="text-indigo-600 font-semibold">Upload</span></p>
                 <Icon icon="lucide:upload" className="w-[1.5vw] h-[1.5vw] text-gray-300 mb-[0.4vw]" />
                 <p className="text-[0.65vw] text-gray-400 text-center">Supported File : <span className="font-medium">JPG, PNG, WEBP</span></p>
               </div>
               <input type="file" ref={galleryInputRef} onChange={handleLibraryFileUpload} accept="image/*" className="hidden" />
             </div>

             <div className="custom-scrollbar overflow-y-auto px-[1vw] py-[0.5vw] flex-1">
               <h3 className="text-[0.85vw] font-semibold text-gray-900 mb-[0.5vw]">Uploaded Images</h3>
               {uploadedImages.length > 0 ? (
                 <div className="grid grid-cols-3 gap-[0.5vw]">
                   {uploadedImages.map((img, index) => (
                     <div key={img.id || index} className="group cursor-pointer flex flex-col items-center" onClick={() => setLocalLibrarySelected(img)}>
                       <div className={`aspect-square w-full rounded-[0.5vw] overflow-hidden border-[0.15vw] transition-all ${localLibrarySelected?.url === img.url ? 'border-indigo-600 shadow-md scale-[1.02]' : 'hover:border-indigo-400 border-gray-100'}`}>
                         <img src={img.url} className="w-full h-full object-cover" alt="" />
                       </div>
                     </div>
                   ))}
                 </div>
               ) : (
                 <div className="text-center py-[2vw] text-gray-400">
                   <p className="text-[0.8vw]">No uploaded images yet</p>
                 </div>
               )}
             </div>

             <div className="p-[0.75vw] border-t flex justify-end gap-[0.5vw] bg-white mt-auto">
               <button 
                 onClick={() => { setShowLibrary(false); setLocalLibrarySelected(null); }} 
                 className="flex-1 h-[2vw] border border-gray-300 rounded-[0.5vw] text-[0.7vw] font-semibold flex items-center justify-center gap-[0.3vw] hover:bg-gray-50"
               >
                 <X size="0.9vw" /> Close
               </button>
               <button
                 onClick={handlePlaceFromLibrary}
                 disabled={!localLibrarySelected}
                 className={`flex-1 h-[2vw] rounded-[0.5vw] text-[0.7vw] font-semibold flex items-center justify-center gap-[0.3vw] transition-all ${localLibrarySelected ? 'bg-black text-white hover:bg-zinc-800' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
               >
                 <Check size="0.9vw" /> Place
               </button>
             </div>
           </div>
        )}
      </div>
    </div>
  );
};

export default OtherSetup;
