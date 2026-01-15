import { createModal } from '../components/Modal';
import { SearchableGroupList } from '../components/SearchableGroupList';

export function showMoveToGroupDialog(): Promise<number | undefined> {
  return new Promise((resolve) => {
    let selectedGroupId: number | null = null;
    let groupList: SearchableGroupList | null = null;

    const modal = createModal(`
      <div class="p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Move to Group</h2>
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-1">Select Group</label>
          <div id="group-list-container" class="border border-gray-300 rounded-md overflow-hidden" style="height: 280px;">
          </div>
        </div>
        <div class="flex justify-end gap-2">
          <button id="cancel-btn" class="btn btn-secondary">Cancel</button>
          <button id="move-btn" class="btn btn-primary">Move</button>
        </div>
      </div>
    `);

    const container = modal.getElement().querySelector('#group-list-container') as HTMLElement;
    const moveBtn = modal.getElement().querySelector('#move-btn') as HTMLButtonElement;
    const cancelBtn = modal.getElement().querySelector('#cancel-btn') as HTMLButtonElement;

    groupList = new SearchableGroupList({
      container,
      showNoGroupOption: true,
      selectedGroupId: 0,
      maxHeight: '220px',
      onSelect: (groupId) => {
        selectedGroupId = groupId;
      }
    });

    groupList.loadGroups().then(() => {
      // Auto-focus search input after loading
      requestAnimationFrame(() => {
        groupList?.focusSearch();
      });
    });

    moveBtn.addEventListener('click', () => {
      groupList?.destroy();
      modal.close(false);
      // Return 0 for "No Group", or the actual group ID
      resolve(selectedGroupId === null ? 0 : selectedGroupId);
    });

    cancelBtn.addEventListener('click', () => {
      groupList?.destroy();
      modal.close(false);
      resolve(undefined);
    });

    modal.setOnClose(() => {
      groupList?.destroy();
      resolve(undefined);
    });
  });
}
