import React, { useRef, useState, useCallback, useEffect, useMemo } from 'react';
import { Icon } from '@iconify/react';
import HTMLFlipBook from 'react-pageflip';
import backgroundComponents from './Backgrounds'; // Import the background components
import animationComponents from './Animations';
import * as BookAppearanceHelpers from './bookAppearanceHelpers';
import BottomToolbar from './BottomToolbar';
import ThumbnailsBar from './ThumbnailsBar';
import AddBookmarkPopup from './AddBookmarkPopup';
import AddNotesPopup from './AddNotesPopup';
import NotesViewerPopup from './NotesViewerPopup';
import ViewBookmarkPopup from './ViewBookmarkPopup';
import TableOfContentsPopup from './TableOfContentsPopup';
import FlipbookSharePopup from './FlipbookSharePopup';
import ProfilePopup from './ProfilePopup';
import Export from './Export';
import GalleryPopup from './GalleryPopup';


const getSlideshowScript = () => `
  <script>
    (function() {
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
          overlay = document.createElement('div');
          overlay.className = 'slideshow-overlay-controls';
          overlay.style.cssText = 'position: absolute; inset: 0; z-index: 10; pointer-events: none; display: flex; flex-direction: column; justify-content: space-between;';
          parent.appendChild(overlay);
        }
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

        // Arrows (Manual Mode or Optional in Auto)
        if (settings.showArrows && images.length > 1) {
          const createArrow = (direction) => {
            const isLeft = direction === 'left';
            const canGoBack = settings.infiniteLoop || currentIndex > 0;
            const canGoNext = settings.infiniteLoop || currentIndex < images.length - 1;
            if (isLeft && !canGoBack) return null;
            if (!isLeft && !canGoNext) return null;

            const btn = document.createElement('div');
            btn.style.cssText = 'position: absolute; top: 50%; ' + (isLeft ? 'left: 0.5vw;' : 'right: 0.5vw;') + ' transform: translateY(-50%); width: 2.8vw; height: 2.8vw; background: rgba(255, 255, 255, 0.8); border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; pointer-events: auto; box-shadow: 0 0.1vw 0.25vw rgba(0,0,0,0.2); transition: background 0.2s; z-index: 20;';
            btn.innerHTML = isLeft ? '<svg width="1.6vw" height="1.6vw" viewBox="0 0 24 24" fill="none" stroke="#1f2937" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>' : '<svg width="1.6vw" height="1.6vw" viewBox="0 0 24 24" fill="none" stroke="#1f2937" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg>';
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

        // Dots
        if (settings.showDots && images.length > 1) {
          const dotsContainer = document.createElement('div');
          dotsContainer.style.cssText = 'position: absolute; bottom: 0.8vw; left: 50%; transform: translateX(-50%); display: flex; gap: 0.5vw; pointer-events: auto; padding: 0.35vw 0.6vw; background: rgba(0,0,0,0.1); border-radius: 1vw; backdrop-filter: blur(0.15vw);';
          images.forEach((_, idx) => {
            const dot = document.createElement('div');
            const isActive = idx === currentIndex;
            dot.style.cssText = 'width: 1.1vw; height: 1.1vw; border-radius: 50%; cursor: pointer; transition: all 0.2s; background-color: ' + (isActive ? (settings.dotColor || '#000000') : 'rgba(255,255,255,0.5)') + '; opacity: ' + (isActive ? 1 : ((settings.dotOpacity || 100) / 100)) + '; transform: ' + (isActive ? 'scale(1.2)' : 'scale(1)') + '; box-shadow: 0 0.05vw 0.1vw rgba(0,0,0,0.1);';
            dot.onclick = (e) => { e.stopPropagation(); e.preventDefault(); el.setAttribute('data-active-index', idx); };
            dotsContainer.appendChild(dot);
          });
          overlay.appendChild(dotsContainer);
        }

        // Drag to Slide (Manual Mode only?)
        if (!settings.autoPlay && settings.dragToSlide && images.length > 1) {
          const dragLayer = document.createElement('div');
          dragLayer.style.cssText = 'position: absolute; inset: 0; z-index: 5; cursor: grab; pointer-events: auto;';
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
              document.removeEventListener('mousemove', move); document.removeEventListener('mouseup', up);
            };
            document.addEventListener('mousemove', move); document.addEventListener('mouseup', up);
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

        activeSlideshows.set(el, {
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
        });
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
        });
      });

      let isInitialized = false;
      const initSlideshows = () => {
         if (isInitialized || !document.body) return;
         isInitialized = true;
         observer.observe(document.body, {
           subtree: true,
           attributes: true,
           attributeFilter: ['data-slideshow', 'data-is-slideshow', 'data-active-index']
         });
         document.querySelectorAll('[data-slideshow]').forEach(el => {
            if (el.dataset.isSlideshow === 'true') setupSlideshow(el);
         });
      };
      
      if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initSlideshows);
      else initSlideshows();
    })();
  </script>
`;

