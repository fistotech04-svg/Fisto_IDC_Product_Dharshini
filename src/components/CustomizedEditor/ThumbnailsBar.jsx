import React, { useRef, useEffect } from 'react';
import { Icon } from '@iconify/react';

const PageThumbnail = React.memo(({ html, index, scale = 0.15, cornerRadius = '0px' }) => {
    // Optimization: Strip malicious/heavy scripts
    const cleanHtml = (html || '')
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<video\b[^<]*(?:(?!<\/video>)<[^<]*)*<\/video>/gi, '<div style="width:100%;height:100%;background:#f3f4f6;display:flex;align-items:center;justify-content:center;font-size:20px;color:#9ca3af">Video</div>')
        .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '<div style="width:100%;height:100%;background:#f3f4f6;display:flex;align-items:center;justify-content:center;font-size:20px;color:#9ca3af">Frame</div>')
        .replace(/<img\b([^>]*src=['"]https:\/\/codia-f2c\.s3\.us-west-1\.amazonaws\.com\/[^'"]*['"])([^>]*)>/gi, '<img $1 crossOrigin="anonymous" $2>');

    const srcDoc = `
        <!DOCTYPE html>
        <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { 
                        margin: 0; 
                        padding: 0; 
                        overflow: hidden; 
                        background: white; 
                        width: 400px; 
                        height: 566px; 
                        position: relative;
                    }
                    * { box-sizing: border-box; }
                    ::-webkit-scrollbar { width: 0px; background: transparent; }
                    img { max-width: 100%; height: auto; display: block; }
                </style>
                <script src="https://cdn.tailwindcss.com"></script>
            </head>
            <body>
                 <div style="width: 400px; height: 566px; overflow: hidden; position: relative; background: white;">
                    ${cleanHtml}
                </div>
            </body>
        </html>
    `;

    return (
        <div className="w-full h-full relative overflow-hidden bg-white flex items-center justify-center">
            <iframe
                className="border-none pointer-events-none"
                srcDoc={srcDoc}
                title={`Thumb ${index}`}
                loading="lazy"
                style={{
                    width: '400px',
                    height: '566px',
                    transform: `scale(${scale})`,
                    transformOrigin: 'center center',
                    backgroundColor: 'white',
                    borderRadius: cornerRadius
                }}
            />
        </div>
    );
});

