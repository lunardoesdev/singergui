import { createModal } from '../components/Modal';

interface SubscriptionResult {
  url: string;
  name: string;
}

export function showAddSubscriptionDialog(): Promise<SubscriptionResult | null> {
  return new Promise((resolve) => {
    const modal = createModal(`
      <div class="p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Add Subscription</h2>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Subscription URL</label>
            <input type="url" id="sub-url" class="input"
                   placeholder="https://example.com/subscription.txt" autofocus>
            <p class="text-sm text-gray-500 mt-1">URL to a subscription file containing proxy links</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Name (optional)</label>
            <input type="text" id="sub-name" class="input" placeholder="My Subscription">
          </div>
        </div>
        <div class="flex justify-end gap-2 mt-6">
          <button id="cancel-btn" class="btn btn-secondary">Cancel</button>
          <button id="add-btn" class="btn btn-primary">Add</button>
        </div>
      </div>
    `);

    const urlInput = modal.getElement().querySelector('#sub-url') as HTMLInputElement;
    const nameInput = modal.getElement().querySelector('#sub-name') as HTMLInputElement;
    const addBtn = modal.getElement().querySelector('#add-btn') as HTMLButtonElement;
    const cancelBtn = modal.getElement().querySelector('#cancel-btn') as HTMLButtonElement;

    const isValidSubscriptionUrl = (url: string): boolean => {
      try {
        const parsed = new URL(url);
        // Must be http or https
        if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return false;
        // Should have a path (not just a proxy)
        return parsed.pathname !== '' && parsed.pathname !== '/';
      } catch {
        return false;
      }
    };

    const submit = () => {
      const url = urlInput.value.trim();
      const name = nameInput.value.trim();

      if (!isValidSubscriptionUrl(url)) {
        urlInput.classList.add('border-red-500');
        return;
      }

      modal.close(false);
      resolve({ url, name });
    };

    urlInput.addEventListener('input', () => {
      urlInput.classList.remove('border-red-500');
    });

    addBtn.addEventListener('click', submit);
    cancelBtn.addEventListener('click', () => {
      modal.close(false);
      resolve(null);
    });

    urlInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        submit();
      }
    });

    modal.setOnClose(() => resolve(null));

    // Focus input
    setTimeout(() => urlInput.focus(), 100);
  });
}
