export interface SearchInputConfig {
  placeholder?: string;
  debounceMs?: number;
  onSearch: (query: string) => void;
  onClear?: () => void;
}

export class SearchInput {
  private container: HTMLElement;
  private input!: HTMLInputElement;
  private clearBtn!: HTMLButtonElement;
  private debounceTimer: number | null = null;
  private config: Required<SearchInputConfig>;

  constructor(config: SearchInputConfig) {
    this.config = {
      placeholder: config.placeholder ?? 'Search...',
      debounceMs: config.debounceMs ?? 150,
      onSearch: config.onSearch,
      onClear: config.onClear ?? (() => {})
    };
    this.container = document.createElement('div');
    this.render();
  }

  private render(): void {
    this.container.className = 'relative';
    this.container.innerHTML = `
      <div class="relative">
        <svg class="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
        </svg>
        <input type="text"
               class="input pl-8 pr-8 py-1.5 text-sm w-full"
               placeholder="${this.config.placeholder}">
        <button type="button"
                class="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-gray-400 hover:text-gray-600 hidden"
                title="Clear">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>
    `;

    this.input = this.container.querySelector('input') as HTMLInputElement;
    this.clearBtn = this.container.querySelector('button') as HTMLButtonElement;

    this.attachListeners();
  }

  private attachListeners(): void {
    this.input.addEventListener('input', () => {
      this.updateClearButton();
      this.debouncedSearch();
    });

    this.input.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.clear();
        this.input.blur();
      } else if (e.key === 'Enter') {
        // Trigger immediate search
        if (this.debounceTimer !== null) {
          clearTimeout(this.debounceTimer);
          this.debounceTimer = null;
        }
        this.config.onSearch(this.input.value.trim());
      }
    });

    this.clearBtn.addEventListener('click', () => {
      this.clear();
      this.input.focus();
    });
  }

  private updateClearButton(): void {
    if (this.input.value.length > 0) {
      this.clearBtn.classList.remove('hidden');
    } else {
      this.clearBtn.classList.add('hidden');
    }
  }

  private debouncedSearch(): void {
    if (this.debounceTimer !== null) {
      clearTimeout(this.debounceTimer);
    }
    this.debounceTimer = window.setTimeout(() => {
      this.debounceTimer = null;
      this.config.onSearch(this.input.value.trim());
    }, this.config.debounceMs);
  }

  getElement(): HTMLElement {
    return this.container;
  }

  focus(): void {
    this.input.focus();
  }

  clear(): void {
    this.input.value = '';
    this.updateClearButton();
    if (this.debounceTimer !== null) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }
    this.config.onSearch('');
    this.config.onClear();
  }

  getValue(): string {
    return this.input.value.trim();
  }

  destroy(): void {
    if (this.debounceTimer !== null) {
      clearTimeout(this.debounceTimer);
    }
  }
}
