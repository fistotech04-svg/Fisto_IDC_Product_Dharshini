import React from 'react';
import PreviewArea from '../CustomizedEditor/PreviewArea';
import { Icon } from '@iconify/react';

const FlipbookPreview = ({ pages, pageName, onClose, isMobile, isDoublePage, settings, targetPage }) => {
  return (
    <div 
      className="fixed inset-0 z-[1000] flex flex-col overflow-hidden"
      style={{ backgroundColor: settings?.background?.color || 'white' }}
    >
      {/* Overlay Close Button for Editor Preview */}
      <div className="absolute top-[1.5vh] right-[8vw] z-[2000]">
        <button
          onClick={onClose}
          className="w-[2.5vw] h-[2.5vw] bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-full text-white flex items-center justify-center transition-all border border-white/20 shadow-lg"
          title="Close Preview"
        >
          <Icon icon="lucide:x" className="w-[1.2vw] h-[1.2vw]" />
        </button>
      </div>
      
      <PreviewArea 
        bookName={pageName} 
        pages={pages}
        targetPage={targetPage}
        logoSettings={settings?.logo}
        backgroundSettings={settings?.background}
        bookAppearanceSettings={settings?.appearance}
        menuBarSettings={settings?.menubar}
        leadFormSettings={settings?.leadform}
        profileSettings={settings?.profile}
        otherSetupSettings={settings?.othersetup}
        hideHeader={false}
      />
    </div>
  );
};

export default FlipbookPreview;
