import React from 'react';
import { Icon } from '@iconify/react';

const ProfilePopup = ({ onClose, profileSettings, popupSettings }) => {
    const containerStyle = {
        backgroundColor: popupSettings?.backgroundColor?.fill || '#575C9C',
        border: popupSettings?.backgroundColor?.stroke && popupSettings.backgroundColor.stroke !== '#' ? `1px solid ${popupSettings.backgroundColor.stroke}` : 'none',
        fontFamily: profileSettings?.font || popupSettings?.textProperties?.font || 'Poppins'
    };

    const textStyle = {
        color: popupSettings?.textProperties?.fill || '#ffffff'
    };
    const name = profileSettings?.name || '';
    const about = profileSettings?.about || '';
    const contacts = profileSettings?.contacts || [];

    const getSocialIcon = (type) => {
        switch (type) {
            case 'x': return { icon: 'ri:twitter-x-fill', bg: 'bg-black', color: 'text-white' };
            case 'facebook': return { icon: 'ri:facebook-fill', bg: 'bg-[#3B5998]', color: 'text-white' };
            case 'email': return { icon: 'logos:google-gmail', bg: 'bg-white', color: '' };
            case 'instagram': return { icon: 'ri:instagram-line', bg: 'bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7]', color: 'text-white' };
            case 'phone': return { icon: 'ph:phone-fill', bg: 'bg-white', color: 'text-[#4C51F3]' };
            case 'linkedin': return { icon: 'ri:linkedin-fill', bg: 'bg-[#0077B5]', color: 'text-white' };
            default: return { icon: 'ph:link-bold', bg: 'bg-white', color: 'text-gray-600' };
        }
    };

    return (
        <>
            {/* Overlay */}
            <div
                className="absolute inset-0 z-[110] pointer-events-auto"
                onClick={onClose}
            />

            {/* Popup Container */}
            <div className="absolute bottom-[4.5vw] right-[21.2vw] z-[120] pointer-events-auto animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div
                    className="rounded-[1vw] shadow-2xl p-[1.5vw] w-[19vw] relative overflow-hidden"
                    style={containerStyle}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="text-center mb-[1vw] relative">
                        <h2 className="text-[1.1vw] font-semibold leading-tight" style={textStyle}>Profile</h2>
                        <div className="h-[1px] w-full mt-[0.5vw] opacity-40" style={{ backgroundColor: textStyle.color }}></div>
                    </div>

                    {/* Personal Info */}
                    <div className="space-y-[1vw] mb-[2vw]">
                        {name && (
                            <div className="flex items-start gap-[0.5vw]">
                                <span className="text-[0.9vw] font-semibold whitespace-nowrap mt-[0.1vw]" style={textStyle}>Name :</span>
                                <span className="text-[0.9vw] font-medium" style={textStyle}>{name}</span>
                            </div>
                        )}
                        {about && (
                            <div className="flex items-start gap-[0.5vw]">
                                <span className="text-[0.9vw] font-semibold whitespace-nowrap mt-[0.1vw]" style={textStyle}>About :</span>
                                <p className="text-[0.85vw] font-normal leading-[1.45] text-justify tracking-tight" style={textStyle}>
                                    {about}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Contact Section */}
                    {contacts.length > 0 && (
                        <div className="relative">
                            <div className="flex items-center gap-[0.8vw] mb-[1.2vw]">
                                <h3 className="text-[1vw] font-semibold" style={textStyle}>Contact</h3>
                                <div className="flex-1 h-[1px] opacity-40" style={{ backgroundColor: textStyle.color }}></div>
                            </div>

                            {/* Social Icons Stack */}
                            <div className="flex items-center flex-wrap gap-[0.6vw] justify-start px-[0.2vw]">
                                {contacts.map((contact) => {
                                    if (!contact.value) return null;
                                    const style = getSocialIcon(contact.type);
                                    return (
                                        <div
                                            key={contact.id}
                                            className={`w-[2.45vw] h-[2.35vw] ${style.bg} rounded-[0.5vw] flex items-center justify-center hover:scale-105 transition-transform cursor-pointer shadow-lg border border-white/10`}
                                            title={contact.value}
                                            onClick={() => {
                                                if (contact.type === 'email') window.location.href = `mailto:${contact.value}`;
                                                else if (contact.type === 'phone') window.location.href = `tel:${contact.value}`;
                                                else {
                                                    const url = contact.value.startsWith('http') ? contact.value : `https://${contact.value}`;
                                                    window.open(url, '_blank');
                                                }
                                            }}
                                        >
                                            <Icon icon={style.icon} className={`${style.color} w-[1.4vw] h-[1.4vw]`} />
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default ProfilePopup;
