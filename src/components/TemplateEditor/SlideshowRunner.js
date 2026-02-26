export const initSlideshowRunner = function(doc) {
  // Re-initialization is allowed as doc.write wipes the body but doc object might persist
  doc.__slideshowRunnerInitialized = true;

  const activeSlideshows = new Map();

  function applyTransition(el, nextSrc, effect, baseOpacity = '1') {
    const parent = el.parentElement;
    if (!parent || el.src === nextSrc) return;

    // Connect Animations: Cancel any entrance animations that might lock opacity/transform
    if (el.getAnimations) {
        el.getAnimations().forEach(anim => anim.cancel());
    }

    // Helper to finish transition
    const finish = () => {
      el.src = nextSrc;
      el.style.setProperty('transition', '', 'important');
      el.style.setProperty('transform', '', 'important');
      el.style.setProperty('opacity', baseOpacity, 'important');
      el.style.setProperty('filter', '', 'important');
    };

    if (effect === 'Fade') {
      el.style.setProperty('transition', 'opacity 0.4s ease-in-out', 'important');
      el.style.setProperty('opacity', '0.2', 'important');
      setTimeout(() => {
        finish();
        requestAnimationFrame(() => { el.style.setProperty('opacity', baseOpacity, 'important'); });
      }, 400);
    } else if (effect === 'Slide' || effect === 'Push') {
      el.style.setProperty('transition', 'transform 0.4s ease-in, opacity 0.4s ease-in', 'important');
      el.style.setProperty('transform', 'translateX(-30%)', 'important');
      el.style.setProperty('opacity', '0', 'important');
      setTimeout(() => {
        el.src = nextSrc;
        el.style.setProperty('transition', 'none', 'important');
        el.style.setProperty('transform', 'translateX(30%)', 'important');
        void el.offsetWidth;
        el.style.setProperty('transition', 'transform 0.4s ease-out, opacity 0.4s ease-out', 'important');
        el.style.setProperty('transform', 'translateX(0)', 'important');
        el.style.setProperty('opacity', baseOpacity, 'important');
        setTimeout(() => {
          el.style.setProperty('transition', '', 'important');
          el.style.setProperty('transform', '', 'important');
        }, 400);
      }, 400);
    } else if (effect === 'Flip') {
      el.style.setProperty('transition', 'transform 0.5s ease-in-out', 'important');
      el.style.setProperty('transform', 'rotateY(90deg)', 'important');
      setTimeout(() => {
        el.src = nextSrc;
        el.style.setProperty('transition', 'none', 'important');
        el.style.setProperty('transform', 'rotateY(-90deg)', 'important');
        void el.offsetWidth;
        el.style.setProperty('transition', 'transform 0.5s ease-in-out', 'important');
        el.style.setProperty('transform', 'rotateY(0deg)', 'important');
        setTimeout(() => {
          el.style.setProperty('transition', '', 'important');
          el.style.setProperty('transform', '', 'important');
        }, 500);
      }, 500);
    } else if (effect === 'Reveal' || effect === 'Zoom') {
      el.style.setProperty('transition', 'transform 0.4s ease-in, opacity 0.4s ease', 'important');
      el.style.setProperty('transform', 'scale(0.8)', 'important');
      el.style.setProperty('opacity', '0.5', 'important');
      setTimeout(() => {
        el.src = nextSrc;
        el.style.setProperty('transition', 'transform 0.4s ease-out, opacity 0.4s ease', 'important');
        el.style.setProperty('transform', 'scale(1)', 'important');
        el.style.setProperty('opacity', baseOpacity, 'important');
        setTimeout(() => {
          el.style.setProperty('transition', '', 'important');
          el.style.setProperty('transform', '', 'important');
        }, 400);
      }, 400);
    } else {
      finish();
    }
  }

  function injectControls(el) {
    const parent = el.parentElement;
    if (!parent) return;

    if (window.getComputedStyle(parent).position === 'static') {
      parent.style.position = 'relative';
    }

    let overlay = parent.querySelector('.slideshow-overlay-controls');
    if (!overlay) {
      overlay = doc.createElement('div');
      overlay.className = 'slideshow-overlay-controls';
      overlay.style.cssText = `position: absolute; inset: 0; z-index: 10; pointer-events: none; display: flex; flex-direction: column; justify-content: space-between;`;
      parent.appendChild(overlay);
    }
    
    // We update content in syncControls
  }

  function syncControls(el) {
    const parent = el.parentElement;
    if (!parent) return;
    const overlay = parent.querySelector('.slideshow-overlay-controls');
    if (!overlay) return;

    const data = JSON.parse(el.dataset.slideshow || '{}');
    const settings = data.settings || {};
    const images = data.images || [];
    const currentIndex = parseInt(el.dataset.activeIndex) || 0;

    overlay.innerHTML = '';

    if (settings.showArrows && images.length > 1) {
      const createArrow = (direction) => {
        const isLeft = direction === 'left';
        const canGoBack = settings.infiniteLoop || currentIndex > 0;
        const canGoNext = settings.infiniteLoop || currentIndex < images.length - 1;
        if (isLeft && !canGoBack) return null;
        if (!isLeft && !canGoNext) return null;

        const btn = doc.createElement('div');
        btn.style.cssText = `position: absolute; top: 50%; ${isLeft ? 'left: 0.5vw;' : 'right: 0.5vw;'} transform: translateY(-50%); width: 2.8vw; height: 2.8vw; background: rgba(255, 255, 255, 0.8); border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; pointer-events: auto; box-shadow: 0 0.1vw 0.25vw rgba(0,0,0,0.2); transition: background 0.2s; z-index: 20;`;
        btn.innerHTML = isLeft ? `<svg width="1.6vw" height="1.6vw" viewBox="0 0 24 24" fill="none" stroke="#1f2937" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>` : `<svg width="1.6vw" height="1.6vw" viewBox="0 0 24 24" fill="none" stroke="#1f2937" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg>`;
        btn.onclick = (e) => {
          e.stopPropagation(); e.preventDefault();
          const nextIndex = isLeft ? (currentIndex === 0 ? images.length - 1 : currentIndex - 1) : (currentIndex === images.length - 1 ? 0 : currentIndex + 1);
          el.setAttribute('data-active-index', nextIndex);
        };
        return btn;
      };
      const left = createArrow('left'); if (left) overlay.appendChild(left);
      const right = createArrow('right'); if (right) overlay.appendChild(right);
    }

    if (settings.showDots && images.length > 1) {
      const dotsContainer = doc.createElement('div');
      dotsContainer.style.cssText = `position: absolute; bottom: 0.8vw; left: 50%; transform: translateX(-50%); display: flex; gap: 0.5vw; pointer-events: auto; padding: 0.35vw 0.6vw; background: rgba(0,0,0,0.1); border-radius: 1vw; backdrop-filter: blur(0.15vw);`;
      images.forEach((_, idx) => {
        const dot = doc.createElement('div');
        const isActive = idx === currentIndex;
        dot.style.cssText = `width: 1.1vw; height: 1.1vw; border-radius: 50%; cursor: pointer; transition: all 0.2s; background-color: ${isActive ? (settings.dotColor || '#000000') : 'rgba(255,255,255,0.5)'}; opacity: ${isActive ? 1 : ((settings.dotOpacity || 100) / 100)}; transform: ${isActive ? 'scale(1.2)' : 'scale(1)'}; box-shadow: 0 0.05vw 0.1vw rgba(0,0,0,0.1);`;
        dot.onclick = (e) => { e.stopPropagation(); e.preventDefault(); el.setAttribute('data-active-index', idx); };
        dotsContainer.appendChild(dot);
      });
      overlay.appendChild(dotsContainer);
    }

    if (!settings.autoPlay && settings.dragToSlide && images.length > 1) {
      const dragLayer = doc.createElement('div');
      dragLayer.style.cssText = `position: absolute; inset: 0; z-index: 5; cursor: grab; pointer-events: auto;`;
      dragLayer.onmousedown = (e) => {
        e.stopPropagation();
        const startX = e.clientX;
        let isDragging = false;
        const move = (mv) => { if (Math.abs(mv.clientX - startX) > 10) isDragging = true; };
        const up = (upE) => {
          if (isDragging) {
            const diff = upE.clientX - startX;
            if (Math.abs(diff) > 50) {
                const nextIndex = diff > 0 
                  ? (currentIndex === 0 ? (settings.infiniteLoop ? images.length - 1 : 0) : currentIndex - 1)
                  : (currentIndex === images.length - 1 ? (settings.infiniteLoop ? 0 : currentIndex) : currentIndex + 1);
                el.setAttribute('data-active-index', nextIndex);
            }
          }
          doc.removeEventListener('mousemove', move); doc.removeEventListener('mouseup', up);
        };
        doc.addEventListener('mousemove', move); doc.addEventListener('mouseup', up);
      };
      overlay.insertBefore(dragLayer, overlay.firstChild);
    }
  }

  function setupSlideshow(el) {
    if (activeSlideshows.has(el)) return;

    let interval = null;
    
    function startAutoPlay() {
      if (interval) clearInterval(interval);
      const data = JSON.parse(el.dataset.slideshow || '{}');
      const settings = data.settings || {};
      const images = data.images || [];
      
      if (settings.autoPlay && images.length > 1) {
        interval = setInterval(() => {
          const currentIndex = parseInt(el.dataset.activeIndex) || 0;
          let nextIndex = currentIndex + 1;
          if (nextIndex >= images.length) {
            nextIndex = settings.infiniteLoop ? 0 : currentIndex;
          }
          if (nextIndex !== currentIndex) {
            el.setAttribute('data-active-index', nextIndex);
          }
        }, (settings.speed || 3) * 1000);
      }
    }

    function refresh() {
      const data = JSON.parse(el.dataset.slideshow || '{}');
      const settings = data.settings || {};
      el.style.objectFit = settings.imageFitType === 'Fill All' ? 'cover' : 'contain';
      startAutoPlay();
      injectControls(el);
      syncControls(el);
    }

    // Initial run
    if (!el.dataset.activeIndex) el.dataset.activeIndex = "0";
    refresh();

    const state = {
      interval,
      refresh,
      cleanup: () => {
        if (interval) clearInterval(interval);
        const parent = el.parentElement;
        if (parent) {
          const overlay = parent.querySelector('.slideshow-overlay-controls');
          if (overlay) overlay.remove();
        }
      }
    };

    activeSlideshows.set(el, state);
  }

  const observer = new MutationObserver((mutations) => {
    mutations.forEach(m => {
      const el = m.target;
      if (m.type === 'attributes') {
        if (m.attributeName === 'data-slideshow' || m.attributeName === 'data-is-slideshow') {
          if (el.dataset.isSlideshow === 'true') {
            const instance = activeSlideshows.get(el);
            if (instance) instance.refresh();
            else setupSlideshow(el);
          } else {
            const instance = activeSlideshows.get(el);
            if (instance) {
              instance.cleanup();
              activeSlideshows.delete(el);
            }
          }
        }
        if (m.attributeName === 'data-active-index') {
            const nextIndex = parseInt(el.dataset.activeIndex) || 0;
            const data = JSON.parse(el.dataset.slideshow || '{}');
            const images = data.images || [];
            const settings = data.settings || {};
            if (images[nextIndex]) {
               applyTransition(el, images[nextIndex].url, settings.transitionEffect, el.style.opacity);
               syncControls(el);
            }
        }
      }
      
      if (m.type === 'childList') {
          m.addedNodes.forEach(node => {
              if (node.nodeType === 1) {
                  if (node.dataset?.isSlideshow === 'true') setupSlideshow(node);
                  node.querySelectorAll?.('[data-is-slideshow="true"]').forEach(setupSlideshow);
              }
          });
          m.removedNodes.forEach(node => {
              if (node.nodeType === 1) {
                  const instance = activeSlideshows.get(node);
                  if (instance) {
                      instance.cleanup();
                      activeSlideshows.delete(node);
                  }
                  node.querySelectorAll?.('[data-is-slideshow="true"]').forEach(n => {
                      const inst = activeSlideshows.get(n);
                      if (inst) {
                         inst.cleanup();
                         activeSlideshows.delete(n);
                      }
                  });
              }
          });
      }
    });
  });

  observer.observe(doc.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['data-slideshow', 'data-is-slideshow', 'data-active-index']
  });

  doc.querySelectorAll('[data-is-slideshow="true"]').forEach(setupSlideshow);
};