const getAnimationScript = (pageNumber) => `
  <script>
    (function() {
      const pageNumber = ${pageNumber};
      const WAAPI_ANIMATIONS = {
        'none': [],
        'fade-in': [{ opacity: 0 }, { opacity: 1 }],
        'fade-out': [{ opacity: 1 }, { opacity: 0 }],
        'blur-in': [{ filter: 'blur(20px)', opacity: 0 }, { filter: 'blur(0)', opacity: 1 }],
        'focus-in': [{ filter: 'blur(12px)', opacity: 0, transform: 'scale(1.2)' }, { filter: 'blur(0)', opacity: 1, transform: 'scale(1)' }],
        'glass-reveal': [{ opacity: 0, backdropFilter: 'blur(20px)', webkitBackdropFilter: 'blur(20px)' }, { opacity: 1, backdropFilter: 'blur(0px)', webkitBackdropFilter: 'blur(0px)' }],
        'perspective-in': [{ transform: 'perspective(400px) rotateX(-60deg) translateZ(-500px)', opacity: 0 }, { transform: 'perspective(400px) rotateX(0deg) translateZ(0)', opacity: 1 }],
        'slide-up': [{ transform: 'translateY(100px)', opacity: 0 }, { transform: 'translateY(0)', opacity: 1 }],
        'slide-down': [{ transform: 'translateY(-100px)', opacity: 0 }, { transform: 'translateY(0)', opacity: 1 }],
        'slide-left': [{ transform: 'translateX(100px)', opacity: 0 }, { transform: 'translateX(0)', opacity: 1 }],
        'slide-right': [{ transform: 'translateX(-100px)', opacity: 0 }, { transform: 'translateX(0)', opacity: 1 }],
        'back-in-up': [{ transform: 'translateY(500px) scale(0.7)', opacity: 0 }, { transform: 'translateY(0) scale(0.7)', opacity: 0.7, offset: 0.8 }, { transform: 'translateY(0) scale(1)', opacity: 1 }],
        'back-in-down': [{ transform: 'translateY(-500px) scale(0.7)', opacity: 0 }, { transform: 'translateY(0) scale(0.7)', opacity: 0.7, offset: 0.8 }, { transform: 'translateY(0) scale(1)', opacity: 1 }],
        'back-in-left': [{ transform: 'translateX(-500px) scale(0.7)', opacity: 0 }, { transform: 'translateX(0) scale(0.7)', opacity: 0.7, offset: 0.8 }, { transform: 'translateX(0) scale(1)', opacity: 1 }],
        'back-in-right': [{ transform: 'translateX(500px) scale(0.7)', opacity: 0 }, { transform: 'translateX(0) scale(0.7)', opacity: 0.7, offset: 0.8 }, { transform: 'translateX(0) scale(1)', opacity: 1 }],
        'zoom-in': [{ transform: 'scale(0)', opacity: 0 }, { transform: 'scale(1)', opacity: 1 }],
        'zoom-out': [{ transform: 'scale(1)', opacity: 1 }, { transform: 'scale(0)', opacity: 0 }],
        'zoom-in-up': [{ transform: 'scale(0.1) translateY(100px)', opacity: 0 }, { transform: 'scale(1) translateY(0)', opacity: 1 }],
        'zoom-in-down': [{ transform: 'scale(0.1) translateY(-100px)', opacity: 0 }, { transform: 'scale(1) translateY(0)', opacity: 1 }],
        'rotate-in': [{ transform: 'rotate(-200deg) scale(0)', opacity: 0 }, { transform: 'rotate(0) scale(1)', opacity: 1 }],
        'rotate-in-down-left': [{ transform: 'rotate(-45deg)', transformOrigin: 'left bottom', opacity: 0 }, { transform: 'rotate(0)', transformOrigin: 'left bottom', opacity: 1 }],
        'rotate-in-up-right': [{ transform: 'rotate(-90deg)', transformOrigin: 'right bottom', opacity: 0 }, { transform: 'rotate(0)', transformOrigin: 'right bottom', opacity: 1 }],
        'bounce-in': [{ transform: 'scale(0.3)', opacity: 0 }, { transform: 'scale(1.1)', opacity: 0.8, offset: 0.5 }, { transform: 'scale(0.9)', opacity: 1, offset: 0.7 }, { transform: 'scale(1)', opacity: 1 }],
        'bounce-out': [{ transform: 'scale(1)', opacity: 1 }, { transform: 'scale(1.1)', opacity: 0.8, offset: 0.2 }, { transform: 'scale(0.3)', opacity: 0, offset: 1 }],
        'flip-in': [{ transform: 'perspective(400px) rotateX(90deg)', opacity: 0 }, { transform: 'perspective(400px) rotateX(0deg)', opacity: 1 }],
        'flip-in-y': [{ transform: 'perspective(400px) rotateY(90deg)', opacity: 0 }, { transform: 'perspective(400px) rotateY(0deg)', opacity: 1 }],
        'roll-in': [{ transform: 'translateX(-100px) rotate(-120deg)', opacity: 0 }, { transform: 'translateX(0) rotate(0)', opacity: 1 }],
        'pulse': [{ transform: 'scale(1)' }, { transform: 'scale(1.1)', offset: 0.5 }, { transform: 'scale(1)' }],
        'heartbeat': [{ transform: 'scale(1)' }, { transform: 'scale(1.3)', offset: 0.14 }, { transform: 'scale(1)', offset: 0.28 }, { transform: 'scale(1.3)', offset: 0.42 }, { transform: 'scale(1)', offset: 0.7 }],
        'float': [{ transform: 'translateY(0)' }, { transform: 'translateY(-15px)', offset: 0.5 }, { transform: 'translateY(0)' }],
        'neon-glow': [{ filter: 'brightness(1) drop-shadow(0 0 0px rgba(79, 70, 229, 0))' }, { filter: 'brightness(1.5) drop-shadow(0 0 10px rgba(79, 70, 229, 0.8))', offset: 0.5 }, { filter: 'brightness(1) drop-shadow(0 0 0px rgba(79, 70, 229, 0))' }],
        'tada': [{ transform: 'scale(1) rotate(0)' }, { transform: 'scale(0.9) rotate(-3deg)', offset: 0.1 }, { transform: 'scale(0.9) rotate(-3deg)', offset: 0.2 }, { transform: 'scale(1.1) rotate(3deg)', offset: 0.3 }, { transform: 'scale(1.1) rotate(-3deg)', offset: 0.4 }, { transform: 'scale(1.1) rotate(3deg)', offset: 0.5 }, { transform: 'scale(1.1) rotate(-3deg)', offset: 0.6 }, { transform: 'scale(1.1) rotate(3deg)', offset: 0.7 }, { transform: 'scale(1.1) rotate(-3deg)', offset: 0.8 }, { transform: 'scale(1.1) rotate(3deg)', offset: 0.9 }, { transform: 'scale(1) rotate(0)' }],
        'rubber-band': [{ transform: 'scale(1, 1)' }, { transform: 'scale(1.25, 0.75)', offset: 0.3 }, { transform: 'scale(0.75, 1.25)', offset: 0.4 }, { transform: 'scale(1.15, 0.85)', offset: 0.5 }, { transform: 'scale(0.95, 1.05)', offset: 0.65 }, { transform: 'scale(1.05, 0.95)', offset: 0.75 }, { transform: 'scale(1, 1)' }],
        'jello': [{ transform: 'skew(0,0)' }, { transform: 'skew(-12.5deg, -12.5deg)', offset: 0.22 }, { transform: 'skew(6.25deg, 6.25deg)', offset: 0.33 }, { transform: 'skew(-3.125deg, -3.125deg)', offset: 0.44 }, { transform: 'skew(1.5625deg, 1.5625deg)', offset: 0.55 }, { transform: 'skew(-0.78deg, -0.78deg)', offset: 0.66 }, { transform: 'skew(0.39deg, 0.39deg)', offset: 0.77 }, { transform: 'skew(-0.2deg, -0.2deg)', offset: 0.88 }, { transform: 'skew(0,0)' }],
        'swing': [{ transform: 'rotate(0deg)' }, { transform: 'rotate(15deg)', offset: 0.2 }, { transform: 'rotate(-10deg)', offset: 0.4 }, { transform: 'rotate(5deg)', offset: 0.6 }, { transform: 'rotate(-5deg)', offset: 0.8 }, { transform: 'rotate(0deg)' }],
        'wobble': [{ transform: 'translateX(0%) rotate(0deg)' }, { transform: 'translateX(-25%) rotate(-5deg)', offset: 0.15 }, { transform: 'translateX(20%) rotate(3deg)', offset: 0.3 }, { transform: 'translateX(-15%) rotate(-3deg)', offset: 0.45 }, { transform: 'translateX(10%) rotate(2deg)', offset: 0.6 }, { transform: 'translateX(-5%) rotate(-1deg)', offset: 0.75 }, { transform: 'translateX(0%) rotate(0deg)' }],
        'glitch': [{ transform: 'translate(0)' }, { transform: 'translate(-2px, 2px)', offset: 0.2 }, { transform: 'translate(2px, -2px)', offset: 0.4 }, { transform: 'translate(-2px, 2px)', offset: 0.6 }, { transform: 'translate(2px, -2px)', offset: 0.8 }, { transform: 'translate(0)' }],
      };

      const LOOP_ANIMATIONS = ['pulse', 'tada', 'rubber-band', 'jello', 'heartbeat', 'glitch', 'neon-glow', 'swing', 'wobble', 'float'];

      const getWaapiEase = (name) => {
        const map = {
          'Linear': 'linear',
          'Smooth': 'ease-in-out',
          'Ease In': 'ease-in',
          'Ease Out': 'ease-out',
          'Ease In & Out': 'ease-in-out',
          'Bounce': 'cubic-bezier(0.175, 0.885, 0.32, 1.275)'
        };
        return map[name] || 'linear';
      };

      const runAnim = (el, type, settings) => {
        if (!type || !WAAPI_ANIMATIONS[type] || type === 'none') {
            if (el.__currentAnimation) {
                el.__currentAnimation.cancel();
                el.__currentAnimation = null;
            }
            return;
        }
        if (el.__currentAnimation) el.__currentAnimation.cancel();

        const duration = ((parseFloat(settings.duration) || 1) / (parseFloat(settings.speed) || 1)) * 1000;
        const delay = (parseFloat(settings.delay) || 0) * 1000;
        const easing = getWaapiEase(settings.easing || 'Linear');
        const isLoop = LOOP_ANIMATIONS.includes(type);

        try {
          const anim = el.animate(WAAPI_ANIMATIONS[type], {
            duration,
            delay,
            easing,
            fill: isLoop ? 'none' : 'forwards',
            iterations: isLoop ? Infinity : 1
          });
          el.__currentAnimation = anim;
        } catch (e) {
          console.error("Animation error", e);
        }
      };

      const handleTrigger = () => {
        document.querySelectorAll('[data-animation-trigger]').forEach(el => {
            const trigger = el.getAttribute('data-animation-trigger');
            
            // 1. While Opening
            if (trigger === 'While Opening') {
                const type = el.getAttribute('data-animation-open-type');
                if (type && type !== 'none') {
                    const everyVisit = el.getAttribute('data-animation-open-every-visit') !== 'false';
                    const settingsStr = JSON.stringify({
                       type,
                       duration: el.getAttribute('data-animation-open-duration'),
                       speed: el.getAttribute('data-animation-open-speed'),
                       delay: el.getAttribute('data-animation-open-delay'),
                       easing: el.getAttribute('data-animation-open-easing')
                    });

                    const hasChanged = el.__lastOpenSettings !== settingsStr;
                    if (!everyVisit && el.__animOpened && !hasChanged) return;
                    
                    runAnim(el, type, {
                      duration: el.getAttribute('data-animation-open-duration'),
                      speed: el.getAttribute('data-animation-open-speed'),
                      delay: el.getAttribute('data-animation-open-delay'),
                      easing: el.getAttribute('data-animation-open-easing')
                    });
                    
                    el.__animOpened = true;
                    el.__lastOpenSettings = settingsStr;
                } else {
                    runAnim(el, 'none');
                }
            }
            
            // 2. On Page - Always
            else if (trigger === 'On Page' && el.getAttribute('data-animation-action') === 'Always') {
                const type = el.getAttribute('data-animation-interact-type');
                if (type && type !== 'none') {
                    const settingsStr = JSON.stringify({
                      type,
                      duration: el.getAttribute('data-animation-interact-duration'),
                      speed: el.getAttribute('data-animation-interact-speed'),
                      delay: el.getAttribute('data-animation-interact-delay'),
                      easing: el.getAttribute('data-animation-interact-easing')
                    });

                    if (el.__lastAlwaysSettings === settingsStr) return;

                    runAnim(el, type, {
                      duration: el.getAttribute('data-animation-interact-duration'),
                      speed: el.getAttribute('data-animation-interact-speed'),
                      delay: el.getAttribute('data-animation-interact-delay'),
                      easing: el.getAttribute('data-animation-interact-easing')
                    });
                    el.__lastAlwaysSettings = settingsStr;
                } else {
                    runAnim(el, 'none');
                    el.__lastAlwaysSettings = null;
                }
            }

            // 3. On Page - Click/Hover
            else if (trigger === 'On Page') {
                const action = el.getAttribute('data-animation-action');
                if (action === 'Click') {
                    if (!el.__clickBound) {
                        el.__clickBound = true;
                        el.style.cursor = 'pointer';
                        el.addEventListener('click', (e) => {
                            if (el.getAttribute('data-animation-trigger') !== 'On Page' || el.getAttribute('data-animation-action') !== 'Click') return;
                            e.stopPropagation();
                            const type = el.getAttribute('data-animation-interact-type');
                            runAnim(el, type, {
                                duration: el.getAttribute('data-animation-interact-duration'),
                                speed: el.getAttribute('data-animation-interact-speed'),
                                delay: el.getAttribute('data-animation-interact-delay'),
                                easing: el.getAttribute('data-animation-interact-easing')
                            });
                        });
                    }
                } else if (action === 'Hover') {
                    if (!el.__hoverBound) {
                        el.__hoverBound = true;
                        el.addEventListener('mouseenter', () => {
                            if (el.getAttribute('data-animation-trigger') !== 'On Page' || el.getAttribute('data-animation-action') !== 'Hover') return;
                            const type = el.getAttribute('data-animation-interact-type');
                            runAnim(el, type, {
                                duration: el.getAttribute('data-animation-interact-duration'),
                                speed: el.getAttribute('data-animation-interact-speed'),
                                delay: el.getAttribute('data-animation-interact-delay'),
                                easing: el.getAttribute('data-animation-interact-easing')
                            });
                        });
                    }
                }
                if (el.__lastAlwaysSettings) {
                    runAnim(el, 'none');
                    el.__lastAlwaysSettings = null;
                }
            }
            
            else {
                runAnim(el, 'none');
                el.__lastAlwaysSettings = null;
            }
        });
      };

      const observer = new MutationObserver((mutations) => {
        let shouldTrigger = false;
        mutations.forEach(m => {
          if (m.type === 'attributes' && m.attributeName.startsWith('data-animation-')) shouldTrigger = true;
          if (m.type === 'childList' && m.addedNodes.length > 0) shouldTrigger = true;
        });
        if (shouldTrigger) handleTrigger();
      });

      let isInitialized = false;
      const initAnimations = () => {
          if (isInitialized || !document.body) return;
          isInitialized = true;
          // console.log("Animation Script Initializing for Page", pageNumber);
          observer.observe(document.body, { childList: true, subtree: true, attributes: true });
          handleTrigger();
      };

      window.addEventListener('message', (e) => {
          if (e.data && e.data.type === 'RETRIGGER_ANIMATIONS') {
              if (!isInitialized) initAnimations();
              document.querySelectorAll('[data-animation-trigger="While Opening"]').forEach(el => {
                  const everyVisit = el.getAttribute('data-animation-open-every-visit') !== 'false';
                  if (everyVisit) {
                      el.__animOpened = false;
                      el.__lastOpenSettings = null;
                  }
              });
              handleTrigger();
          }
      });

      if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initAnimations);
      else initAnimations();
    })();
  </script>
`;

const getInteractionScript = (pageNumber) => `
  <script>
    (function() {
        const init = () => {
            window._pageNumber = ${pageNumber};
            document.addEventListener('click', (e) => {
               const el = e.target.closest('[data-interaction]');
               if (el) {
                   const type = el.dataset.interaction;
                   const value = el.dataset.interactionValue;
                   if (type === 'link' && value) {
                       window.open(value.startsWith('http') ? value : 'https://' + value, '_blank');
                   } else if (type === 'popup') {
                       // Basic alert for now in customized editor
                       // console.log("Popup clicked", el.dataset.interactionContent);
                   }
               }
            });

            // Double Click / Double Tap reporting for Zoom
            let lastTap = 0;
            const handleDoubleAction = () => {
                window.parent.postMessage({ type: 'DOUBLE_CLICK_ZOOM' }, '*');
            };

            document.addEventListener('dblclick', handleDoubleAction);
            document.addEventListener('touchstart', (e) => {
                const now = Date.now();
                if (now - lastTap < 300) {
                    handleDoubleAction();
                }
                lastTap = now;
            }, { passive: true });
        };
        if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
        else init();
    })();
  </script>
`;

const getIframeContent = (html, pageNumber) => {
    if (!html) return '';
    
    const scripts = `
        <style>
            body { margin: 0; padding: 0; overflow: hidden; background: white; width: 100%; height: 100%; }
            * { box-sizing: border-box; }
            ::-webkit-scrollbar { width: 0px; background: transparent; }
        </style>
        ${getSlideshowScript()}
        ${getAnimationScript(pageNumber)}
        ${getInteractionScript(pageNumber)}
    `;

    // If it's a full HTML document, inject scripts into <head>
    if (html.toLowerCase().includes('<html') || html.toLowerCase().includes('<head')) {
        if (html.toLowerCase().includes('</head>')) {
            return html.replace(/<\/head>/i, `${scripts}</head>`);
        } else if (html.toLowerCase().includes('<body')) {
            return html.replace(/<body/i, `${scripts}<body`);
        }
        return scripts + html;
    }

    // Otherwise, wrap the snippet
    return `
        <!DOCTYPE html>
        <html>
            <head>
                ${scripts}
            </head>
            <body>
                ${html}
            </body>
        </html>
    `;
};

