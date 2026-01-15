import { createModal } from '../components/Modal';

export function showAddProxyDialog(): Promise<string[] | null> {
  return new Promise((resolve) => {
    const modal = createModal(`
      <div class="p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Add Proxies</h2>
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-1">Proxy Links</label>
          <textarea id="proxy-links" class="input h-48 font-mono text-sm"
                    placeholder="Paste proxy links here (one per line)&#10;&#10;Supported formats:&#10;vless://...&#10;vmess://...&#10;ss://...&#10;trojan://...&#10;socks5://...&#10;http://host:port"></textarea>
          <p id="link-count" class="text-sm text-gray-500 mt-1">0 valid links detected</p>
        </div>
        <div class="flex justify-end gap-2">
          <button id="cancel-btn" class="btn btn-secondary">Cancel</button>
          <button id="add-btn" class="btn btn-primary">Add</button>
        </div>
      </div>
    `);

    const textarea = modal.getElement().querySelector('#proxy-links') as HTMLTextAreaElement;
    const countLabel = modal.getElement().querySelector('#link-count') as HTMLParagraphElement;
    const addBtn = modal.getElement().querySelector('#add-btn') as HTMLButtonElement;
    const cancelBtn = modal.getElement().querySelector('#cancel-btn') as HTMLButtonElement;

    const protocols = ['vless://', 'vmess://', 'ss://', 'trojan://', 'socks://', 'socks5://'];

    const isValidLink = (link: string): boolean => {
      const lowered = link.toLowerCase();
      // Check standard proxy protocols
      if (protocols.some(p => lowered.startsWith(p))) return true;
      // Check HTTP proxy (has port, no path)
      if (lowered.startsWith('http://') || lowered.startsWith('https://')) {
        try {
          const url = new URL(link);
          return url.port !== '' && (url.pathname === '' || url.pathname === '/');
        } catch {
          return false;
        }
      }
      return false;
    };

    const parseLinks = (): string[] => {
      const lines = textarea.value.split('\n');
      return lines
        .map(l => l.trim())
        .filter(l => l && isValidLink(l));
    };

    // Update count on input
    textarea.addEventListener('input', () => {
      const links = parseLinks();
      countLabel.textContent = `${links.length} valid link${links.length !== 1 ? 's' : ''} detected`;
    });

    addBtn.addEventListener('click', () => {
      const links = parseLinks();
      if (links.length > 0) {
        modal.close(false);
        resolve(links);
      }
    });

    cancelBtn.addEventListener('click', () => {
      modal.close(false);
      resolve(null);
    });

    modal.setOnClose(() => resolve(null));

    // Focus textarea
    setTimeout(() => textarea.focus(), 100);
  });
}
