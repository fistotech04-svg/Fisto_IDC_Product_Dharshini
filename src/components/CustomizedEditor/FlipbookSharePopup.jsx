import React, { useState } from 'react';
import { Icon } from '@iconify/react';

const FlipbookSharePopup = ({ onClose, bookName = "Flipbook Name", url = "https://flipbook/page", popupSettings }) => {
    const [shareCurrentPage, setShareCurrentPage] = useState(false);

    const containerStyle = {
        backgroundColor: popupSettings?.backgroundColor?.fill || '#ffffff',
        border: popupSettings?.backgroundColor?.stroke && popupSettings.backgroundColor.stroke !== '#' ? `1px solid ${popupSettings.backgroundColor.stroke}` : '1px solid #e5e7eb',
        fontFamily: popupSettings?.textProperties?.font || 'Poppins'
    };

    const headerTextStyle = {
        color: popupSettings?.textProperties?.fill || '#111827',
        fontFamily: popupSettings?.textProperties?.font || 'Poppins'
    };

    return (
        <div
            className="absolute inset-0 z-[110] flex items-center justify-center pointer-events-auto bg-black/10 backdrop-blur-[1px]"
            onClick={onClose}
        >
            <div
                className="w-[24vw] rounded-[1vw] p-[1.2vw] shadow-[0_1.5vw_4vw_rgba(0,0,0,0.12)] flex flex-col gap-[1vw] pointer-events-auto animate-in zoom-in-95 duration-200"
                style={containerStyle}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="relative mb-[0.2vw]">
                    <div className="flex items-center gap-[0.8vw]">
                        <h2 className="text-[1.1vw] font-semibold whitespace-nowrap" style={headerTextStyle}>Share Flipbook</h2>
                        <div className="h-[1px] flex-1 opacity-20" style={{ backgroundColor: headerTextStyle.color }}></div>
                        <button
                            onClick={onClose}
                            className="w-[1.6vw] h-[1.6vw] rounded-[0.3vw] border border-[#FF4D4D] flex items-center justify-center text-[#FF4D4D] hover:bg-red-50 transition-colors"
                        >
                            <Icon icon="lucide:x" className="w-[1vw] h-[1vw] stroke-[2.5]" />
                        </button>
                    </div>
                    <p className="text-[0.75vw] text-gray-500 font-medium mt-[0.3vw]">
                        Select the Export type <span className="text-red-500">*</span>
                    </p>
                </div>

                {/* Link Input */}
                <div className="flex gap-[0.6vw] items-center">
                    <div className="flex-1 border border-gray-400 rounded-[0.4vw] px-[0.8vw] py-[0.5vw] flex items-center bg-white shadow-sm overflow-hidden h-[2.5vw]">
                        <span className="text-[0.8vw] text-gray-600 truncate w-full">{url}</span>
                    </div>
                    <button className="flex-shrink-0 bg-black text-white px-[1.2vw] py-[0.5vw] h-[2.5vw] rounded-[0.4vw] flex items-center gap-[0.5vw] hover:bg-gray-800 transition-colors shadow-sm whitespace-nowrap">
                        <Icon icon="solar:copy-bold-duotone" className="w-[1.2vw] h-[1.2vw]" />
                        <span className="text-[0.8vw] font-semibold">Copy link</span>
                    </button>
                </div>

                {/* Checkbox */}
                <div
                    className="flex items-center gap-[0.5vw] cursor-pointer w-fit"
                    onClick={() => setShareCurrentPage(!shareCurrentPage)}
                >
                    <div className={`w-[0.9vw] h-[0.9vw] border-[1.5px] rounded-[0.2vw] flex items-center justify-center transition-colors bg-white ${shareCurrentPage ? 'border-black' : 'border-gray-400'}`}>
                        {shareCurrentPage && <Icon icon="lucide:check" className="w-[0.7vw] h-[0.7vw] text-black stroke-[3]" />}
                    </div>
                    <span className="text-[0.75vw] text-gray-500 font-medium tracking-tight">Share Current Page only</span>
                </div>

                {/* QR Code Section */}
                <div className="flex items-center gap-[1.5vw]">
                    <div className="flex flex-col items-center gap-[0.4vw] p-[0.6vw] border border-gray-100 rounded-[1vw] shadow-[0_0.2vw_1vw_rgba(0,0,0,0.05)] bg-white w-[8vw]">
                        <div className="w-[6.5vw] h-[6.5vw] flex items-center justify-center">
                            <Icon icon="openmoji:qr-code" className="w-full h-full" />
                        </div>
                        <span className="text-[0.6vw] font-medium text-gray-400 truncate w-full text-center">{bookName}</span>
                    </div>
                    <div className="flex items-center gap-[0.6vw] text-gray-500">
                        <Icon icon="fluent:share-ios-24-regular" className="w-[1.2vw] h-[1.2vw] text-gray-400 rotate-180" />
                        <span className="text-[0.8vw] font-medium text-gray-600">Share Through QR Code</span>
                    </div>
                </div>

                <div className="h-[1px] w-full bg-gray-200"></div>

                {/* Social Share */}
                <div className="space-y-[0.8vw]">
                    <h3 className="text-[1vw] font-semibold text-gray-700">Share Through</h3>
                    <div className="flex gap-[0.8vw] justify-between">
                        {/* WhatsApp */}
                        <button
                            onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(`Check out this flipbook: ${bookName} - ${url}`)}`, '_blank')}
                            className="w-[3.2vw] h-[3.2vw] rounded-[0.6vw] bg-[#25D366] flex items-center justify-center hover:scale-110 transition-transform shadow-sm"
                        >
                            <Icon icon="ic:baseline-whatsapp" className="w-[2.2vw] h-[2.2vw] text-white" />
                        </button>
                        {/* X (Twitter) */}
                        <button
                            onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out this flipbook: ${bookName}`)}&url=${encodeURIComponent(url)}`, '_blank')}
                            className="w-[3.2vw] h-[3.2vw] rounded-[0.6vw] bg-black flex items-center justify-center hover:scale-110 transition-transform shadow-sm"
                        >
                            <Icon icon="ri:twitter-x-fill" className="w-[1.8vw] h-[1.8vw] text-white" />
                        </button>
                        {/* Facebook */}
                        <button
                            onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank')}
                            className="w-[3.2vw] h-[3.2vw] rounded-[0.6vw] bg-[#3b5998] flex items-center justify-center hover:scale-110 transition-transform shadow-sm"
                        >
                            <Icon icon="ic:baseline-facebook" className="w-[2.4vw] h-[2.4vw] text-white" />
                        </button>
                        {/* Gmail */}
                        <button
                            onClick={() => window.open(`mailto:?subject=${encodeURIComponent(bookName)}&body=${encodeURIComponent(`Check out this flipbook: ${url}`)}`, '_blank')}
                            className="w-[3.2vw] h-[3.2vw] rounded-[0.6vw] bg-white border border-gray-200 flex items-center justify-center hover:scale-110 transition-transform shadow-sm"
                        >
                            <Icon icon="logos:google-gmail" className="w-[2vw] h-[2vw]" />
                        </button>
                        {/* Drive */}
                        <button
                            onClick={() => window.open(`https://drive.google.com/`, '_blank')}
                            className="w-[3.2vw] h-[3.2vw] rounded-[0.6vw] bg-white border border-gray-200 flex items-center justify-center hover:scale-110 transition-transform shadow-sm"
                        >
                            <Icon icon="logos:google-drive" className="w-[2vw] h-[2vw]" />
                        </button>
                        {/* Instagram */}
                        <button
                            onClick={() => window.open(`https://www.instagram.com/`, '_blank')}
                            className="w-[3.2vw] h-[3.2vw] rounded-[0.6vw] bg-white flex items-center justify-center hover:scale-110 transition-transform shadow-sm overflow-hidden"
                        >
                            <Icon icon="skill-icons:instagram" className="w-[3.2vw] h-[3.2vw]" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FlipbookSharePopup;
