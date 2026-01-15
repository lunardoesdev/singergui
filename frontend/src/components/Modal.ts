// Base modal component for dialogs
export class Modal {
  private overlay: HTMLElement;
  private modal: HTMLElement;
  private onClose?: () => void;

  constructor() {
    // Create overlay
    this.overlay = document.createElement('div');
    this.overlay.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) {
        this.close();
      }
    });

    // Create modal container
    this.modal = document.createElement('div');
    this.modal.className = 'bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-hidden';
    this.overlay.appendChild(this.modal);

    // Handle escape key
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        this.close();
        document.removeEventListener('keydown', handleEscape);
      }
    };
    document.addEventListener('keydown', handleEscape);
  }

  setContent(html: string): void {
    this.modal.innerHTML = html;
  }

  setOnClose(callback: () => void): void {
    this.onClose = callback;
  }

  show(): void {
    document.body.appendChild(this.overlay);
  }

  close(triggerCallback: boolean = true): void {
    this.overlay.remove();
    if (triggerCallback) {
      this.onClose?.();
    }
  }

  getElement(): HTMLElement {
    return this.modal;
  }
}

// Helper to create and show a modal
export function createModal(content: string): Modal {
  const modal = new Modal();
  modal.setContent(content);
  modal.show();
  return modal;
}
