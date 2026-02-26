class GtPageSelectHeader {
  init(params) {
    this.params = params;
    this.eGui = document.createElement('div');
    this.eGui.className = 'gt-header-select-all';

    this.checkbox = document.createElement('input');
    this.checkbox.type = 'checkbox';
    this.checkbox.className = 'gt-header-select-checkbox';
    this.checkbox.setAttribute('aria-label', 'Select visible rows');

    this.stopEvent = (e) => e.stopPropagation();
    this.onToggle = () => this.toggleVisibleRows();
    this.onSync = () => this.syncState();

    this.checkbox.addEventListener('click', this.stopEvent);
    this.checkbox.addEventListener('mousedown', this.stopEvent);
    this.checkbox.addEventListener('change', this.onToggle);

    this.params.api.addEventListener('selectionChanged', this.onSync);
    this.params.api.addEventListener('paginationChanged', this.onSync);
    this.params.api.addEventListener('filterChanged', this.onSync);
    this.params.api.addEventListener('sortChanged', this.onSync);

    this.eGui.appendChild(this.checkbox);
    this.syncState();
  }

  getGui() {
    return this.eGui;
  }

  toggleVisibleRows() {
    const shouldSelect = this.checkbox.checked;
    const pageSize = this.params.api.paginationGetPageSize?.() || 20;
    const currentPage = this.params.api.paginationGetCurrentPage?.() || 0;
    const from = currentPage * pageSize;
    const to = from + pageSize;

    for (let i = from; i < to; i++) {
      const rowNode = this.params.api.getDisplayedRowAtIndex(i);
      if (!rowNode) continue;
      if (rowNode.rowPinned || rowNode.group || rowNode.selectable === false) continue;
      rowNode.setSelected(shouldSelect);
    }

    this.syncState();
  }

  syncState() {
    if (!this.checkbox || !this.params?.api) return;

    const pageSize = this.params.api.paginationGetPageSize?.() || 20;
    const currentPage = this.params.api.paginationGetCurrentPage?.() || 0;
    const from = currentPage * pageSize;
    const to = from + pageSize;
    let selectableCount = 0;
    let selectedCount = 0;

    for (let i = from; i < to; i++) {
      const rowNode = this.params.api.getDisplayedRowAtIndex(i);
      if (!rowNode) continue;
      if (rowNode.rowPinned || rowNode.group || rowNode.selectable === false) continue;
      selectableCount += 1;
      if (rowNode.isSelected()) selectedCount += 1;
    }

    this.checkbox.indeterminate =
      selectableCount > 0 && selectedCount > 0 && selectedCount < selectableCount;
    this.checkbox.checked = selectableCount > 0 && selectedCount === selectableCount;
  }

  destroy() {
    if (!this.checkbox) return;
    this.checkbox.removeEventListener('click', this.stopEvent);
    this.checkbox.removeEventListener('mousedown', this.stopEvent);
    this.checkbox.removeEventListener('change', this.onToggle);

    if (this.params?.api) {
      this.params.api.removeEventListener('selectionChanged', this.onSync);
      this.params.api.removeEventListener('paginationChanged', this.onSync);
      this.params.api.removeEventListener('filterChanged', this.onSync);
      this.params.api.removeEventListener('sortChanged', this.onSync);
    }
  }
}

