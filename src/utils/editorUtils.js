// Utility functions for the template editor

// Reset properties to default values
export const resetProperties = (setProperties) => {
  setProperties({
    fontSize: 16,
    fontFamily: "Arial",
    fontWeight: 400,
    color: "#000000",
    backgroundColor: "#ffffff",
    textAlign: "left",
    lineHeight: 1.5,
    letterSpacing: 0,
    textDecoration: "none",
    textTransform: "none",
    borderRadius: 0,
    borderWidth: 0,
    borderColor: "#000000",
    borderStyle: "solid",
    boxShadow: "none",
    opacity: 1,
    width: 100,
    height: 50,
    x: 0,
    y: 0,
    rotation: 0,
    scaleX: 1,
    scaleY: 1,
    skewX: 0,
    skewY: 0,
    zIndex: 0,
    animation: "none",
    animationDuration: 0,
    animationDelay: 0,
    animationIterationCount: 1,
    animationDirection: "normal",
    animationFillMode: "none",
    animationTimingFunction: "ease",
    interaction: "none",
    link: "",
    tooltip: "",
    altText: "",
    src: "",
    videoSrc: "",
    autoplay: false,
    loop: false,
    muted: true,
    controls: true,
    poster: "",
  });
};

// Update properties from an object
export const updatePropertiesFromObject = (setProperties, obj) => {
  setProperties((prev) => ({ ...prev, ...obj }));
};

// Update a single property
export const updateProperty = (setProperties, key, value) => {
  setProperties((prev) => ({ ...prev, [key]: value }));
};

// History management functions
export const saveToHistory = (history, setHistory, currentState) => {
  setHistory([...history, currentState]);
};

export const undo = (history, setHistory, setCurrentState) => {
  if (history.length > 0) {
    const previousState = history[history.length - 1];
    setHistory(history.slice(0, -1));
    setCurrentState(previousState);
  }
};

export const redo = (redoStack, setRedoStack, setCurrentState) => {
  if (redoStack.length > 0) {
    const nextState = redoStack[redoStack.length - 1];
    setRedoStack(redoStack.slice(0, -1));
    setCurrentState(nextState);
  }
};

/**
 * Extracts clean HTML from a DOM element or document, 
 * stripping all editor-specific attributes, styles, and UI elements.
 */
export const getCleanHTML = (docOrEl) => {
  if (!docOrEl) return '';
  
  let root;
  if (typeof docOrEl === 'string') {
      const parser = new DOMParser();
      const doc = parser.parseFromString(docOrEl, 'text/html');
      root = doc.documentElement;
  } else {
      root = docOrEl.documentElement || docOrEl;
  }
  
  // Clone to avoid side effects on the live view
  const clone = root.cloneNode(true);
  
  // 1. Remove Editor-Specific Attributes & Selection Outlines from ALL elements
  clone.querySelectorAll('*').forEach(el => {
    el.removeAttribute('data-editable');
    el.removeAttribute('contenteditable');
    el.removeAttribute('data-selection-active');
    el.removeAttribute('data-selected');
    
    // Clean up inline styles that might have been added for selection/hover
    // Support both HEX and RGB formats for indigo outline
    const outline = el.style.outline || '';
    if (outline === 'none' || outline.includes('#6366f1') || outline.includes('rgb(99, 102, 241)')) {
      el.style.outline = '';
      el.style.outlineOffset = '';
    }
    const cursor = el.style.cursor || '';
    if (cursor === 'text' || cursor === 'pointer' || cursor === 'move') {
      el.style.cursor = '';
    }
    const bgColor = el.style.backgroundColor || '';
    if (bgColor.includes('rgba(99, 102, 241')) {
       el.style.backgroundColor = '';
    }
  });

  // 3. Remove Injected Editor-Only Style Blocks
  clone.querySelectorAll('style').forEach(tag => {
      const text = tag.textContent;
      if (text.includes('data-editable') || text.includes('resize-handle') || text.includes('fisto-editor-styles')) {
          tag.remove();
      }
  });

  // 4. Remove Interaction Frame Editor UI (Handles/Labels)
  clone.querySelectorAll('.resize-handle, .fisto-editor-selection-label').forEach(h => h.remove());
  clone.querySelectorAll('[data-interaction-type="frame"]').forEach(f => {
      f.removeAttribute('data-selected');
      f.style.cursor = '';
      // We KEEEP data-interaction-* as these are used for the actual published interaction logic
  });

  // 5. Remove Slideshow Internal Controls (re-injected by runner anyway)
  clone.querySelectorAll('.slideshow-overlay-controls').forEach(c => c.remove());

  // Return the outerHTML of the root (usually <html>)
  return clone.outerHTML || clone.innerHTML || '';
};