import React, { useState } from 'react';
import { Icon } from '@iconify/react';

const ViewBookmarkPopup = ({ onClose, bookmarks = [], onDelete, onUpdate, popupSettings }) => {
    const [editingId, setEditingId] = useState(null);
    const [editValue, setEditValue] = useState('');

    const containerStyle = {
        backgroundColor: popupSettings?.backgroundColor?.fill || '#575C9C',
        border: popupSettings?.backgroundColor?.stroke && popupSettings.backgroundColor.stroke !== '#' ? `1px solid ${popupSettings.backgroundColor.stroke}` : 'none',
        fontFamily: popupSettings?.textProperties?.font || 'Poppins'
    };

    const headerTextStyle = {
        color: popupSettings?.textProperties?.fill || '#ffffff',
        fontFamily: popupSettings?.textProperties?.font || 'Poppins'
    };

    const iconColor = popupSettings?.iconsColor?.fill || '#ffffff';
    const iconStyle = {
        color: iconColor,
        filter: popupSettings?.iconsColor?.stroke && popupSettings.iconsColor.stroke !== '#' 
            ? `drop-shadow(1px 0 0 ${popupSettings.iconsColor.stroke}) drop-shadow(-1px 0 0 ${popupSettings.iconsColor.stroke}) drop-shadow(0 1px 0 ${popupSettings.iconsColor.stroke}) drop-shadow(0 -1px 0 ${popupSettings.iconsColor.stroke})` 
            : 'none'
    };

    // Only show user-added bookmarks
    const displayBookmarks = bookmarks;

    const handleEditStart = (bookmark) => {
        setEditingId(bookmark.id);
        setEditValue(bookmark.label);
    };

    const handleEditSave = (id) => {
        if (onUpdate && editValue.trim()) {
            onUpdate(id, editValue);
        }
        setEditingId(null);
    };

    const handleDelete = (id) => {
        if (onDelete) {
            onDelete(id);
        }
    };

    return (
        <>
            <div className="absolute inset-0 z-[99] pointer-events-auto" onClick={onClose} />
            <div className="absolute bottom-[4.5vw] right-[27.3vw] z-[100] pointer-events-auto">
                <div 
                    className="rounded-[1vw] shadow-2xl p-[0.8vw] w-[13vw] relative animate-in slide-in-from-bottom-4 duration-200" 
                    style={containerStyle}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="text-center mb-[0.6vw]">
                        <h2 className="text-[0.95vw] font-semibold" style={headerTextStyle}>Book Mark</h2>
                        <div className="h-[1.5px] w-full mt-[0.4vw] opacity-50" style={{ backgroundColor: headerTextStyle.color }}></div>
                    </div>

                    <div className="flex flex-col gap-[0.3vw]">
                        {displayBookmarks.map((bookmark) => (
                            <div key={bookmark.id} className="flex items-center justify-between px-[0.6vw] py-[0.45vw] text-white hover:bg-white/10 rounded-[0.3vw] transition-colors group">
                                {editingId === bookmark.id ? (
                                    <input
                                        autoFocus
                                        className="bg-white/20 border-none outline-none text-[0.75vw] text-white rounded px-[0.2vw] w-full mr-[0.4vw]"
                                        value={editValue}
                                        onChange={(e) => setEditValue(e.target.value)}
                                        onBlur={() => handleEditSave(bookmark.id)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleEditSave(bookmark.id)}
                                        style={{ fontFamily: bookmark.font || 'inherit' }}
                                    />
                                ) : (
                                    <span 
                                        className="text-[0.75vw] font-medium truncate flex-1"
                                        style={{ fontFamily: bookmark.font || 'inherit' }}
                                    >
                                        {bookmark.label}
                                    </span>
                                )}

                                <div className="flex items-center gap-[0.4vw] flex-shrink-0">
                                    <button onClick={() => handleEditStart(bookmark)} className="hover:scale-110 transition-transform">
                                        <Icon icon="lucide:pencil" className="w-[0.85vw] h-[0.85vw]" style={iconStyle} />
                                    </button>
                                    <button onClick={() => handleDelete(bookmark.id)} className="hover:scale-110 transition-transform">
                                        <Icon icon="lucide:trash-2" className="w-[0.85vw] h-[0.85vw]" style={iconStyle} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
};

export default ViewBookmarkPopup;
