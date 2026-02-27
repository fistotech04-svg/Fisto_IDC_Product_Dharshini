import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Icon } from '@iconify/react';
import { X, Pipette } from 'lucide-react';
import { rgbToHex, hexToRgb, rgbToHsv, hsvToRgb } from './AppearanceShared';

import ColorPicker from './ColorPallet';

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
                    style={{ position: 'fixed', top: pickerPos.y, left: pickerPos.x, zIndex: 1000 }}
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
