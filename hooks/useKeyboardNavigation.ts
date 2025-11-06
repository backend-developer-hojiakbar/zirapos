import { useState, useEffect, useCallback, RefObject } from 'react';

interface KeyboardNavigationOptions {
  enableArrowNavigation?: boolean;
  enableTabNavigation?: boolean;
  containerRef?: RefObject<HTMLElement>;
}

export const useKeyboardNavigation = (
  items: any[],
  options: KeyboardNavigationOptions = {}
) => {
  const {
    enableArrowNavigation = true,
    enableTabNavigation = true,
    containerRef
  } = options;

  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const [isKeyboardMode, setIsKeyboardMode] = useState<boolean>(false);

  // Reset focus when items change
  useEffect(() => {
    setFocusedIndex(-1);
  }, [items]);

  const moveFocus = useCallback((direction: 'up' | 'down') => {
    if (!enableArrowNavigation) return;
    
    setIsKeyboardMode(true);
    setFocusedIndex(prevIndex => {
      if (direction === 'down') {
        return prevIndex < items.length - 1 ? prevIndex + 1 : 0;
      } else {
        return prevIndex > 0 ? prevIndex - 1 : items.length - 1;
      }
    });
  }, [items.length, enableArrowNavigation]);

  const handleKeyDown = useCallback((e: Event) => {
    // Type guard to ensure we're working with a KeyboardEvent
    if (!(e instanceof KeyboardEvent)) return;
    
    // Only handle keyboard events when in keyboard mode or when Tab is pressed
    if (!isKeyboardMode && e.key !== 'Tab') return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        moveFocus('down');
        break;
      case 'ArrowUp':
        e.preventDefault();
        moveFocus('up');
        break;
      case 'Tab':
        if (enableTabNavigation) {
          setIsKeyboardMode(true);
        }
        break;
      case 'Enter':
      case ' ':
        // Allow Enter and Space to trigger default actions
        break;
      default:
        // For other keys, we might want to exit keyboard mode
        if (isKeyboardMode && e.key.length === 1) {
          setIsKeyboardMode(false);
        }
        break;
    }
  }, [moveFocus, isKeyboardMode, enableTabNavigation]);

  const handleMouseDown = useCallback(() => {
    // Exit keyboard mode when user uses mouse
    setIsKeyboardMode(false);
  }, []);

  useEffect(() => {
    const container = containerRef?.current || document;
    
    if (enableArrowNavigation || enableTabNavigation) {
      container.addEventListener('keydown', handleKeyDown as EventListener);
      container.addEventListener('mousedown', handleMouseDown);
      
      return () => {
        container.removeEventListener('keydown', handleKeyDown as EventListener);
        container.removeEventListener('mousedown', handleMouseDown);
      };
    }
  }, [handleKeyDown, handleMouseDown, enableArrowNavigation, enableTabNavigation, containerRef]);

  const resetFocus = useCallback(() => {
    setFocusedIndex(-1);
    setIsKeyboardMode(false);
  }, []);

  return {
    focusedIndex,
    isKeyboardMode,
    moveFocus,
    resetFocus
  };
};