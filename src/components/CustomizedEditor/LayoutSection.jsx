import React from 'react';
import { Icon } from '@iconify/react';

const LayoutSection = () => {
  return (
    <div className="p-12 flex flex-col items-center justify-center text-center gap-4 text-gray-400">
      <Icon icon="lucide:layout-panel-left" className="w-16 h-16 opacity-20" />
      <p className="text-sm font-semibold">Layout Settings<br />Coming Soon</p>
    </div>
  );
};

export default LayoutSection;
