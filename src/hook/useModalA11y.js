import { useEffect, useRef } from 'react';

// FYI A11 means a then 11 letters (c-c-e-s-s-i-b-i-l-i-t) then y

const FOCUSABLE_SELECTOR = [
  'a[href]', 'button:not([disabled])', 'textarea:not([disabled])',
  'input:not([disabled])', 'select:not([disabled])', '[tabindex]:not([tabindex="-1"])',
].join(', ');

// Attach the returned ref to the modal's visible panel (the actual dialog box, not the fixed-inset backdrop). 
//   1. Escape closes the modal
//   2. Focus moves into the modal the moment it opens
//   3. Tab/Shift+Tab cycle only among the modal's own focusable elements
//      (can't Tab through to whatever's behind it on the page)
//   4. Focus returns to whatever opened the modal once it closes
//
// `active` lets a modal skip trapping entirely while e.g. a nested confirm dialog is open on top of it — pass false and this hook does nothing.
//
// `closeOnEscape` (default true) controls ONLY the Escape-closes-it behavior.
export function useModalA11y(onClose, active = true, closeOnEscape = true) {
  const containerRef = useRef(null);

  // Kept current on every render without being an effect dependency.
  const closeOnEscapeRef = useRef(closeOnEscape);
  useEffect(() => {
    closeOnEscapeRef.current = closeOnEscape;
  }, [closeOnEscape]);

  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  // Mount/unmount only — deliberately does NOT depend on closeOnEscape (see
  // above) so it doesn't rerun (and re-steal focus) while the modal is open.
  useEffect(() => {
    if (!active) return;
    const container = containerRef.current;
    if (!container) return;

    const previouslyFocused = document.activeElement;

    // Focus the first focusable element inside, or the panel itself as a fallback
    const focusables = container.querySelectorAll(FOCUSABLE_SELECTOR);
    (focusables[0] ?? container).focus?.();

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (closeOnEscapeRef.current) {
          e.stopPropagation();
          onCloseRef.current?.();
        }
        return;
      }
      if (e.key !== 'Tab') return;

      const focusableEls = Array.from(container.querySelectorAll(FOCUSABLE_SELECTOR))
        .filter(el => el.offsetParent !== null); // skip hidden/disabled-away elements
      if (focusableEls.length === 0) return;

      const first = focusableEls[0];
      const last = focusableEls[focusableEls.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown, true);
    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
      previouslyFocused?.focus?.();
    };
  }, [active]);

  return containerRef;
}