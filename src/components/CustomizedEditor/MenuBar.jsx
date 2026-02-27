import React, { useState } from 'react';
import { Icon } from '@iconify/react';
import { motion, AnimatePresence } from 'framer-motion';
import PremiumDropdown from './PremiumDropdown';
import { Plus, Trash2, Edit2, ChevronDown, ChevronRight } from 'lucide-react';
import BookmarkStylesPopup, { getBookmarkClipPath, getBookmarkBorderRadius } from './BookmarkStylesPopup';


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

const Switch1 = ({ enabled, onChange }) => (
  <button
    onClick={(e) => {
      e.stopPropagation();
      onChange(!enabled);
    }}
    className={`group relative inline-flex items-center h-[1vw] w-[2.8vw] shrink-0 cursor-pointer rounded-[1vw] transition-all duration-200 ease-in-out border outline-none ${
              enabled ? 'bg-[#373D8A] border-[#373D8A]' : 'bg-transparent border-[#373D8A]'
            }`}
          >
            <div
              className={`pointer-events-none flex items-center justify-center h-[1.3vw] w-[1.3vw] rounded-full bg-[#373D8A] shadow-sm transition-all duration-200 ease-in-out absolute  ${
                enabled ? 'left-[1.5vw]' : 'right-[1.5vw]'
              }`}
            >
              {enabled && (
                <Icon icon="lucide:check" className="w-[0.9vw] h-[0.9vw] text-white " />
              )}
    </div>
  </button>
);

// Reusable Section Header
const SectionHeader = ({ title }) => (
  <div className="flex items-center gap-[1vw] mt-[1.2vw] mb-[0.8vw]">
    <h4 className="text-[0.85vw] font-semibold text-gray-900 whitespace-nowrap">{title}</h4>
    <div className="h-[1px] bg-gray-200 flex-grow mt-[0.2vw]"></div>
  </div>
);

// Menu Item Component (Card Style)
const MenuItem = ({ label, enabled, onChange, hasSettings, isExpanded, onToggleSettings, children }) => (
  <div 
    className={`bg-white rounded-[1vw] shadow-[0_0.4vw_1.2vw_rgba(0,0,0,0.06)] border border-gray-50 transition-all duration-300 relative ${isExpanded ? 'ring-1 ring-gray-200 z-50' : 'z-0'}`}
    style={{ overflow: isExpanded ? 'visible' : 'hidden' }}
  >
    <div className="flex items-center justify-between px-[0.5vw] py-[0.9vw] shadow-[0_0.4vw_1.2vw_rgba(0,0,0,0.06)] border border-gray-100 transition-all duration-300 ">
      <span className="text-[0.75vw] font-semibold text-gray-700">{label}</span>
      <div className="flex items-center gap-[0.75vw]">
        {hasSettings && (
          <button 
            onClick={onToggleSettings}
            className={`p-[0.25vw] rounded-[0.4vw] transition-colors ${
              isExpanded ? 'bg-gray-100 text-[#5551FF]' : 'hover:bg-gray-100 text-gray-400'
            }`}
          >
            <Icon 
              icon="tdesign:adjustment-filled" 
              className={`w-[1vw] h-[1vw] rotate-90 transition-colors ${isExpanded ? 'text-[#5551FF]' : 'text-gray-800'}`} 
            />
          </button>
        )}
        <Switch enabled={enabled} onChange={onChange} />
      </div>
    </div>
    {children}
  </div>
);

