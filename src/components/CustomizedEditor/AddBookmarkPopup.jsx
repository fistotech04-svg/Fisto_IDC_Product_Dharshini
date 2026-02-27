import React, { useState } from 'react';
import { Icon } from '@iconify/react';
import { Pipette } from 'lucide-react';
import { getBookmarkClipPath, getBookmarkBorderRadius } from './BookmarkStylesPopup';
import PremiumDropdown from './PremiumDropdown';

const fontFamilies = [
  'Arial', 'Times New Roman', 'Courier New', 'Georgia', 'Verdana',
  'Helvetica', 'Poppins', 'Roboto', 'Open Sans', 'Lato', 'Montserrat',
  'Inter', 'Playfair Display', 'Oswald', 'Merriweather'
];


import ColorPicker from './ColorPallet';

const AddBookmarkPopup = ({ onClose, currentPageIndex, totalPages, onAddBookmark, popupSettings, bookmarkSettings }) => {
    const [selectedColor, setSelectedColor] = useState('#C45A5A');
    const [textColor, setTextColor] = useState('#FFFFFF');
    const [opacity, setOpacity] = useState(100);
    const [showColorPicker, setShowColorPicker] = useState(false);
    const [pickerTarget, setPickerTarget] = useState('background'); // 'background' or 'text'
    const [pickerPos, setPickerPos] = useState({ x: 0, y: 0 });
    const [bookmarkText, setBookmarkText] = useState('');
    const [selectedFont, setSelectedFont] = useState(bookmarkSettings?.font || 'Poppins');

    const colors = [
        '#C45A5A', // Muted Red/Coral (matches image)
        '#6B7CBF', // Blue
        '#6FAF7C', // Green
        '#E0D95A', // Yellow
        'multi-color' // Rainbow
    ];

    const currentPage = currentPageIndex + 1;
    const nextPage = currentPage + 1 <= totalPages ? currentPage + 1 : null;

    // Helper function to convert hex to rgba with opacity
    const hexToRgba = (hex, opacity) => {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${opacity / 100})`;
    };

    // Update bookmark text when page changes
    React.useEffect(() => {
        setBookmarkText(`Page ${currentPage}`);
    }, [currentPage]);

    const popupStyle = {
        backgroundColor: popupSettings?.backgroundColor?.fill || '#ffffff',
        border: popupSettings?.backgroundColor?.stroke && popupSettings.backgroundColor.stroke !== '#' ? `1px solid ${popupSettings.backgroundColor.stroke}` : 'none',
        fontFamily: popupSettings?.textProperties?.font || 'Poppins'
    };

    const headerTextStyle = {
        color: popupSettings?.textProperties?.fill || '#111827',
        fontFamily: popupSettings?.textProperties?.font || 'Poppins'
    };

    const iconColor = popupSettings?.iconsColor?.fill || '#295655';
    const iconStyle = {
        color: iconColor,
        filter: popupSettings?.iconsColor?.stroke && popupSettings.iconsColor.stroke !== '#' 
            ? `drop-shadow(1px 0 0 ${popupSettings.iconsColor.stroke}) drop-shadow(-1px 0 0 ${popupSettings.iconsColor.stroke}) drop-shadow(0 1px 0 ${popupSettings.iconsColor.stroke}) drop-shadow(0 -1px 0 ${popupSettings.iconsColor.stroke})` 
            : 'none'
    };

    return (

        <div
            className="absolute inset-0 z-[100] flex items-center justify-center pointer-events-auto bg-black/5"
            onClick={onClose}
        >
            <div
                className="rounded-[1.2vw] shadow-2xl p-[1.2vw] w-[38vw] relative animate-in zoom-in-95 duration-200"
                style={popupStyle}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex flex-col mb-[0.8vw]">
                    {/* First Line: Drag Icon (Centered) */}
                    <div className="flex justify-center w-full py-[0.2vw]">
                        <Icon 
                            icon="material-symbols:drag-indicator" 
                            className="w-[1.2vw] h-[1.2vw] rotate-90" 
                            style={iconStyle}
                        />
                    </div>

                    {/* Second Line: Add Bookmark heading, gray line, and close button */}
                    <div className="flex items-center">
                        <h2 className="text-[1vw] font-semibold pr-[0.4vw]" style={headerTextStyle}>Add Bookmark</h2>
                        <div className="flex-1 h-[1px] opacity-20" style={{ backgroundColor: headerTextStyle.color }}></div>
                        <button
                            onClick={onClose}
                            className="ml-[0.8vw] w-[1.8vw] h-[1.8vw] rounded-[0.4vw] border border-red-500 flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors"
                        >
                            <Icon icon="lucide:x" className="w-[1vw] h-[1vw] stroke-[2.5]" />
                        </button>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="flex gap-[1.6vw]">
                    {/* Left Column: Color Picker */}
                    <div className="flex flex-col gap-[0.6vw] pt-[0.4vw]">
                        {['#C45A5A', '#6B7CBF', '#6FAF7C', '#E0D95A'].map((color, index) => (
                            <button
                                key={index}
                                onClick={() => setSelectedColor(color)}
                                className={`w-[2vw] h-[2vw] rounded-full transition-all hover:scale-110 shadow-sm border-[0.12vw] ${selectedColor === color ? 'border-gray-400 scale-110' : 'border-transparent'}`}
                                style={{ backgroundColor: color }}
                            />
                        ))}
                        {/* Rainbow Wheel */}
                        <button
                            onClick={(e) => {
                                const rect = e.currentTarget.getBoundingClientRect();
                                setPickerPos({ x: rect.right + 20, y: rect.top - 100 });
                                setPickerTarget('background');
                                setShowColorPicker(true);
                            }}
                            className={`w-[2vw] h-[2vw] rounded-full transition-all hover:scale-110 shadow-sm border-[0.12vw] border-transparent`}
                            style={{ background: 'conic-gradient(red, yellow, lime, aqua, blue, magenta, red)' }}
                        />
                    </div>

                    {/* Middle Column: Large Ribbon Preview */}
                    <div className="flex-1 flex items-start justify-start">
                        {(() => {
                            const styleIdx = bookmarkSettings?.style || 1;
                            return (
                                <div 
                                    className="relative h-[10vw] w-full flex shadow-md filter drop-shadow-md overflow-hidden transition-all duration-300"
                                    style={{
                                        backgroundColor: hexToRgba(selectedColor, opacity),
                                        clipPath: getBookmarkClipPath(styleIdx),
                                        borderRadius: getBookmarkBorderRadius(styleIdx).replace(/1.2vw/g, '5vw') // Use larger radius for the big preview
                                    }}
                                >
                                    <div className="flex-1 flex items-center justify-center p-[0.5vw]">
                                        <div
                                            contentEditable
                                            suppressContentEditableWarning
                                            onBlur={(e) => setBookmarkText(e.currentTarget.textContent)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                }
                                            }}
                                            className="text-[1.5vw] font-medium outline-none text-center w-full cursor-text"
                                            style={{ 
                                                color: textColor,
                                                fontFamily: selectedFont
                                            }}
                                            dangerouslySetInnerHTML={{ __html: bookmarkText }}
                                        />
                                    </div>
                                </div>
                            );
                        })()}
                    </div>

                    {/* Right Column: Controls */}
                    <div className="w-[12vw] flex flex-col pt-[0.4vw]">
                        

                        {/* Text Color Label + Line */}
                        <div className="flex items-center mb-[0.6vw]">
                            <span className="text-[0.8vw] font-semibold text-gray-900 bg-white pr-[0.4vw] z-10">Text Color</span>
                            <div className="flex-1 h-[1px] bg-gray-200"></div>
                        </div>

                        {/* Text Color Input */}
                        <div className="flex items-center gap-[0.6vw] mb-[2.5vw]">
                            {/* Color Square Box */}
                            <div
                                className="w-[2vw] h-[2vw] rounded-[0.3vw] border border-gray-400 cursor-pointer hover:shadow-md transition-shadow"
                                style={{ backgroundColor: textColor }}
                                onClick={(e) => {
                                    const rect = e.currentTarget.getBoundingClientRect();
                                    setPickerPos({ x: rect.right + 20, y: rect.top - 100 });
                                    setPickerTarget('text');
                                    setShowColorPicker(true);
                                }}
                            ></div>

                            {/* Input Box */}
                            <div className="flex-1 h-[2vw] border border-gray-400 rounded-[0.3vw] flex items-center px-[0.4vw] justify-between">
                                <span className="text-[0.75vw] text-gray-600">{textColor}</span>
                                <span className="text-[0.75vw] text-gray-400">{opacity}%</span>
                            </div>
                        </div>

                        {/* Buttons Row with Add Functionality */}
                        <div className="flex gap-[0.6vw]">
                            <button
                                className="flex-1 bg-black text-white rounded-[0.5vw] py-[0.6vw] flex flex-col items-center justify-center shadow-lg hover:bg-gray-800 transition-colors"
                                onClick={() => {
                                    onAddBookmark({ 
                                        id: Date.now(), 
                                        label: bookmarkText, 
                                        pageIndex: currentPageIndex,
                                        bgColor: selectedColor,
                                        textColor: textColor,
                                        opacity: opacity,
                                        font: selectedFont,
                                        style: bookmarkSettings?.style || 1
                                    });
                                    onClose();
                                }}
                            >
                                <span className="text-[0.6vw] font-semibold">Add Bookmark</span>
                                <span className="text-[0.6vw] font-semibold">Page - {currentPage}</span>
                            </button>

                            {nextPage && (
                                <button
                                    className="flex-1 bg-black text-white rounded-[0.5vw] py-[0.6vw] flex flex-col items-center justify-center shadow-lg hover:bg-gray-800 transition-colors"
                                    onClick={() => {
                                        onAddBookmark({ 
                                            id: Date.now(), 
                                            label: `Page ${nextPage}`, 
                                            pageIndex: currentPageIndex + 1,
                                            bgColor: selectedColor,
                                            textColor: textColor,
                                            opacity: opacity,
                                            style: bookmarkSettings?.style || 1
                                        });
                                        onClose();
                                    }}
                                >
                                    <span className="text-[0.6vw] font-semibold">Add Bookmark</span>
                                    <span className="text-[0.6vw] font-semibold">Page - {nextPage}</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            {showColorPicker && (
                <ColorPicker
                    color={pickerTarget === 'text' ? textColor : selectedColor}
                    style={{ position: 'fixed', top: pickerPos.y, left: pickerPos.x, zIndex: 1000 }}
                    opacity={opacity}
                    onOpacityChange={(val) => setOpacity(val)}
                    onChange={(color) => {
                        if (pickerTarget === 'text') setTextColor(color);
                        else setSelectedColor(color);
                    }}
                    onClose={() => setShowColorPicker(false)}
                />
            )}
        </div>
    );
};

export default AddBookmarkPopup;