const ThumbnailsBar = ({ pages, currentPage, onPageClick, popupSettings, cornerRadius = '0px', textureStyle }) => {
    const scrollRef = useRef(null);

    const barStyle = {
        backgroundColor: `${popupSettings?.backgroundColor?.fill || '#ffffff'}F2`, // Adding transparency
        border: popupSettings?.backgroundColor?.stroke && popupSettings.backgroundColor.stroke !== '#' ? `1px solid ${popupSettings.backgroundColor.stroke}` : '1px solid rgba(0,0,0,0.1)',
        fontFamily: popupSettings?.textProperties?.font || 'Poppins'
    };

    const textStyle = {
        color: popupSettings?.textProperties?.fill || '#1E293B'
    };

    const inactiveTextStyle = `${popupSettings?.textProperties?.fill || '#1E293B'}33`; // 20% opacity
    const hoverTextStyle = `${popupSettings?.textProperties?.fill || '#1E293B'}66`; // 40% opacity

    const scroll = (direction) => {
        if (scrollRef.current) {
            const scrollAmount = window.innerWidth * 0.3;
            scrollRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    // Grouping logic for spreads - Memoized to prevent recalculation
    const spreads = React.useMemo(() => {
        const result = [];
        if (pages && pages.length > 0) {
            // First page is cover
            result.push({ pages: [pages[0]], indices: [0], label: "Page 1" });
            for (let i = 1; i < pages.length; i += 2) {
                const spreadIndices = [i];
                const spreadPages = [pages[i]];
                if (i + 1 < pages.length) {
                    spreadIndices.push(i + 1);
                    spreadPages.push(pages[i + 1]);
                }
                result.push({
                    pages: spreadPages,
                    indices: spreadIndices,
                    label: spreadIndices.length === 1 ? `Page ${spreadIndices[0] + 1}` : `Page ${spreadIndices[0] + 1}-${spreadIndices[1] + 1}`
                });
            }
        }
        return result;
    }, [pages]);

    // Scroll to active thumbnail on change - Only if not already in view
    useEffect(() => {
        if (scrollRef.current) {
            const activeElem = scrollRef.current.querySelector('.active-thumbnail');
            if (activeElem) {
                activeElem.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
            }
        }
    }, [currentPage]);

    return (
        <div
            className="absolute bottom-[4vw] left-[1.5vw] right-[1.5vw] h-[7.8vw] backdrop-blur-md rounded-[0.8vw] shadow-2xl z-[50] flex items-center px-[0.5vw] group/bar fisto-menu-content"
            style={barStyle}
            onClick={(e) => e.stopPropagation()}
        >
            {/* Scroll Left Button - Inside Bar */}
            <button
                className="w-[2.2vw] h-[3.8vw] rounded-[0.4vw] bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/40 hover:text-white transition-all shrink-0 z-20 ml-[0.3vw]"
                onClick={(e) => { e.stopPropagation(); scroll('left'); }}
            >
                <Icon icon="lucide:chevron-left" className="w-[1.2vw] h-[1.2vw]" />
            </button>

            {/* Thumbnails Container */}
            <div
                ref={scrollRef}
                className="flex-1 flex gap-[0.4vw] overflow-x-hidden no-scrollbar scroll-smooth px-[0.8vw] items-center h-full"
            >
                {spreads.map((spread, idx) => {
                    const activeSpreadIdx = spreads.findIndex(s => s.indices.includes(currentPage));
                    const isSelected = spread.indices.includes(currentPage) || (spread.indices.length === 2 && currentPage === spread.indices[1]);

                    // Calculate distance from active spread for dynamic scaling
                    const distance = Math.abs(idx - activeSpreadIdx);
                    // Scaling factor: 1.0 for active, decreasing as they move away
                    const dynamicScale = Math.max(0.55, 1 - (distance * 0.12));
                    // User requested full brightness for all thumbnails
                    const dynamicOpacity = 1.0;

                    return (
                        <div
                            key={idx}
                            className={`
                                flex flex-col items-center gap-[0.2vw] shrink-0 cursor-pointer group p-[0.3vw] rounded-[0.5vw]
                                ${isSelected ? 'bg-white/10 active-thumbnail' : 'hover:bg-white/5'}
                            `}
                            style={{
                                transform: `scale(${dynamicScale})`,
                                opacity: dynamicOpacity,
                                transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                                margin: `0 -${distance > 0 ? (1.5 / (distance + 0.5)) : 0}vw` // Overlap effect
                            }}
                            onClick={() => onPageClick(spread.indices[0])}
                        >
                            <div className={`
                                w-[6.5vw] h-[4.5vw] rounded-[0.3vw] overflow-hidden border-[0.15vw] transition-all bg-white relative shadow-xl
                                ${isSelected ? 'border-white ring-2 ring-white/20' : 'border-transparent group-hover:border-white/20'}
                            `}>
                                <div className="flex w-full h-full gap-[0.5px] bg-gray-200">
                                    {spread.pages.map((page, pIdx) => {
                                        const pageIdx = spread.indices[pIdx];
                                        const isEven = pageIdx % 2 === 0;
                                        const isSingle = pages.length === 1;
                                        const isCover = pageIdx === 0;
                                        const isLast = pageIdx === pages.length - 1;

                                        // In thumbnail bar, index 0 is always standalone Front Cover (Right page)
                                        // Then spreads starts from index 1 (Left page)
                                        let finalBorderRadius = '0px';
                                        if (isSingle) {
                                            finalBorderRadius = cornerRadius;
                                        } else if (isCover) {
                                            finalBorderRadius = `0 ${cornerRadius} ${cornerRadius} 0`;
                                        } else if (isLast && pages.length % 2 === 0) {
                                            // Back cover is even index if total pages is even (0-indexed)
                                            finalBorderRadius = `${cornerRadius} 0 0 ${cornerRadius}`;
                                        } else {
                                            finalBorderRadius = isEven 
                                                ? `0 ${cornerRadius} ${cornerRadius} 0` // Right side
                                                : `${cornerRadius} 0 0 ${cornerRadius}`; // Left side
                                        }

                                        return (
                                            <div key={`${idx}-${pIdx}`} className="flex-1 bg-white overflow-hidden relative" style={{ borderRadius: finalBorderRadius }}>
                                                <PageThumbnail 
                                                    html={page.html || page.content} 
                                                    index={pageIdx} 
                                                    scale={0.15} 
                                                    cornerRadius={finalBorderRadius}
                                                />
                                                {/* Texture Overlay for Thumbnail */}
                                                {textureStyle && (
                                                    <div
                                                        className="absolute inset-0 pointer-events-none z-10 opacity-60"
                                                        style={{
                                                            ...textureStyle,
                                                            borderRadius: finalBorderRadius
                                                        }}
                                                    />
                                                )}
                                            </div>
                                        );
                                    })}
                                    {spread.pages.length === 1 && (
                                        <div className="flex-1 bg-gray-50/50" />
                                    )}
                                </div>
                            </div>
                            <span 
                                className="text-[0.6vw] font-semibold tracking-tight transition-colors"
                                style={{ color: isSelected ? textStyle.color : inactiveTextStyle }}
                                onMouseEnter={(e) => { if(!isSelected) e.target.style.color = hoverTextStyle; }}
                                onMouseLeave={(e) => { if(!isSelected) e.target.style.color = inactiveTextStyle; }}
                            >
                                {spread.label}
                            </span>
                        </div>
                    );
                })}
            </div>

            {/* Scroll Right Button - Inside Bar */}
            <button
                className="w-[2.2vw] h-[3.8vw] rounded-[0.4vw] bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/40 hover:text-white transition-all shrink-0 z-20 mr-[0.3vw]"
                onClick={(e) => { e.stopPropagation(); scroll('right'); }}
            >
                <Icon icon="lucide:chevron-right" className="w-[1.2vw] h-[1.2vw]" />
            </button>
        </div>
    );
};

export default ThumbnailsBar;
