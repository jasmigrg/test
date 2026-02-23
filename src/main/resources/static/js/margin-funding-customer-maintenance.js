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
      if (rowNode.rowPinned || rowNode.group || rowNode.selectable === false) {
        continue;
      }
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
      if (rowNode.rowPinned || rowNode.group || rowNode.selectable === false) {
        continue;
      }
      selectableCount += 1;
      if (rowNode.isSelected()) {
        selectedCount += 1;
      }
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

const MarginFundingCustomerMaintenanceManager = {
  gridApi: null,
  gridElement: null,

  buildRows() {
    return Array.from({ length: 16 }, (_, i) => ({
      uniqueKey: `UK-${1000 + i}`,
      vendorFamilyNumber: `VF-${200 + (i % 6)}`,
      vendorFamilyName: `Vendor Family ${String.fromCharCode(65 + (i % 6))}`,
      vendorProgram: `Program ${1 + (i % 4)}`,
      itemNumber: `${10001 + i}`,
      itemDescription: `Item Description ${i + 1}`,
      distributionNonContract: (5 + (i % 3)).toFixed(2),
      distributionContract: (3 + (i % 4)).toFixed(2),
      marginFundingPercentType: i % 2 === 0 ? 'Flat' : 'Tiered',
      effectiveFrom: '01/01/2026',
      effectiveThru: '12/31/2026',
      userId: `USER${100 + (i % 8)}`,
      dateUpdated: '01/15/2026',
      timeUpdated: `${String(9 + (i % 8)).padStart(2, '0')}:30:00`,
      workStnId: `WS${200 + (i % 6)}`,
      programId: `PGM-${3000 + (i % 12)}`
    }));
  },

  resetGridState() {
    if (!this.gridApi) return;
    if (typeof this.gridApi.setFilterModel === 'function') {
      this.gridApi.setFilterModel(null);
    }
    if (typeof this.gridApi.setSortModel === 'function') {
      this.gridApi.setSortModel(null);
    }
    if (typeof this.gridApi.onFilterChanged === 'function') {
      this.gridApi.onFilterChanged();
    }
    if (typeof this.gridApi.paginationGoToFirstPage === 'function') {
      this.gridApi.paginationGoToFirstPage();
    }
    if (typeof this.gridApi.deselectAll === 'function') {
      this.gridApi.deselectAll();
    }
  },

  initViewActions() {
    const backBtn = document.querySelector('.gt-action-btn[data-action="back"]');
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        window.location.assign('/');
      });
    }

    if (window.GridToolbar && this.gridApi && this.gridElement) {
      window.GridToolbar.bindDensityControls({
        gridApi: this.gridApi,
        gridElement: this.gridElement,
        defaultMode: 'compact',
        densityClassPrefix: 'mfi-density'
      });
      window.GridToolbar.bindDownloadControl({
        gridApi: this.gridApi,
      fileName: 'margin-funding-customer-maintenance.csv'
      });
    }

    const executeBtn = document.querySelector('.gt-action-btn[data-action="execute"]');
    if (executeBtn) {
      executeBtn.addEventListener('click', () => {
        if (this.gridApi && typeof this.gridApi.applyPendingFloatingFilters === 'function') {
          this.gridApi.applyPendingFloatingFilters();
        }
      });
    }

    const refreshBtn = document.querySelector('.gt-action-btn[data-action="refresh"]');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => this.resetGridState());
    }
  },

  applyDefaultDensity() {
    if (!(window.GridToolbar && this.gridApi && this.gridElement)) return;
    const activeDensityBtn = document.querySelector('.gt-view-btn[data-density].is-active');
    const defaultMode = activeDensityBtn?.dataset?.density || 'compact';
    window.GridToolbar.stabilizeDensity(
      {
        gridApi: this.gridApi,
        gridElement: this.gridElement,
        densityClassPrefix: 'mfi-density'
      },
      defaultMode
    );
  },

  init() {
    this.gridElement = document.getElementById('mfcGrid');

    const gridConfig = {
      gridElementId: 'mfcGrid',
      pageSize: 20,
      floatingFilter: true,
      manualFilterApply: true,
      paginationType: 'server',
      useSpringPagination: true,
      apiEndpoint: '/api/margin-funding/customer-maintenance/paginated',
      gridOptions: {
        rowSelection: 'multiple',
        suppressRowClickSelection: true,
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
      columns: [
        {
          field: 'select',
          headerName: '',
          checkboxSelection: true,
          headerComponent: 'gtPageSelectHeader',
          width: 44,
          minWidth: 44,
          maxWidth: 44,
          pinned: 'left',
          sortable: false,
          filter: false,
          floatingFilter: false,
          resizable: false,
          suppressSizeToFit: true
        },
        { field: 'uniqueKey', headerName: 'Unique Key', minWidth: 150 },
        { field: 'vendorFamilyNumber', headerName: 'Vendor Family Number', minWidth: 170 },
        { field: 'vendorFamilyName', headerName: 'Vendor Family Name', minWidth: 190 },
        { field: 'vendorProgram', headerName: 'Vendor Program', minWidth: 160 },
        { field: 'accountType', headerName: 'Account Type', minWidth: 140 },
        { field: 'customerNumber', headerName: 'Customer Number', minWidth: 160 },
        { field: 'customerName', headerName: 'Customer Name', minWidth: 180 },
        { field: 'ieFlag', headerName: 'I E', minWidth: 100 },
        { field: 'effectiveFrom', headerName: 'Effective From', minWidth: 140 },
        { field: 'effectiveThru', headerName: 'Effective Thru', minWidth: 140 },
        { field: 'programId', headerName: 'Program ID', minWidth: 130 },
        { field: 'workStnId', headerName: 'Work Stn ID', minWidth: 130 },
        { field: 'userId', headerName: 'User ID', minWidth: 120 }
      ]
    };

    this.gridApi = DynamicGrid.createGrid(gridConfig);

    window.gridApi = this.gridApi;
    this.initViewActions();
    if (this.gridApi && typeof this.gridApi.addEventListener === 'function') {
      this.gridApi.addEventListener('firstDataRendered', () => this.applyDefaultDensity());
    }
    this.applyDefaultDensity();
    setTimeout(() => this.applyDefaultDensity(), 150);

    setTimeout(() => {
      if (window.gridApi && typeof GridManager !== 'undefined') {
        GridManager.init(window.gridApi, 'mfcGrid');
      }
    }, 500);
  }
};

document.addEventListener('DOMContentLoaded', () => {
  MarginFundingCustomerMaintenanceManager.init();
});
