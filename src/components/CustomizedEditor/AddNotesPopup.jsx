import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Icon } from '@iconify/react';
import { X, Pipette } from 'lucide-react';
import { rgbToHex, hexToRgb, rgbToHsv, hsvToRgb } from './AppearanceShared';

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
    const [hsv, setHsv] = useState(() => hexToHsv(color));

    useEffect(() => {
        setHsv(hexToHsv(color));
    }, [color]);

    const handleSaturationChange = useCallback((e, container) => {
        const { width, height, left, top } = container.getBoundingClientRect();
        const x = Math.min(Math.max((e.clientX - left) / width, 0), 1);
        const y = Math.min(Math.max((e.clientY - top) / height, 0), 1);

        const newHsv = { ...hsv, s: x * 100, v: (1 - y) * 100 };
        setHsv(newHsv);
        onChange(hsvToHex(newHsv));
    }, [hsv, onChange]);

    const handleHueChange = useCallback((e, container) => {
        const { height, top } = container.getBoundingClientRect();
        const y = Math.min(Math.max((e.clientY - top) / height, 0), 1);

        const newHsv = { ...hsv, h: y * 360 };
        setHsv(newHsv);
        onChange(hsvToHex(newHsv));
    }, [hsv, onChange]);

    const useDrag = (handler) => {
        const isDragging = useRef(false);
        const containerRef = useRef(null);

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

const AddNotesPopup = ({ onClose, currentPageIndex, totalPages, onAddNote, popupSettings }) => {
    // Notes Formatting States
    const [noteContent, setNoteContent] = useState('');
    const [noteAlignment, setNoteAlignment] = useState('left');
    const [noteStyles, setNoteStyles] = useState(['bold']);
    const [noteCase, setNoteCase] = useState('sentence');
    const [noteList, setNoteList] = useState('none');
    const [activeFormattingTab, setActiveFormattingTab] = useState(null);
    const [noteBackground, setNoteBackground] = useState('#D4E221');
    const [noteTextColor, setNoteTextColor] = useState('#ffffff');
    const [noteFontFamily, setNoteFontFamily] = useState('Poppins');
    const [noteFontSize, setNoteFontSize] = useState('16');
    const [noteTextOpacity, setNoteTextOpacity] = useState(100);
    const [noteBgOpacity, setNoteBgOpacity] = useState(100);

    const [showColorPicker, setShowColorPicker] = useState(false);
    const [pickerTarget, setPickerTarget] = useState('text'); // 'text' or 'background'
    const [pickerPos, setPickerPos] = useState({ x: 0, y: 0 });

    const [noteWeight, setNoteWeight] = useState('Semi Bold');
    const [isWeightMenuOpen, setIsWeightMenuOpen] = useState(false);
    const [isSizeMenuOpen, setIsSizeMenuOpen] = useState(false);
    const [isFontMenuOpen, setIsFontMenuOpen] = useState(false);

    const weights = ["Thin", "Light", "Regular", "Semi Bold", "Bold"];
    const sizes = ["12", "14", "16", "18", "20", "24", "32", "48", "64", "72", "96"];
    const fonts = [
        "Arial", "Times New Roman", "Courier New", "Georgia", "Verdana",
        "Helvetica", "Poppins", "Roboto", "Open Sans", "Lato",
        "Montserrat", "Inter", "Playfair Display", "Oswald", "Merriweather",
        "Dancing Script", "Pacifico", "Shadows Into Light", "Satisfy", "Courgette"
    ];

    const toggleNoteStyle = (style) => {
        setNoteStyles(prev => prev.includes(style) ? prev.filter(s => s !== style) : [...prev, style]);
    };

    const applyListFormat = (type, currentContent) => {
        if (type === 'none') return currentContent;
        const lines = currentContent.split('\n');
        return lines.map((line, index) => {
            const cleanLine = line.replace(/^[•○\d+.]\s*|^\[\s*\]\s*/, '');
            if (type === 'bullet') return `• ${cleanLine}`;
            if (type === 'bullet2') return `○ ${cleanLine}`;
            if (type === 'ordered') return `${index + 1}. ${cleanLine}`;
            return cleanLine;
        }).join('\n');
    };

    const handleListClick = (type) => {
        const newListType = noteList === type ? 'none' : type;
        setNoteList(newListType);
        if (newListType !== 'none') {
            setNoteContent(prev => applyListFormat(newListType, prev));
        } else {
            setNoteContent(prev => prev.split('\n').map(l => l.replace(/^[•○\d+.]\s*|^\[\s*\]\s*/, '')).join('\n'));
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && noteList !== 'none') {
            e.preventDefault();
            const { selectionStart, selectionEnd, value } = e.target;
            const lines = value.substr(0, selectionStart).split('\n');
            const currentLineIndex = lines.length - 1;
            let nextPrefix = '';

            if (noteList === 'bullet') nextPrefix = '\n• ';
            else if (noteList === 'bullet2') nextPrefix = '\n○ ';
            else if (noteList === 'ordered') nextPrefix = `\n${currentLineIndex + 2}. `;

            const newValue = value.substring(0, selectionStart) + nextPrefix + value.substring(selectionEnd);
            setNoteContent(newValue);

            // Set cursor position after the prefix
            setTimeout(() => {
                e.target.selectionStart = e.target.selectionEnd = selectionStart + nextPrefix.length;
            }, 0);
        }
    };

    const resetNote = () => {
        setNoteContent('');
        setNoteAlignment('left');
        setNoteStyles(['bold']);
        setNoteWeight('Semi Bold');
        setNoteCase('sentence');
        setNoteList('none');
        setNoteBackground('#D4E221');
        setNoteTextColor('#ffffff');
        setNoteFontFamily('Poppins');
        setNoteFontSize('16');
        setNoteBgOpacity(100);
        setNoteTextOpacity(100);
        setActiveFormattingTab(null);
    };

    // Close menus on click outside
    React.useEffect(() => {
        const handleClickOutside = () => {
            setIsFontMenuOpen(false);
            setIsWeightMenuOpen(false);
            setIsSizeMenuOpen(false);
        };
        if (isFontMenuOpen || isWeightMenuOpen || isSizeMenuOpen) {
            document.addEventListener('click', handleClickOutside);
        }
        return () => document.removeEventListener('click', handleClickOutside);
    }, [isFontMenuOpen, isWeightMenuOpen, isSizeMenuOpen]);

    const getFontWeight = (weight) => {
        switch (weight) {
            case 'Thin': return 100;
            case 'Light': return 300;
            case 'Regular': return 400;
            case 'Semi Bold': return 600;
            case 'Bold': return 700;
            default: return 400;
        }
    };

    // Calculate current page display
    const pageDisplay = (() => {
        const p1 = (currentPageIndex || 0) + 1;
        const p2 = p1 + 1 <= (totalPages || 0) ? p1 + 1 : null;
        if (!p2) return `Page ${p1.toString().padStart(2, '0')}`;
        return `Page ${p1.toString().padStart(2, '0')} - ${p2.toString().padStart(2, '0')}`;
    })();

    const popupStyle = {
        backgroundColor: popupSettings?.backgroundColor?.fill || '#ffffff',
        border: popupSettings?.backgroundColor?.stroke && popupSettings.backgroundColor.stroke !== '#' ? `1px solid ${popupSettings.backgroundColor.stroke}` : '1px solid #22C55E99',
        fontFamily: popupSettings?.textProperties?.font || 'Poppins'
    };

    const headerTextStyle = {
        color: popupSettings?.textProperties?.fill || '#1E293B',
        fontFamily: popupSettings?.textProperties?.font || 'Poppins'
    };

    return (
        <div
            className="absolute inset-0 z-[100] flex items-center justify-center pointer-events-auto bg-black/5"
            onClick={onClose}
        >
            <div
                className="w-[34vw] rounded-[1vw] shadow-[0_1.5vw_4vw_rgba(0,0,0,0.12)] flex flex-col pointer-events-auto animate-in zoom-in-95 duration-200 p-[1vw] gap-[0.8vw]"
                style={popupStyle}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex flex-col mb-[0.2vw]">
                    {/* First Line: Icon alone */}
                    <div className="flex justify-center w-full py-[0.2vw]">
                        <Icon 
                            icon="material-symbols:drag-indicator" 
                            className="w-[1.4vw] h-[1.4vw] rotate-90" 
                            style={{ 
                                color: popupSettings?.iconsColor?.fill || '#9CA3AF',
                                filter: popupSettings?.iconsColor?.stroke && popupSettings.iconsColor.stroke !== '#' 
                                    ? `drop-shadow(1px 0 0 ${popupSettings.iconsColor.stroke}) drop-shadow(-1px 0 0 ${popupSettings.iconsColor.stroke}) drop-shadow(0 1px 0 ${popupSettings.iconsColor.stroke}) drop-shadow(0 -1px 0 ${popupSettings.iconsColor.stroke})` 
                                    : 'none'
                            }}
                        />
                    </div>

                    {/* Second Line: Add Notes and Line (with Close button) */}
                    <div className="flex items-center px-[0.5vw] h-[2vw]">
                        <span className="text-[1.1vw] font-semibold mr-[1vw]" style={headerTextStyle}>Add Notes</span>
                        <div className="flex-1 h-[1px] opacity-20" style={{ backgroundColor: headerTextStyle.color }}></div>
                        <div className="ml-[1.2vw]">
                            <button
                                onClick={(e) => { e.stopPropagation(); onClose(); }}
                                className="w-[1.8vw] h-[1.8vw] bg-white border rounded-[0.5vw] flex items-center justify-center transition-all focus:outline-none"
                                style={{ 
                                    borderColor: popupSettings?.iconsColor?.fill || '#F87171',
                                    color: popupSettings?.iconsColor?.fill || '#EF4444' 
                                }}
                            >
                                <Icon icon="lucide:x" className="w-[1vw] h-[1vw] stroke-[2.5]" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="flex gap-[0.8vw] items-start">
                    {/* Left Column - Colors */}
                    <div className="flex flex-col gap-[0.6vw]">
                        {['#31B0B0', '#C68798', '#D6566E', '#6B7DBB', '#67AC78', '#D8DC53', '#23D295'].map((color, i) => (
                            <div
                                key={i}
                                onClick={() => setNoteBackground(color)}
                                className={`w-[1.8vw] h-[1.8vw] rounded-full cursor-pointer hover:scale-110 transition-transform shadow-sm border-[0.15vw] ${noteBackground === color ? 'border-black' : 'border-transparent'}`}
                                style={{ backgroundColor: color }}
                            />
                        ))}
                        <div
                            onClick={(e) => {
                                const rect = e.currentTarget.getBoundingClientRect();
                                setPickerPos({ x: rect.right + 20, y: rect.top - 100 });
                                setPickerTarget('background');
                                setShowColorPicker(true);
                            }}
                            className="w-[1.8vw] h-[1.8vw] rounded-full cursor-pointer hover:scale-110 transition-transform shadow-sm flex items-center justify-center overflow-hidden bg-[conic-gradient(from_0deg,#ff0000,#ffff00,#00ff00,#00ffff,#0000ff,#ff00ff,#ff0000)]"
                        />
                    </div>

                    {/* Middle Column - Note Area (Editable Textarea) */}
                    <div
                        className="relative w-[13vw] h-[13vw] rounded-[0.8vw] p-[0.7vw] shadow-inner flex flex-col transition-colors duration-300"
                        style={{ backgroundColor: noteBackground, opacity: noteBgOpacity / 100 }}
                    >
                        <div className="flex justify-end gap-[0.4vw] mb-[0.2vw] items-center pointer-events-none">
                            <span className="text-[0.65vw] font-medium text-white/90">{pageDisplay}</span>
                            <Icon icon="lucide:pencil" className="w-[0.8vw] h-[0.8vw] text-white/90" />
                        </div>
                        <textarea
                            value={noteContent}
                            onChange={(e) => setNoteContent(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Enter your Notes"
                            style={{
                                textAlign: noteAlignment,
                                fontWeight: getFontWeight(noteWeight),
                                fontStyle: noteStyles.includes('italic') ? 'italic' : 'normal',
                                textDecoration: `${noteStyles.includes('underline') ? 'underline' : ''} ${noteStyles.includes('strike') ? 'line-through' : ''}`,
                                textTransform: noteCase === 'upper' ? 'uppercase' : noteCase === 'lower' ? 'lowercase' : noteCase === 'sentence' ? 'capitalize' : 'none',
                                fontFamily: noteFontFamily,
                                fontSize: `${noteFontSize}px`,
                                color: noteTextColor,
                                opacity: noteTextOpacity / 100,
                                background: 'transparent',
                                border: 'none',
                                outline: 'none',
                                resize: 'none',
                                width: '100%',
                                height: '100%'
                            }}
                            className="flex-1 placeholder:text-white/40 font-medium overflow-y-auto custom-scrollbar"
                        />
                    </div>

                    {/* Right Column - Properties */}
                    <div className="flex-1 flex flex-col gap-[0.8vw]">
                        <div className="flex items-center gap-[0.5vw]">
                            <span className="text-[0.9vw] font-semibold text-gray-900 whitespace-nowrap">Text Property</span>
                            <div className="h-[0.1vw] flex-1 bg-gray-200"></div>
                        </div>

                        {/* Font Family Selection */}
                        <div className="relative">
                            <div
                                onClick={(e) => { e.stopPropagation(); setIsFontMenuOpen(!isFontMenuOpen); }}
                                className={`w-full flex items-center justify-between border-[0.1vw] rounded-[0.6vw] px-[0.8vw] py-[0.4vw] cursor-pointer transition-all bg-white ${isFontMenuOpen ? 'border-[#6366F1] ring-1 ring-[#6366F1]' : 'border-gray-400 hover:border-black'}`}
                            >
                                <span className="text-[0.8vw] font-semibold text-gray-700" style={{ fontFamily: noteFontFamily }}>
                                    {noteFontFamily}
                                </span>
                                <Icon icon="lucide:chevron-down" className={`w-[1vw] h-[1vw] text-gray-500 transition-transform ${isFontMenuOpen ? 'rotate-180' : ''}`} />
                            </div>

                            {isFontMenuOpen && (
                                <div className="absolute top-full left-0 w-full mt-[0.5vw] bg-white border border-gray-200 rounded-[0.75vw] shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                    <div className="max-h-[15vw] overflow-y-auto custom-scrollbar py-[0.5vw]">
                                        {fonts.map((font) => (
                                            <div
                                                key={font}
                                                onClick={() => {
                                                    setNoteFontFamily(font);
                                                    setIsFontMenuOpen(false);
                                                }}
                                                className={`px-[1vw] py-[0.75vw] text-[0.9vw] cursor-pointer transition-colors ${noteFontFamily === font ? 'bg-[#EEF2FF] text-[#6366F1]' : 'text-gray-700 hover:bg-[#F3F4F6] hover:text-[#6366F1]'}`}
                                                style={{ fontFamily: font }}
                                            >
                                                {font}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Weight and Size Selection */}
                        <div className="flex gap-[0.7vw]">
                            {/* Weight Dropdown */}
                            <div className="flex-1 relative">
                                <div
                                    onClick={(e) => { e.stopPropagation(); setIsWeightMenuOpen(!isWeightMenuOpen); setIsSizeMenuOpen(false); setIsFontMenuOpen(false); }}
                                    className={`w-full flex items-center justify-between border-[0.1vw] rounded-[0.6vw] px-[0.8vw] py-[0.4vw] cursor-pointer transition-all bg-white ${isWeightMenuOpen ? 'border-[#6366F1] ring-1 ring-[#6366F1]' : 'border-gray-400 hover:border-black'}`}
                                >
                                    <span className="text-[0.8vw] font-semibold text-gray-700">
                                        {noteWeight}
                                    </span>
                                    <Icon icon="lucide:chevron-down" className={`w-[1vw] h-[1vw] text-gray-500 transition-transform ${isWeightMenuOpen ? 'rotate-180' : ''}`} />
                                </div>

                                {isWeightMenuOpen && (
                                    <div className="absolute top-full left-0 w-full mt-[0.5vw] bg-white border border-gray-200 rounded-[0.75vw] shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                        <div className="py-[0.5vw]">
                                            {weights.map((w) => (
                                                <div
                                                    key={w}
                                                    onClick={() => {
                                                        setNoteWeight(prev => prev === w ? 'Regular' : w);
                                                        setIsWeightMenuOpen(false);
                                                    }}
                                                    className={`px-[1vw] py-[0.7vw] text-[0.9vw] cursor-pointer transition-colors ${noteWeight === w ? 'bg-[#EEF2FF] text-[#6366F1]' : 'text-gray-700 hover:bg-[#F3F4F6]'}`}
                                                    style={{ fontWeight: getFontWeight(w) }}
                                                >
                                                    {w}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Size Dropdown */}
                            <div className="w-[8vw] relative">
                                <div
                                    onClick={(e) => { e.stopPropagation(); setIsSizeMenuOpen(!isSizeMenuOpen); setIsWeightMenuOpen(false); setIsFontMenuOpen(false); }}
                                    className={`w-full flex items-center justify-between border-[0.1vw] rounded-[0.6vw] px-[0.8vw] py-[0.4vw] cursor-pointer transition-all bg-white ${isSizeMenuOpen ? 'border-[#6366F1] ring-1 ring-[#6366F1]' : 'border-gray-400 hover:border-black'}`}
                                >
                                    <span className="text-[0.8vw] font-semibold text-gray-700">
                                        {noteFontSize}
                                    </span>
                                    <Icon icon="lucide:chevron-down" className={`w-[1vw] h-[1vw] text-gray-500 transition-transform ${isSizeMenuOpen ? 'rotate-180' : ''}`} />
                                </div>

                                {isSizeMenuOpen && (
                                    <div className="absolute top-full right-0 w-full mt-[0.5vw] bg-white border border-gray-200 rounded-[0.75vw] shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                        <div className="max-h-[15vw] overflow-y-auto custom-scrollbar py-[0.5vw]">
                                            {sizes.map((s) => (
                                                <div
                                                    key={s}
                                                    onClick={() => {
                                                        setNoteFontSize(s);
                                                        setIsSizeMenuOpen(false);
                                                    }}
                                                    className={`px-[1vw] py-[0.6vw] text-[0.9vw] text-center cursor-pointer transition-colors ${noteFontSize === s ? 'bg-[#808080] text-white' : 'text-gray-700 hover:bg-[#F3F4F6]'}`}
                                                >
                                                    {s}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Formatting Toolbar - Main Row */}
                        <div className="flex items-center justify-end gap-[0.75vw]">
                            {[
                                { id: 'align', icon: 'lucide:align-center' },
                                { id: 'style', label: 'B' },
                                { id: 'case', label: '—' },
                                { id: 'list', icon: 'lucide:list' }
                            ].map((tab) => (
                                <div key={tab.id} className="relative flex justify-center">
                                    <button
                                        onClick={() => setActiveFormattingTab(prev => prev === tab.id ? null : tab.id)}
                                        className={`w-[2vw] h-[2vw] border border-gray-400 rounded-[0.6vw] flex items-center justify-center transition-all ${activeFormattingTab === tab.id ? 'bg-[#EEF2FF] border-[#6366F1] text-[#6366F1]' : 'bg-white text-[#4A4A4A] hover:border-black'}`}
                                    >
                                        {tab.icon ? <Icon icon={tab.icon} className="w-[1vw] h-[1vw]" /> : <span className="text-[1vw] font-semibold">{tab.label}</span>}
                                    </button>

                                    {activeFormattingTab === tab.id && (
                                        <div className="absolute top-[3.2vw] left-1/2 -translate-x-1/2 w-fit bg-[#1A1A1A] p-[0.35vw] rounded-[0.8vw] flex gap-[0.35vw] animate-in fade-in slide-in-from-top-1 duration-200 z-[60]">
                                            {tab.id === 'align' && [
                                                { id: 'left', icon: 'lucide:align-left' },
                                                { id: 'center', icon: 'lucide:align-center' },
                                                { id: 'right', icon: 'lucide:align-right' },
                                                { id: 'justify', icon: 'lucide:align-justify' }
                                            ].map((btn) => (
                                                <button
                                                    key={btn.id}
                                                    onClick={() => setNoteAlignment(prev => prev === btn.id ? 'left' : btn.id)}
                                                    className={`w-[2.5vw] h-[2.2vw] rounded-[0.6vw] flex items-center justify-center transition-all ${noteAlignment === btn.id ? 'bg-[#D1D5DB]' : 'bg-white'}`}
                                                >
                                                    <Icon icon={btn.icon} className="w-[1.2vw] h-[1.2vw] text-[#1A1A1A]" />
                                                </button>
                                            ))}
                                            {tab.id === 'style' && [
                                                { id: 'bold', label: 'B', className: 'font-semibold' },
                                                { id: 'italic', label: 'I', className: 'italic' },
                                                { id: 'underline', label: 'U', className: 'underline' },
                                                { id: 'strike', label: 'S', className: 'line-through' }
                                            ].map((btn) => (
                                                <button
                                                    key={btn.id}
                                                    onClick={() => toggleNoteStyle(btn.id)}
                                                    className={`w-[2.5vw] h-[2.2vw] rounded-[0.6vw] flex items-center justify-center transition-all ${noteStyles.includes(btn.id) ? 'bg-[#D1D5DB]' : 'bg-white'}`}
                                                >
                                                    <span className={`text-[1vw] text-[#1A1A1A] ${btn.className}`}>{btn.label}</span>
                                                </button>
                                            ))}
                                            {tab.id === 'case' && [
                                                { id: 'none', label: '—' },
                                                { id: 'sentence', label: 'Aa' },
                                                { id: 'upper', label: 'AB' },
                                                { id: 'lower', label: 'ab' }
                                            ].map((btn) => (
                                                <button
                                                    key={btn.id}
                                                    onClick={() => setNoteCase(prev => prev === btn.id ? 'none' : btn.id)}
                                                    className={`w-[2.5vw] h-[2.2vw] rounded-[0.6vw] flex items-center justify-center transition-all ${noteCase === btn.id ? 'bg-[#D1D5DB]' : 'bg-white'}`}
                                                >
                                                    <span className="text-[0.9vw] font-semibold text-[#1A1A1A]">{btn.label}</span>
                                                </button>
                                            ))}
                                            {tab.id === 'list' && [
                                                { id: 'bullet', icon: 'lucide:list' },
                                                { id: 'bullet2', icon: 'lucide:list-todo' },
                                                { id: 'ordered', icon: 'lucide:list-ordered' }
                                            ].map((btn) => (
                                                <button
                                                    key={btn.id}
                                                    onClick={() => handleListClick(btn.id)}
                                                    className={`w-[2.5vw] h-[2.2vw] rounded-[0.6vw] flex items-center justify-center transition-all ${noteList === btn.id ? 'bg-[#D1D5DB]' : 'bg-white'}`}
                                                >
                                                    <Icon icon={btn.icon} className="w-[1.2vw] h-[1.2vw] text-[#1A1A1A]" />
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Background & Opacity Selection */}
                        <div className="flex items-center gap-[0.75vw]">
                            <div
                                className="w-[2vw] h-[2vw] rounded-[0.4vw] border border-gray-400 shadow-sm cursor-pointer"
                                style={{ backgroundColor: noteTextColor }}
                                onClick={(e) => {
                                    const rect = e.currentTarget.getBoundingClientRect();
                                    setPickerPos({ x: rect.right + 20, y: rect.top - 100 });
                                    setPickerTarget('text');
                                    setShowColorPicker(true);
                                }}
                            />
                            <div className="flex-1 flex items-center border border-gray-400 rounded-[0.4vw] pl-[0.8vw] pr-[0.4vw] py-[0.3vw] bg-white">
                                <span className="text-[0.8vw] font-medium text-gray-700 uppercase flex-1">{noteTextColor}</span>
                                <div className="flex items-center">
                                    <input
                                        type="text"
                                        value={noteTextOpacity}
                                        onChange={(e) => setNoteTextOpacity(e.target.value)}
                                        className="w-[2vw] text-right text-[0.8vw] font-medium text-gray-700 outline-none bg-transparent"
                                    />
                                    <span className="text-[0.8vw] text-gray-700 font-medium">%</span>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-[0.75vw] mt-auto">
                            <button
                                onClick={resetNote}
                                className="flex-1 flex items-center justify-center gap-[0.5vw] py-[0.5vw] border border-gray-300 rounded-[0.5vw] hover:bg-gray-50 transition-all"
                            >
                                <Icon icon="lucide:x" className="w-[1vw] h-[1vw] text-black" />
                                <span className="text-[0.8vw] font-medium text-black">Clear</span>
                            </button>
                            <button
                                onClick={() => {
                                    if (!noteContent.trim()) return;
                                    onAddNote({
                                        content: noteContent,
                                        background: noteBackground,
                                        color: noteTextColor,
                                        fontFamily: noteFontFamily,
                                        fontSize: noteFontSize,
                                        styles: noteStyles,
                                        alignment: noteAlignment,
                                        case: noteCase,
                                        list: noteList,
                                        bgOpacity: noteBgOpacity,
                                        textOpacity: noteTextOpacity,
                                        pageLabel: pageDisplay
                                    });
                                    onClose();
                                }}
                                className="flex-[1.5] py-[0.5vw] bg-black text-white rounded-[0.5vw] text-[0.8vw] font-semibold hover:bg-zinc-800 transition-all shadow-sm px-[1.5vw]"
                            >
                                Add To Notes
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            {showColorPicker && (
                <ColorPicker
                    color={pickerTarget === 'text' ? noteTextColor : noteBackground}
                    position={pickerPos}
                    opacity={pickerTarget === 'text' ? noteTextOpacity : noteBgOpacity}
                    onOpacityChange={(val) => {
                        if (pickerTarget === 'text') setNoteTextOpacity(val);
                        else setNoteBgOpacity(val);
                    }}
                    onChange={(color) => {
                        if (pickerTarget === 'text') setNoteTextColor(color);
                        else setNoteBackground(color);
                    }}
                    onClose={() => setShowColorPicker(false)}
                />
            )}
        </div>
    );
};

export default AddNotesPopup;
