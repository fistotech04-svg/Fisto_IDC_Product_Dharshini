import React, { useState } from 'react';
import { Icon } from '@iconify/react';

const TableOfContentsPopup = ({ onClose, onNavigate, settings, popupSettings, addSearchOnTOC = true }) => {
    const [searchQuery, setSearchQuery] = useState('');

    const {
        addSearch = true,
        addPageNumber = true,
        addSerialNumberHeading = true,
        addSerialNumberSubheading = true,
        content = []
    } = settings || {};

    const filteredContent = content.map(heading => {
        const matchesHeading = heading.title.toLowerCase().includes(searchQuery.toLowerCase());
        const filteredSubheadings = heading.subheadings?.filter(sub =>
            sub.title.toLowerCase().includes(searchQuery.toLowerCase())
        ) || [];

        if (matchesHeading || filteredSubheadings.length > 0) {
            return {
                ...heading,
                subheadings: matchesHeading ? heading.subheadings : filteredSubheadings
            };
        }
        return null;
    }).filter(Boolean);

    const modalStyle = {
        backgroundColor: popupSettings?.backgroundColor?.fill || '#575C9C',
        border: popupSettings?.backgroundColor?.stroke && popupSettings.backgroundColor.stroke !== '#' ? `1px solid ${popupSettings.backgroundColor.stroke}` : 'none',
        fontFamily: settings?.fontFamily || popupSettings?.textProperties?.font || 'Poppins'
    };

    const textStyle = {
        color: popupSettings?.textProperties?.fill || '#ffffff',
    };

    const iconColor = popupSettings?.iconsColor?.fill || '#ffffff';
    const iconStyle = {
        color: iconColor,
        filter: popupSettings?.iconsColor?.stroke && popupSettings.iconsColor.stroke !== '#' 
            ? `drop-shadow(1px 0 0 ${popupSettings.iconsColor.stroke}) drop-shadow(-1px 0 0 ${popupSettings.iconsColor.stroke}) drop-shadow(0 1px 0 ${popupSettings.iconsColor.stroke}) drop-shadow(0 -1px 0 ${popupSettings.iconsColor.stroke})` 
            : 'none'
    };

    return (
        <>
            <div className="absolute inset-0 z-[99] pointer-events-auto" onClick={onClose} />
            <div className="absolute bottom-[4.5vw] left-[2vw] z-[100] pointer-events-auto">
                <div 
                    className="rounded-[1vw] shadow-2xl p-[0.8vw] w-[13vw] relative animate-in slide-in-from-bottom-4 duration-200" 
                    style={modalStyle}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="text-center mb-[0.6vw]">
                        <h2 className="text-[0.95vw] font-semibold" style={textStyle}>Table of Contents</h2>
                        <div className="h-[1.5px] w-full mt-[0.4vw]" style={{ backgroundColor: textStyle.color, opacity: 0.3 }}></div>
                    </div>

                    {(addSearch && addSearchOnTOC) && (
                        <div 
                            className="mb-[0.6vw] relative font-[Poppins] flex items-center rounded-full px-[0.6vw]"
                            style={{ 
                                backgroundColor: popupSettings?.searchBar?.fill || 'rgba(255,255,255,0.1)',
                                border: popupSettings?.searchBar?.stroke && popupSettings.searchBar.stroke !== '#' ? `1px solid ${popupSettings.searchBar.stroke}` : 'none'
                            }}
                        >
                            <Icon
                                icon="lucide:search"
                                className="w-[0.85vw] h-[0.85vw] flex-shrink-0"
                                style={{ 
                                    color: popupSettings?.searchBar?.icon || iconColor,
                                    filter: popupSettings?.searchBar?.stroke && popupSettings.searchBar.stroke !== '#' 
                                        ? `drop-shadow(0.5px 0 0 ${popupSettings.searchBar.stroke}) drop-shadow(-0.5px 0 0 ${popupSettings.searchBar.stroke}) drop-shadow(0 0.5px 0 ${popupSettings.searchBar.stroke}) drop-shadow(0 -0.5px 0 ${popupSettings.searchBar.stroke})` 
                                        : 'none'
                                }}
                            />
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-transparent pl-[0.5vw] pr-[0.4vw] py-[0.35vw] text-[0.75vw] outline-none transition-colors"
                                style={{ 
                                    color: popupSettings?.searchBar?.text || textStyle.color
                                }}
                            />
                        </div>
                    )}

                    <div className="flex flex-col gap-[0.1vw] max-h-[18vw] overflow-y-auto custom-scrollbar pr-[0.2vw]">
                        {filteredContent.map((heading, hIdx) => (
                            <React.Fragment key={heading.id}>
                                <div
                                    className="flex items-center justify-between px-[0.6vw] py-[0.4vw] hover:bg-white/10 rounded-[0.3vw] transition-colors cursor-pointer group"
                                    onClick={() => onNavigate && onNavigate(heading.page - 1)}
                                    style={textStyle}
                                >
                                    <div className="flex items-center gap-[0.5vw] truncate flex-1 min-w-0">
                                        {addSerialNumberHeading && (
                                            <span 
                                                className="flex-shrink-0 flex justify-center items-center w-[1.1vw] h-[1.1vw] rounded-full text-[0.65vw] font-semibold text-white"
                                                style={{ backgroundColor: iconColor }}
                                            >
                                                {hIdx + 1}
                                            </span>
                                        )}
                                        <span className="text-[0.78vw] font-semibold truncate">
                                            {heading.title}
                                        </span>
                                    </div>
                                    {addPageNumber && (
                                        <span className="text-[0.72vw] font-medium opacity-80 flex-shrink-0 ml-[0.4vw]">{heading.page}</span>
                                    )}
                                </div>

                                {heading.subheadings?.map((sub, sIdx) => (
                                    <div
                                        key={sub.id}
                                        className="flex items-center justify-between px-[0.6vw] py-[0.4vw] pl-[1.4vw] hover:bg-white/10 rounded-[0.3vw] transition-colors cursor-pointer group"
                                        onClick={() => onNavigate && onNavigate(sub.page - 1)}
                                        style={textStyle}
                                    >
                                        <div className="flex items-center gap-[0.5vw] truncate flex-1 min-w-0">
                                            {addSerialNumberSubheading && (
                                                <span 
                                                    className="flex-shrink-0 flex justify-center items-center w-[1.1vw] h-[1.1vw] rounded-full text-[0.65vw] font-semibold text-white opacity-40"
                                                    style={{ backgroundColor: iconColor }}
                                                >
                                                    {sIdx + 1}
                                                </span>
                                            )}
                                            <span className="text-[0.78vw] font-medium truncate">
                                                {sub.title}
                                            </span>
                                        </div>
                                        {addPageNumber && (
                                            <span className="text-[0.72vw] font-medium opacity-80 flex-shrink-0 ml-[0.4vw]">{sub.page}</span>
                                        )}
                                    </div>
                                ))}
                            </React.Fragment>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
};

export default TableOfContentsPopup;
