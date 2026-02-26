import React, { useState, useEffect } from 'react';
import { Download, X, Loader2, Check } from 'lucide-react';
import JSZip from 'jszip';
import { jsPDF } from 'jspdf';
import { saveAs } from 'file-saver';
import html2canvas from 'html2canvas';

// Export Component handling Button + Popup + Download Logic
const Export = ({
    isOpen,
    onClose,
    hideButton = false,
    pages = [],
    bookName = "Flipbook",
    currentPage = 1,
    isThreedEditor = false
}) => {
    // Internal state for popup visibility if not controlled externally
    const [internalShow, setInternalShow] = useState(false);

    // Derived visibility: External 'isOpen' takes precedence if defined
    const show = isOpen !== undefined ? isOpen : internalShow;

    const handleOpen = () => {
        if (!isThreedEditor) {
            setInternalShow(true);
        }
    };

    const handleClose = () => {
        if (onClose) {
            onClose();
        } else {
            setInternalShow(false);
        }
    };

    // --- Popup State ---
    const [exportType, setExportType] = useState('current'); // current, all, custom
    const [selectedPages, setSelectedPages] = useState([]);
    const [isExporting, setIsExporting] = useState(false);
    const [exportingFormat, setExportingFormat] = useState(null); // 'jpg', 'png', 'pdf'

    // Reset selections when opening
    useEffect(() => {
        if (show) {
            // Optional: reset or keep state? ExportModal kept state.
            // keeping state for now.
        }
    }, [show]);

    const totalPages = pages.length;

    const togglePage = (pageNum) => {
        if (selectedPages.includes(pageNum)) {
            setSelectedPages(selectedPages.filter(p => p !== pageNum));
        } else {
            setSelectedPages([...selectedPages, pageNum]);
        }
    };

    // --- Download Logic (Ported from MainEditor.jsx) ---
    const handleDownloadPages = async (pagesToExport, format = 'png') => {
        try {
            const PAGE_WIDTH = 595;
            const PAGE_HEIGHT = 842;

            // Helper to sanitize filenames
            const sanitizeName = (name) => (name || 'Untitled').replace(/[^a-z0-9 _-]/gi, '_').replace(/\s+/g, '_');
            const bookNameClean = sanitizeName(bookName) || 'Flipbook';

            // Helper to render page to canvas
            const renderPageToCanvas = async (html, scale = 4) => {
                const hiddenFrame = document.createElement('iframe');
                hiddenFrame.style.width = `${PAGE_WIDTH}px`;
                hiddenFrame.style.height = `${PAGE_HEIGHT}px`;
                hiddenFrame.style.position = 'fixed';
                hiddenFrame.style.top = '0';
                hiddenFrame.style.left = '0';
                hiddenFrame.style.zIndex = '-9999';
                hiddenFrame.style.border = 'none';
                document.body.appendChild(hiddenFrame);

                const doc = hiddenFrame.contentDocument;
                if (!doc) throw new Error("Could not create iframe document");

                doc.write(html);
                doc.close();

                // Inject styles
                const style = doc.createElement('style');
                style.innerHTML = `
                    html, body {
                        width: 595px !important;
                        height: 842px !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        overflow: hidden !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                        background: white !important;
                    }
                    * {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                `;

                if (doc.head) doc.head.appendChild(style);
                else if (doc.body) doc.body.appendChild(style);
                else {
                    const head = doc.createElement('head');
                    doc.documentElement.appendChild(head);
                    head.appendChild(style);
                }

                // Wait for images/content to load
                await new Promise(resolve => setTimeout(resolve, 1500));

                const canvas = await html2canvas(doc.documentElement, {
                    scale: scale,
                    useCORS: true,
                    allowTaint: true,
                    logging: false,
                    width: PAGE_WIDTH,
                    height: PAGE_HEIGHT,
                    x: 0,
                    y: 0,
                    backgroundColor: '#ffffff'
                });

                document.body.removeChild(hiddenFrame);
                return canvas;
            };

            if (format === 'pdf') {
                const pdf = new jsPDF('p', 'pt', [PAGE_WIDTH, PAGE_HEIGHT]);

                for (let i = 0; i < pagesToExport.length; i++) {
                    const pageNum = pagesToExport[i];
                    const page = pages.find((p, idx) => (idx + 1) === pageNum);
                    const pageHTML = page?.html || page?.content || '';

                    const canvas = await renderPageToCanvas(pageHTML, 4);
                    const imgData = canvas.toDataURL('image/jpeg', 0.95);

                    if (i > 0) pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
                    pdf.addImage(imgData, 'JPEG', 0, 0, PAGE_WIDTH, PAGE_HEIGHT);
                }

                pdf.save(`${bookNameClean}.pdf`);

            } else {
                const mimeType = format === 'jpg' ? 'image/jpeg' : 'image/png';
                const ext = format === 'jpg' ? 'jpg' : 'png';

                if (pagesToExport.length === 1) {
                    const pageNum = pagesToExport[0];
                    const page = pages.find((p, i) => (i + 1) === pageNum);
                    const pageNameClean = sanitizeName(page?.name || `Page_${pageNum}`);

                    const canvas = await renderPageToCanvas(page?.html || page?.content || '', 4);

                    canvas.toBlob((blob) => {
                        if (blob) {
                            saveAs(blob, `${bookNameClean}_${pageNameClean}.${ext}`);
                        } else {
                            throw new Error("Failed to generate image blob");
                        }
                    }, mimeType);

                } else {
                    const zip = new JSZip();

                    for (const pageNum of pagesToExport) {
                        const page = pages.find((p, i) => (i + 1) === pageNum);
                        const pageNameClean = sanitizeName(page?.name || `Page_${pageNum}`);

                        const canvas = await renderPageToCanvas(page?.html || page?.content || '', 4);

                        const blob = await new Promise(resolve => canvas.toBlob(resolve, mimeType));
                        if (blob) {
                            zip.file(`${pageNameClean}.${ext}`, blob);
                        }
                    }

                    const content = await zip.generateAsync({ type: 'blob' });
                    saveAs(content, `${bookNameClean}.zip`);
                }
            }
        } catch (error) {
            console.error("Export failed:", error);
            alert("Export failed. See console for details.");
        }
    };

    const handleExportClick = async (format) => {
        setIsExporting(true);
        setExportingFormat(format);

        let pagesToExport = [];

        if (exportType === 'current') {
            pagesToExport = [currentPage + 1]; // currentPage is 0-indexed usually in PreviewArea, adjust if needed
            // Wait, PreviewArea passes currentPage (0-indexed). Logic below expects 1-based page numbers?
            // "const page = pages.find((p, idx) => (idx + 1) === pageNum);"
            // So if currentPage is 0, pageNum should be 1.
        } else if (exportType === 'all') {
            pagesToExport = Array.from({ length: totalPages }, (_, i) => i + 1);
        } else {
            // Custom
            pagesToExport = selectedPages.sort((a, b) => a - b);
        }

        try {
            await handleDownloadPages(pagesToExport, format);
        } catch (error) {
            console.error("Export process error:", error);
        } finally {
            setIsExporting(false);
            setExportingFormat(null);
            handleClose();
        }
    };


    return (
        <>
            {/* Export Button (Optional, can be hidden) */}
            {!hideButton && (
                <button
                    onClick={handleOpen}
                    disabled={isThreedEditor}
                    className={`bg-black text-white rounded-lg flex items-center justify-center transition-colors px-5 py-2.5 ml-1 ${isThreedEditor
                        ? 'opacity-50 cursor-not-allowed pointer-events-none'
                        : 'hover:bg-gray-800'
                        }`}
                    style={{ gap: '0.5rem' }}
                >
                    <Download size={18} />
                    <span className="font-medium text-sm">Export</span>
                </button>
            )}

            {/* Export Modal UI */}
            {show && (
                <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px] z-[200] flex items-center justify-center p-4 text-left font-sans text-black" onClick={(e) => e.stopPropagation()}>
                    <div className="bg-[#f9fafb] rounded-[1vw] shadow-2xl w-[22vw] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-white/20">

                        {/* Header */}
                        <div className="flex items-center justify-between p-[1.2vw] pb-[0.5vw]">
                            <h2 className="text-[1.1vw] font-semibold text-gray-900">Export File</h2>
                            <button onClick={handleClose} className="p-[0.2vw] hover:bg-gray-200 rounded-full transition-colors text-gray-500">
                                <X className="w-[1.2vw] h-[1.2vw]" />
                            </button>
                        </div>

                        {/* Separator Line */}
                        <div className="px-[1.2vw]">
                            <div className="h-px bg-gray-200 w-full mb-[1vw]"></div>
                        </div>

                        <div className="px-[1.2vw] flex-1 overflow-y-auto custom-scrollbar">

                            <p className="text-[0.75vw] font-medium text-gray-600 mb-[0.8vw]">
                                Select the Export type <span className="text-red-500">*</span>
                            </p>

                            <div className="space-y-[0.8vw] mb-[1.2vw]">
                                {/* Export Current Pages */}
                                <label className="flex items-center gap-[0.6vw] cursor-pointer group">
                                    <div className="relative flex items-center justify-center">
                                        <input
                                            type="radio"
                                            name="exportType"
                                            value="current"
                                            checked={exportType === 'current'}
                                            onChange={(e) => setExportType(e.target.value)}
                                            className="peer appearance-none w-[1.1vw] h-[1.1vw] border-[1.5px] border-gray-400 rounded-full checked:border-[#6366f1] checked:border-[4px] transition-all"
                                        />
                                    </div>
                                    <span className="text-gray-700 font-medium group-hover:text-gray-900 text-[0.8vw]">Export Current Pages</span>
                                </label>

                                {/* Export Entire Pages */}
                                <label className="flex items-center gap-[0.6vw] cursor-pointer group">
                                    <div className="relative flex items-center justify-center">
                                        <input
                                            type="radio"
                                            name="exportType"
                                            value="all"
                                            checked={exportType === 'all'}
                                            onChange={(e) => setExportType(e.target.value)}
                                            className="peer appearance-none w-[1.1vw] h-[1.1vw] border-[1.5px] border-gray-400 rounded-full checked:border-[#6366f1] checked:border-[4px] transition-all"
                                        />
                                    </div>
                                    <span className="text-gray-700 font-medium group-hover:text-gray-900 text-[0.8vw]">Export Entire Pages</span>
                                </label>

                                {/* Export Custom Selection Pages */}
                                <label className="flex items-center gap-[0.6vw] cursor-pointer group">
                                    <div className="relative flex items-center justify-center">
                                        <input
                                            type="radio"
                                            name="exportType"
                                            value="custom"
                                            checked={exportType === 'custom'}
                                            onChange={(e) => setExportType(e.target.value)}
                                            className="peer appearance-none w-[1.1vw] h-[1.1vw] border-[1.5px] border-gray-400 rounded-full checked:border-[#6366f1] checked:border-[4px] transition-all"
                                        />
                                    </div>
                                    <span className="text-gray-700 font-medium group-hover:text-gray-900 text-[0.8vw]">Export Custom Selection Pages</span>
                                </label>
                            </div>

                            {/* Custom Selection List */}
                            {exportType === 'custom' && (
                                <div className="bg-white border border-gray-200 rounded-[0.5vw] shadow-sm overflow-hidden mb-[1vw] animate-in slide-in-from-top-2 duration-200">
                                    <div className="px-[1vw] py-[0.6vw] border-b border-gray-100">
                                        <span className="font-semibold text-gray-800 text-[0.75vw]">Select Pages</span>
                                    </div>
                                    <div className="max-h-[9vw] overflow-y-auto p-[0.4vw] custom-scrollbar">
                                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                                            <label
                                                key={pageNum}
                                                className="flex items-center gap-[0.6vw] px-[0.6vw] py-[0.4vw] hover:bg-gray-50 rounded-[0.3vw] cursor-pointer transition-colors"
                                            >
                                                <div className="relative flex items-center justify-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedPages.includes(pageNum)}
                                                        onChange={() => togglePage(pageNum)}
                                                        className="peer appearance-none w-[1vw] h-[1vw] border-[1.5px] border-gray-300 rounded-[0.2vw] checked:bg-[#6366f1] checked:border-[#6366f1] transition-all"
                                                    />
                                                    <Check className="w-[0.7vw] h-[0.7vw] text-white absolute opacity-0 peer-checked:opacity-100 pointer-events-none" strokeWidth={3} />
                                                </div>
                                                <span className={`text-[0.75vw] ${selectedPages.includes(pageNum) ? 'text-gray-900 font-medium' : 'text-gray-600'}`}>
                                                    Page {pageNum}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer Area - Buttons */}
                        <div className="p-[1.2vw] pt-0 flex flex-col gap-[0.6vw]">
                            <button
                                onClick={() => handleExportClick('jpg')}
                                disabled={isExporting}
                                className="w-full py-[0.6vw] bg-black text-white rounded-[0.4vw] font-semibold text-[0.8vw] tracking-wide shadow-lg hover:bg-gray-900 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-[0.4vw]"
                            >
                                {isExporting && exportingFormat === 'jpg' ? <Loader2 className="w-[1vw] h-[1vw] animate-spin" /> : null}
                                JPG
                            </button>
                            <button
                                onClick={() => handleExportClick('png')}
                                disabled={isExporting}
                                className="w-full py-[0.6vw] bg-black text-white rounded-[0.4vw] font-semibold text-[0.8vw] tracking-wide shadow-lg hover:bg-gray-900 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-[0.4vw]"
                            >
                                {isExporting && exportingFormat === 'png' ? <Loader2 className="w-[1vw] h-[1vw] animate-spin" /> : null}
                                PNG
                            </button>
                            <button
                                onClick={() => handleExportClick('pdf')}
                                disabled={isExporting}
                                className="w-full py-[0.6vw] bg-black text-white rounded-[0.4vw] font-semibold text-[0.8vw] tracking-wide shadow-lg hover:bg-gray-900 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-[0.4vw]"
                            >
                                {isExporting && exportingFormat === 'pdf' ? <Loader2 className="w-[1vw] h-[1vw] animate-spin" /> : null}
                                PDF
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Export;
