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


// Helper functions for color conversion
const hexToHsv = (hex) => {
    let color = hex.substring(1);
    if (color.length === 3)
        color = color.split("").map((c) => c + c).join("");
    const r = parseInt(color.substring(0, 2), 16) / 255;
    const g = parseInt(color.substring(2, 4), 16) / 255;
    const b = parseInt(color.substring(4, 6), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const d = max - min;
    const s = max === 0 ? 0 : d / max;
    const v = max;
    let h = 0;

    if (max !== min) {
        switch (max) {
            case r:
                h = (g - b) / d + (g < b ? 6 : 0);
                break;
            case g:
                h = (b - r) / d + 2;
                break;
            case b:
                h = (r - g) / d + 4;
                break;
        }
        h /= 6;
    }
    return { h: h * 360, s: s * 100, v: v * 100 };
};

const hsvToHex = ({ h, s, v }) => {
    s /= 100;
    v /= 100;
    const c = v * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = v - c;
    let r = 0, g = 0, b = 0;

    if (0 <= h && h < 60) { r = c; g = x; b = 0; }
    else if (60 <= h && h < 120) { r = x; g = c; b = 0; }
    else if (120 <= h && h < 180) { r = 0; g = c; b = x; }
    else if (180 <= h && h < 240) { r = 0; g = x; b = c; }
    else if (240 <= h && h < 300) { r = x; g = 0; b = c; }
    else if (300 <= h && h < 360) { r = c; g = 0; b = x; }

    const toHex = (n) =>
        Math.round((n + m) * 255)
            .toString(16)
            .padStart(2, "0");
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
};

const ColorPicker = ({ color, onChange, opacity, onOpacityChange, onClose, position }) => {
    const [hsv, setHsv] = React.useState(() => hexToHsv(color));

    React.useEffect(() => {
        setHsv(hexToHsv(color));
    }, [color]);

    const handleSaturationChange = React.useCallback((e, container) => {
        const { width, height, left, top } = container.getBoundingClientRect();
        const x = Math.min(Math.max((e.clientX - left) / width, 0), 1);
        const y = Math.min(Math.max((e.clientY - top) / height, 0), 1);

        const newHsv = { ...hsv, s: x * 100, v: (1 - y) * 100 };
        setHsv(newHsv);
        onChange(hsvToHex(newHsv));
    }, [hsv, onChange]);

    const handleHueChange = React.useCallback((e, container) => {
        const { height, top } = container.getBoundingClientRect();
        const y = Math.min(Math.max((e.clientY - top) / height, 0), 1);

        const newHsv = { ...hsv, h: y * 360 };
        setHsv(newHsv);
        onChange(hsvToHex(newHsv));
    }, [hsv, onChange]);

    const useDrag = (handler) => {
        const isDragging = React.useRef(false);
        const containerRef = React.useRef(null);

        const onMouseDown = (e) => {
            isDragging.current = true;
            handler(e, containerRef.current);
            window.addEventListener("mousemove", onMouseMove);
            window.addEventListener("mouseup", onMouseUp);
        };

        const onMouseMove = (e) => {
            if (isDragging.current) {
                e.preventDefault();
                handler(e, containerRef.current);
            }
        };

        const onMouseUp = () => {
            isDragging.current = false;
            window.removeEventListener("mousemove", onMouseMove);
            window.removeEventListener("mouseup", onMouseUp);
        };

        return { onMouseDown, ref: containerRef };
    };

    const satDrag = useDrag(handleSaturationChange);
    const hueDrag = useDrag(handleHueChange);

    const hueColor = hsvToHex({ h: hsv.h, s: 100, v: 100 });

    const handleEyeDropper = async () => {
        if (!window.EyeDropper) return;
        try {
            const eyeDropper = new window.EyeDropper();
            const result = await eyeDropper.open();
            onChange(result.sRGBHex.toUpperCase());
        } catch (e) { }
    };

    return (
        <div
            className="fixed z-[1000] w-[250px] bg-white rounded-[15px] shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-gray-100 p-4 animate-in fade-in zoom-in-95 duration-200 select-none font-sans pointer-events-auto"
            style={{ top: position.y, left: position.x }}
            onClick={(e) => e.stopPropagation()}
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5 flex-grow">
                    <span className="text-[12px] font-semibold text-gray-900 whitespace-nowrap">Colors Pallet</span>
                    <div className="h-px w-full bg-gray-100"></div>
                </div>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onClose();
                    }}
                    className="ml-1.5 w-6 h-6 rounded-md border-[1.5px] border-[#ff4d4d] flex items-center justify-center text-[#ff4d4d] hover:bg-[#ff4d4d] hover:text-white transition-all shadow-sm active:scale-90"
                >
                    <Icon icon="heroicons:x-mark" width={14} className="stroke-[2.5]" />
                </button>
            </div>

            {/* Main Area */}
            <div className="flex gap-2 h-[85px] mb-2">
                {/* Saturation/Value Box */}
                <div
                    ref={satDrag.ref}
                    onMouseDown={satDrag.onMouseDown}
                    className="flex-1 rounded-lg relative cursor-crosshair overflow-hidden"
                    style={{ backgroundColor: hueColor }}
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-white to-transparent"></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent"></div>

                    {/* Circular Thumb */}
                    <div
                        className="absolute w-3 h-3 border-2 border-white rounded-full shadow-md -ml-1.5 -mt-1.5 pointer-events-none"
                        style={{
                            left: `${hsv.s}%`,
                            top: `${100 - hsv.v}%`,
                        }}
                    />
                </div>

                {/* Vertical Hue Slider */}
                <div
                    ref={hueDrag.ref}
                    onMouseDown={hueDrag.onMouseDown}
                    className="w-4 rounded-full relative cursor-pointer"
                    style={{
                        background: "linear-gradient(to bottom, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)"
                    }}
                >
                    {/* Thumb with lines */}
                    <div
                        className="absolute left-1/2 -translate-x-1/2 w-6 h-6 pointer-events-none"
                        style={{ top: `${(hsv.h / 360) * 100}%`, marginTop: '-12px' }}
                    >
                        <div className="absolute top-1/2 left-0 w-full h-px bg-white"></div>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-white border-2 border-white rounded-full shadow-sm">
                            <div
                                className="w-full h-full rounded-full border border-gray-100"
                                style={{ backgroundColor: hsvToHex(hsv) }}
                            ></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="space-y-2">
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleEyeDropper}
                        className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-all border border-gray-100"
                    >
                        <Pipette size={14} />
                    </button>
                    <div
                        className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
                        style={{ backgroundColor: color }}
                    />
                </div>

                {/* Hex Input */}
                <div className="flex items-center justify-between">
                    <span className="text-[12px] font-semibold text-gray-700">Color Code :</span>
                    <div className="flex items-center gap-1.5 border-[1.5px] border-gray-200 rounded-lg px-1.5 py-1 w-[120px] focus-within:border-[#5d5efc] transition-all bg-white">
                        <span className="text-gray-400 text-[10px] font-semibold">#</span>
                        <input
                            type="text"
                            value={color.replace("#", "").toLowerCase()}
                            onChange={(e) => onChange(`#${e.target.value}`)}
                            className="w-full text-[12px] font-semibold text-gray-600 outline-none lowercase font-mono bg-transparent"
                            maxLength={6}
                        />
                        <Icon icon="heroicons:pencil" width={14} className="text-gray-400" />
                    </div>
                </div>

                {/* Opacity Slider */}
                <div className="flex items-center justify-between">
                    <span className="text-[12px] font-semibold text-gray-700">Opacity :</span>
                    <div className="flex items-center gap-2 w-[120px]">
                        <div className="relative flex-1 h-1 bg-gray-100 rounded-full">
                            <div
                                className="absolute top-0 left-0 h-full bg-[#7c5dff] rounded-full"
                                style={{ width: `${opacity}%` }}
                            ></div>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={opacity}
                                onChange={(e) => onOpacityChange && onOpacityChange(parseInt(e.target.value))}
                                className="absolute inset-0 w-full opacity-0 cursor-pointer z-10"
                            />
                            <div
                                className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-[#7c5dff] border-2 border-white rounded-full shadow-sm pointer-events-none"
                                style={{ left: `${opacity}%`, marginLeft: "-7px" }}
                            ></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

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
                    position={pickerPos}
                    opacity={opacity} // Note: This opacity state might need to be split if we want separate opacities for text and background, but following current usage.
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
