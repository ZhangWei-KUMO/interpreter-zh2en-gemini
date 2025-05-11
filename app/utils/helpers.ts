/**
 * Helper functions for the translation app
 */

// Handle placeholder behavior for contentEditable elements
export function setupPlaceholders(): void {
  document.querySelectorAll('[contenteditable][data-placeholder]').forEach(el => {
    updatePlaceholderState(el as HTMLElement);
    
    el.addEventListener('focus', () => {
      if (el.textContent === (el as HTMLElement).dataset.placeholder) {
        el.textContent = '';
        el.classList.remove('placeholder-active');
      }
    });
    
    el.addEventListener('blur', () => {
      updatePlaceholderState(el as HTMLElement);
    });
  });
}

// Update placeholder state based on content
function updatePlaceholderState(element: HTMLElement): void {
  if (!element.textContent?.trim()) {
    element.textContent = element.dataset.placeholder || '';
    element.classList.add('placeholder-active');
  } else if (element.textContent === element.dataset.placeholder) {
    element.classList.add('placeholder-active');
  } else {
    element.classList.remove('placeholder-active');
  }
}

// Empty function to maintain compatibility with existing codebase
export function setupTabNavigation(): void {
  // This function is left empty as we no longer need tab navigation
  // but the function is still referenced in existing code
} 