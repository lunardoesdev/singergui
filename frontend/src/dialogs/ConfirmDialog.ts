import { createModal } from '../components/Modal';

export function showConfirmDialog(title: string, message: string): Promise<boolean> {
  return new Promise((resolve) => {
    const modal = createModal(`
      <div class="p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-2">${escapeHtml(title)}</h2>
        <p class="text-gray-600 mb-6 whitespace-pre-wrap">${escapeHtml(message)}</p>
        <div class="flex justify-end gap-2">
          <button id="cancel-btn" class="btn btn-secondary">Cancel</button>
          <button id="confirm-btn" class="btn btn-danger">Confirm</button>
        </div>
      </div>
    `);

    const confirmBtn = modal.getElement().querySelector('#confirm-btn') as HTMLButtonElement;
    const cancelBtn = modal.getElement().querySelector('#cancel-btn') as HTMLButtonElement;

    confirmBtn.addEventListener('click', () => {
      modal.close(false);
      resolve(true);
    });

    cancelBtn.addEventListener('click', () => {
      modal.close(false);
      resolve(false);
    });

    modal.setOnClose(() => resolve(false));
  });
}

function escapeHtml(str: string): string {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
