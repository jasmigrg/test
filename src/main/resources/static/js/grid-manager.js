function createGridManager(gridApi, gridId) {
  return {
    gridApi: gridApi,
    gridId: gridId,
    apiConfig: {
      baseUrl: '/api/v1/guidance-engine',
      userId: 'user', // TODO: Replace with actual logged-in user ID
      screenId: `id_${gridId}`
    },

    savedPreferences: {
      'default': {
        name: 'Default Preference',
        visibleColumns: []
      }
    },
    currentPreferenceKey: 'default',
    currentPreferenceId: null,

    async init() {
      console.log('GridManager initializing for grid:', this.gridId, 'with screenId:', this.apiConfig.screenId);

      this.populateColumnsMenu();
      this.initializeDefaultPreference();
      await this.fetchPreferences();
      this.initDropdowns();
      this.initColumnToggle();
      this.initColumnSearch();
    },

    populateColumnsMenu() {
      const columnsMenuBody = document.getElementById('columnsMenuBody');
      if (!columnsMenuBody) {
        console.error('Cannot populate columns menu: columnsMenuBody element not found');
        return;
      }

      if (!this.gridApi) {
        console.error('Cannot populate columns menu: gridApi not available for grid:', this.gridId);
        return;
      }

      const allColumns = this.gridApi.getColumns();
      if (!allColumns || allColumns.length === 0) {
        console.warn('No columns found in grid, retrying in 200ms...');
        setTimeout(() => this.populateColumnsMenu(), 200);
        return;
      }

      const dataColumns = allColumns.filter((col) => {
        const colDef = col.getColDef();
        return colDef.field && !colDef.checkboxSelection;
      });

      console.log('Populating columns menu with', dataColumns.length, 'data columns from', allColumns.length, 'total columns');

      let html = `
        <label class="gm-menu-item">
          <input type="checkbox" id="columnsAll" data-column-key="ALL" />
          <span>All</span>
        </label>
      `;

      dataColumns.forEach((column) => {
        const colDef = column.getColDef();
        const field = colDef.field;
        const headerName = colDef.headerName || field;
        const isVisible = column.isVisible();

        html += `
          <label class="gm-menu-item" draggable="true" data-column-key="${field}">
            <input type="checkbox" data-column-key="${field}" ${isVisible ? 'checked' : ''}>
            <span>${headerName}</span>
            <span class="drag-handle"><i class="fas fa-grip-vertical"></i></span>
          </label>
        `;
      });

      columnsMenuBody.innerHTML = html;
      console.log('Successfully populated columns menu for grid:', this.gridId);
    },

    initializeDefaultPreference() {
      if (!this.gridApi) return;

      const allColumns = this.gridApi.getColumns();
      const visibleFields = allColumns
        .filter((col) => col.getColDef().field && !col.getColDef().checkboxSelection)
        .map((col) => col.getColDef().field);

      this.savedPreferences['default'] = {
        name: 'Default Preference',
        visibleColumns: visibleFields
      };

      console.log('Initialized default preference with', visibleFields.length, 'columns');
    },

    async fetchPreferences() {
      // TODO: Replace localStorage with API call when grid preference API is ready
      // API endpoint: GET /api/gridColumnPreference?userId={userId}&screenId={screenId}
      // For now, using browser localStorage for client-side preference storage
      try {
        const storageKey = `gridPreferences_${this.apiConfig.screenId}_${this.apiConfig.userId}`;
        const stored = localStorage.getItem(storageKey);

        if (stored) {
          const data = JSON.parse(stored);
          const defaultPref = this.savedPreferences['default'];
          this.savedPreferences = { 'default': defaultPref };

          data.forEach((pref) => {
            const key = pref.preferenceName.toLowerCase().replace(/\s+/g, '-');

            this.savedPreferences[key] = {
              name: pref.preferenceName,
              preferenceId: pref.preferenceId,
              visibleColumns: pref.visibleColumns,
              columnOrder: pref.visibleColumns,
              currentPreference: pref.currentPreference
            };

            if (pref.currentPreference) {
              this.currentPreferenceKey = key;
              this.currentPreferenceId = pref.preferenceId;
            }
          });

          console.log('Loaded preferences from localStorage:', this.savedPreferences);

          if (this.currentPreferenceKey && this.savedPreferences[this.currentPreferenceKey]) {
            const preference = this.savedPreferences[this.currentPreferenceKey];
            if (this.isPreferenceValidForGrid(preference)) {
              console.log('Auto-applying saved preference:', preference.name);
              this.applyPreference(preference);
            } else {
              console.warn('Saved preference has invalid columns for this grid, skipping auto-apply');
            }
          }
        }
      } catch (error) {
        console.error('Error loading preferences from localStorage:', error);
      }
    },

    isPreferenceValidForGrid(preference) {
      if (!this.gridApi || !Array.isArray(preference.visibleColumns) || preference.visibleColumns.length === 0) {
        return false;
      }

      const allColumns = this.gridApi.getColumns();
      const gridFields = new Set(
        allColumns
          .filter((col) => col.getColDef().field)
          .map((col) => col.getColDef().field)
      );

      const validColumns = preference.visibleColumns.filter((col) => gridFields.has(col));
      const validPercentage = validColumns.length / preference.visibleColumns.length;
      console.log(`Preference validation: ${validColumns.length}/${preference.visibleColumns.length} columns valid (${Math.round(validPercentage * 100)}%)`);

      return validPercentage >= 0.5;
    },

    async savePreferenceToBackend(preferenceName, visibleColumns, setAsCurrent = true) {
      // TODO: Replace localStorage with API call when grid preference API is ready
      // API endpoint: POST /api/gridColumnPreference
      // Request body: { userId, preferenceName, columnDetails, screenId, currentPreference }
      // For now, using browser localStorage for client-side preference storage
      try {
        const storageKey = `gridPreferences_${this.apiConfig.screenId}_${this.apiConfig.userId}`;
        const stored = localStorage.getItem(storageKey);
        const allPreferences = stored ? JSON.parse(stored) : [];

        const preferenceId = `pref_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        if (setAsCurrent) {
          allPreferences.forEach((p) => p.currentPreference = false);
        }

        const existingIndex = allPreferences.findIndex((p) => p.preferenceName === preferenceName);
        const preference = {
          preferenceId: existingIndex >= 0 ? allPreferences[existingIndex].preferenceId : preferenceId,
          preferenceName: preferenceName,
          visibleColumns: visibleColumns,
          currentPreference: setAsCurrent
        };

        if (existingIndex >= 0) {
          allPreferences[existingIndex] = preference;
        } else {
          allPreferences.push(preference);
        }

        localStorage.setItem(storageKey, JSON.stringify(allPreferences));
        console.log('Preference saved to localStorage:', preference);
        return preference;
      } catch (error) {
        console.error('Error saving preference to localStorage:', error);
        this.showToast('Failed to save preference', 'error');
        throw error;
      }
    },

    async setCurrentPreference(preferenceId) {
      // TODO: Replace localStorage with API call when grid preference API is ready
      // API endpoint: PATCH /api/saveCurrentGridColumnPreference?userId={userId}&preferenceId={preferenceId}&screenId={screenId}
      // For now, using browser localStorage for client-side preference storage
      try {
        const storageKey = `gridPreferences_${this.apiConfig.screenId}_${this.apiConfig.userId}`;
        const stored = localStorage.getItem(storageKey);
        const allPreferences = stored ? JSON.parse(stored) : [];

        allPreferences.forEach((p) => {
          p.currentPreference = (p.preferenceId === preferenceId);
        });

        localStorage.setItem(storageKey, JSON.stringify(allPreferences));

        const updatedPref = allPreferences.find((p) => p.preferenceId === preferenceId);
        console.log('Current preference updated in localStorage:', updatedPref);
        return updatedPref;
      } catch (error) {
        console.error('Error updating current preference in localStorage:', error);
        this.showToast('Failed to update current preference', 'error');
        throw error;
      }
    },

    initDropdowns() {
      const columnsToggle = document.getElementById('columnsToggle');
      const columnsMenu = document.getElementById('columnsMenu');
      const preferenceToggle = document.getElementById('preferenceToggle');
      const preferenceMenu = document.getElementById('preferenceMenu');

      columnsToggle?.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();

        preferenceMenu?.classList.remove('show');

        if (columnsMenu && !columnsMenu.classList.contains('show')) {
          const searchInput = document.getElementById('columnsSearch');
          if (searchInput) searchInput.value = '';

          const items = columnsMenu.querySelectorAll('.gm-menu-item');
          items.forEach((item) => {
            item.style.display = '';
          });

          this.syncCheckboxesWithGrid();
        }

        columnsMenu?.classList.toggle('show');
      });

      preferenceToggle?.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();

        columnsMenu?.classList.remove('show');
        preferenceMenu?.classList.toggle('show');
        this.loadPreferencesList();
      });

      document.addEventListener('click', (e) => {
        const clickedColumnsArea = columnsToggle?.contains(e.target) || columnsMenu?.contains(e.target);
        const clickedPreferenceArea = preferenceToggle?.contains(e.target) || preferenceMenu?.contains(e.target);

        if (!clickedColumnsArea) columnsMenu?.classList.remove('show');
        if (!clickedPreferenceArea) preferenceMenu?.classList.remove('show');
      });

      columnsMenu?.addEventListener('click', (e) => e.stopPropagation());
      preferenceMenu?.addEventListener('click', (e) => e.stopPropagation());
    },

    initColumnToggle() {
      const columnsMenu = document.getElementById('columnsMenu');

      columnsMenu?.addEventListener('change', (e) => {
        if (e.target.type !== 'checkbox') return;

        const columnKey = e.target.dataset.columnKey;
        const allCheckbox = document.getElementById('columnsAll');
        const checkboxes = columnsMenu.querySelectorAll('.gm-menu-item input[type="checkbox"]');
        const columnCheckboxes = Array.from(checkboxes).filter((c) => c.id !== 'columnsAll');

        if (columnKey === 'ALL') {
          columnCheckboxes.forEach((cb) => {
            cb.checked = e.target.checked;
          });
        } else {
          if (allCheckbox) {
            const allChecked = columnCheckboxes.every((c) => c.checked);
            const someChecked = columnCheckboxes.some((c) => c.checked);
            allCheckbox.checked = allChecked;
            allCheckbox.indeterminate = someChecked && !allChecked;
          }
        }
      });

      this.initDragAndDrop();
    },

    initDragAndDrop() {
      const columnsMenu = document.getElementById('columnsMenu');
      if (!columnsMenu) return;

      const menuBody = columnsMenu.querySelector('.gm-menu-body');
      const draggableItems = columnsMenu.querySelectorAll('.gm-menu-item[draggable="true"]');
      let scrollInterval = null;

      draggableItems.forEach((item) => {
        const newItem = item.cloneNode(true);
        item.parentNode.replaceChild(newItem, item);
      });

      const updatedDraggableItems = columnsMenu.querySelectorAll('.gm-menu-item[draggable="true"]');

      updatedDraggableItems.forEach((item) => {
        item.addEventListener('dragstart', (e) => {
          e.dataTransfer.effectAllowed = 'move';
          e.dataTransfer.setData('text/html', item.innerHTML);
          item.classList.add('dragging');
        });

        item.addEventListener('dragend', () => {
          item.classList.remove('dragging');
          updatedDraggableItems.forEach((i) => i.classList.remove('drag-over'));
          if (scrollInterval) clearInterval(scrollInterval);
        });

        item.addEventListener('dragover', (e) => {
          e.preventDefault();
          e.dataTransfer.dropEffect = 'move';

          if (item !== e.target.closest('.gm-menu-item[draggable="true"]')) {
            item.classList.add('drag-over');
          }

          if (menuBody) {
            const rect = menuBody.getBoundingClientRect();
            const scrollThreshold = 50;

            if (scrollInterval) clearInterval(scrollInterval);

            if (e.clientY > rect.bottom - scrollThreshold) {
              scrollInterval = setInterval(() => {
                menuBody.scrollTop += 5;
              }, 50);
            } else if (e.clientY < rect.top + scrollThreshold) {
              scrollInterval = setInterval(() => {
                menuBody.scrollTop -= 5;
              }, 50);
            } else {
              if (scrollInterval) clearInterval(scrollInterval);
            }
          }
        });

        item.addEventListener('dragleave', () => {
          item.classList.remove('drag-over');
        });

        item.addEventListener('drop', (e) => {
          e.preventDefault();
          const columnsMenuCurrent = document.getElementById('columnsMenu');
          const draggingItem = columnsMenuCurrent.querySelector('.gm-menu-item.dragging');

          if (draggingItem && draggingItem !== item) {
            const allItems = Array.from(columnsMenuCurrent.querySelectorAll('.gm-menu-item[draggable="true"]'));
            const dragIndex = allItems.indexOf(draggingItem);
            const dropIndex = allItems.indexOf(item);

            if (dragIndex < dropIndex) {
              item.parentNode.insertBefore(draggingItem, item.nextSibling);
            } else {
              item.parentNode.insertBefore(draggingItem, item);
            }
          }

          item.classList.remove('drag-over');
          if (scrollInterval) clearInterval(scrollInterval);
        });
      });
    },

    toggleColumn(columnKey, show) {
      if (!this.gridApi) {
        console.error('Grid API not available');
        return;
      }

      this.gridApi.setColumnsVisible([columnKey], show);
      console.log(`Column ${columnKey} ${show ? 'shown' : 'hidden'}`);
    },

    getSelectedColumns() {
      if (!this.gridApi) {
        console.error('Grid API not available');
        return [];
      }

      const allColumns = this.gridApi.getColumns();
      const visibleColumns = allColumns
        .filter((col) => col.isVisible() && col.getColDef().field)
        .map((col) => col.getColDef().field);

      console.log('Selected columns (from AG-Grid):', visibleColumns);
      return visibleColumns;
    },

    savePreference() {
      const modal = document.getElementById('preferenceModal');
      if (modal) {
        modal.classList.add('show');
        document.getElementById('suggestedPreferenceName').value = '';
        document.getElementById('customPreferenceName').value = '';
        document.querySelector('input[name="preferenceType"][value="suggested"]').checked = true;
        document.getElementById('customPreferenceName').disabled = true;

        this.updateSuggestionNames();
      }
    },

    updateSuggestionNames() {
      const usedNames = Object.values(this.savedPreferences).map((p) => p.name.toLowerCase());

      const suggestions = [];
      let counter = 1;

      while (suggestions.length < 3) {
        const name = `Preference ${counter}`;
        if (!usedNames.includes(name.toLowerCase())) {
          suggestions.push({ name, value: `preference-${counter}` });
        }
        counter++;
      }

      const suggestionList = document.querySelector('.suggestion-list');
      if (suggestionList) {
        suggestionList.innerHTML = suggestions.map((s) =>
          `<a href="#" class="suggestion-link" onclick="document.getElementById('suggestedPreferenceName').value='${s.name}'; event.preventDefault();">${s.name}</a>`
        ).join('');
      }
    },

    closePreferenceModal() {
      const modal = document.getElementById('preferenceModal');
      if (modal) {
        modal.classList.remove('show');
      }
    },

    handlePreferenceTypeChange(radio) {
      const customInput = document.getElementById('customPreferenceName');
      const suggestedInput = document.getElementById('suggestedPreferenceName');

      if (radio.value === 'custom') {
        if (customInput) customInput.disabled = false;
        if (suggestedInput) suggestedInput.disabled = true;
      } else {
        if (customInput) customInput.disabled = true;
        if (suggestedInput) suggestedInput.disabled = false;
      }
    },

    async savePreferenceFromModal() {
      const preferenceType = document.querySelector('input[name="preferenceType"]:checked').value;
      let preferenceName = '';

      if (preferenceType === 'suggested') {
        const suggestedInput = document.getElementById('suggestedPreferenceName');
        const suggestedValue = suggestedInput.value.trim();

        if (!suggestedValue) {
          this.showToast('Please select a suggested preference name', 'error');
          return;
        }

        preferenceName = suggestedValue;
      } else {
        const customName = document.getElementById('customPreferenceName').value.trim();

        if (!customName) {
          this.showToast('Please enter a preference name', 'error');
          return;
        }

        preferenceName = customName;
      }

      const columnsMenu = document.getElementById('columnsMenu');
      if (!columnsMenu) return;

      const menuItems = columnsMenu.querySelectorAll('.gm-menu-item[draggable="true"]');
      const visibleColumns = Array.from(menuItems)
        .filter((item) => {
          const checkbox = item.querySelector('input[type="checkbox"]');
          return checkbox && checkbox.checked;
        })
        .map((item) => item.dataset.columnKey);

      if (visibleColumns.length === 0) {
        this.showToast('Please select at least one column', 'error');
        return;
      }

      try {
        const savedData = await this.savePreferenceToBackend(preferenceName, visibleColumns, true);

        const key = preferenceName.toLowerCase().replace(/\s+/g, '-');

        this.savedPreferences[key] = {
          name: preferenceName,
          preferenceId: savedData.preferenceId,
          visibleColumns: visibleColumns,
          columnOrder: Array.from(menuItems).map((item) => item.dataset.columnKey),
          currentPreference: true
        };

        console.log(`Saved preference: "${preferenceName}" with ${visibleColumns.length} columns`);

        this.closePreferenceModal();

        this.currentPreferenceKey = key;
        this.currentPreferenceId = savedData.preferenceId;

        this.loadPreferencesList();
        this.applyPreference(this.savedPreferences[key]);
        this.showSuccessModal(preferenceName);
      } catch (error) {
        console.error('Failed to save preference:', error);
      }
    },

    showSuccessModal(preferenceName) {
      const modal = document.getElementById('successModal');
      if (modal) {
        const message = modal.querySelector('.success-message');
        if (message) {
          message.textContent = `Preference "${preferenceName}" has been saved successfully!`;
        }
        modal.classList.add('show');

        setTimeout(() => {
          this.closeSuccessModal();
        }, 3000);
      }
    },

    closeSuccessModal() {
      const modal = document.getElementById('successModal');
      if (modal) {
        modal.classList.remove('show');
      }
    },

    loadPreferencesList() {
      const preferenceMenu = document.getElementById('preferenceMenu');
      if (!preferenceMenu) return;

      const footer = preferenceMenu.querySelector('.gm-menu-footer');
      const existingItems = preferenceMenu.querySelectorAll('.dropdown-item');
      existingItems.forEach((item) => item.remove());

      Object.keys(this.savedPreferences).forEach((key) => {
        const pref = this.savedPreferences[key];
        const isCurrentPreference = key === this.currentPreferenceKey;

        const label = document.createElement('label');
        label.className = `dropdown-item${isCurrentPreference ? ' active' : ''}`;
        label.innerHTML = `
          <input type="radio" name="gridPreference" value="${key}" ${isCurrentPreference ? 'checked' : ''}/>
          ${pref.name}
        `;

        preferenceMenu.insertBefore(label, footer);
      });
    },

    async applySelectedPreference() {
      const selected = document.querySelector('input[name="gridPreference"]:checked');
      if (!selected) {
        this.showToast('Please select a preference to apply.', 'error');
        return;
      }

      const preferenceKey = selected.value;
      const preference = this.savedPreferences[preferenceKey];

      if (!preference) {
        this.showToast('Preference not found.', 'error');
        return;
      }

      try {
        if (preferenceKey !== 'default' && preference.preferenceId) {
          await this.setCurrentPreference(preference.preferenceId);
          this.currentPreferenceId = preference.preferenceId;
        }

        this.currentPreferenceKey = preferenceKey;

        const preferenceMenu = document.getElementById('preferenceMenu');
        if (preferenceMenu) {
          const items = preferenceMenu.querySelectorAll('.dropdown-item');
          items.forEach((item) => item.classList.remove('active'));

          const activeItem = preferenceMenu.querySelector(`label:has(input[value="${preferenceKey}"])`);
          if (activeItem) activeItem.classList.add('active');
        }

        this.applyPreference(preference);
        this.showAppliedSuccessModal(preference.name);
      } catch (error) {
        console.error('Failed to apply preference:', error);
      }
    },

    showAppliedSuccessModal(preferenceName) {
      const modal = document.getElementById('appliedSuccessModal');
      if (modal) {
        const message = modal.querySelector('.success-message');
        if (message) {
          message.textContent = `Preference "${preferenceName}" has been applied successfully!`;
        }

        modal.classList.add('show');

        setTimeout(() => {
          this.closeAppliedSuccessModal();
        }, 3000);
      }
    },

    closeAppliedSuccessModal() {
      const modal = document.getElementById('appliedSuccessModal');
      if (modal) {
        modal.classList.remove('show');
      }
    },

    applyPreference(preference) {
      if (!this.gridApi) {
        console.error('Grid API not available');
        return;
      }

      const allColumns = this.gridApi.getColumns();
      const allFields = allColumns
        .map((col) => col.getColDef().field)
        .filter(Boolean);

      const requestedVisibleColumns = Array.isArray(preference.visibleColumns)
        ? preference.visibleColumns.filter((field) => allFields.includes(field))
        : [];

      const fallbackVisibleColumns = (this.savedPreferences.default?.visibleColumns || allFields)
        .filter((field) => allFields.includes(field));

      const safeVisibleColumns = requestedVisibleColumns.length > 0
        ? requestedVisibleColumns
        : fallbackVisibleColumns;

      if (requestedVisibleColumns.length === 0) {
        console.warn(
          `Preference "${preference.name}" has no valid columns for grid "${this.gridId}". Falling back to default columns.`
        );
      }

      const visibleSet = new Set(safeVisibleColumns);
      const columnOrder = preference.columnOrder || preference.visibleColumns;

      const columnsMenu = document.getElementById('columnsMenu');
      if (columnsMenu) {
        const items = columnsMenu.querySelectorAll('.gm-menu-item');
        items.forEach((item) => {
          item.style.display = '';
        });
      }

      allColumns.forEach((col) => {
        const colDef = col.getColDef();
        const field = colDef.field;

        if (field) {
          const shouldShow = visibleSet.has(field);
          this.gridApi.setColumnsVisible([field], shouldShow);
        }
      });

      if (columnOrder && columnOrder.length > 0) {
        this.reorderColumns(columnOrder);
      }

      console.log(`Applied preference: "${preference.name}"`);
    },

    reorderColumns(columnOrder) {
      if (!this.gridApi) {
        console.error('Grid API not available');
        return;
      }

      const allColumns = this.gridApi.getColumns();
      const columnMap = {};

      allColumns.forEach((col) => {
        const field = col.getColDef().field;
        if (field) {
          columnMap[field] = col;
        }
      });

      const newColumnOrder = [];

      const checkboxCol = allColumns.find((col) => !col.getColDef().field && col.getColDef().checkboxSelection);
      if (checkboxCol) newColumnOrder.push(checkboxCol);

      columnOrder.forEach((field) => {
        if (columnMap[field]) {
          newColumnOrder.push(columnMap[field]);
        }
      });

      const actionsCol = allColumns.find((col) => col.getColDef().field === 'actions');
      if (actionsCol) newColumnOrder.push(actionsCol);

      this.gridApi.moveColumns(newColumnOrder.map((col) => col.getColId()), 0);
    },

    reorderRowColumns(row, columnOrder) {
      const checkboxCell = row.querySelector('td.checkbox-col, th.checkbox-col');
      const actionsCell = row.querySelector('td.actions-col, th.actions-col');
      const cells = Array.from(row.querySelectorAll('td[data-column-key], th[data-column-key]'));
      const cellMap = {};

      cells.forEach((cell) => {
        cellMap[cell.dataset.columnKey] = cell.cloneNode(true);
      });

      const fragment = document.createDocumentFragment();

      if (checkboxCell) {
        fragment.appendChild(checkboxCell.cloneNode(true));
      }

      columnOrder.forEach((key) => {
        if (cellMap[key]) {
          fragment.appendChild(cellMap[key]);
        }
      });

      if (actionsCell) {
        fragment.appendChild(actionsCell.cloneNode(true));
      }

      row.innerHTML = '';
      row.appendChild(fragment);
    },

    applyCurrentPreference() {
      if (!this.currentPreferenceKey || !this.savedPreferences[this.currentPreferenceKey]) {
        console.log('No active preference to re-apply');
        return;
      }

      const preference = this.savedPreferences[this.currentPreferenceKey];
      console.log(`Re-applying preference: "${preference.name}"`);
      this.applyPreference(preference);
    },

    syncCheckboxesWithGrid() {
      const columnsMenu = document.getElementById('columnsMenu');
      if (!columnsMenu || !this.gridApi) return;

      const checkboxes = columnsMenu.querySelectorAll('.gm-menu-item input[type="checkbox"]');
      const allCheckbox = document.getElementById('columnsAll');

      const allColumns = this.gridApi.getColumns();
      const visibleFields = new Set(
        allColumns
          .filter((col) => col.isVisible() && col.getColDef().field)
          .map((col) => col.getColDef().field)
      );

      checkboxes.forEach((checkbox) => {
        const columnKey = checkbox.dataset.columnKey;
        if (columnKey && columnKey !== 'ALL') {
          checkbox.checked = visibleFields.has(columnKey);
        }
      });

      if (allCheckbox) {
        const dataCheckboxes = Array.from(checkboxes).filter((cb) => cb.dataset.columnKey !== 'ALL');
        const allChecked = dataCheckboxes.every((cb) => cb.checked);
        const someChecked = dataCheckboxes.some((cb) => cb.checked);

        allCheckbox.checked = allChecked;
        allCheckbox.indeterminate = someChecked && !allChecked;
      }
    },

    initColumnSearch() {
      const columnsMenu = document.getElementById('columnsMenu');
      const searchInput = document.getElementById('columnsSearch');

      if (!columnsMenu || !searchInput) return;

      searchInput.addEventListener('input', () => {
        const filter = searchInput.value.toLowerCase();
        const items = columnsMenu.querySelectorAll('.gm-menu-item');

        items.forEach((item) => {
          const text = item.textContent || '';
          item.style.display = text.toLowerCase().includes(filter) ? '' : 'none';
        });
      });
    },

    showToast(message, type = 'error', duration = 3000) {
      console.log('Showing toast:', message, type);

      let container = document.getElementById('toastContainer');
      if (!container) {
        container = document.createElement('div');
        container.id = 'toastContainer';
        container.className = 'toast-container';
        document.body.appendChild(container);
      }

      const toast = document.createElement('div');
      toast.className = `toast ${type}`;

      const iconClass = type === 'error' ? 'fa-exclamation-circle' :
        type === 'success' ? 'fa-check-circle' :
          'fa-info-circle';

      toast.innerHTML = `
        <i class="fas ${iconClass} toast-icon"></i>
        <span class="toast-message">${message}</span>
        <button class="toast-close" onclick="this.closest('.toast').remove()">
          <i class="fas fa-times"></i>
        </button>
      `;

      container.appendChild(toast);

      setTimeout(() => {
        toast.classList.add('hide');
        setTimeout(() => {
          toast.remove();
        }, 300);
      }, duration);
    }
  };
}

const GridManager = {
  instances: {},
  currentInstance: null,

  init(gridApi, gridId) {
    if (!gridId) {
      console.error('GridManager.init requires gridId parameter');
      return null;
    }

    const instance = createGridManager(gridApi, gridId);
    this.instances[gridId] = instance;
    this.currentInstance = instance;

    instance.init();
    return instance;
  },

  getInstance(gridId) {
    return this.instances[gridId];
  },

  savePreference() {
    if (this.currentInstance) {
      this.currentInstance.savePreference();
    } else {
      console.error('No active GridManager instance');
    }
  },

  closePreferenceModal() {
    if (this.currentInstance) {
      this.currentInstance.closePreferenceModal();
    }
  },

  savePreferenceFromModal() {
    if (this.currentInstance) {
      this.currentInstance.savePreferenceFromModal();
    }
  },

  applySelectedPreference() {
    if (this.currentInstance) {
      this.currentInstance.applySelectedPreference();
    }
  },

  handlePreferenceTypeChange(radio) {
    if (this.currentInstance) {
      this.currentInstance.handlePreferenceTypeChange(radio);
    }
  },

  showSuccessModal(preferenceName) {
    if (this.currentInstance) {
      this.currentInstance.showSuccessModal(preferenceName);
    }
  },

  closeSuccessModal() {
    if (this.currentInstance) {
      this.currentInstance.closeSuccessModal();
    }
  },

  showAppliedSuccessModal(preferenceName) {
    if (this.currentInstance) {
      this.currentInstance.showAppliedSuccessModal(preferenceName);
    }
  },

  closeAppliedSuccessModal() {
    if (this.currentInstance) {
      this.currentInstance.closeAppliedSuccessModal();
    }
  },

  updateSuggestionNames() {
    if (this.currentInstance) {
      this.currentInstance.updateSuggestionNames();
    }
  },

  applyCurrentPreference() {
    if (this.currentInstance) {
      this.currentInstance.applyCurrentPreference();
    }
  }
};

window.GridManager = GridManager;