const PageItem = React.memo(({ html, index, cornerRadius }) => {
    return (
        <iframe
            className="w-full h-full border-none overflow-hidden origin-top-left"
            srcDoc={getIframeContent(html, index + 1)}
            title={`Page ${index + 1}`}
            style={{
                transform: 'scale(0.67)',
                width: '149.25%',
                height: '149.25%',
                pointerEvents: 'auto',
                borderRadius: cornerRadius
            }}
        />
    );
});

const FlipPage = React.forwardRef(({ children, style, textureStyle, number, density: propDensity, isPad, ...props }, ref) => {
    const isEven = number % 2 === 0;
    const density = propDensity || props['data-density'] || 'soft';
    const radius = style?.borderRadius || '0px';
    
    // Apply radius only to outer edges, keep spine (inner edge) sharp
    const finalBorderRadius = isEven 
        ? `${radius} 0 0 ${radius}`  // Left page: round left side
        : `0 ${radius} ${radius} 0`; // Right page: round right side

    return (
        <div
            className="fisto-book-page h-full overflow-hidden relative"
            ref={ref}
            style={{
                backgroundColor: 'white',
                boxShadow: isPad ? 'none' : (isEven ? '2px 0 10px rgba(0,0,0,0.1)' : '-2px 0 10px rgba(0,0,0,0.1)'),
                ...style,
                borderRadius: finalBorderRadius
            }}
            data-density={density}
        >
            {!isPad && (
                <div
                    className="absolute inset-0 pointer-events-none z-20"
                    style={{
                        boxShadow: isEven
                            ? 'inset -10px 0 20px -10px rgba(0, 0, 0, 0.15), inset 2px 0 5px rgba(0, 0, 0, 0.05)'
                            : 'inset 10px 0 20px -10px rgba(0, 0, 0, 0.15), inset -2px 0 5px rgba(0, 0, 0, 0.05)',
                        borderRadius: finalBorderRadius
                    }}
                />
            )}

            <div 
              className="fisto-book-content w-full h-full p-0 m-0 relative z-10 transition-all duration-300 overflow-hidden"
              style={{ borderRadius: finalBorderRadius }}
            >
                {children && React.cloneElement(children, { cornerRadius: finalBorderRadius })}
            </div>
            {/* Texture Overlay - Must be on top with multiply blend mode to be visible */}
            {textureStyle && (
                <div
                    className="absolute inset-0 pointer-events-none z-30 opacity-60"
                    style={{
                        ...textureStyle,
                        borderRadius: finalBorderRadius
                    }}
                />
            )}
        </div>
    );
});
const BookRenderer = React.memo(({
    augmentedPages,
    WIDTH,
    HEIGHT,
    flipTime,
    useHardCover,
    targetPage,
    bookRef,
    onFlip,
    cornerRadius,
    pageOpacity,
    textureStyle,
    shadowActive,
    shadowStyle,
    currentPage,
    pagesCount
}) => {
    const shadowOffset = BookAppearanceHelpers.getShadowOffset(currentPage, pagesCount);
    let shadowBorderRadius = cornerRadius;
    if (shadowOffset === '75%') {
        shadowBorderRadius = `0 ${cornerRadius} ${cornerRadius} 0`;
    } else if (shadowOffset === '25%') {
        shadowBorderRadius = `${cornerRadius} 0 0 ${cornerRadius}`;
    }

    return (
        <div className="relative">
            {/* Dynamic Shadow Layer */}
            {shadowActive && (
                <div
                    className="absolute transition-all duration-700 pointer-events-none"
                    style={{
                        width: BookAppearanceHelpers.getShadowWidth(currentPage, pagesCount, WIDTH),
                        height: HEIGHT,
                        left: shadowOffset === '75%' ? '50%' :
                            shadowOffset === '25%' ? '0%' : '0%',
                        transform: 'translateX(0)',
                        boxShadow: shadowStyle,
                        zIndex: 0,
                        borderRadius: shadowBorderRadius
                    }}
                />
            )}

            <HTMLFlipBook
                key={`flipbook-${augmentedPages.length}-${flipTime}-${useHardCover}`}
                width={WIDTH}
                height={HEIGHT}
                size="fixed"
                minWidth={400}
                maxWidth={1200}
                minHeight={400}
                maxHeight={1500}
                usePortrait={false}
                mobileScrollSupport={true}
                startPage={targetPage + 1}
                className="flip-book"
                ref={bookRef}
                style={{ margin: '0 auto', position: 'relative', zIndex: 1 }}
                drawShadow={true}
                flippingTime={flipTime}
                onFlip={onFlip}
                useMouseEvents={true}
                clickEventForward={true}
                showPageCorners={false}
                disableFlipByClick={true}
            >
                {augmentedPages.map((page, index) => {
                    const isFirstSpread = index === 0 || index === 1;
                    const isLastSpread = index === augmentedPages.length - 1 || index === augmentedPages.length - 2;
                    const isHard = (isFirstSpread || isLastSpread) && useHardCover;
                    const density = isHard ? 'hard' : 'soft';

                    if (page.isPad) {
                        return (
                            <FlipPage
                                key={`pad-${index}`}
                                isPad={true}
                                density={density}
                                data-density={density}
                                style={{ backgroundColor: 'transparent', opacity: 0, pointerEvents: 'none', boxShadow: 'none' }}
                            />
                        );
                    }
                    return (
                        <FlipPage
                            key={page.id || index}
                            number={index}
                            style={{
                                borderRadius: cornerRadius,
                                opacity: pageOpacity,
                                backgroundColor: 'white'
                            }}
                            textureStyle={textureStyle}
                            density={density}
                            data-density={density}
                        >
                            <PageItem html={page.html || page.content} index={index - 1} />
                        </FlipPage>
                    );
                })}
            </HTMLFlipBook>
        </div>
    );
});