const KviRecommendationLogicPage = {
  activeTab: 'parameter',
  grids: {},
  toolbarScope: '.kvi-page-shell',
  gridManagerBootstrapped: false,
  gridManagerInitScheduled: false,

  init() {
    this.cacheDom();
    this.bindTabs();
    this.bindToolbarActions();
    this.initGridForTab('parameter');
    this.initGridForTab('output');
    this.syncTabUi();
    this.syncToolbarForTab();
    this.syncGridManager();
    this.applyActiveDensity();
  },

  cacheDom() {
    this.pageShell = document.querySelector('.kvi-page-shell');
    this.tabButtons = Array.from(document.querySelectorAll('.kvi-tab-btn[data-kvi-tab]'));
    this.tabPanels = Array.from(document.querySelectorAll('.kvi-tab-panel[data-kvi-panel]'));
  },

  bindTabs() {
    this.tabButtons.forEach((button) => {
      button.addEventListener('click', () => this.activateTab(button.getAttribute('data-kvi-tab')));
    });
  },

  bindToolbarActions() {
    const scope = this.pageShell;
    if (!scope) return;

    scope.querySelectorAll('.gt-action-btn[data-action="back"]').forEach((backBtn) => {
      backBtn.addEventListener('click', () => {
        window.location.assign('/');
      });
    });

    scope.querySelectorAll('.gt-action-btn[data-action="add"]').forEach((addBtn) => {
      addBtn.addEventListener('click', () => {
        const activeGrid = this.getActiveGrid();
        if (!activeGrid?.api) return;
        const row = this.activeTab === 'parameter'
          ? this.buildParameterRows(1)[0]
          : this.buildOutputRows(1)[0];
        if (typeof activeGrid.api.applyTransaction === 'function') {
          activeGrid.api.applyTransaction({ add: [row], addIndex: 0 });
        }
      });
    });

    scope.querySelectorAll('.gt-action-btn[data-action="refresh"]').forEach((refreshBtn) => {
      refreshBtn.addEventListener('click', () => {
        this.resetActiveGridState();
      });
    });

    scope.querySelectorAll('.gt-action-btn[data-action="execute"]').forEach((executeBtn) => {
      executeBtn.addEventListener('click', () => {
        const activeGrid = this.getActiveGrid();
        if (!activeGrid?.api) return;
        if (typeof activeGrid.api.applyPendingFloatingFilters === 'function') {
          activeGrid.api.applyPendingFloatingFilters();
        }
      });
    });

    scope.querySelectorAll('.gt-view-btn[data-density]').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.applyDensity(btn.dataset.density);
      });
    });

    const downloadBtn = scope.querySelector('.gt-view-btn[data-action="download"]');
    downloadBtn?.addEventListener('click', () => {
      const activeGrid = this.getActiveGrid();
      if (!activeGrid?.api || typeof activeGrid.api.exportDataAsCsv !== 'function') return;
      activeGrid.api.exportDataAsCsv({
        fileName: this.activeTab === 'parameter'
          ? 'kvi-recommendation-parameter.csv'
          : 'kvi-recommendation-output.csv'
      });
    });
  },

  activateTab(tabKey) {
    if (!tabKey || tabKey === this.activeTab) return;

    this.activeTab = tabKey;
    this.syncTabUi();
    this.syncToolbarForTab();
    this.initGridForTab(tabKey);
    this.syncGridManager();
    this.applyActiveDensity();
    this.refreshActiveGridLayout();
  },

  syncTabUi() {
    this.tabButtons.forEach((button) => {
      const isActive = button.getAttribute('data-kvi-tab') === this.activeTab;
      button.classList.toggle('is-active', isActive);
      button.setAttribute('aria-selected', String(isActive));
      button.tabIndex = isActive ? 0 : -1;
    });

    this.tabPanels.forEach((panel) => {
      const isActive = panel.getAttribute('data-kvi-panel') === this.activeTab;
      panel.classList.toggle('is-active', isActive);
      panel.hidden = !isActive;
      panel.style.display = isActive ? 'flex' : 'none';
    });
  },

  getActiveGrid() {
    return this.grids[this.activeTab] || null;
  },

  syncToolbarForTab() {
    const scope = this.pageShell;
    if (!scope) return;

    scope.querySelectorAll('.kvi-tab-action-toolbar[data-kvi-actions]').forEach((toolbar) => {
      const isActive = toolbar.getAttribute('data-kvi-actions') === this.activeTab;
      toolbar.hidden = !isActive;
      toolbar.style.display = isActive ? 'flex' : 'none';
      toolbar.setAttribute('aria-hidden', String(!isActive));
    });
  },

  getSelectedDensityMode() {
    const activeBtn = document.querySelector(`${this.toolbarScope} .gt-view-btn[data-density].is-active`);
    return activeBtn?.dataset?.density || 'compact';
  },

  applyDensity(mode) {
    const activeGrid = this.getActiveGrid();
    if (!(window.GridToolbar && activeGrid?.api && activeGrid?.element)) return;

    window.GridToolbar.setDensity(
      {
        gridApi: activeGrid.api,
        gridElement: activeGrid.element,
        densityClassPrefix: 'kvi-density',
        densityButtonSelector: `${this.toolbarScope} .gt-view-btn[data-density]`
      },
      mode || this.getSelectedDensityMode()
    );
  },

  applyActiveDensity() {
    const mode = this.getSelectedDensityMode();
    requestAnimationFrame(() => {
      this.applyDensity(mode);
      setTimeout(() => this.applyDensity(mode), 120);
    });
  },

  refreshActiveGridLayout() {
    const activeGrid = this.getActiveGrid();
    if (!activeGrid?.api || !activeGrid?.element) return;

    requestAnimationFrame(() => {
      if (typeof activeGrid.api.refreshHeader === 'function') {
        activeGrid.api.refreshHeader();
      }
      if (typeof activeGrid.api.resetRowHeights === 'function') {
        activeGrid.api.resetRowHeights();
      }
      if (typeof DynamicGrid?.scheduleSizeToFit === 'function') {
        DynamicGrid.scheduleSizeToFit(activeGrid.api, activeGrid.element);
      } else if (typeof activeGrid.api.sizeColumnsToFit === 'function') {
        try {
          activeGrid.api.sizeColumnsToFit();
        } catch (error) {
          console.warn('sizeColumnsToFit skipped on tab switch:', error);
        }
      }
    });
  },

  resetActiveGridState() {
    const activeGrid = this.getActiveGrid();
    if (!activeGrid?.api) return;

    if (typeof activeGrid.api.setFilterModel === 'function') {
      activeGrid.api.setFilterModel(null);
    }
    if (typeof activeGrid.api.setSortModel === 'function') {
      activeGrid.api.setSortModel(null);
    }
    if (typeof activeGrid.api.onFilterChanged === 'function') {
      activeGrid.api.onFilterChanged();
    }
    if (typeof activeGrid.api.paginationGoToFirstPage === 'function') {
      activeGrid.api.paginationGoToFirstPage();
    }
    if (typeof activeGrid.api.deselectAll === 'function') {
      activeGrid.api.deselectAll();
    }
    this.refreshActiveGridLayout();
  },

  initGridForTab(tabKey) {
    if (this.grids[tabKey]?.api) return;

    const configByTab = {
      parameter: {
        gridElementId: 'kviParameterGrid',
        columns: this.parameterColumns(),
        apiEndpoint: '/api/kvi-recommendation/parameter/paginated'
      },
      output: {
        gridElementId: 'kviOutputGrid',
        columns: this.outputColumns(),
        apiEndpoint: '/api/kvi-recommendation/output/paginated'
      }
    };

    const tabConfig = configByTab[tabKey];
    if (!tabConfig) return;

    const gridApi = DynamicGrid.createGrid({
      gridElementId: tabConfig.gridElementId,
      pageSize: 20,
      paginationType: 'server',
      useSpringPagination: true,
      floatingFilter: true,
      manualFilterApply: true,
      apiEndpoint: tabConfig.apiEndpoint,
      gridOptions: {
        rowSelection: 'multiple',
        suppressRowClickSelection: false,
        icons: {
          sortUnSort:
            '<span class="gt-sort-icon gt-sort-icon--none" aria-hidden="true"><svg viewBox="0 0 8 12" focusable="false"><path d="M4 1L7 4H1L4 1Z"></path><path d="M4 11L1 8H7L4 11Z"></path></svg></span>',
          sortAscending:
            '<span class="gt-sort-icon gt-sort-icon--asc" aria-hidden="true"><svg viewBox="0 0 8 12" focusable="false"><path d="M4 1L7 4H1L4 1Z"></path></svg></span>',
          sortDescending:
            '<span class="gt-sort-icon gt-sort-icon--desc" aria-hidden="true"><svg viewBox="0 0 8 12" focusable="false"><path d="M4 11L1 8H7L4 11Z"></path></svg></span>'
        },
        components: {
          gtPageSelectHeader: GtPageSelectHeader
        },
        defaultColDef: {
          sortable: true,
          unSortIcon: true,
          wrapHeaderText: true,
          autoHeaderHeight: true,
          filterParams: {
            buttons: ['apply', 'reset'],
            closeOnApply: true
          }
        }
      },
      columns: tabConfig.columns
    });

    const gridElement = document.getElementById(tabConfig.gridElementId);
    this.grids[tabKey] = {
      api: gridApi,
      element: gridElement,
      gridElementId: tabConfig.gridElementId
    };

    if (
      !this.gridManagerBootstrapped &&
      !this.gridManagerInitScheduled &&
      gridApi &&
      typeof window.GridManager !== 'undefined'
    ) {
      this.gridManagerInitScheduled = true;
      setTimeout(() => {
        try {
          if (this.gridManagerBootstrapped || typeof window.GridManager === 'undefined') return;
          const activeGrid = this.getActiveGrid();
          if (!activeGrid?.api || typeof window.GridManager === 'undefined') return;
          window.GridManager.init(activeGrid.api, activeGrid.gridElementId);
          this.gridManagerBootstrapped = true;
          this.syncGridManager();
        } finally {
          this.gridManagerInitScheduled = false;
        }
      }, 300);
    }
  },

  syncGridManager() {
    if (!this.gridManagerBootstrapped || typeof window.GridManager === 'undefined') return;

    const activeGrid = this.getActiveGrid();
    const instance = window.GridManager.currentInstance;
    if (!activeGrid?.api || !instance) return;

    instance.gridApi = activeGrid.api;
    instance.gridId = activeGrid.gridElementId;
    instance.apiConfig.screenId = `id_${activeGrid.gridElementId}`;
    instance.currentPreferenceKey = 'default';
    instance.currentPreferenceId = null;
    instance.savedPreferences = {
      default: {
        name: 'Default Preference',
        visibleColumns: []
      }
    };

    instance.populateColumnsMenu();
    instance.initializeDefaultPreference();

    if (typeof instance.fetchPreferences === 'function') {
      Promise.resolve(instance.fetchPreferences())
        .then(() => {
          if (typeof instance.loadPreferencesList === 'function') {
            instance.loadPreferencesList();
          }
        })
        .catch((error) => {
          console.warn('GridManager preference sync skipped:', error);
        });
    }
  },

  parameterColumns() {
    return [
      { field: 'effectiveDate', headerName: 'Effective Date', minWidth: 150 },
      { field: 'terminationDate', headerName: 'Termination Date', minWidth: 170 },
      { field: 'prcaMinThreshold', headerName: 'PRCA Min Threshold', minWidth: 190 },
      { field: 'dedupMethod', headerName: 'Dedup Method', minWidth: 170 }
    ];
  },

  outputColumns() {
    return [
      { field: 'prcaNum', headerName: 'PRCA Num', minWidth: 130 },
      { field: 'customerCluster', headerName: 'Customer Cluster', minWidth: 170 },
      { field: 'effectiveDate', headerName: 'Effective Date', minWidth: 150 },
      { field: 'itemNum', headerName: 'Item Num', minWidth: 130 },
      { field: 'itemFamily', headerName: 'Item Family', minWidth: 150 },
      { field: 'itemCategory', headerName: 'Item Category', minWidth: 160 },
      { field: 'itemGroup', headerName: 'Item Group', minWidth: 150 },
      { field: 'itemSubCategory', headerName: 'Item Sub Category', minWidth: 190 },
      { field: 'itemDescription', headerName: 'Item Description', minWidth: 210 },
      { field: 'itemSegmentation', headerName: 'Item Segmentation', minWidth: 180 },
      { field: 'finalBaseMargin', headerName: 'Final Base Margin', minWidth: 170 },
      { field: 'finalPremiumMargin', headerName: 'Final Premium Margin', minWidth: 190 }
    ];
  },

  buildParameterRows(count) {
    const methods = ['Highest PRCA', 'Lowest PRCA', 'Latest Effective', 'Manual Override'];
    return Array.from({ length: count }, (_, index) => ({
      effectiveDate: `0${(index % 9) + 1}/01/2026`,
      terminationDate: `12/${String(20 + (index % 8)).padStart(2, '0')}/2026`,
      prcaMinThreshold: (5 + index * 0.75).toFixed(2),
      dedupMethod: methods[index % methods.length]
    }));
  },

  buildOutputRows(count) {
    const categories = ['Surgical', 'Lab', 'Office', 'Pharma'];
    const groups = ['Group A', 'Group B', 'Group C'];
    const segments = ['Core', 'Value', 'Strategic'];

    return Array.from({ length: count }, (_, index) => ({
      prcaNum: `PRCA-${1200 + index}`,
      customerCluster: `Cluster ${String.fromCharCode(65 + (index % 5))}`,
      effectiveDate: `01/${String((index % 27) + 1).padStart(2, '0')}/2026`,
      itemNum: `${500000 + index}`,
      itemFamily: `Family ${1 + (index % 7)}`,
      itemCategory: categories[index % categories.length],
      itemGroup: groups[index % groups.length],
      itemSubCategory: `SubCat ${1 + (index % 6)}`,
      itemDescription: `KVI Recommended Item ${index + 1}`,
      itemSegmentation: segments[index % segments.length],
      finalBaseMargin: `${(12 + (index % 9) * 0.9).toFixed(2)}%`,
      finalPremiumMargin: `${(18 + (index % 11) * 0.85).toFixed(2)}%`
    }));
  }
};

document.addEventListener('DOMContentLoaded', () => {
  KviRecommendationLogicPage.init();
});
