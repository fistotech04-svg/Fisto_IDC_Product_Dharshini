import React, { useState, useEffect, useRef } from 'react';
import { useParams, useOutletContext } from 'react-router-dom';
import axios from 'axios';
import Sidebar from './Sidebar';
import PreviewArea from './PreviewArea';
import Branding from './Branding';
import Appearance from './Appearance';
import MenuBar from './MenuBar';
import OtherSetup from './OtherSetup';
import LeadForm from './LeadForm';
import Visibility from './Visibility';
import Statistic from './Statistic';
import FlipbookPreview from '../TemplateEditor/FlipbookPreview';
// Navbar removed

const CustomizedEditor = () => {
  const { folder, v_id } = useParams();
  const { setExportHandler, setSaveHandler, setPreviewHandler, setHasUnsavedChanges, triggerSaveSuccess, isAutoSaveEnabled, setCurrentBook } = useOutletContext() || {};
  const [bookName, setBookName] = useState('Name of the Book');
  const [activeSubView, setActiveSubView] = useState(null);
  const [pages, setPages] = useState([]);
  const [showPreview, setShowPreview] = useState(false);

  // Navbar States handled by context
  const [saveSuccessInfo, setSaveSuccessInfo] = useState(null);

  // Customization States
  const [logoSettings, setLogoSettings] = useState(() => {
    const saved = localStorage.getItem('customized_editor_branding');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.logo) return parsed.logo;
      } catch (e) {
        console.error("Failed to parse logo settings from local storage", e);
      }
    }
    return {
      src: '',
      url: '',
      type: 'Fit',
      opacity: 100,
      adjustments: {
        exposure: 0,
        contrast: 0,
        saturation: 0,
        temperature: 0,
        tint: 0,
        highlights: 0,
        shadows: 0
      }
    };
  });

  const [profileSettings, setProfileSettings] = useState(() => {
    const saved = localStorage.getItem('customized_editor_branding');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.profile) return parsed.profile;
      } catch (e) {
        console.error("Failed to parse profile settings from local storage", e);
      }
    }
    return {
      name: '',
      about: '',
      contacts: [
        { id: '1', type: 'email', value: '' },
        { id: '2', type: 'phone', value: '' }
      ]
    };
  });

  const [backgroundSettings, setBackgroundSettings] = useState(() => {
    const saved = localStorage.getItem('customized_editor_appearance');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.background) return parsed.background;
      } catch (e) {
        console.error("Failed to parse background settings from local storage", e);
      }
    }
    return {
      color: '#DADBE8',
      style: 'Solid', // Solid, Gradient, Image, ReactBits
      gradient: 'linear-gradient(to bottom, #b363f1ff, #a855f7)',
      image: '',
      fit: 'Cover',
      opacity: 100,
      animation: 'None',
      reactBitType: null
    };
  });

  const [bookAppearanceSettings, setBookAppearanceSettings] = useState(() => {
    const saved = localStorage.getItem('customized_editor_appearance');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.appearance) return parsed.appearance;
      } catch (e) {
        console.error("Failed to parse appearance settings from local storage", e);
      }
    }
    return {
      texture: 'Plain White',
      hardCover: false,
      grainIntensity: 20,
      warmth: 0,
      textureScale: 0,
      opacity: 100,
      flipStyle: 'Classic Flip',
      flipSpeed: 'Slow',
      corner: 'Sharp',
      dropShadow: {
        active: true,
        color: '#4f4f4fff',
        opacity: 50,
        xAxis: 0,
        yAxis: 0,
        blur: 0,
        spread: 0
      },
      instructions: 'first'
    };
  });

  const [menuBarSettings, setMenuBarSettings] = useState(() => {
    const saved = localStorage.getItem('customized_editor_setup');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.menuBar) return parsed.menuBar;
      } catch (e) {
        console.error("Failed to parse menu bar settings from local storage", e);
      }
    }
    return {
      navigation: {
        nextPrevButtons: true,
        mouseWheel: true,
        dragToTurn: false,
        pageQuickAccess: true,
        tableOfContents: true,
        pageThumbnails: true,
        bookmark: true,
        bookmarkSettings: {
          icon: 'default',
          font: 'Poppins'
        },
        startEndNav: false,
      },
      viewing: {
        zoom: true,
        fullScreen: true,
      },
      interaction: {
        search: true,
        notes: true,
        gallery: true,
      },
      media: {
        autoFlip: true,
        autoFlipSettings: {
          duration: 5,
          forwardBackwardButtons: true,
          countdown: true
        },
        backgroundAudio: true,
      },
      shareExport: {
        share: true,
        download: true,
        contact: true,
      },
      brandingProfile: {
        logo: true,
        profile: true,
      },
      tocSettings: {
        addSearch: true,
        addPageNumber: true,
        addSerialNumberHeading: true,
        addSerialNumberSubheading: true,
        content: [
          { id: 1, title: 'Heading 1', page: 1, subheadings: [{ id: 1, title: 'Subheading 1', page: 1 }] },
          { id: 2, title: 'Heading 2', page: 2, subheadings: [{ id: 1, title: 'Subheading 1', page: 2 }, { id: 2, title: 'Subheading 2', page: 3 }] },
          { id: 3, title: 'Heading 3', page: 4, subheadings: [] }
        ]
      }
    };
  });

  const [otherSetupSettings, setOtherSetupSettings] = useState(() => {
    const saved = localStorage.getItem('customized_editor_setup');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.otherSetup) {
          // Migration: remove old hardcoded Unsplash placeholder images
          const UNSPLASH_DEFAULTS = [
            'photo-1581450234418-ad4c9954d68b',
            'photo-1486406146926-c627a92ad1ab',
            'photo-1497215728101-856f4ea42174',
            'photo-1497366216548-37526070297c',
          ];
          if (parsed.otherSetup.gallery?.images) {
            parsed.otherSetup.gallery.images = parsed.otherSetup.gallery.images.filter(
              img => !UNSPLASH_DEFAULTS.some(id => img.url?.includes(id))
            );
          }
          return parsed.otherSetup;
        }
      } catch (e) {
        console.error("Failed to parse other setup settings from local storage", e);
      }
    }
    return {
      toolbar: {
        displayMode: 'icon',
        addTextBelowIcons: false,
        addSearchOnTop: true,
        textProperties: { font: 'Poppins', fill: '#ffffffff', stroke: '#' },
        toolbarColor: { fill: '#3E4491', stroke: '#' },
        iconsColor: { fill: '#ffffff', stroke: '#' },
        processBar: { fill: '#ffffffff', stroke: '#' },
        autoFlipEnabled: false,
        autoFlipDuration: 2,
        addForwardFlipCountdownLine: true,
        nextFlipCountdown: true,
        maximumZoom: 1,
        twoClickToZoom: true,
      },

      sound: {
        flipSound: 'Soft Paper Flip',
        pageSpecificSound: false,
        bgSound: 'BG Sound 1',
        customBgSounds: [], // To store list of uploaded background sounds
        bgSoundFile: null
      },
      gallery: {
        autoPlay: true,
        speed: 2,
        infiniteLoop: true,
        showDots: true,
        dotColor: '#4F46E5',
        imageFitType: 'Fill All',
        transitionEffect: 'Linear',
        dragToSlide: false,
        images: [],
      },
    };
  });

  const [leadFormSettings, setLeadFormSettings] = useState(() => {
    const saved = localStorage.getItem('customized_editor_setup');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.leadForm) return parsed.leadForm;
      } catch (e) {
        console.error("Failed to parse lead form settings from local storage", e);
      }
    }
    return {
      enabled: true,
      leadText: 'Share your Information to get personalized updates.',
      fields: {
        name: true,
        phone: false,
        email: true,
        feedback: true
      },
      appearance: {
        timing: 'after-pages', // before, after-pages, end
        afterPages: 4,
        allowSkip: true,
        fontStyle: 'Poppins',
        textFill: '#3E4491',
        textStroke: '',
        bgFill: '#ffffffff',
        bgStroke: '',
        btnFill: '#3E4491',
        btnStroke: '',
        btnText: 'white'
      }
    };
  });

  const [visibilitySettings, setVisibilitySettings] = useState(() => {
    const saved = localStorage.getItem('customized_editor_setup');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.visibility) return parsed.visibility;
      } catch (e) {
        console.error("Failed to parse visibility settings from local storage", e);
      }
    }
    return {
      type: 'Public', // Public, Private, Password Protect, Invite only Access
      password: '',
      inviteOnly: {
        allowReAccess: true,
        notifyOnView: true,
        autoExpire: {
          enabled: true,
          duration: '5 Days'
        },
        emails: [
          { email: 'naveen1234@gmail.com', status: 'valid' }
        ],
        domains: [
          { domain: 'fist-o.com', status: 'valid' }
        ]
      }
    };
  });

  // Save Appearance Logic
  useEffect(() => {
    const settings = {
      background: backgroundSettings,
      appearance: bookAppearanceSettings
    };
    localStorage.setItem('customized_editor_appearance', JSON.stringify(settings));
  }, [backgroundSettings, bookAppearanceSettings]);

  // Save Setup Logic
  useEffect(() => {
    const settings = {
      menuBar: menuBarSettings,
      otherSetup: otherSetupSettings,
      visibility: visibilitySettings,
      leadForm: leadFormSettings
    };
    localStorage.setItem('customized_editor_setup', JSON.stringify(settings));
  }, [menuBarSettings, otherSetupSettings, visibilitySettings, leadFormSettings]);

  // Save Branding Logic
  useEffect(() => {
    const settings = {
      logo: logoSettings,
      profile: profileSettings
    };
    localStorage.setItem('customized_editor_branding', JSON.stringify(settings));
  }, [logoSettings, profileSettings]);

  // Export/Save Handlers (Logic)
  const handleExport = () => {
    // Implement export logic if needed
    console.log("Exporting...");
  };

  const handleSave = async () => {
    try {
      const storedUser = localStorage.getItem('user');
      if (!storedUser) {
        console.error("User not found");
        return;
      }
      const user = JSON.parse(storedUser);

      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

      const payload = {
        emailId: user.emailId,
        folderName: folder,
        bookName: v_id,
        newName: bookName,
        settings: {
          logo: logoSettings,
          profile: profileSettings,
          background: backgroundSettings,
          appearance: bookAppearanceSettings,
          menubar: menuBarSettings,
          othersetup: otherSetupSettings,
          leadform: leadFormSettings,
          visibility: visibilitySettings
        }
      };

      await axios.post(`${backendUrl}/api/flipbook/update-settings`, payload);

      if (setHasUnsavedChanges) setHasUnsavedChanges(false);
      if (triggerSaveSuccess) triggerSaveSuccess({ name: bookName, folder: 'Customized' });
      setSaveSuccessInfo({ name: bookName, folder: 'Customized' });
      setTimeout(() => setSaveSuccessInfo(null), 3000);
    } catch (error) {
      console.error("Save failed", error);
    }
  };

  // Export/Save Handlers for Context (Registration)
  useEffect(() => {
    if (setExportHandler) setExportHandler(() => handleExport);
    if (setSaveHandler) setSaveHandler(() => handleSave);
    if (setPreviewHandler) setPreviewHandler(() => () => setShowPreview(true));
    return () => {
      if (setExportHandler) setExportHandler(null);
      if (setSaveHandler) setSaveHandler(null);
      if (setPreviewHandler) setPreviewHandler(null);
    };
  }, [setExportHandler, setSaveHandler, setPreviewHandler, bookName, logoSettings, profileSettings, backgroundSettings, bookAppearanceSettings, menuBarSettings, otherSetupSettings, leadFormSettings, visibilitySettings]);

  // Sync Current Book to Navbar
  useEffect(() => {
    if (setCurrentBook) {
      setCurrentBook({ folder: folder, name: v_id || bookName });
    }
  }, [setCurrentBook, folder, v_id, bookName]);


  // Track changes for unsaved status
  useEffect(() => {
    if (setHasUnsavedChanges) setHasUnsavedChanges(true);
  }, [bookName, logoSettings, profileSettings, backgroundSettings, bookAppearanceSettings, menuBarSettings, otherSetupSettings, leadFormSettings, visibilitySettings, setHasUnsavedChanges]);

  // Initial load should not trigger unsaved changes
  const initialLoadRef = useRef(true);
  useEffect(() => {
    if (initialLoadRef.current) {
      initialLoadRef.current = false;
      // Slight delay to ensure state updates from fetch don't trigger it immediately
      setTimeout(() => { if (setHasUnsavedChanges) setHasUnsavedChanges(false); }, 500);
    }
  }, [folder, v_id, setHasUnsavedChanges]);

  const [isLoading, setIsLoading] = useState(false);

  // Load Flipbook Data
  useEffect(() => {
    if (v_id && folder) {
      console.log('CustomizedEditor: Fetching flipbook with folder:', folder, 'v_id:', v_id);
      const fetchBook = async () => {
        setIsLoading(true);
        try {
          const storedUser = localStorage.getItem('user');
          if (!storedUser) {
            console.log('CustomizedEditor: No user found in localStorage');
            return;
          }
          const user = JSON.parse(storedUser);

          const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
          console.log('CustomizedEditor: Fetching from:', `${backendUrl}/api/flipbook/get`);
          const res = await axios.get(`${backendUrl}/api/flipbook/get`, {
            params: {
              emailId: user.emailId,
              folderName: folder,
              bookName: v_id
            }
          });

          console.log('CustomizedEditor: Received data:', res.data);

          if (res.data) {
            setBookName(res.data.name || 'Name of the Book');
            if (res.data.pages) {
              console.log('CustomizedEditor: Loading', res.data.pages.length, 'pages');
              setPages(res.data.pages.map((p, i) => ({
                id: p.id || i,
                content: p.content || p.html || '',
                name: p.name || `Page ${i + 1}`,
                html: p.html || p.content || ''
              })));
            }
            // Load settings if available
            if (res.data.settings) {
              console.log('CustomizedEditor: Loading settings:', res.data.settings);
              if (res.data.settings.logo) setLogoSettings(res.data.settings.logo);
              if (res.data.settings.profile) setProfileSettings(res.data.settings.profile);
              if (res.data.settings.background) setBackgroundSettings(res.data.settings.background);
              if (res.data.settings.appearance) setBookAppearanceSettings(res.data.settings.appearance);
              if (res.data.settings.menubar) setMenuBarSettings(res.data.settings.menubar);
              if (res.data.settings.othersetup) {
                const setup = res.data.settings.othersetup;
                if (setup.sound && !setup.sound.customBgSounds) {
                    setup.sound.customBgSounds = [];
                }
                setOtherSetupSettings(setup);
              }
              if (res.data.settings.leadform) setLeadFormSettings(res.data.settings.leadform);
              if (res.data.settings.visibility) setVisibilitySettings(res.data.settings.visibility);
            }

          }
        } catch (err) {
          console.error("CustomizedEditor: Failed to fetch flipbook", err);
        } finally {
          setIsLoading(false);
        }
      };
      fetchBook();
    } else {
      console.log('CustomizedEditor: No folder or v_id provided. folder:', folder, 'v_id:', v_id);

      // Fallback: Try to load from local storage autosave (for unsaved/session books)
      const autosave = localStorage.getItem('editor_autosave');
      if (autosave) {
        console.log('CustomizedEditor: Loading from autosave fallback');
        try {
          const data = JSON.parse(autosave);
          if (data.pages && Array.isArray(data.pages)) {
            setPages(data.pages.map((p, i) => ({
              id: p.id || i,
              name: p.name || `Page ${i + 1}`,
              html: p.html || p.content || '',
              content: p.html || p.content || ''
            })));
          }
          if (data.pageName) setBookName(data.pageName);
          // Note: Autosave might not have branding/appearance settings, so defaults apply
        } catch (e) {
          console.error("CustomizedEditor: Failed to load autosave", e);
        }
      }
    }
  }, [v_id, folder]);



  const renderDetailContent = () => {
    switch (activeSubView) {
      case 'logo':
      case 'profile':
        return (
          <Branding
            type={activeSubView}
            onBack={() => setActiveSubView(null)}
            logoSettings={logoSettings}
            onUpdateLogo={setLogoSettings}
            profileSettings={profileSettings}
            onUpdateProfile={setProfileSettings}
          />
        );
      case 'background':
      case 'layout':
      case 'bookappearance':
        return (
          <Appearance
            activeSub={activeSubView}
            onBack={() => setActiveSubView(null)}
            backgroundSettings={backgroundSettings}
            onUpdateBackground={setBackgroundSettings}
            bookAppearanceSettings={bookAppearanceSettings}
            onUpdateBookAppearance={setBookAppearanceSettings}
          />
        );
      case 'menubar':
        return (
          <MenuBar
            onBack={() => setActiveSubView(null)}
            settings={menuBarSettings}
            onUpdate={setMenuBarSettings}
          />
        );
      case 'othersetup':
        return (
          <OtherSetup
            onBack={() => setActiveSubView(null)}
            settings={otherSetupSettings}
            onUpdate={setOtherSetupSettings}
            folderName={folder}
            bookName={v_id || bookName}
          />
        );
      case 'leadform':
        return (
          <LeadForm
            onBack={() => setActiveSubView(null)}
            settings={leadFormSettings}
            onUpdate={setLeadFormSettings}
            pages={pages}
          />
        );
      case 'visibility':
        return (
          <Visibility
            onBack={() => setActiveSubView(null)}
            settings={visibilitySettings}
            onUpdate={setVisibilitySettings}
          />
        );
      case 'statistic':
        return <Statistic onBack={() => setActiveSubView(null)} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#DADBE8] overflow-hidden font-sans">
      {/* Navbar handled by parent layout */}


      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-8 shadow-2xl flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-700 font-medium">Loading Flipbook...</p>
          </div>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* Main Sidebar - Always Visible */}
        <div className="w-[16.25vw] h-full flex-shrink-0 bg-white shadow-xl z-20 relative border-r border-gray-100">
          <Sidebar
            bookName={bookName}
            setBookName={setBookName}
            activeSubView={activeSubView}
            setActiveSubView={setActiveSubView}
            pageCount={pages.length}
            visibilitySettings={visibilitySettings}
            onUpdateVisibility={setVisibilitySettings}
            onPreview={() => setShowPreview(true)}
          />
        </div>

        {/* Sub-side Panel (Detail View) - Opens next to Main Sidebar */}
        <div
          className={`h-full bg-white shadow-lg z-10 border-r border-gray-100 transition-all duration-300 ease-in-out flex-shrink-0 ${activeSubView
            ? 'w-[21.25vw] opacity-100 translate-x-0 overflow-visible'
            : 'w-0 opacity-0 -translate-x-full pointer-events-none overflow-hidden'
            }`}
        >
          <div className="w-[21.25vw] h-full flex flex-col overflow-visible">
            {activeSubView && renderDetailContent()}
          </div>
        </div>

        {/* Main Preview Area */}
        <div className="flex-1 min-w-0 flex flex-col relative z-0 overflow-hidden">
          <PreviewArea
            bookName={bookName}
            pages={pages}
            logoSettings={logoSettings}
            profileSettings={profileSettings}
            backgroundSettings={backgroundSettings}
            bookAppearanceSettings={bookAppearanceSettings}
            menuBarSettings={menuBarSettings}
            leadFormSettings={leadFormSettings}
            otherSetupSettings={otherSetupSettings}
            activeSubView={activeSubView}
          />
        </div>
      </div>

      {showPreview && (
        <FlipbookPreview
          pages={pages.map(p => ({ ...p, content: p.content || p.html || '' }))}
          pageName={bookName}
          onClose={() => setShowPreview(false)}
          isMobile={false}
          isDoublePage={false}
          settings={{
            logo: logoSettings,
            profile: profileSettings,
            background: backgroundSettings,
            appearance: bookAppearanceSettings,
            menubar: menuBarSettings,
            othersetup: otherSetupSettings,
            leadform: leadFormSettings,
            visibility: visibilitySettings
          }}
          targetPage={0}
        />
      )}
    </div>
  );
};

export default CustomizedEditor;
