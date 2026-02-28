import React from 'react';
import PreviewArea from '../CustomizedEditor/PreviewArea';
import { Icon } from '@iconify/react';

const FlipbookPreview = ({ pages, pageName, onClose, isMobile, isDoublePage, settings, targetPage }) => {
  return (
    <div 
      className="fixed inset-0 z-[1000] flex flex-col overflow-hidden"
      style={{ backgroundColor: settings?.background?.color || 'white' }}
    >
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
        onClose={onClose}
      />
    </div>
  );
};

export default FlipbookPreview;