const PreviewArea = React.memo(({
    pages = [],
    bookName,
    onPageChange,
    targetPage = 0,
    backgroundSettings,
    bookAppearanceSettings,
    logoSettings,
    leadFormSettings,
    profileSettings,
    zoom = 1,
    menuBarSettings,
    otherSetupSettings,
    hideHeader = false,
    activeSubView,
    onClose
}) => {
    const settings = menuBarSettings || {
        navigation: { nextPrevButtons: true, mouseWheel: true, dragToTurn: true, pageQuickAccess: true, tableOfContents: true, pageThumbnails: true, bookmark: true, startEndNav: true },
        viewing: { zoom: true, fullScreen: true },
        interaction: { search: true, notes: true, gallery: true },
        media: { autoFlip: true, backgroundAudio: true },
        shareExport: { share: true, download: true, contact: true },
        brandingProfile: { logo: true, profile: true }
    };

    const otherSetup = otherSetupSettings || {
        toolbar: {
            displayMode: 'icon',
            textProperties: { font: 'Poppins', fill: '#295655', stroke: '#' },
            toolbarColor: { fill: '#3E4491', stroke: '#' },
            iconsColor: { fill: '#ffffff', stroke: '#' },
            processBar: { fill: '#4C51F3', stroke: '#' },
        },

    };

    const bookRef = useRef();
    const containerRef = useRef();
    const isFlippingRef = useRef(false);
    const lastSyncPage = useRef(targetPage);

    // Page dimensions (A4 ratio)
    const WIDTH = 400;
    const HEIGHT = 566;

    // Menu States
    const [showBookmarkMenu, setShowBookmarkMenu] = useState(false);
    const [showMoreMenu, setShowMoreMenu] = useState(false);
    const [isAutoFlipping, setIsAutoFlipping] = useState(false);
    const [currentZoom, setCurrentZoom] = useState(zoom);
    const [currentPage, setCurrentPage] = useState(targetPage);
    const [offset, setOffset] = useState(0);
    const [showLeadForm, setShowLeadForm] = useState(false);
    const [leadFormSubmitted, setLeadFormSubmitted] = useState(() => {
        if (activeSubView === undefined && bookName) {
            return localStorage.getItem(`leadFormSubmitted_${bookName}`) === 'true';
        }
        return false;
    });
    const [showThumbnailBar, setShowThumbnailBar] = useState(false);
    const [showAddBookmarkPopup, setShowAddBookmarkPopup] = useState(false);
    const [showAddNotesPopup, setShowAddNotesPopup] = useState(false);
    const [showNotesViewer, setShowNotesViewer] = useState(false);
    const [showViewBookmarkPopup, setShowViewBookmarkPopup] = useState(false);
    const [notes, setNotes] = useState([]);
    const [bookmarks, setBookmarks] = useState([]);
    const [showTOC, setShowTOC] = useState(false);
    const [showExportPopup, setShowExportPopup] = useState(false);
    const [showSharePopup, setShowSharePopup] = useState(false);
    const [showProfilePopup, setShowProfilePopup] = useState(false);
    const [showGalleryPopup, setShowGalleryPopup] = useState(false);
    const [countdown, setCountdown] = useState(null);

    // Auto Flip Initialization & Sync
    useEffect(() => {
        if (settings.media.autoFlip) {
            setIsAutoFlipping(otherSetup.toolbar?.autoFlipEnabled ?? false);
        }
    }, [otherSetup.toolbar?.autoFlipEnabled, settings.media.autoFlip]);

    // --- Gallery: always read live settings so the popup is always fully synced ---
    const gallerySettings = otherSetupSettings?.gallery || {};
    const galleryImages = gallerySettings.images || [];
    const prevGalleryCountRef = useRef(galleryImages.length);

    // Auto-open carousel when the very first image is uploaded (0 → 1 transition)
    useEffect(() => {
        const prev = prevGalleryCountRef.current;
        const next = galleryImages.length;
        if (prev === 0 && next > 0) {
            setShowGalleryPopup(true);
        }
        prevGalleryCountRef.current = next;
    }, [galleryImages.length]);

    const [searchQuery, setSearchQuery] = useState('');

    const [deviceMode, setDeviceMode] = useState('desktop'); // desktop, tablet, mobile
    const [isDraggerExpanded, setIsDraggerExpanded] = useState(false);
    const [draggerTabTop, setDraggerTabTop] = useState(150);
    const [draggerTabLeft, setDraggerTabLeft] = useState(window.innerWidth - 60);
    const [isDraggerDragging, setIsDraggerDragging] = useState(false);
    const draggerHasMovedRef = useRef(false);
    const draggerOffsetRef = useRef({ x: 0, y: 0 });

    const deviceStyles = {
        desktop: { width: '100%', height: '100%', borderRadius: '0', border: 'none', transition: 'all 0.5s ease' },
        tablet: { width: '100%', height: '100%', maxWidth: '768px', maxHeight: '1024px', aspectRatio: '768/1024', borderRadius: '1.5rem', border: '16px solid #1f2937', transition: 'all 0.5s ease', boxShadow: '0 20px 50px rgba(0,0,0,0.3)' },
        mobile: { width: '100%', height: '100%', maxWidth: '375px', maxHeight: '812px', aspectRatio: '375/812', borderRadius: '2rem', border: '16px solid #1f2937', transition: 'all 0.5s ease', boxShadow: '0 20px 50px rgba(0,0,0,0.3)' },
    };

    const handleDraggerMouseDown = (e) => {
        setIsDraggerDragging(true);
        draggerHasMovedRef.current = false;
        
        // Calculate offset so the dragger doesn't "jump" to cursor top-left
        draggerOffsetRef.current = {
            x: e.clientX - draggerTabLeft,
            y: e.clientY - draggerTabTop
        };
        
        e.preventDefault();
    };

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (!isDraggerDragging) return;
            draggerHasMovedRef.current = true;
            
            const newTop = e.clientY - draggerOffsetRef.current.y;
            const newLeft = e.clientX - draggerOffsetRef.current.x;
            
            // Clamp within viewport
            const paddedWidth = window.innerWidth - 60;
            const paddedHeight = window.innerHeight - (isDraggerExpanded ? 300 : 60);
            
            setDraggerTabTop(Math.max(10, Math.min(newTop, paddedHeight)));
            setDraggerTabLeft(Math.max(10, Math.min(newLeft, paddedWidth)));
        };

        const handleMouseUp = () => {
            if (isDraggerDragging) {
                setIsDraggerDragging(false);
                if (!draggerHasMovedRef.current) {
                    setIsDraggerExpanded(prev => !prev);
                } else {
                    // Snap to sides based on the center of the dragger
                    const midPoint = window.innerWidth / 2;
                    const draggerWidth = (window.innerWidth * 3.2) / 100; // 3.2vw in pixels
                    const draggerCenter = draggerTabLeft + (draggerWidth / 2);
                    
                    if (draggerCenter < midPoint) {
                        setDraggerTabLeft(0);
                    } else {
                        setDraggerTabLeft(window.innerWidth - draggerWidth);
                    }
                }
            }
        };

        const handleResize = () => {
            setDraggerTabLeft(prev => {
                const draggerWidth = (window.innerWidth * 3.2) / 100;
                // If it was stuck to the right, keep it stuck to the right
                if (prev > window.innerWidth / 2) {
                    return window.innerWidth - draggerWidth;
                }
                return 0; // Otherwise keep it on the left
            });
        };

        if (isDraggerDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }
        
        window.addEventListener('resize', handleResize);
        
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
            window.removeEventListener('resize', handleResize);
        };
    }, [isDraggerDragging, isDraggerExpanded, draggerTabLeft]);

    const setIsPlaying = useCallback((val) => {
        setIsAutoFlipping(val);
    }, []);

    const setShowTOCMemo = useCallback((val) => {
        if (val) {
            setShowThumbnailBar(false);
            setShowAddBookmarkPopup(false);
            setShowAddNotesPopup(false);
            setShowNotesViewer(false);
        }
        setShowTOC(val);
    }, []);

    const setShowThumbnailBarMemo = useCallback((val) => {
        if (val) {
            setShowTOC(false);
            setShowAddBookmarkPopup(false);
            setShowAddNotesPopup(false);
            setShowNotesViewer(false);
        }
        setShowThumbnailBar(val);
    }, []);

    const setShowAddBookmarkPopupMemo = useCallback((val) => {
        if (val) {
            setShowTOC(false);
            setShowThumbnailBar(false);
            setShowAddNotesPopup(false);
            setShowNotesViewer(false);
        }
        setShowAddBookmarkPopup(val);
    }, []);

    const setShowAddNotesPopupMemo = useCallback((val) => {
        if (val) {
            setShowTOC(false);
            setShowThumbnailBar(false);
            setShowAddBookmarkPopup(false);
            setShowNotesViewer(false);
        }
        setShowAddNotesPopup(val);
    }, []);

    const setShowNotesViewerMemo = useCallback((val) => {
        if (val) {
            setShowTOC(false);
            setShowThumbnailBar(false);
            setShowAddBookmarkPopup(false);
            setShowAddNotesPopup(false);
        }
        setShowNotesViewer(val);
    }, []);

    const setShowBookmarkMenuMemo = useCallback((val) => setShowBookmarkMenu(val), []);
    const setShowMoreMenuMemo = useCallback((val) => setShowMoreMenu(val), []);

    const onAddNote = useCallback((note) => {
        setNotes(prev => [...prev, note]);
    }, []);

    const onAddBookmark = useCallback((bookmark) => {
        setBookmarks(prev => [...prev, bookmark]);
    }, []);

    const onDeleteBookmark = useCallback((id) => {
        setBookmarks(prev => prev.filter(b => b.id !== id));
    }, []);

    const onUpdateBookmark = useCallback((id, newLabel) => {
        setBookmarks(prev => prev.map(b => b.id === id ? { ...b, label: newLabel } : b));
    }, []);

    const onPageClick = useCallback((index) => {
        bookRef.current?.pageFlip()?.turnToPage(index + 1);
    }, []);

    // Double Click / Double Tap Zoom Logic
    const lastTapRef = useRef(0);
    const toggleZoom = useCallback(() => {
        if (otherSetup.toolbar?.twoClickToZoom ?? true) {
            setCurrentZoom(prev => prev > 1.1 ? 1 : (otherSetup.toolbar?.maximumZoom || 4));
        }
    }, [otherSetup.toolbar?.twoClickToZoom, otherSetup.toolbar?.maximumZoom]);

    useEffect(() => {
        const handleMessage = (e) => {
            if (e.data?.type === 'DOUBLE_CLICK_ZOOM') {
                toggleZoom();
            }
        };
        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [toggleZoom]);

    const handleZoomIn = useCallback(() => setCurrentZoom(prev => Math.min(prev + 0.1, otherSetup.toolbar?.maximumZoom || 4)), [otherSetup.toolbar?.maximumZoom]);
    const handleZoomOut = useCallback(() => setCurrentZoom(prev => Math.max(prev - 0.1, 0.5)), []);
    const handleFullScreen = useCallback(() => {
        if (!containerRef.current) return;
        if (!document.fullscreenElement) {
            containerRef.current.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable full-screen mode: ${err.message}`);
            });
        } else {
            document.exitFullscreen();
        }
    }, []);

    const handleShare = useCallback(() => {
        setShowSharePopup(true);
    }, []);

    const handleDownload = useCallback(() => {
        setShowExportPopup(true);
    }, []);

    const handleQuickSearch = useCallback((query) => {
        if (!query.trim()) return;

        const lowerQuery = query.toLowerCase();
        const foundPageIndex = pages.findIndex(page => {
            const content = (page.html || page.content || '').toLowerCase();
            return content.includes(lowerQuery);
        });

        if (foundPageIndex !== -1) {
            onPageClick(foundPageIndex);
        }
    }, [pages, onPageClick]);

    // Click outside to close menus
    useEffect(() => {
        const handleClickOutside = () => {
            setShowBookmarkMenu(false);
            setShowMoreMenu(false);
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    const logoObjectFit = logoSettings?.type === 'Fill' ? 'cover' : logoSettings?.type === 'Stretch' ? 'fill' : 'contain';

    // Augmented pages for single-centered alignment behavior
    const augmentedPages = useMemo(() => {
        if (!pages || pages.length === 0) return [];
        const result = [{ isPad: true }, ...pages];
        // Ensure last page is single if total count is even (relative to logical pages)
        // Pad, P1, P2, P3... PN
        // index: 0, 1, 2, 3... N
        // If N is even, PN is on left side [PN, Pad]
        // If N is odd, PN is on right side [PN-1, PN] -> Needs [PN, Pad] to be single
        if (pages.length % 2 !== 0) {
            result.push({ isPad: true });
        } else {
            result.push({ isPad: true }); // Always pad the end for consistency in centering logic
        }
        return result;
    }, [pages]);

    // Auto Flip Interval with Countdown
    useEffect(() => {
        const isOnLastPage = currentPage >= pages.length - 1;
        
        if (isAutoFlipping && isOnLastPage) {
            setIsAutoFlipping(false);
            setCountdown(null);
            return;
        }

        if (!isAutoFlipping) {
            setCountdown(null);
            return;
        }

        const totalDuration = (otherSetup.toolbar?.autoFlipDuration || 5); // in seconds
        const showCountdown = otherSetup.toolbar?.nextFlipCountdown;
        
        let secondsElapsed = 0;
        
        const interval = setInterval(() => {
            secondsElapsed += 1;
            
            if (showCountdown) {
                const remaining = totalDuration - secondsElapsed;
                if (remaining <= 3 && remaining > 0) {
                    setCountdown(remaining);
                } else if (remaining <= 0) {
                    setCountdown(null);
                    secondsElapsed = 0;
                    const flip = bookRef.current?.pageFlip();
                    if (flip) {
                        const totalFlipPages = augmentedPages.length;
                        const currentIdx = flip.getCurrentPageIndex();
                        if (currentIdx < totalFlipPages - 2) { // 2 because of padding logic
                            flip.flipNext();
                        } else {
                            setIsAutoFlipping(false);
                            clearInterval(interval);
                        }
                    }
                } else {
                    setCountdown(null);
                }
            } else {
                if (secondsElapsed >= totalDuration) {
                    secondsElapsed = 0;
                    const flip = bookRef.current?.pageFlip();
                    if (flip) {
                        const totalFlipPages = augmentedPages.length;
                        const currentIdx = flip.getCurrentPageIndex();
                        if (currentIdx < totalFlipPages - 2) {
                            flip.flipNext();
                        } else {
                            setIsAutoFlipping(false);
                            clearInterval(interval);
                        }
                    }
                }
            }
        }, 1000);

        return () => {
            clearInterval(interval);
            setCountdown(null);
        };
    }, [isAutoFlipping, augmentedPages.length, otherSetup.toolbar?.autoFlipDuration, otherSetup.toolbar?.nextFlipCountdown, otherSetup.toolbar?.autoFlipEnabled, currentPage, pages.length]);

    // Book Appearance Logic - Using helper functions with memoization to prevent re-render loops
    const processedAppearance = React.useMemo(() =>
        BookAppearanceHelpers.processBookAppearanceSettings(bookAppearanceSettings),
        [bookAppearanceSettings]
    );

    const {
        shadowStyle,
        cornerRadius,
        pageOpacity,
        textureStyle,
        flipTime,
        hardCover: useHardCover,
        shadowActive
    } = processedAppearance;

    // Background Audio Logic
    const backgroundAudioRef = useRef(null);
    useEffect(() => {
        if (otherSetup.sound?.pageSpecificSound && otherSetup.sound?.bgSound && otherSetup.sound?.bgSound !== 'None') {
            let src = '';
            if (otherSetup.sound.bgSound === 'BG Sound 1') src = '/sounds/bg-1.mp3';
            else if (otherSetup.sound.bgSound === 'BG Sound 2') src = '/sounds/bg-2.mp3';
            else if (otherSetup.sound.bgSound === 'BG Sound 3') src = '/sounds/bg-3.mp3';
            else if (otherSetup.sound.bgSound?.startsWith('BG Sound')) {
                // Find custom sound
                const customSound = otherSetup.sound.customBgSounds?.find(s => s.id === otherSetup.sound.bgSound);
                if (customSound) src = customSound.url;
            }

            if (src) {
                if (!backgroundAudioRef.current || backgroundAudioRef.current.src !== new URL(src, window.location.href).href) {
                    if (backgroundAudioRef.current) backgroundAudioRef.current.pause();
                    backgroundAudioRef.current = new Audio(src);
                    backgroundAudioRef.current.loop = true;
                    backgroundAudioRef.current.volume = 0.1;
                }
                backgroundAudioRef.current.volume = 0.1;
                backgroundAudioRef.current.play().catch(e => console.log("Bg audio auto-play blocked", e));
            }
        } else {
            if (backgroundAudioRef.current) {
                backgroundAudioRef.current.pause();
            }
        }
        return () => {
            if (backgroundAudioRef.current) backgroundAudioRef.current.pause();
        };
    }, [otherSetup.sound?.bgSound, otherSetup.sound?.uploadedBgSound, otherSetup.sound?.pageSpecificSound, otherSetup.sound?.customBgSounds]);



    // Memoize background style to prevent re-render loops
    const backgroundStyle = React.useMemo(() => {
        if (backgroundSettings?.style === 'Gradient') {
            return { background: backgroundSettings.gradient };
        } else if (backgroundSettings?.style === 'Image' && backgroundSettings.image) {
            const adj = backgroundSettings.adjustments || {};
            const exposure = adj.exposure || 0;
            const contrast = adj.contrast || 0;
            const saturation = adj.saturation || 0;
            const temperature = adj.temperature || 0;
            const tint = adj.tint || 0;
            const highlights = (adj.highlights || 0) / 5;
            const shadows = (adj.shadows || 0) / 5;

            const filterStr = `brightness(${100 + exposure}%) contrast(${100 + contrast}%) saturate(${100 + saturation}%) hue-rotate(${tint}deg) sepia(${temperature > 0 ? temperature : 0}%) brightness(${100 + highlights}%) contrast(${100 + shadows}%)`;

            const fitMap = {
                'Fit': 'contain',
                'Fill': 'cover',
                'Stretch': '100% 100%'
            };

            return {
                backgroundImage: `url(${backgroundSettings.image})`,
                backgroundSize: fitMap[backgroundSettings.fit] || 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                filter: filterStr,
                opacity: (backgroundSettings.opacity || 100) / 100
            };
        }
        return { backgroundColor: backgroundSettings?.color || '#DADBE8' };
    }, [backgroundSettings]);


    useEffect(() => {
        // Reset submitted state if we enter the lead form subview to allow continuous editing/previewing
        if (activeSubView === 'leadform') {
            setLeadFormSubmitted(false);
        }
    }, [activeSubView]);

    useEffect(() => {
        if (!leadFormSettings || !leadFormSettings.enabled) {
            setShowLeadForm(false);
            return;
        }

        // --- Editor Mode ---
        // If activeSubView is present (even if null), we are in the editor.
        // We only show the lead form if we are specifically configuring it.
        if (activeSubView !== undefined) {
            if (activeSubView === 'leadform' && !leadFormSubmitted) {
                setShowLeadForm(true);
            } else {
                setShowLeadForm(false);
            }
            return;
        }

        // --- Viewer / Preview Mode ---
        // In this mode, activeSubView is undefined. We follow timing logic.
        if (leadFormSubmitted) {
            setShowLeadForm(false);
            return;
        }

        const timing = leadFormSettings.appearance.timing;
        const afterPages = leadFormSettings.appearance.afterPages || 1;

        if (timing === 'before' && currentPage >= 0) {
            setShowLeadForm(true);
        } else if (timing === 'after-pages' && currentPage >= afterPages) {
            setShowLeadForm(true);
        } else if (timing === 'end' && currentPage >= pages.length - 1) {
            setShowLeadForm(true);
        } else {
            setShowLeadForm(false);
        }
    }, [currentPage, leadFormSettings, leadFormSubmitted, pages.length, activeSubView]);

    const onFlip = useCallback((e) => {
        const index = e.data;
        const total = augmentedPages.length;

        // Play flip sound if enabled
        if (otherSetup.sound?.flipSound && otherSetup.sound?.flipSound !== 'None') {
            let soundSrc = '/sounds/page-flip.mp3';
            if (otherSetup.sound.flipSound === 'Soft Paper Flip') soundSrc = '/sounds/soft-flip.ogg';
            else if (otherSetup.sound.flipSound === 'Hard Cover Flip') soundSrc = '/sounds/hard-flip.mp3';

            const audio = new Audio(soundSrc);
            audio.volume = 0.5;
            audio.play().catch(err => console.log('Sound play blocked:', err));
        }

        // Convert augmented index to logical page index
        // logical P1 is at index 1
        const logicalIndex = Math.max(0, index - 1);

        // Only update parent if it's a real user-triggered flip
        if (onPageChange && !isFlippingRef.current && logicalIndex !== lastSyncPage.current) {
            lastSyncPage.current = logicalIndex;
            onPageChange(logicalIndex);
        }

        // If auto-playing, we want to reset the countdown timer on every flip
        if (isAutoFlipping) {
            setCountdown(null);
        }

        // Adjust for cover centering
        let newOffset = 0;
        if (logicalIndex === 0) {
            newOffset = -(WIDTH / 2);
        } else if (logicalIndex === pages.length - 1) {
            // If Last index is Even (P1, P3, P5...), it's on the Right side
            // If Last index is Odd (P2, P4, P6...), it's on the Left side
            newOffset = (logicalIndex % 2 === 0) ? -(WIDTH / 2) : (WIDTH / 2);
        } else {
            newOffset = 0;
        }
        setCurrentPage(logicalIndex);
        setOffset(newOffset);
    }, [pages.length, onPageChange, WIDTH, augmentedPages.length]);

    useEffect(() => {
        if (pages.length === 0) {
            setOffset(0);
        } else if (targetPage === 0) {
            setOffset(-(WIDTH / 2));
        } else if (targetPage === pages.length - 1) {
            setOffset((targetPage % 2 === 0) ? -(WIDTH / 2) : (WIDTH / 2));
        } else {
            setOffset(0);
        }
    }, [pages.length, WIDTH, targetPage]);


    // Handle external page change (Synchronize parent state to book)
    useEffect(() => {
        if (!bookRef.current || augmentedPages.length === 0) return;

        // Logical page X is at augmented index X+1? No, let's be precise.
        // P0 (index 0) -> Aug[1]
        const augTarget = targetPage + 1;

        const flip = bookRef.current.pageFlip();
        if (flip && flip.getCurrentPageIndex() !== augTarget) {
            isFlippingRef.current = true;
            lastSyncPage.current = targetPage;
            setCurrentPage(targetPage);

            const timer = setTimeout(() => {
                if (bookRef.current) {
                    try {
                        bookRef.current.pageFlip().turnToPage(augTarget);
                    } catch (e) {
                        console.warn('Flip error', e);
                    }
                }
                isFlippingRef.current = false;
            }, 50);

            return () => {
                clearTimeout(timer);
                isFlippingRef.current = false;
            };
        }
    }, [targetPage, augmentedPages.length]);

    // Broadcast animation re-trigger on page visible
    useEffect(() => {
        const timer = setTimeout(() => {
            if (containerRef.current) {
                const iframes = containerRef.current.querySelectorAll('iframe');
                iframes.forEach(iframe => {
                    if (iframe.contentWindow) {
                        iframe.contentWindow.postMessage({ type: 'RETRIGGER_ANIMATIONS' }, '*');
                    }
                });
            }
        }, 800); // Wait for flip animation to mostly complete
        return () => clearTimeout(timer);
    }, [currentPage]);

    return (
        <div
            ref={containerRef}
            className="flex-1 flex flex-col relative min-h-0 overflow-hidden"
            style={{ backgroundColor: backgroundSettings?.color || '#DADBE8' }}
        >
            {/* Lead Form Overlay */}
            {showLeadForm && (
                <div className="absolute inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-center justify-center p-[2vw]">
                    <div className="relative" style={{ fontFamily: leadFormSettings.appearance.fontStyle || 'Inter' }}>
                        <div
                            className="w-[40vw] rounded-[1.5vw] shadow-[0_1vw_4vw_rgba(0,0,0,0.1)] overflow-hidden relative border animate-in zoom-in-95 duration-300"
                            style={{
                                fontFamily: leadFormSettings.appearance.fontStyle || 'Inter',
                                backgroundColor: leadFormSettings.appearance.bgFill || '#ffffff',
                                borderColor: leadFormSettings.appearance.bgStroke && leadFormSettings.appearance.bgStroke !== '#' ? leadFormSettings.appearance.bgStroke : '#F3F4F6'
                            }}
                        >
                            <div className="p-[3.5vw] space-y-[2.5vw]">
                                {/* Header */}
                                <div className="space-y-[0.5vw]">
                                    <div className="flex items-center gap-[1.25vw] relative">
                                        <h2 
                                            className="text-[1.8vw] font-semibold leading-none"
                                            style={{ 
                                                color: leadFormSettings.appearance.textFill || '#111827',
                                                WebkitTextStroke: leadFormSettings.appearance.textStroke && leadFormSettings.appearance.textStroke !== '#' ? `0.02vw ${leadFormSettings.appearance.textStroke}` : 'none'
                                            }}
                                        >
                                            Lead Form
                                        </h2>
                                        <div 
                                            className="h-[1px] flex-1 mt-[0.2vw]" 
                                            style={{ backgroundColor: leadFormSettings.appearance.bgStroke && leadFormSettings.appearance.bgStroke !== '#' ? leadFormSettings.appearance.bgStroke : '#E5E7EB' }}
                                        />
                                        {/* Close Button (X) */}
                                        {leadFormSettings.appearance.allowSkip && (
                                            <button
                                                onClick={() => {
                                                    setLeadFormSubmitted(true);
                                                    if (activeSubView === undefined && bookName) {
                                                        localStorage.setItem(`leadFormSubmitted_${bookName}`, 'true');
                                                    }
                                                }}
                                                className="w-[2vw] h-[2vw] flex items-center justify-center border-[1.5px] border-red-500 rounded-[0.4vw] hover:bg-red-50 transition-all flex-shrink-0"
                                            >
                                                <Icon icon="lucide:x" className="w-[1.2vw] h-[1.2vw] text-red-500 stroke-[3]" />
                                            </button>
                                        )}
                                    </div>
                                    <p 
                                        className="text-[0.85vw] font-semibold"
                                        style={{ 
                                            color: leadFormSettings.appearance.textFill || '#1F2937',
                                            WebkitTextStroke: leadFormSettings.appearance.textStroke && leadFormSettings.appearance.textStroke !== '#' ? `0.01vw ${leadFormSettings.appearance.textStroke}` : 'none'
                                        }}
                                    >
                                        {!leadFormSettings.appearance.allowSkip || leadFormSettings.appearance.timing === 'end' 
                                            ? "Enter your details*"
                                            : <>Enter your details to continue <span className="text-red-500 font-semibold">*</span></>
                                        }
                                    </p>
                                </div>

                                {/* Lead Message */}
                                <div className="py-[0.5vw] text-center">
                                    <p 
                                        className="text-[1.1vw] font-semibold"
                                        style={{ 
                                            color: leadFormSettings.appearance.textFill || '#111827',
                                            WebkitTextStroke: leadFormSettings.appearance.textStroke && leadFormSettings.appearance.textStroke !== '#' ? `0.02vw ${leadFormSettings.appearance.textStroke}` : 'none'
                                        }}
                                    >
                                        "{leadFormSettings.leadText || 'Share your information to get personalized updates.'}"
                                    </p>
                                </div>

                                {/* Form Fields */}
                                <div className="space-y-[1.25vw] max-w-[22vw] mx-auto">
                                    {leadFormSettings.fields.name && (
                                        <div className="relative">
                                            <div className="absolute left-[1vw] top-1/2 -translate-y-1/2 text-gray-900">
                                                <Icon icon="lucide:user" className="w-[1.25vw] h-[1.25vw]" />
                                            </div>
                                            <input
                                                type="text"
                                                placeholder="Enter your Name as Lead"
                                                className="w-full bg-white border rounded-[0.7vw] py-[0.7vw] pl-[3.5vw] pr-[1vw] text-[0.85vw] font-medium focus:outline-none transition-all shadow-sm"
                                                style={{ 
                                                    borderColor: leadFormSettings.appearance.bgStroke || '#D1D5DB',
                                                    color: leadFormSettings.appearance.textFill || '#111827',
                                                    fontFamily: 'inherit'
                                                }}
                                                onFocus={(e) => e.target.style.borderColor = leadFormSettings.appearance.btnFill || '#3E4491'}
                                                onBlur={(e) => e.target.style.borderColor = leadFormSettings.appearance.bgStroke || '#D1D5DB'}
                                            />
                                        </div>
                                    )}
                                    {leadFormSettings.fields.email && (
                                        <div className="relative">
                                            <div className="absolute left-[1vw] top-1/2 -translate-y-1/2">
                                                <Icon icon="logos:google-gmail" className="w-[1.25vw] h-[1.25vw]" />
                                            </div>
                                            <input
                                                type="email"
                                                placeholder="Enter your Gmail as Lead"
                                                className="w-full bg-white border rounded-[0.7vw] py-[0.7vw] pl-[3.5vw] pr-[1vw] text-[0.85vw] font-medium focus:outline-none transition-all shadow-sm"
                                                style={{ 
                                                    borderColor: leadFormSettings.appearance.bgStroke || '#D1D5DB',
                                                    color: leadFormSettings.appearance.textFill || '#111827',
                                                    fontFamily: 'inherit'
                                                }}
                                                onFocus={(e) => e.target.style.borderColor = leadFormSettings.appearance.btnFill || '#3E4491'}
                                                onBlur={(e) => e.target.style.borderColor = leadFormSettings.appearance.bgStroke || '#D1D5DB'}
                                            />
                                        </div>
                                    )}
                                    {leadFormSettings.fields.phone && (
                                        <div className="relative">
                                            <div className="absolute left-[1vw] top-1/2 -translate-y-1/2 text-gray-400">
                                                <Icon icon="lucide:phone" className="w-[1.25vw] h-[1.25vw]" />
                                            </div>
                                            <input
                                                type="tel"
                                                placeholder="Enter your Phone Number"
                                                className="w-full bg-white border rounded-[0.7vw] py-[0.7vw] pl-[3.5vw] pr-[1vw] text-[0.85vw] font-medium focus:outline-none transition-all shadow-sm"
                                                style={{ 
                                                    borderColor: leadFormSettings.appearance.bgStroke || '#D1D5DB',
                                                    color: leadFormSettings.appearance.textFill || '#111827',
                                                    fontFamily: 'inherit'
                                                }}
                                                onFocus={(e) => e.target.style.borderColor = leadFormSettings.appearance.btnFill || '#3E4491'}
                                                onBlur={(e) => e.target.style.borderColor = leadFormSettings.appearance.bgStroke || '#D1D5DB'}
                                            />
                                        </div>
                                    )}
                                    
                                    {leadFormSettings.fields.feedback && (
                                        <div className="space-y-[0.75vw]">
                                            <label 
                                                className="text-[1vw] font-semibold block"
                                                style={{ 
                                                    color: leadFormSettings.appearance.textFill || '#111827',
                                                    WebkitTextStroke: leadFormSettings.appearance.textStroke && leadFormSettings.appearance.textStroke !== '#' ? `0.02vw ${leadFormSettings.appearance.textStroke}` : 'none'
                                                }}
                                            >
                                                Enter your Feedback
                                            </label>
                                            <textarea
                                                placeholder="Enter your Feedback"
                                                className="w-full bg-white border rounded-[0.7vw] p-[1.2vw] text-[0.85vw] font-medium h-[9vw] focus:outline-none transition-all resize-none shadow-sm"
                                                style={{ 
                                                    borderColor: leadFormSettings.appearance.bgStroke || '#D1D5DB',
                                                    color: leadFormSettings.appearance.textFill || '#111827',
                                                    fontFamily: 'inherit'
                                                }}
                                                onFocus={(e) => e.target.style.borderColor = leadFormSettings.appearance.btnFill || '#3E4491'}
                                                onBlur={(e) => e.target.style.borderColor = leadFormSettings.appearance.bgStroke || '#D1D5DB'}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* External Actions - Positioned below card as in image */}
                        <div className="flex items-center justify-end gap-[1vw] mt-[1.2vw] animate-in fade-in slide-in-from-bottom-2 duration-500 delay-150 pr-[1vw]">
                            {leadFormSettings.appearance.allowSkip && (
                                <button
                                    onClick={() => {
                                        setLeadFormSubmitted(true);
                                        if (activeSubView === undefined && bookName) {
                                            localStorage.setItem(`leadFormSubmitted_${bookName}`, 'true');
                                        }
                                    }}
                                    className="px-[3.5vw] py-[0.9vw] rounded-[0.7vw] font-semibold text-[0.9vw] transition-all hover:brightness-110 active:scale-95 shadow-xl uppercase tracking-wider"
                                    style={{
                                        backgroundColor: leadFormSettings.appearance.btnFill || '#3E4491',
                                        color: leadFormSettings.appearance.btnText || '#ffffff',
                                        border: leadFormSettings.appearance.btnStroke && leadFormSettings.appearance.btnStroke !== '#' ? `1.5px solid ${leadFormSettings.appearance.btnStroke}` : 'none',
                                        fontFamily: 'inherit'
                                    }}
                                >
                                    SKIP
                                </button>
                            )}
                            <button
                                onClick={() => {
                                    setLeadFormSubmitted(true);
                                    if (activeSubView === undefined && bookName) {
                                        localStorage.setItem(`leadFormSubmitted_${bookName}`, 'true');
                                    }
                                }}
                                className="px-[3.5vw] py-[0.9vw] rounded-[0.7vw] font-semibold text-[0.9vw] transition-all hover:brightness-110 active:scale-95 shadow-xl uppercase tracking-wider"
                                style={{
                                    backgroundColor: leadFormSettings.appearance.btnFill || '#3E4491',
                                    color: leadFormSettings.appearance.btnText || '#ffffff',
                                    border: leadFormSettings.appearance.btnStroke && leadFormSettings.appearance.btnStroke !== '#' ? `1.5px solid ${leadFormSettings.appearance.btnStroke}` : 'none',
                                    fontFamily: 'inherit'
                                }}
                            >
                                SUBMIT
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Background Layer - Gradient / Image */}
            {(backgroundSettings?.style === 'Gradient' || (backgroundSettings?.style === 'Image' && backgroundSettings.image)) && (
                <div className="absolute inset-0 z-0 pointer-events-none" style={backgroundStyle} />
            )}

            {backgroundSettings?.style === 'ReactBits' && backgroundSettings.reactBitType && backgroundComponents[backgroundSettings.reactBitType] && (
                <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                    {React.createElement(backgroundComponents[backgroundSettings.reactBitType])}
                </div>
            )}

            {/* Animation Overlay Layer */}
            {backgroundSettings?.animation && backgroundSettings.animation !== 'None' && animationComponents[backgroundSettings.animation] && (
                <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                    {React.createElement(animationComponents[backgroundSettings.animation])}
                </div>
            )}

            {/* Top Bar - Revamped */}
            {!hideHeader && (
                <div
                    className="h-[8vh] flex items-center justify-between px-[2vw] shrink-0 w-full shadow-lg z-10 relative backdrop-blur-md"
                    style={{ 
                        backgroundColor: `${otherSetup.toolbar.toolbarColor.fill}E6` || '#3E4491E6',
                        borderBottom: otherSetup.toolbar.toolbarColor.stroke && otherSetup.toolbar.toolbarColor.stroke !== '#' ? `1px solid ${otherSetup.toolbar.toolbarColor.stroke}` : 'none'
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Search Area */}
                    {settings.interaction.search ? (
                        <div className="flex items-center rounded-full px-[1.2vw] py-[0.4vw] w-[16vw] group transition-all shadow-inner bg-[#DDE0F4]">
                            <Icon 
                                icon="lucide:search" 
                                className="w-[1.1vw] h-[1.1vw] text-[#575C9C]" 
                            />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        handleQuickSearch(searchQuery);
                                    }
                                }}
                                placeholder="Quick Search..."
                                className="bg-transparent border-0 outline-none focus:outline-none focus:ring-0 text-[0.85vw] ml-[0.6vw] w-full font-medium text-[#575C9C]"
                            />
                        </div>
                    ) : <div className="w-[15vw]" />}

                    {/* Centered Title */}
                    <div className="absolute left-1/2 -translate-x-1/2 text-center pointer-events-none">
                        <span className="text-white text-[1.25vw] font-medium drop-shadow-sm">{bookName}</span>
                    </div>

                    {/* Logo Area */}
                    {settings.brandingProfile.logo && logoSettings?.src && (
                        <div className="flex items-center gap-[1vw]">
                            {(() => {
                                const adj = logoSettings.adjustments || {};
                                const exposure = adj.exposure || 0;
                                const contrast = adj.contrast || 0;
                                const saturation = adj.saturation || 0;
                                const temperature = adj.temperature || 0;
                                const tint = adj.tint || 0;
                                const highlights = (adj.highlights || 0) / 5;
                                const shadows = (adj.shadows || 0) / 5;
                                const filterStr = `brightness(${100 + exposure}%) contrast(${100 + contrast}%) saturate(${100 + saturation}%) hue-rotate(${tint}deg) sepia(${temperature > 0 ? temperature : 0}%) brightness(${100 + highlights}%) contrast(${100 + shadows}%)`;
                                const logoStyle = {
                                    objectFit: logoObjectFit,
                                    filter: filterStr,
                                    opacity: (logoSettings.opacity ?? 100) / 100
                                };

                                return logoSettings.url ? (
                                    <a
                                        href={logoSettings.url.startsWith('http') ? logoSettings.url : `https://${logoSettings.url}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block hover:scale-105 transition-transform"
                                    >
                                        <img
                                            src={logoSettings.src}
                                            alt="Brand Logo"
                                            className="h-[2vw] w-auto transition-all duration-300"
                                            style={logoStyle}
                                        />
                                    </a>
                                ) : (
                                    <img
                                        src={logoSettings.src}
                                        alt="Brand Logo"
                                        className="h-[2vw] w-auto transition-all duration-300"
                                        style={logoStyle}
                                    />
                                );
                            })()}
                        </div>
                    )}
                </div>
            )}

            {/* Draggable Device Settings (Sidebar-style Dragger) - Only visible in Preview Mode */}
            {onClose && (
                <>
                    {/* Persistent vertical line on the stuck edge */}
                    {!isDraggerDragging && (
                        <div 
                            className="fixed top-0 w-[0.25vw] h-full bg-black z-[1999] pointer-events-none transition-all duration-300"
                            style={{ 
                                left: draggerTabLeft < 10 ? '0' : 'auto',
                                right: draggerTabLeft > 10 ? '0' : 'auto',
                                opacity: 1
                            }}
                        />
                    )}

                    <div 
                        className="fixed z-[2000] pointer-events-auto"
                        style={{ 
                            top: `${draggerTabTop}px`,
                            left: isDraggerDragging ? `${draggerTabLeft}px` : (draggerTabLeft < 10 ? '0' : 'auto'),
                            right: isDraggerDragging ? 'auto' : (draggerTabLeft < 10 ? 'auto' : '0')
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div 
                            className={`bg-black text-white shadow-[0_10px_30px_rgba(0,0,0,0.3)] flex flex-col items-center transition-all duration-300 overflow-hidden ${
                                isDraggerDragging ? 'rounded-[0.8vw]' : (draggerTabLeft < 10 ? 'rounded-r-[0.8vw] rounded-l-none' : 'rounded-l-[0.8vw] rounded-r-none')
                            }`}
                            style={{ width: '3.2vw', height: isDraggerExpanded ? '14vw' : '3.2vw' }}
                        >
                        {/* Draggable Handle / Gear Icon */}
                        <div
                            onMouseDown={handleDraggerMouseDown}
                            className={`w-[2.6vw] h-[2.6vw] mt-[0.3vw] flex items-center justify-center rounded-[0.5vw] cursor-grab transition-colors flex-shrink-0 ${
                                isDraggerExpanded ? 'bg-white text-black' : 'bg-transparent text-white hover:bg-white/20'
                            } ${isDraggerDragging ? 'cursor-grabbing scale-105' : ''}`}
                            title="Toggle Device Preview Settings"
                        >
                            <Icon icon="lucide:settings" className="w-[1.4vw] h-[1.4vw]" />
                        </div>

                        {/* Expandable Options */}
                        <div className={`flex flex-col gap-[0.8vw] mt-[0.8vw] w-full px-[0.4vw] transition-opacity duration-300 ${isDraggerExpanded ? 'opacity-100 delay-100' : 'opacity-0 pointer-events-none'}`}>
                            
                            {/* Device Selectors */}
                            <div className="flex flex-col gap-[0.4vw] border border-white/30 rounded-[1.5vw] p-[0.3vw]">
                                <button 
                                    onClick={() => setDeviceMode('desktop')}
                                    className={`w-[1.8vw] h-[1.8vw] mx-auto rounded-full flex items-center justify-center transition-colors ${deviceMode === 'desktop' ? 'bg-white text-black shadow-md' : 'text-white hover:bg-white/20'}`}
                                    title="Desktop View"
                                >
                                    <Icon icon="lucide:monitor" className="w-[1vw] h-[1vw]" />
                                </button>
                                <button 
                                    onClick={() => setDeviceMode('tablet')}
                                    className={`w-[1.8vw] h-[1.8vw] mx-auto rounded-full flex items-center justify-center transition-colors ${deviceMode === 'tablet' ? 'bg-white text-black shadow-md' : 'text-white hover:bg-white/20'}`}
                                    title="Tablet View"
                                >
                                    <Icon icon="lucide:tablet" className="w-[1vw] h-[1vw]" />
                                </button>
                                <button 
                                    onClick={() => setDeviceMode('mobile')}
                                    className={`w-[1.8vw] h-[1.8vw] mx-auto rounded-full flex items-center justify-center transition-colors ${deviceMode === 'mobile' ? 'bg-white text-black shadow-md' : 'text-white hover:bg-white/20'}`}
                                    title="Mobile View"
                                >
                                    <Icon icon="lucide:smartphone" className="w-[1vw] h-[1vw]" />
                                </button>
                            </div>

                            {/* Return/Exit action (Only in Preview Mode) */}
                            {onClose && (
                                <button 
                                    className="w-[2.2vw] h-[2.2vw] rounded-[0.5vw] flex items-center justify-center mx-auto text-white hover:bg-gray-500/50 transition-colors border border-white/20"
                                    title="Exit Preview"
                                    onClick={onClose}
                                >
                                    <Icon 
                                        icon="heroicons-outline:logout" 
                                        className={`w-[1.1vw] h-[1.1vw] transition-transform duration-300 ${draggerTabLeft < 10 ? 'rotate-0' : 'rotate-180'}`} 
                                    />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
                </>
            )}

            {/* Canvas Area - Added min-h-0 to allow shrinking in flex layout */}
            <div className="flex-1 min-h-0 flex items-center justify-center relative p-[2vw] z-[1]">
                {/* Device Frame Wrapper */}
                <div 
                    className="relative flex items-center justify-center transition-all duration-500"
                    style={{ 
                        ...deviceStyles[deviceMode],
                        backgroundColor: deviceMode === 'desktop' ? 'transparent' : 'white',
                        overflow: 'hidden'
                    }}
                >
                    {deviceMode !== 'desktop' && (
                        <div className="absolute top-[0.6rem] left-1/2 -translate-x-1/2 w-[60px] h-[6px] bg-[#1f2937] opacity-80 rounded-full z-[100] pointer-events-none"></div>
                    )}
                {/* Vertical Centered Navigation Arrows */}
                {settings.navigation.nextPrevButtons && (
                    <>
                        <button
                            className="absolute left-[2.5vw] top-1/2 -translate-y-1/2 w-[2.5vw] h-[2.5vw] bg-[#3E4491]/80 backdrop-blur-md rounded-[0.25vw] text-white flex items-center justify-center hover:bg-[#3E4491] transition-all shadow-lg group z-20"
                            onClick={(e) => {
                                e.stopPropagation();
                                bookRef.current?.pageFlip()?.flipPrev();
                            }}
                        >
                            <Icon icon="fluent:chevron-left-24-filled" className="w-[1.25vw] h-[1.25vw] group-active:scale-90 transition-transform" />
                        </button>

                        <button
                            className="absolute right-[2.5vw] top-1/2 -translate-y-1/2 w-[2.5vw] h-[2.5vw] bg-[#3E4491]/80 backdrop-blur-md rounded-[0.25vw] text-white flex items-center justify-center hover:bg-[#3E4491] transition-all shadow-lg group z-20"
                            onClick={(e) => {
                                e.stopPropagation();
                                bookRef.current?.pageFlip()?.flipNext();
                            }}
                        >
                            <Icon icon="fluent:chevron-right-24-filled" className="w-[1.25vw] h-[1.25vw] group-active:scale-90 transition-transform" />
                        </button>
                    </>
                )}

                {/* Bottom Corner Navigation Buttons */}
                {settings.navigation.startEndNav && (
                    <>
                        <button
                            className="absolute left-[9.5vw] bottom-[3vw] w-[2.5vw] h-[2.5vw] bg-[#3E4491]/80 backdrop-blur-md rounded-[0.25vw] text-white flex items-center justify-center hover:bg-[#3E4491] transition-all shadow-lg group z-20"
                            onClick={(e) => {
                                e.stopPropagation();
                                bookRef.current?.pageFlip()?.turnToPage(0);
                            }}
                        >
                            <Icon icon="fluent:previous-24-filled" className="w-[1vw] h-[1vw] group-active:scale-90 transition-transform" />
                        </button>

                        <button
                            className="absolute right-[9.5vw] bottom-[3vw] w-[2.5vw] h-[2.5vw] bg-[#3E4491]/80 backdrop-blur-md rounded-[0.25vw] text-white flex items-center justify-center hover:bg-[#3E4491] transition-all shadow-lg group z-20"
                            onClick={(e) => {
                                e.stopPropagation();
                                bookRef.current?.pageFlip()?.turnToPage(pages.length - 1);
                            }}
                        >
                            <Icon icon="fluent:next-24-filled" className="w-[1vw] h-[1vw] group-active:scale-90 transition-transform" />
                        </button>
                    </>
                )}

                {/* Page Counter Badge */}
                {settings.navigation.pageQuickAccess && (
                    <div 
                        className="absolute left-[1vw] bottom-[1.25vw] bg-white rounded-[0.9vw] px-[1vw] py-[0.55vw] shadow-md border border-gray-100 z-20"
                        style={{ fontFamily: otherSetup.toolbar?.textProperties?.font || 'Poppins' }}
                    >
                        <span className="text-[0.95vw] font-semibold text-indigo-500">Page {currentPage + 1} / {pages.length}</span>
                    </div>
                )}

                {/* Right Floating Actions - Only visible in Preview Mode */}
                {onClose && (
                    <div className="absolute right-[2.5vw] top-[3vw] flex flex-col gap-[0.8vw] z-20 items-end">
                        {/* Interaction Button */}
                        <div 
                            className="w-[8.5vw] h-[3.4vw] rounded-[0.8vw] shadow-[0_0.3vw_1vw_rgba(0,0,0,0.1)] flex items-center p-[0.6vw] gap-[0.5vw] cursor-pointer hover:brightness-105 transition-all group overflow-hidden border border-white/50"
                            style={{ 
                                backgroundColor: otherSetup.popup?.backgroundColor?.fill || '#F1F1F5',
                                borderColor: otherSetup.popup?.backgroundColor?.stroke && otherSetup.popup.backgroundColor.stroke !== '#' ? otherSetup.popup.backgroundColor.stroke : 'white'
                            }}
                        >
                            <div className="flex-shrink-0 w-[2.2vw] h-[2.2vw] flex items-center justify-center">
                                <Icon 
                                    icon="ph:cursor-click-bold" 
                                    className="w-[1.6vw] h-[1.6vw] group-hover:scale-110 transition-transform" 
                                    style={{ 
                                        color: otherSetup.popup?.iconsColor?.fill || '#1A1A1A',
                                        filter: otherSetup.popup?.iconsColor?.stroke && otherSetup.popup.iconsColor.stroke !== '#' 
                                            ? `drop-shadow(1px 0 0 ${otherSetup.popup.iconsColor.stroke}) drop-shadow(-1px 0 0 ${otherSetup.popup.iconsColor.stroke}) drop-shadow(0 1px 0 ${otherSetup.popup.iconsColor.stroke}) drop-shadow(0 -1px 0 ${otherSetup.popup.iconsColor.stroke})` 
                                            : 'none'
                                    }}
                                />
                            </div>
                            <span 
                                className="text-[0.72vw] font-medium leading-[1.1] select-none"
                                style={{ 
                                    fontFamily: otherSetup.popup?.textProperties?.font || 'Poppins',
                                    color: otherSetup.popup?.textProperties?.fill || '#1A1A1A'
                                }}
                            >
                                Click to View<br />Interaction
                            </span>
                        </div>

                        {/* Bookmarks Button */}
                        {settings.navigation.bookmark && (
                            <div
                                className="w-[8.5vw] h-[3.4vw] rounded-[0.8vw] shadow-[0_0.3vw_1vw_rgba(0,0,0,0.1)] flex items-center p-[0.6vw] gap-[0.5vw] cursor-pointer hover:brightness-105 transition-all group relative overflow-hidden border border-white/50"
                                style={{ 
                                    backgroundColor: otherSetup.popup?.backgroundColor?.fill || '#F1F1F5',
                                    borderColor: otherSetup.popup?.backgroundColor?.stroke && otherSetup.popup.backgroundColor.stroke !== '#' ? otherSetup.popup.backgroundColor.stroke : 'white'
                                }}
                                onClick={(e) => { e.stopPropagation(); setShowAddBookmarkPopupMemo(true); }}
                            >
                                <span 
                                    className="text-[0.72vw] font-medium leading-[1.1] select-none z-10"
                                    style={{ 
                                        fontFamily: otherSetup.popup?.textProperties?.font || 'Poppins',
                                        color: otherSetup.popup?.textProperties?.fill || '#1A1A1A'
                                    }}
                                >
                                    Click to Add<br />Bookmarks
                                </span>
                                {/* Colored Emoji Bookmark Icon */}
                                <div className="absolute top-[0.2vw] right-[0.2vw] w-[3.2vw] h-[3.2vw] group-hover:scale-110 transition-transform flex items-center justify-center pointer-events-none">
                                    <Icon icon="emojione:bookmark" className="w-[2.4vw] h-[2.4vw]" />
                                </div>
                            </div>
                        )}

                        {/* Notes Button */}
                        {settings.interaction.notes && (
                            <div
                                className="w-[8.5vw] h-[3.4vw] rounded-[0.8vw] shadow-[0_0.3vw_1vw_rgba(0,0,0,0.1)] flex items-center p-[0.6vw] gap-[0.5vw] cursor-pointer hover:brightness-105 transition-all group relative border border-white/50"
                                style={{ 
                                    backgroundColor: otherSetup.popup?.backgroundColor?.fill || '#F1F1F5',
                                    borderColor: otherSetup.popup?.backgroundColor?.stroke && otherSetup.popup.backgroundColor.stroke !== '#' ? otherSetup.popup.backgroundColor.stroke : 'white'
                                }}
                                onClick={(e) => { e.stopPropagation(); setShowAddNotesPopupMemo(true); }}
                            >
                                <span 
                                    className="text-[0.72vw] font-medium leading-[1.1] select-none z-10"
                                    style={{ 
                                        fontFamily: otherSetup.popup?.textProperties?.font || 'Poppins',
                                        color: otherSetup.popup?.textProperties?.fill || '#1A1A1A'
                                    }}
                                >
                                    Click to Add<br />Notes
                                </span>
                                {/* Decorative Stacked Post-its - Styled as a Corner Sticker */}
                                <div className="absolute top-[-0.6vw] right-[-0.6vw] w-[3.5vw] h-[3.5vw] group-hover:scale-110 transition-transform pointer-events-none z-20">
                                    <div className="relative w-full h-full">
                                        {/* Yellow Card */}
                                        <div className="absolute top-[0.4vw] right-[1vw] w-[1.8vw] h-[1.8vw] bg-[#E5D731] rounded-[0.2vw] shadow-sm rotate-[12deg]" />
                                        {/* Red Card */}
                                        <div className="absolute top-[0.2vw] right-[0.6vw] w-[1.8vw] h-[1.8vw] bg-[#D4223A] rounded-[0.2vw] shadow-sm rotate-[-5deg]" />
                                        {/* Blue Card */}
                                        <div className="absolute top-[0.6vw] right-[0.2vw] w-[1.8vw] h-[1.8vw] bg-[#1D62D0] rounded-[0.2vw] shadow-lg flex items-center justify-center text-center p-[0.1vw]">
                                            <span className="text-[0.28vw] text-white font-semibold leading-tight">Click to<br />Add<br />Notes</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Flipbook Container Wrapper */}
                <div
                    className="relative flex items-center justify-center flipbook-magazine-wrapper"
                    onClick={(e) => e.stopPropagation()}
                    onDoubleClick={(e) => {
                        e.stopPropagation();
                        toggleZoom();
                    }}
                    onTouchStart={(e) => {
                        const now = Date.now();
                        if (now - lastTapRef.current < 300) {
                            toggleZoom();
                        }
                        lastTapRef.current = now;
                    }}
                    style={{
                        transform: `translateX(${offset}px) scale(${currentZoom})`,
                        transformOrigin: 'center center',
                        transition: 'transform 0.7s ease-out'
                    }}
                >
                    <BookRenderer
                        augmentedPages={augmentedPages}
                        WIDTH={WIDTH}
                        HEIGHT={HEIGHT}
                        flipTime={flipTime}
                        useHardCover={useHardCover}
                        targetPage={targetPage}
                        bookRef={bookRef}
                        onFlip={onFlip}
                        cornerRadius={cornerRadius}
                        pageOpacity={pageOpacity}
                        textureStyle={textureStyle}
                        shadowActive={shadowActive}
                        shadowStyle={shadowStyle}
                        currentPage={currentPage}
                        pagesCount={pages.length}
                    />

                    {/* Next Flip Countdown Overlay */}
                    {countdown !== null && (
                        <div className="absolute inset-0 flex items-center justify-center z-[100] pointer-events-none">
                            <span 
                                className="text-[8vw] font-semibold text-gray-400/40 font-poppins drop-shadow-sm transition-transform duration-300"
                                style={{
                                    transform: (currentPage === 0) ? 'translateX(200px)' : 'none'
                                }}
                            >
                                {countdown}
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>

            {/* Popup Menus - Positioned specifically above toolbar icons */}
            {showBookmarkMenu && (
                <>
                    <div className="absolute inset-0 z-40 pointer-events-auto" onClick={() => setShowBookmarkMenu(false)} />
                    <div
                        className="absolute bottom-[4.5vw] right-[27.3vw] flex flex-col rounded-[1vw] overflow-hidden shadow-[0_1vw_3vw_rgba(0,0,0,0.3)] z-50 min-w-[12vw] animate-in fade-in slide-in-from-bottom-2 duration-200 bg-white"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            className="flex items-center gap-[0.75vw] px-[1.25vw] py-[0.85vw] hover:bg-black/5 transition-colors text-left group"
                            onClick={() => { setShowAddBookmarkPopupMemo(true); setShowBookmarkMenu(false); }}
                        >
                            <Icon 
                                icon="fluent:bookmark-add-24-filled" 
                                className="w-[1.2vw] h-[1.2vw] group-hover:scale-110 transition-transform" 

                            />
                            <span className="text-[0.85vw] font-semibold">Add Bookmark</span>
                        </button>
                        <div className="h-[1px] opacity-10 w-full bg-[#1E293B]" />
                        <button
                            className="flex items-center gap-[0.75vw] px-[1.25vw] py-[0.85vw] hover:bg-black/5 transition-colors text-left group"

                            onClick={() => { setShowViewBookmarkPopup(true); setShowBookmarkMenu(false); }}
                        >
                            <Icon 
                                icon="lucide:view" 
                                width={18} 
                                height={18} 
                                className="group-hover:scale-110 transition-transform" 

                            />
                            <span className="text-[0.85vw] font-semibold">View Bookmark</span>
                        </button>
                    </div>
                </>
            )}

            {showMoreMenu && (
                <>
                    <div className="absolute inset-0 z-40 pointer-events-auto" onClick={() => setShowMoreMenu(false)} />
                    <div
                        className="absolute bottom-[4.5vw] right-[21.8vw] flex flex-col rounded-[1vw] overflow-hidden shadow-[0_1vw_3vw_rgba(0,0,0,0.3)] z-50 min-w-[10vw] animate-in fade-in slide-in-from-bottom-2 duration-200 bg-white"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {settings.interaction.gallery && (
                            <button 
                                className="flex items-center gap-[0.75vw] px-[1.2vw] py-[0.85vw] hover:bg-black/5 transition-colors text-left group"
    
                                onClick={() => { setShowGalleryPopup(true); setShowMoreMenu(false); }}
                            >
                                <Icon 
                                    icon="fluent:image-multiple-24-filled" 
                                    className="w-[1.2vw] h-[1.2vw] group-hover:scale-110 transition-transform" 
    
                                />
                                <span className="text-[0.85vw] font-semibold">Gallery</span>
                            </button>
                        )}
                        <div className="h-[1px] opacity-10 w-full bg-[#1E293B]" />
                        {settings.brandingProfile.profile && (
                            <button
                                className="flex items-center gap-[0.75vw] px-[1.2vw] py-[0.85vw] hover:bg-black/5 transition-colors text-left group"
    
                                onClick={() => { setShowProfilePopup(true); setShowMoreMenu(false); }}
                            >
                                <Icon 
                                    icon="fluent:person-24-filled" 
                                    className="w-[1.2vw] h-[1.2vw] group-hover:scale-110 transition-transform" 
    
                                />
                                <span className="text-[0.85vw] font-semibold">Profile</span>
                            </button>
                        )}
                    </div>
                </>
            )}

            {/* Overlays (Popups & Bars) */}
            {showThumbnailBar && (
                <ThumbnailsBar
                    pages={pages}
                    currentPage={currentPage}
                    onPageClick={onPageClick}
                    onClose={() => setShowThumbnailBar(false)}
                    cornerRadius={cornerRadius}
                    textureStyle={textureStyle}
                />
            )}

            {showAddBookmarkPopup && (
                <AddBookmarkPopup
                    onClose={() => setShowAddBookmarkPopup(false)}
                    currentPageIndex={currentPage}
                    totalPages={pages.length}
                    onAddBookmark={onAddBookmark}
                    bookmarkSettings={settings.navigation?.bookmarkSettings}
                />
            )}

            {showAddNotesPopup && (
                <AddNotesPopup
                    onClose={() => setShowAddNotesPopup(false)}
                    currentPageIndex={currentPage}
                    totalPages={pages.length}
                    onAddNote={onAddNote}
                />
            )}

            {showNotesViewer && (
                <NotesViewerPopup
                    onClose={() => setShowNotesViewer(false)}
                    notes={notes}
                />
            )}

            {showViewBookmarkPopup && (
                <ViewBookmarkPopup
                    onClose={() => setShowViewBookmarkPopup(false)}
                    bookmarks={bookmarks}
                    onDelete={onDeleteBookmark}
                    onUpdate={onUpdateBookmark}
                />
            )}

            {showProfilePopup && (
                <ProfilePopup
                    onClose={() => setShowProfilePopup(false)}
                    profileSettings={profileSettings}
                />
            )}

            {showTOC && (
                <TableOfContentsPopup
                    onClose={() => setShowTOC(false)}
                    settings={settings.tocSettings}
                    addSearchOnTOC={otherSetup.toolbar?.addSearchOnTOC ?? true}
                    onNavigate={(pageIndex) => {
                        onPageClick(pageIndex);
                        setShowTOC(false);
                    }}
                />
            )}

            {showSharePopup && (
                <FlipbookSharePopup
                    onClose={() => setShowSharePopup(false)}
                    bookName={bookName}
                    url={window.location.href}
                />
            )}

            {showGalleryPopup && (
                <GalleryPopup
                    onClose={() => setShowGalleryPopup(false)}
                    settings={otherSetup.gallery}
                />
            )}            {/* Bottom Toolbar */}
            <BottomToolbar
                settings={settings}
                toolbarSettings={otherSetup.toolbar}
                showBookmarkMenu={showBookmarkMenu}
                setShowBookmarkMenu={setShowBookmarkMenuMemo}
                showMoreMenu={showMoreMenu}
                setShowMoreMenu={setShowMoreMenuMemo}
                showThumbnailBar={showThumbnailBar}
                setShowThumbnailBar={setShowThumbnailBarMemo}
                showTOC={showTOC}
                setShowTOC={setShowTOCMemo}
                setShowAddNotesPopup={setShowAddNotesPopupMemo}
                setShowNotesViewer={setShowNotesViewerMemo}
                setShowAddBookmarkPopup={setShowAddBookmarkPopupMemo}
                setShowProfilePopup={setShowProfilePopup}
                activePage={currentPage}
                totalPages={pages.length}
                isPlaying={isAutoFlipping}
                setIsPlaying={setIsPlaying}
                onPageClick={onPageClick}
                zoomValue={currentZoom}
                onZoomIn={handleZoomIn}
                onZoomOut={handleZoomOut}
                maxZoom={otherSetup.toolbar?.maximumZoom || 4}
                onFullScreen={handleFullScreen}
                onShare={handleShare}
                onDownload={handleDownload}
            />

            {/* Export Popup Component */}
            <Export
                isOpen={showExportPopup}
                onClose={() => setShowExportPopup(false)}
                hideButton={true}
                pages={pages}
                bookName={bookName}
                currentPage={currentPage}
            />

            {/* Gallery Popup — opens on first upload & via Navbar Gallery button.
                Settings are always live-synced from otherSetupSettings.gallery. */}
            {showGalleryPopup && galleryImages.length > 0 && (
                <GalleryPopup 
                    onClose={() => setShowGalleryPopup(false)}
                    settings={gallerySettings}

                />
            )}
        </div>
    );
});

export default PreviewArea;