// TOC Item Component for Editor
const TocItem = ({ item, index, onUpdate, onDelete, settings, activeTOCItem, setActiveTOCItem }) => {
  const isHeadActive = activeTOCItem?.type === 'head' && activeTOCItem?.index === index;

  return (
    <div className="mb-[1vw] relative flex gap-[0.6vw]">
       {/* Number Circle and Vertical Connector */}
       <div className="relative flex flex-col items-center w-[1.4vw] shrink-0">
          <div className="w-[1.4vw] h-[1.4vw] rounded-full bg-[#525252] text-white flex items-center justify-center text-[0.8vw] font-medium z-10 shrink-0">
            {index + 1}
          </div>
       </div>

       {/* Form fields */}
       <div className="flex-1 flex flex-col gap-[0.6vw]">
          {/* Heading Inputs */}
          <div 
            className={`flex items-center gap-[0.3vw] relative group ${isHeadActive ? 'p-[0.3vw] bg-[#3F37C9] rounded-[0.5vw] border-[1px] border-[#3F37C9] shadow-sm' : ''}`}
            onClick={() => setActiveTOCItem({ type: 'head', index })}
          >
             <div className={`flex-1 relative ${isHeadActive ? 'bg-white rounded-[0.3vw] flex items-center px-[0.6vw]' : 'flex items-center'}`}>
                <input
                  type="text"
                  placeholder={`Heading ${index + 1}`}
                  value={item.title || ''}
                  onChange={(e) => onUpdate({ ...item, title: e.target.value })}
                  className={`w-full h-[2.6vw] text-[0.85vw] border-gray-900 transition-all placeholder-[#BCC2CF] ${
                    isHeadActive 
                    ? 'text-gray-900 h-[2vw]' 
                    : 'px-[0.8vw] text-gray-400 border border-[#BCBCBC] rounded-[0.6vw] hover:border-[#3F37C9] focus:border-[#3F37C9] shadow-sm'
                  }`}
                />
                
                {/* Actions: Show on Hover or Active */}
                <div className={`flex items-center gap-[0.2vw] ml-auto ${isHeadActive ? '' : 'absolute right-[0.5vw] opacity-0 group-hover:opacity-100 transition-opacity'}`}>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete();
                    }}
                    className="text-red-500 hover:text-red-600 p-[0.2vw] "
                    title="Delete Heading"
                  >
                    <Trash2 size="1vw" strokeWidth={2} />
                  </button>
                </div>
             </div>
             <div className={`${isHeadActive ? 'w-[2.6vw] h-[2vw] bg-white rounded-[0.3vw] flex items-center justify-center' : ''}`}>
                <input
                  type="text"
                  value={item.page || ''}
                  placeholder={String(index + 1)}
                  onChange={(e) => onUpdate({ ...item, page: e.target.value })}
                  className={`text-center text-[0.85vw] border-gray-900 transition-all ${
                    isHeadActive 
                    ? 'w-full text-gray-900 bg-transparent' 
                    : 'w-[2.6vw] h-[2.6vw] text-gray-400 border border-[#BCBCBC] rounded-[0.6vw] hover:border-[#3F37C9] focus:border-[#3F37C9] shadow-sm'
                  }`}
                />
             </div>
          </div>

          {/* Subheadings */}
          {item.subheadings?.map((sub, sIdx) => {
             const isSubActive = activeTOCItem?.type === 'sub' && activeTOCItem?.index === index && activeTOCItem?.sIdx === sIdx;
             return (
               <div 
                 key={sub.id || sIdx} 
                 className="flex items-center relative ml-[1.8vw]"
                 onClick={(e) => {
                   e.stopPropagation();
                   setActiveTOCItem({ type: 'sub', index, sIdx });
                 }}
               >
                  {/* L-shaped dashed connector */}
                  <div 
                    className={`absolute left-[-1.1vw] w-[1.1vw] border-l-[1.8px] border-b-[1.8px] border-dashed border-[#373D8A] rounded-bl-[0.2vw] pointer-events-none ${
                      sIdx === 0 ? 'top-[-0.6vw] h-[2.1vw]' : 'top-[-1.3vw] h-[3.1vw]'
                    }`}
                  ></div>
                  
                  <div className={`flex-1 flex items-center gap-[0.3vw] relative group ${isSubActive ? 'p-[0.3vw] bg-[#3F37C9] rounded-[0.5vw] border-[1px] border-[#3F37C9] shadow-sm' : ''}`}>
                    <div className={`flex-1 relative ${isSubActive ? 'bg-white rounded-[0.3vw] flex items-center px-[0.6vw]' : 'flex items-center'}`}>
                      <input
                        type="text"
                        placeholder={`Subheading ${sIdx + 1}`}
                        value={sub.title || ''}
                        onChange={(e) => {
                            const newSubs = [...item.subheadings];
                            newSubs[sIdx] = { ...sub, title: e.target.value };
                            onUpdate({ ...item, subheadings: newSubs });
                        }}
                        className={`w-full h-[2.4vw] text-[0.85vw] border-gray-900 transition-all placeholder-[#BCC2CF] ${
                          isSubActive 
                          ? 'text-gray-400 h-[2vw]' 
                          : 'px-[0.2vw] text-gray-700 border border-[#BCBCBC] rounded-[0.6vw] hover:border-[#3F37C9] focus:border-[#3F37C9] shadow-sm'
                        }`}
                      />
                      
                      {/* Actions for Subheading: Show on Hover or Active */}
                      <div className={`flex items-center ml-auto ${isSubActive ? '' : 'absolute right-[0.5vw] opacity-0 group-hover:opacity-100 transition-opacity'}`}>
                        <button 
                          onClick={(e) => {
                              e.stopPropagation();
                              const newSubs = item.subheadings.filter((_, i) => i !== sIdx);
                              onUpdate({ ...item, subheadings: newSubs });
                          }}
                          className="text-red-500 hover:text-red-600 p-[0.2vw]"
                          title="Delete Subheading"
                        >
                          <Trash2 size="1vw" strokeWidth={2} />
                        </button>
                      </div>
                    </div>
                    <div className={`${isSubActive ? 'w-[2vw] h-[2vw] bg-white rounded-[0.3vw] flex items-center justify-center' : ''}`}>
                      <input
                        type="text"
                        value={sub.page || ''}
                        placeholder={String(sIdx + 1)}
                        onChange={(e) => {
                           const newSubs = [...item.subheadings];
                           newSubs[sIdx] = { ...sub, page: e.target.value };
                           onUpdate({ ...item, subheadings: newSubs });
                        }}
                        className={`text-center text-[0.85vw] border-gray-900 transition-all ${
                          isSubActive 
                          ? 'w-full text-gray-900 bg-transparent' 
                          : 'w-[2.6vw] h-[2.4vw] text-gray-400 border border-[#BCBCBC] rounded-[0.6vw] hover:border-[#3F37C9] focus:border-[#3F37C9] '
                        }`}
                      />
                    </div>
                  </div>
               </div>
             )
          })}
          
          <div className="flex justify-end pt-[0.2vw]">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                const newSubs = [...(item.subheadings || [])];
                newSubs.push({ id: Date.now(), title: '', page: '' });
                onUpdate({ ...item, subheadings: newSubs });
                setActiveTOCItem({ type: 'sub', index, sIdx: newSubs.length - 1 });
              }}
              className="text-gray-400  hover:text-gray-800 transition-colors p-[0.2vw]"
              title="Add Subheading"
            >
               <Icon icon="lucide:square-pen" className="w-[1vw] h-[1vw]" strokeWidth={2} />
            </button>
          </div>
       </div>
    </div>
  )
};


