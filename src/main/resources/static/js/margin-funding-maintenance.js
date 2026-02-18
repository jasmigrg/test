const MarginFundingMaintenanceManager = {
  gridApi: null,
  gridElement: null,
  densityPresets: {
    comfortable: { rowHeight: 50, headerHeight: 56, floatingFiltersHeight: 38 },
    compact: { rowHeight: 40, headerHeight: 48, floatingFiltersHeight: 38 },
    spacious: { rowHeight: 60, headerHeight: 64, floatingFiltersHeight: 38 }
  },

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

  setDensity(mode) {
    if (!this.gridElement) return;
    const preset = this.densityPresets[mode] || this.densityPresets.compact;

    const densityModes = ['comfortable', 'compact', 'spacious'];
    densityModes.forEach(density => {
      this.gridElement.classList.remove(`mfi-density-${density}`);
    });
    this.gridElement.classList.add(`mfi-density-${mode}`);

    document.querySelectorAll('.mfi-view-btn[data-density]').forEach(btn => {
      btn.classList.toggle('is-active', btn.dataset.density === mode);
    });

    if (this.gridApi) {
      this.gridApi.setGridOption('rowHeight', preset.rowHeight);
      this.gridApi.setGridOption('headerHeight', preset.headerHeight);
      this.gridApi.setGridOption('floatingFiltersHeight', preset.floatingFiltersHeight);
      this.gridApi.refreshHeader();
      this.gridApi.resetRowHeights();
    }
  },

  downloadGridData() {
    if (!this.gridApi || typeof this.gridApi.exportDataAsCsv !== 'function') return;

    this.gridApi.exportDataAsCsv({
      fileName: 'margin-funding-item-maintenance.csv'
    });
  },

  initViewActions() {
    document.querySelectorAll('.mfi-view-btn[data-density]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.setDensity(btn.dataset.density);
      });
    });

    const downloadBtn = document.querySelector('.mfi-view-btn[data-action="download"]');
    if (downloadBtn) {
      downloadBtn.addEventListener('click', () => this.downloadGridData());
    }
  },

  init() {
    this.gridElement = document.getElementById('mfiGrid');

    const gridConfig = {
      gridElementId: 'mfiGrid',
      pageSize: 20,
      floatingFilter: true,
      paginationType: 'client',
      gridOptions: {
        rowData: this.buildRows(),
        rowSelection: 'multiple',
        suppressRowClickSelection: true,
        defaultColDef: {
          sortable: true,
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
          headerCheckboxSelection: true,
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
        { field: 'itemNumber', headerName: 'Item Number', minWidth: 130 },
        { field: 'itemDescription', headerName: 'Item Description', minWidth: 180 },
        { field: 'distributionNonContract', headerName: 'Distribution Fee Non-Contract %', minWidth: 220 },
        { field: 'distributionContract', headerName: 'Distribution Fee Contract %', minWidth: 200 },
        { field: 'marginFundingPercentType', headerName: 'Margin Funding Percent Type', minWidth: 220 },
        { field: 'effectiveFrom', headerName: 'Effective From', minWidth: 140 },
        { field: 'effectiveThru', headerName: 'Effective Thru', minWidth: 140 },
        { field: 'userId', headerName: 'User ID', minWidth: 120 },
        { field: 'dateUpdated', headerName: 'Date Updated', minWidth: 140 },
        { field: 'timeUpdated', headerName: 'Time Updated', minWidth: 140 },
        { field: 'workStnId', headerName: 'Work Stn ID', minWidth: 130 },
        { field: 'programId', headerName: 'Program ID', minWidth: 130 }
      ]
    };

    this.gridApi = DynamicGrid.createGrid(gridConfig);

    window.gridApi = this.gridApi;
    this.initViewActions();
    this.setDensity('compact');

    setTimeout(() => {
      if (window.gridApi && typeof GridManager !== 'undefined') {
        GridManager.init(window.gridApi, 'mfiGrid');
      }
    }, 500);
  }
};

document.addEventListener('DOMContentLoaded', () => {
  MarginFundingMaintenanceManager.init();
});
