import React from 'react';
import { Icon } from '@iconify/react';

const NotesViewerPopup = ({ notes, onClose, popupSettings }) => {
    const containerStyle = {
        backgroundColor: popupSettings?.backgroundColor?.fill || '#F1F5F9',
        border: popupSettings?.backgroundColor?.stroke && popupSettings.backgroundColor.stroke !== '#' ? `0.1vw solid ${popupSettings.backgroundColor.stroke}` : '0.1vw solid #e5e7eb',
        fontFamily: popupSettings?.textProperties?.font || 'Poppins'
    };

    const headerTextStyle = {
        color: popupSettings?.textProperties?.fill || '#1E293B',
        fontFamily: popupSettings?.textProperties?.font || 'Poppins'
    };

    const iconColor = popupSettings?.iconsColor?.fill || '#EF4444';
    const iconStyle = {
        color: iconColor,
        filter: popupSettings?.iconsColor?.stroke && popupSettings.iconsColor.stroke !== '#' 
            ? `drop-shadow(1px 0 0 ${popupSettings.iconsColor.stroke}) drop-shadow(-1px 0 0 ${popupSettings.iconsColor.stroke}) drop-shadow(0 1px 0 ${popupSettings.iconsColor.stroke}) drop-shadow(0 -1px 0 ${popupSettings.iconsColor.stroke})` 
            : 'none',
        borderColor: iconColor
    };

    return (
        <div
            className="absolute inset-0 z-[110] flex items-center justify-center pointer-events-auto bg-black/10 backdrop-blur-[2px]"
            onClick={onClose}
        >
            <div
                className="w-[70vw] h-[80vh] rounded-[1.2vw] shadow-[0_2vw_5vw_rgba(0,0,0,0.2)] flex flex-col pointer-events-auto animate-in zoom-in-95 duration-200 overflow-hidden px-[2vw]"
                style={containerStyle}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-[2vw] py-[1.2vw]">
                    <div className="flex-1"></div>
                    <div className="flex-1 flex justify-center">
                        <h2 className="text-[1.2vw] font-semibold" style={headerTextStyle}>Notes Viewer</h2>
                    </div>
                    <div className="flex-1 flex justify-end">
                        <button
                            onClick={onClose}
                            className="w-[2.2vw] h-[2.2vw] flex items-center justify-center rounded-[0.5vw] border transition-colors hover:bg-red-50"
                            style={{ borderColor: iconStyle.borderColor, color: iconStyle.color }}
                        >
                            <Icon icon="lucide:x" className="w-[1.2vw] h-[1.2vw]" />
                        </button>
                    </div>
                </div>

                {/* Grid Content */}
                <div className="flex-1 overflow-y-auto p-[2.5vw] custom-scrollbar">
                    <div className="grid grid-cols-3 gap-[2vw] auto-rows-max">
                        {notes.map((note, idx) => (
                            <div
                                key={idx}
                                className="relative h-[13vw] rounded-[0.8vw] p-[1.2vw] shadow-sm flex flex-col transition-all hover:scale-[1.02] hover:shadow-lg"
                                style={{
                                    backgroundColor: note.background,
                                    opacity: note.bgOpacity / 100
                                }}
                            >
                                {/* Note Header */}
                                <div className="flex justify-end gap-[0.4vw] mb-[0.6vw] items-center">
                                    <span
                                        className="text-[0.65vw] font-semibold"
                                        style={{ color: note.color, opacity: note.textOpacity / 100 }}
                                    >
                                        {note.pageLabel}
                                    </span>
                                </div>

                                {/* Note Body */}
                                <div
                                    className="flex-1 overflow-y-auto whitespace-pre-wrap break-words custom-scrollbar-mini"
                                    style={{
                                        textAlign: note.alignment,
                                        fontWeight: note.weight === 'Bold' ? 700 : note.weight === 'Semi Bold' ? 600 : note.weight === 'Regular' ? 400 : 100,
                                        fontStyle: note.styles.includes('italic') ? 'italic' : 'normal',
                                        textDecoration: `${note.styles.includes('underline') ? 'underline' : ''} ${note.styles.includes('strike') ? 'line-through' : ''}`,
                                        textTransform: note.case === 'upper' ? 'uppercase' : note.case === 'lower' ? 'lowercase' : note.case === 'sentence' ? 'capitalize' : 'none',
                                        fontFamily: note.fontFamily,
                                        fontSize: `clamp(0.6vw, ${note.fontSize / 1.8}px, 0.9vw)`,
                                        color: note.color,
                                        opacity: note.textOpacity / 100,
                                        lineHeight: 1.4
                                    }}
                                >
                                    {note.content}
                                </div>
                            </div>
                        ))}

                        {notes.length === 0 && (
                            <div className="col-span-3 flex flex-col items-center justify-center py-[10vw] text-gray-400 gap-[1vw]">
                                <Icon icon="solar:notes-bold" className="w-[5vw] h-[5vw] opacity-20" />
                                <p className="text-[1.2vw] font-medium">No notes added yet</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NotesViewerPopup;
