import { createModal } from '../components/Modal';

export function showAddGroupDialog(): Promise<string | null> {
  return new Promise((resolve) => {
    const modal = createModal(`
      <div class="p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Add Group</h2>
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-1">Group Name</label>
          <input type="text" id="group-name" class="input" placeholder="Enter group name" autofocus>
        </div>
        <div class="flex justify-end gap-2">
          <button id="cancel-btn" class="btn btn-secondary">Cancel</button>
          <button id="add-btn" class="btn btn-primary">Add</button>
        </div>
      </div>
    `);

    const input = modal.getElement().querySelector('#group-name') as HTMLInputElement;
    const addBtn = modal.getElement().querySelector('#add-btn') as HTMLButtonElement;
    const cancelBtn = modal.getElement().querySelector('#cancel-btn') as HTMLButtonElement;

    const submit = () => {
      const name = input.value.trim();
      if (name) {
        modal.close(false); // Don't trigger onClose callback
        resolve(name);
      }
    };

    addBtn.addEventListener('click', submit);
    cancelBtn.addEventListener('click', () => {
      modal.close();
      resolve(null);
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        submit();
      }
    });

    modal.setOnClose(() => resolve(null));

    // Focus input
    setTimeout(() => input.focus(), 100);
  });
}
