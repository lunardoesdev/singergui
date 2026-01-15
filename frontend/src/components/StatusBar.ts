export class StatusBar {
  private container: HTMLElement;
  private message: string = 'Ready';

  constructor(container: HTMLElement) {
    this.container = container;
    this.render();
  }

  setMessage(message: string): void {
    this.message = message;
    this.render();
  }

  private render(): void {
    this.container.innerHTML = `
      <div class="flex items-center justify-between px-4 py-2 bg-white border-t border-gray-200 text-sm">
        <span class="text-gray-600">${this.escapeHtml(this.message)}</span>
        <div class="flex items-center gap-4 text-gray-400">
          <span>Ctrl+C: Copy</span>
          <span>Ctrl+V: Paste</span>
          <span>Del: Delete</span>
        </div>
      </div>
    `;
  }

  private escapeHtml(str: string): string {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
}