const MenuBar = ({ onBack, settings, onUpdate }) => {
  const [expandedSection, setExpandedSection] = useState(null);
  const [showStylesPopup, setShowStylesPopup] = useState(false);
  const [activeTOCItem, setActiveTOCItem] = useState(null); // { type: 'head'|'sub', index, sIdx }


  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const handleRemoveAll = () => {
    const updatedSettings = { ...settings };
    const sections = ['navigation', 'viewing', 'interaction', 'media', 'shareExport', 'brandingProfile'];
    
    sections.forEach(section => {
      if (updatedSettings[section]) {
        const updatedSection = { ...updatedSettings[section] };
        Object.keys(updatedSection).forEach(key => {
          if (typeof updatedSection[key] === 'boolean') {
            updatedSection[key] = false;
          }
        });
        updatedSettings[section] = updatedSection;
      }
    });

    onUpdate(updatedSettings);
  };

  const updateSection = (section, field, value) => {
    onUpdate({
      ...settings,
      [section]: {
        ...settings[section],
        [field]: value
      }
    });
  };

  const updateNestedSetting = (section, nestedObject, field, value) => {
    const sectionState = settings[section] || {};
    const nestedState = sectionState[nestedObject] || {};

    onUpdate({
      ...settings,
      [section]: {
        ...sectionState,
        [nestedObject]: {
          ...nestedState,
          [field]: value
        }
      }
    });
  };

  // Helper for direct property updates in settings root (like tocSettings which is separate)
  const updateRootSetting = (rootKey, field, value) => {
    onUpdate({
      ...settings,
      [rootKey]: {
        ...settings[rootKey],
        [field]: value
      }
    });
  };

  return (
    <div className="flex flex-col h-full bg-white font-sans relative overflow-visible">
       <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      
      {/* Header */}
      <div className="h-[8vh] flex items-center justify-between px-[1vw] border-b border-gray-100">
        <div className="flex items-center gap-[0.75vw]">
          <Icon icon="lucide:menu" className="w-[1vw] h-[1vw] font-semibold" />
          <span className="text-[1vw] font-semibold text-gray-900">Menu Bar</span>
        </div>
        <button onClick={onBack} className="text-gray-600 hover:text-gray-900">
          <Icon icon="ic:round-arrow-back" className="w-[1.25vw] h-[1.25vw]" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-[1.55vw] pb-[15vw] hide-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>


        {/* Navigation Section */}
        <SectionHeader title="Navigation" />
        <div className="space-y-[0.625vw]">
          <MenuItem 
            label="Next / Preview Buttons" 
            enabled={settings.navigation?.nextPrevButtons} 
            onChange={(val) => updateSection('navigation', 'nextPrevButtons', val)} 
          />
          <MenuItem 
            label="Mouse Wheel Navigation" 
            enabled={settings.navigation?.mouseWheel} 
            onChange={(val) => updateSection('navigation', 'mouseWheel', val)} 
          />
          <MenuItem 
            label="Drag to Turn Pages" 
            enabled={settings.navigation?.dragToTurn} 
            onChange={(val) => updateSection('navigation', 'dragToTurn', val)} 
          />
          <MenuItem 
            label="Page Quick Access" 
            enabled={settings.navigation?.pageQuickAccess} 
            onChange={(val) => updateSection('navigation', 'pageQuickAccess', val)} 
          />
          
          {/* Table of Contents with Settings */}
          <MenuItem 
            label="Table of Contents" 
            enabled={settings.navigation?.tableOfContents} 
            hasSettings={true}
            isExpanded={expandedSection === 'toc'}
            onToggleSettings={() => toggleSection('toc')}
            onChange={(val) => updateSection('navigation', 'tableOfContents', val)} 
          >
            <AnimatePresence>
              {expandedSection === 'toc' && (
                <motion.div 
                  initial={{ height: 0, opacity: 0, overflow: 'hidden' }}
                  animate={{ 
                    height: 'auto', 
                    opacity: 1,
                    transitionEnd: { overflow: 'visible' }
                  }}
                  exit={{ height: 0, opacity: 0, overflow: 'hidden' }}
                  className="border-t border-gray-200 bg-gray-50/50 relative z-10"
                  style={{ overflow: 'visible' }}
                >
                  <div className="p-[1vw]">
                    <div className="space-y-[0.85vw] mb-[1.5vw]">
                      <div className="flex items-center justify-between">
                        <span className="text-[0.75vw] font-semibold text-gray-700">Add Search to the TOC</span>
                        <Switch1 
                          enabled={settings.tocSettings?.addSearch} 
                          onChange={(val) => updateRootSetting('tocSettings', 'addSearch', val)} 
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[0.75vw] font-semibold text-gray-700">Add Page Number to the TOC</span>
                        <Switch1 
                          enabled={settings.tocSettings?.addPageNumber} 
                          onChange={(val) => updateRootSetting('tocSettings', 'addPageNumber', val)} 
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[0.75vw] font-semibold text-gray-700">Add Serial Number to the Heading</span>
                        <Switch1
                          enabled={settings.tocSettings?.addSerialNumberHeading} 
                          onChange={(val) => updateRootSetting('tocSettings', 'addSerialNumberHeading', val)} 
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[0.75vw] font-semibold text-gray-700">Add Serial Number to the Subheading</span>
                        <Switch1 
                          enabled={settings.tocSettings?.addSerialNumberSubheading} 
                          onChange={(val) => updateRootSetting('tocSettings', 'addSerialNumberSubheading', val)} 
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-[0.8vw] mb-[1.2vw] pr-[0.4vw]">
                      <h5 className="text-[0.75vw] font-semibold text-gray-700">TOC Content</h5>
                      <div className="h-[1.5px] bg-[#E2E8F0] flex-1"></div>
                    </div>

                    <div className="space-y-[0.2vw] max-h-[30vw] overflow-y-auto pr-[0.4vw] custom-scrollbar">
                      {settings.tocSettings?.content?.map((item, idx) => (
                        <TocItem 
                           key={idx}
                           item={item}
                           index={idx}
                           onUpdate={(updatedItem) => {
                               const newContent = [...(settings.tocSettings.content || [])];
                               newContent[idx] = updatedItem;
                               updateRootSetting('tocSettings', 'content', newContent);
                           }}
                           onDelete={() => {
                               const newContent = (settings.tocSettings.content || []).filter((_, i) => i !== idx);
                               updateRootSetting('tocSettings', 'content', newContent);
                           }}
                           settings={settings}
                           activeTOCItem={activeTOCItem}
                           setActiveTOCItem={setActiveTOCItem}
                        />   
                      ))}

                    </div>
                    <div className="flex gap-[0.3vw] mt-[1vw] justify-end pr-[0.4vw]">
                       <button 
                         onClick={() => {
                             const newContent = [...(settings.tocSettings?.content || [])];
                             newContent.push({ id: Date.now(), title: '', page: '' });
                             updateRootSetting('tocSettings', 'content', newContent);
                             setActiveTOCItem({ type: 'head', index: newContent.length - 1 });
                         }}
                         className="bg-black text-white px-[1vw] py-[0.3vw] rounded-lg text-[0.8vw] font-semibold flex items-center justify-center gap-[0.4vw] hover:bg-gray-800 transition-all shadow-md"
                       >
                         <Icon icon="lucide:plus" className="w-[1vw] h-[1vw]" strokeWidth={3} /> Head
                       </button>
                       <button 
                         onClick={() => {
                             const newContent = [...(settings.tocSettings?.content || [])];
                             if (newContent.length > 0) {
                                 // Target the currently active heading index, or fallback to the last heading
                                 let targetIndex = newContent.length - 1;
                                 if (activeTOCItem && activeTOCItem.index !== undefined) {
                                     targetIndex = activeTOCItem.index;
                                 }
                                 
                                 const targetItem = newContent[targetIndex];
                                 if (!targetItem.subheadings) targetItem.subheadings = [];
                                 targetItem.subheadings.push({
                                     id: Date.now() + 1,
                                     title: '', 
                                     page: ''
                                 });
                                 updateRootSetting('tocSettings', 'content', newContent);
                                 setActiveTOCItem({ type: 'sub', index: targetIndex, sIdx: targetItem.subheadings.length - 1 });
                             }
                         }}
                         className="bg-black text-white px-[1vw] py-[0.3vw] rounded-lg text-[0.8vw] font-semibold flex items-center justify-center gap-[0.4vw] hover:bg-gray-800 transition-all shadow-md"
                       >
                         <Icon icon="lucide:plus" className="w-[1vw] h-[1vw]" strokeWidth={3} /> Sub
                       </button>
                    </div>

                    <div className="mt-[0.5vw] pt-[0.5vw] pr-[0.4vw] border-t border-gray-300 flex justify-end">
                       <button className="bg-[#4D39FF] text-white px-[1vw] py-[0.3vw] rounded-[0.5vw] text-[0.8vw] font-medium hover:bg-[#3F2CFF] transition-all active:scale-95">
                         Save
                       </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </MenuItem>

          <MenuItem 
            label="Page Thumbnails" 
            enabled={settings.navigation?.pageThumbnails} 
            onChange={(val) => updateSection('navigation', 'pageThumbnails', val)} 
          />

          {/* Bookmark with Settings */}
          <MenuItem 
            label="Bookmark" 
            enabled={settings.navigation?.bookmark} 
            hasSettings={true}
            isExpanded={expandedSection === 'bookmark'}
            onToggleSettings={() => toggleSection('bookmark')}
            onChange={(val) => updateSection('navigation', 'bookmark', val)} 
          >
            <AnimatePresence>
              {expandedSection === 'bookmark' && (
                <motion.div 
                  initial={{ height: 0, opacity: 0, overflow: 'hidden' }}
                  animate={{ 
                    height: 'auto', 
                    opacity: 1,
                    transitionEnd: { overflow: 'visible' }
                  }}
                  exit={{ height: 0, opacity: 0, overflow: 'hidden' }}
                  className="border-t border-gray-200 bg-gray-50/50 relative z-10"
                  style={{ overflow: 'visible' }}
                >
                  <div className="p-[1vw]">
                    <div className="flex items-center gap-[0.5vw] mb-[0.75vw]">
                      <h5 className="text-[0.75vw] font-semibold text-gray-700">Bookmark Symbol</h5>
                      <div className="h-[1px] bg-gray-200 flex-1"></div>
                    </div>
                    
                    <div className="flex items-center gap-[1vw]">
                      <div className="w-[5vw] h-[5vw] p-[0.5vw] flex items-center bg-white shadow-sm border border-gray-200 rounded-[0.5vw] relative">
                        {/* Bookmark icon preview */}
                        <button 
                          onClick={() => setShowStylesPopup(true)}
                          className="absolute top-[0.15vw] right-[0.25vw] p-[0.1vw] hover:bg-gray-100 rounded-full transition-colors"
                        >
                          <Icon icon="lucide:arrow-left-right" className="w-[0.9vw] h-[0.9vw] text-gray-800" />
                        </button>
                        <div 
                          className="w-[4vw] h-[2.5vw] relative overflow-hidden shadow-sm transition-all duration-300"
                          style={{
                              backgroundColor: settings.navigation?.bookmarkSettings?.color || '#C45A5A',
                              clipPath: getBookmarkClipPath(settings.navigation?.bookmarkSettings?.style || 1),
                              borderRadius: getBookmarkBorderRadius(settings.navigation?.bookmarkSettings?.style || 1)
                          }}
                        >
                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white text-[0.5vw] font-semibold whitespace-nowrap">Bookmark</div>
                        </div>
                        
                      </div>
                      
                      <div className="flex-1 flex flex-col space-y-[0.1vw] justify-between">
                        <span className="text-[0.75vw] font-semibold text-gray-700 pb-[0.5vw]">Select Text :</span>
                        <PremiumDropdown 
                          options={fontFamilies} 
                          value={settings.navigation?.bookmarkSettings?.font || 'Poppins'}
                          onChange={(val) => updateNestedSetting('navigation', 'bookmarkSettings', 'font', val)}
                          width="90%"
                          isFont={true}
                          align="right"
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            {showStylesPopup && (
              <BookmarkStylesPopup 
                currentStyle={settings.navigation?.bookmarkSettings?.style || 1}
                onClose={() => setShowStylesPopup(false)}
                onSelect={(style) => updateNestedSetting('navigation', 'bookmarkSettings', 'style', style)}
              />
            )}
          </MenuItem>

          <MenuItem 
            label="Start / End Navigation" 
            enabled={settings.navigation?.startEndNav} 
            onChange={(val) => updateSection('navigation', 'startEndNav', val)} 
          />
        </div>

        {/* Viewing Section */}
        <SectionHeader title="Viewing" />
        <div className="space-y-[0.625vw]">
          <MenuItem 
            label="Zoom In / Out Button" 
            enabled={settings.viewing?.zoom} 
            onChange={(val) => updateSection('viewing', 'zoom', val)} 
          />
          <MenuItem 
            label="Full Screen View" 
            enabled={settings.viewing?.fullScreen} 
            onChange={(val) => updateSection('viewing', 'fullScreen', val)} 
          />
        </div>

        {/* Interaction Tools Section */}
        <SectionHeader title="Interaction Tools" />
        <div className="space-y-[0.625vw]">
          <MenuItem 
            label="Search Inside Book" 
            enabled={settings.interaction?.search} 
            onChange={(val) => updateSection('interaction', 'search', val)} 
          />
          <MenuItem 
            label="Add Notes" 
            enabled={settings.interaction?.notes} 
            onChange={(val) => updateSection('interaction', 'notes', val)} 
          />
          <MenuItem 
            label="Gallery" 
            enabled={settings.interaction?.gallery} 
            onChange={(val) => updateSection('interaction', 'gallery', val)} 
          />
        </div>

        {/* Media Controls Section */}
        <SectionHeader title="Media Controls" />
        <div className="space-y-[0.625vw]">
          <MenuItem 
            label="Auto Flip Features" 
            enabled={settings.media?.autoFlip} 
            onChange={(val) => updateSection('media', 'autoFlip', val)} 
         />
          <MenuItem 
            label="Background Audio" 
            enabled={settings.media?.backgroundAudio} 
            onChange={(val) => updateSection('media', 'backgroundAudio', val)} 
          />
        </div>

        {/* Share & Export Section */}
        <SectionHeader title="Share & Export" />
        <div className="space-y-[0.625vw]">
          <MenuItem 
            label="Share" 
            enabled={settings.shareExport?.share} 
            onChange={(val) => updateSection('shareExport', 'share', val)} 
          />
          <MenuItem 
            label="Download" 
            enabled={settings.shareExport?.download} 
            onChange={(val) => updateSection('shareExport', 'download', val)} 
          />
          <MenuItem 
            label="Contact" 
            enabled={settings.shareExport?.contact} 
            onChange={(val) => updateSection('shareExport', 'contact', val)} 
          />
        </div>

        {/* Branding & Profile Section */}
        <SectionHeader title="Branding & Profile" />
        <div className="space-y-[0.625vw]">
          <MenuItem 
            label="Logo" 
            enabled={settings.brandingProfile?.logo} 
            onChange={(val) => updateSection('brandingProfile', 'logo', val)} 
          />
          <MenuItem 
            label="Profile" 
            enabled={settings.brandingProfile?.profile} 
            onChange={(val) => updateSection('brandingProfile', 'profile', val)} 
          />
        </div>
      </div>
    </div>
  );
};

export default MenuBar;
