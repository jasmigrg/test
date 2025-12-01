// Grid Manager functionality - Column visibility, preferences, and drag-and-drop

const GridManager = {
    savedPreferences: {
        'default': {
            name: 'Default Preference',
            visibleColumns: [
                'uniqueId', 'overrideLevel', 'effectiveDate', 'terminationDate',
                'customerSegment', 'customerMarket', 'customerCluster', 'itemNumber',
                'productSubCategory', 'baseMargin', 'targetMargin', 'premiumMargin',
                'baseCost', 'targetCost', 'basePrice', 'targetPrice', 'premiumPrice',
                'uom', 'reasonCode', 'notes', 'programId', 'userId',
                'dateUpdated', 'timeUpdated'
            ]
        }
    },
    currentPreferenceKey: 'default',
    
    // Toggle dropdown menus
    initDropdowns() {
        const columnsToggle = document.getElementById('columnsToggle');
        const columnsMenu = document.getElementById('columnsMenu');
        const preferenceToggle = document.getElementById('preferenceToggle');
        const preferenceMenu = document.getElementById('preferenceMenu');

        // Columns dropdown
        columnsToggle?.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();

            // Close preference menu if open
            preferenceMenu?.classList.remove('show');

            // If we're about to open the columns menu, reset search/filter and checkboxes
            if (columnsMenu && !columnsMenu.classList.contains('show')) {
                const searchInput = document.getElementById('columnsSearch');
                if (searchInput) searchInput.value = '';

                const items = columnsMenu.querySelectorAll('.gm-menu-item');
                items.forEach(item => {
                    item.style.display = ''; // show all column items again
                });

                // Reset all checkboxes to match current grid visibility
                this.syncCheckboxesWithGrid();
            }

            columnsMenu?.classList.toggle('show');
        });

        // Preference dropdown
        preferenceToggle?.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            columnsMenu?.classList.remove('show');
            preferenceMenu?.classList.toggle('show');
            this.loadPreferencesList();
        });

        // Click outside to close menus
        document.addEventListener('click', (e) => {
            const clickedColumnsArea = columnsToggle?.contains(e.target) || columnsMenu?.contains(e.target);
            const clickedPreferenceArea = preferenceToggle?.contains(e.target) || preferenceMenu?.contains(e.target);
            
            if (!clickedColumnsArea) columnsMenu?.classList.remove('show');
            if (!clickedPreferenceArea) preferenceMenu?.classList.remove('show');
        });

        // Prevent menu clicks from bubbling to document
        columnsMenu?.addEventListener('click', (e) => e.stopPropagation());
        preferenceMenu?.addEventListener('click', (e) => e.stopPropagation());
    },

    // Columns dropdown – now ONLY controls checkbox state, NOT the grid
    initColumnToggle() {
        const columnsMenu = document.getElementById('columnsMenu');

        columnsMenu?.addEventListener('change', (e) => {
            if (e.target.type !== 'checkbox') return;

            const columnKey = e.target.dataset.columnKey;
            const allCheckbox = document.getElementById('columnsAll');
            const checkboxes = columnsMenu.querySelectorAll('.gm-menu-item input[type="checkbox"]');
            const columnCheckboxes = Array.from(checkboxes).filter(c => c.id !== 'columnsAll');

            if (columnKey === 'ALL') {
                // Check/uncheck all column checkboxes, but DO NOT touch grid visibility
                columnCheckboxes.forEach(cb => {
                    cb.checked = e.target.checked;
                });
            } else {
                // Update "All" checkbox state based on individual ones
                if (allCheckbox) {
                    const allChecked = columnCheckboxes.every(c => c.checked);
                    const someChecked = columnCheckboxes.some(c => c.checked);
                    allCheckbox.checked = allChecked;
                    allCheckbox.indeterminate = someChecked && !allChecked;
                }
            }

            // IMPORTANT: no this.toggleColumn(...) here
            // we only change the grid when a preference is applied
        });

        // Initialize drag and drop
        this.initDragAndDrop();
    },

    initDragAndDrop() {
        const columnsMenu = document.getElementById('columnsMenu');
        if (!columnsMenu) return;

        const menuBody = columnsMenu.querySelector('.gm-menu-body');
        const draggableItems = columnsMenu.querySelectorAll('.gm-menu-item[draggable="true"]');
        let scrollInterval = null;
        
        draggableItems.forEach(item => {
            // Remove old listeners by cloning and replacing
            const newItem = item.cloneNode(true);
            item.parentNode.replaceChild(newItem, item);
        });

        // Re-query after replacing elements
        const updatedDraggableItems = columnsMenu.querySelectorAll('.gm-menu-item[draggable="true"]');
        
        updatedDraggableItems.forEach(item => {
            item.addEventListener('dragstart', (e) => {
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('text/html', item.innerHTML);
                item.classList.add('dragging');
            });

            item.addEventListener('dragend', (e) => {
                item.classList.remove('dragging');
                updatedDraggableItems.forEach(i => i.classList.remove('drag-over'));
                if (scrollInterval) clearInterval(scrollInterval);
            });

            item.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                
                if (item !== e.target.closest('.gm-menu-item[draggable="true"]')) {
                    item.classList.add('drag-over');
                }

                // Auto-scroll functionality
                if (menuBody) {
                    const rect = menuBody.getBoundingClientRect();
                    const scrollThreshold = 50;

                    if (scrollInterval) clearInterval(scrollInterval);

                    // Scroll down if near bottom
                    if (e.clientY > rect.bottom - scrollThreshold) {
                        scrollInterval = setInterval(() => {
                            menuBody.scrollTop += 5;
                        }, 50);
                    }
                    // Scroll up if near top
                    else if (e.clientY < rect.top + scrollThreshold) {
                        scrollInterval = setInterval(() => {
                            menuBody.scrollTop -= 5;
                        }, 50);
                    }
                    else {
                        if (scrollInterval) clearInterval(scrollInterval);
                    }
                }
            });

            item.addEventListener('dragleave', (e) => {
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

    // This still controls actual grid visibility (used when applying a preference)
    toggleColumn(columnKey, show) {
        // Hide/show header cells
        const headerCells = document.querySelectorAll(`th[data-column-key="${columnKey}"]`);
        headerCells.forEach(cell => {
            cell.style.display = show ? '' : 'none';
        });

        // Hide/show data cells
        const dataCells = document.querySelectorAll(`td[data-column-key="${columnKey}"]`);
        dataCells.forEach(cell => {
            cell.style.display = show ? '' : 'none';
        });
    },

    // Kept for reference; no longer used by savePreference
    getSelectedColumns() {
        const selected = [];
        const allHeaderCells = document.querySelectorAll('th[data-column-key]');
        allHeaderCells.forEach(cell => {
            const key = cell.dataset.columnKey;
            if (key && key !== 'ALL') {
                if (cell.style.display !== 'none') {
                    selected.push(key);
                }
            }
        });
        console.log('Selected columns (from grid):', selected);
        return selected;
    },

    // Save preference based on CHECKBOXES in the Columns menu, not current grid state
    savePreference() {
        // Open the preference modal instead of prompting
        const modal = document.getElementById('preferenceModal');
        if (modal) {
            modal.classList.add('show');
            // Reset form
            document.getElementById('suggestedPreferenceName').value = '';
            document.getElementById('customPreferenceName').value = '';
            document.querySelector('input[name="preferenceType"][value="suggested"]').checked = true;
            document.getElementById('customPreferenceName').disabled = true;
            
            // Update suggestion names
            this.updateSuggestionNames();
        }
   },

    updateSuggestionNames() {
        // Get all used preference names
        const usedNames = Object.values(this.savedPreferences).map(p => p.name.toLowerCase());
        
        // Generate suggestion names, skipping used ones
        const suggestions = [];
        let counter = 1;
        
        while (suggestions.length < 3) {
            const name = `Preference ${counter}`;
            if (!usedNames.includes(name.toLowerCase())) {
                suggestions.push({ name, value: `preference-${counter}` });
            }
            counter++;
        }

        // Update suggestion links
        const suggestionList = document.querySelector('.suggestion-list');
        if (suggestionList) {
            suggestionList.innerHTML = suggestions.map(s => 
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

    savePreferenceFromModal() {
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

        // Get columns in current order from the DOM
        const menuItems = columnsMenu.querySelectorAll('.gm-menu-item[draggable="true"]');
        const visibleColumns = Array.from(menuItems)
            .filter(item => {
                const checkbox = item.querySelector('input[type="checkbox"]');
                return checkbox && checkbox.checked;
            })
            .map(item => item.dataset.columnKey);

        if (visibleColumns.length === 0) {
            this.showToast('Please select at least one column', 'error');
            return;
        }

        const key = preferenceName.toLowerCase().replace(/\s+/g, '-');

        this.savedPreferences[key] = {
            name: preferenceName,
            visibleColumns: visibleColumns,
            columnOrder: Array.from(menuItems).map(item => item.dataset.columnKey)
        };

        console.log(`Saved preference: "${preferenceName}" with ${visibleColumns.length} columns`);

        // Close the preference modal
        this.closePreferenceModal();

        // Apply the preference immediately
        this.applyPreference(this.savedPreferences[key]);
        
        // Set as current preference
        this.currentPreferenceKey = key;
        
        // Update dropdown to show this preference as selected
        const preferenceRadio = document.querySelector(`input[name="gridPreference"][value="${key}"]`);
        if (preferenceRadio) {
            preferenceRadio.checked = true;
        }

        // Show success modal with preference name
        this.showSuccessModal(preferenceName);
    },

    updateSuggestionNames() {
        // Get all used preference names
        const usedNames = Object.values(this.savedPreferences).map(p => p.name.toLowerCase());
        
        // Generate suggestion names, skipping used ones
        const suggestions = [];
        let counter = 1;
        
        while (suggestions.length < 3) {
            const name = `Preference ${counter}`;
            if (!usedNames.includes(name.toLowerCase())) {
                suggestions.push({ name, value: `preference-${counter}` });
            }
            counter++;
        }

        // Update suggestion links
        const suggestionList = document.querySelector('.suggestion-list');
        if (suggestionList) {
            suggestionList.innerHTML = suggestions.map(s => 
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

    savePreferenceFromModal() {
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

        // Get columns in current order from the DOM
        const menuItems = columnsMenu.querySelectorAll('.gm-menu-item[draggable="true"]');
        const visibleColumns = Array.from(menuItems)
            .filter(item => {
                const checkbox = item.querySelector('input[type="checkbox"]');
                return checkbox && checkbox.checked;
            })
            .map(item => item.dataset.columnKey);

        if (visibleColumns.length === 0) {
            this.showToast('Please select at least one column', 'error');
            return;
        }

        const key = preferenceName.toLowerCase().replace(/\s+/g, '-');

        this.savedPreferences[key] = {
            name: preferenceName,
            visibleColumns: visibleColumns,
            columnOrder: Array.from(menuItems).map(item => item.dataset.columnKey)
        };

        console.log(`Saved preference: "${preferenceName}" with ${visibleColumns.length} columns`);

        // Close the preference modal
        this.closePreferenceModal();

        // Apply the preference immediately
        this.applyPreference(this.savedPreferences[key]);
        
        // Set as current preference
        this.currentPreferenceKey = key;
        
        // Update dropdown to show this preference as selected
        const preferenceRadio = document.querySelector(`input[name="gridPreference"][value="${key}"]`);
        if (preferenceRadio) {
            preferenceRadio.checked = true;
        }

        // Show success modal with preference name
        this.showSuccessModal(preferenceName);
    },

    showSuccessModal(preferenceName) {
        const modal = document.getElementById('successModal');
        const message = document.getElementById('successMessage');
        if (modal && message) {
            message.textContent = `Preference "${preferenceName}" has been saved successfully!`;
            modal.classList.add('show');
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
        existingItems.forEach(item => item.remove());

        Object.keys(this.savedPreferences).forEach(key => {
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

    applySelectedPreference() {
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

        // Update current preference
        this.currentPreferenceKey = preferenceKey;
        
        // Update UI to show active state
        const preferenceMenu = document.getElementById('preferenceMenu');
        if (preferenceMenu) {
            const items = preferenceMenu.querySelectorAll('.dropdown-item');
            items.forEach(item => item.classList.remove('active'));
            const activeItem = preferenceMenu.querySelector(`label:has(input[value="${preferenceKey}"])`);
            if (activeItem) activeItem.classList.add('active');
        }

        this.applyPreference(preference);
        this.showAppliedSuccessModal(preference.name);
    },

    showAppliedSuccessModal(preferenceName) {
        const modal = document.getElementById('appliedSuccessModal');
        const message = document.getElementById('appliedSuccessMessage');
        if (modal && message) {
            message.textContent = `Preference "${preferenceName}" has been applied successfully!`;
            modal.classList.add('show');
        }
    },

    closeAppliedSuccessModal() {
        const modal = document.getElementById('appliedSuccessModal');
        if (modal) {
            modal.classList.remove('show');
        }
    },

    applyPreference(preference) {
        const visibleSet = new Set(preference.visibleColumns);
        const columnOrder = preference.columnOrder || preference.visibleColumns;

        // Make sure all menu items in Columns menu are visible (defensive)
        const columnsMenu = document.getElementById('columnsMenu');
        if (columnsMenu) {
            const items = columnsMenu.querySelectorAll('.gm-menu-item');
            items.forEach(item => {
                item.style.display = '';
            });
        }

        // Get all possible column keys (excluding checkbox column)
        const allHeaderCells = document.querySelectorAll('th[data-column-key]');
        const allColumnKeys = new Set();

        allHeaderCells.forEach(cell => {
            const key = cell.dataset.columnKey;
            if (key && key !== 'ALL') {
                allColumnKeys.add(key);
            }
        });

        // Hide/show ALL columns based on preference (DO NOT update checkboxes)
        allColumnKeys.forEach(columnKey => {
            const shouldShow = visibleSet.has(columnKey);
            this.toggleColumn(columnKey, shouldShow);
        });

        // Reorder columns in the table based on columnOrder
        if (columnOrder && columnOrder.length > 0) {
            const table = document.getElementById('OverridesTable');
            if (table) {
                const thead = table.querySelector('thead');
                const tbody = table.querySelector('tbody');

                if (thead) {
                    // Reorder header rows
                    const headerRows = thead.querySelectorAll('tr');
                    headerRows.forEach(row => {
                        this.reorderRowColumns(row, columnOrder);
                    });
                }

                if (tbody) {
                    // Reorder body rows
                    const bodyRows = tbody.querySelectorAll('tr');
                    bodyRows.forEach(row => {
                        this.reorderRowColumns(row, columnOrder);
                    });
                }
            }
        }

        console.log(`Applied preference: "${preference.name}"`);
    },

    reorderRowColumns(row, columnOrder) {
        // Get the checkbox cell (first cell, always stays first)
        const checkboxCell = row.querySelector('td.checkbox-col, th.checkbox-col');
        
        // Get the actions cell (last cell, always stays last)
        const actionsCell = row.querySelector('td.actions-col, th.actions-col');
        
        const cells = Array.from(row.querySelectorAll('td[data-column-key], th[data-column-key]'));
        
        // Create a map of column key to cell
        const cellMap = {};
        cells.forEach(cell => {
            cellMap[cell.dataset.columnKey] = cell.cloneNode(true);
        });

        // Build the new row content
        const fragment = document.createDocumentFragment();
        
        // Add checkbox cell first if it exists
        if (checkboxCell) {
            fragment.appendChild(checkboxCell.cloneNode(true));
        }

        // Add cells in the order specified
        columnOrder.forEach(key => {
            if (cellMap[key]) {
                fragment.appendChild(cellMap[key]);
            }
        });

        // Add actions cell last if it exists
        if (actionsCell) {
            fragment.appendChild(actionsCell.cloneNode(true));
        }

        // Clear the row and rebuild it
        row.innerHTML = '';
        row.appendChild(fragment);
    },

    syncCheckboxesWithGrid() {
        const columnsMenu = document.getElementById('columnsMenu');
        if (!columnsMenu) return;

        const checkboxes = columnsMenu.querySelectorAll('.gm-menu-item input[type="checkbox"]');
        const allCheckbox = document.getElementById('columnsAll');
        const menuBody = columnsMenu.querySelector('.gm-menu-body');

        // Always check all checkboxes when opening dropdown
        checkboxes.forEach(checkbox => {
            if (checkbox.id !== 'columnsAll') {
                checkbox.checked = true;
            }
        });

        // Update "All" checkbox state
        if (allCheckbox) {
            allCheckbox.checked = true;
            allCheckbox.indeterminate = false;
        }

        // Reset menu items to original order
        const defaultOrder = [
            'uniqueId', 'overrideLevel', 'effectiveDate', 'terminationDate',
            'customerSegment', 'customerMarket', 'customerCluster', 'itemNumber',
            'productSubCategory', 'baseMargin', 'targetMargin', 'premiumMargin',
            'baseCost', 'targetCost', 'basePrice', 'targetPrice', 'premiumPrice',
            'uom', 'reasonCode', 'notes', 'programId', 'userId',
            'dateUpdated', 'timeUpdated'
        ];

        if (menuBody) {
            const items = Array.from(menuBody.querySelectorAll('.gm-menu-item[draggable="true"]'));
            
            // Sort items back to default order
            items.sort((a, b) => {
                const keyA = a.dataset.columnKey;
                const keyB = b.dataset.columnKey;
                return defaultOrder.indexOf(keyA) - defaultOrder.indexOf(keyB);
            });

            // Reorder in DOM WITHOUT cloning
            items.forEach(item => {
                menuBody.appendChild(item);
            });
        }

        // Reinitialize drag and drop after resetting order
        this.initDragAndDrop();
    },

    initColumnSearch() {
        const columnsMenu = document.getElementById('columnsMenu');
        const searchInput = document.getElementById('columnsSearch');

        if (!columnsMenu || !searchInput) return;

        searchInput.addEventListener('input', () => {
            const filter = searchInput.value.toLowerCase();
            const items = columnsMenu.querySelectorAll('.gm-menu-item');

            items.forEach(item => {
                const text = item.textContent || '';
                item.style.display = text.toLowerCase().includes(filter) ? '' : 'none';
            });
        });
    },

    showToast(message, type = 'error', duration = 3000) {
        console.log('Showing toast:', message, type);
        
        // Create toast container if it doesn't exist
        let container = document.getElementById('toastContainer');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toastContainer';
            container.className = 'toast-container';
            document.body.appendChild(container);
        }

        // Create toast element
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

        // Auto-remove after duration
        setTimeout(() => {
            toast.classList.add('hide');
            setTimeout(() => {
                toast.remove();
            }, 300);
        }, duration);
    }
};