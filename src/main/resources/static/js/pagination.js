// Pagination functionality - Sorting and pagination management

const PaginationManager = {
    currentPage: 0,
    pageSize: 20,
    sortColumn: 'uniqueId',
    sortDirection: 'ASC',
    totalPages: 5,
    totalItems: 0,
    pageSizeOptions: [20, 30, 50, 100],
    allData: [], // Store all mock data
    
    // Initialize pagination
    init() {
        this.loadDataFromAPI();
        this.attachSortListeners();
    },
    
    // Load mock data from backend API
    loadDataFromAPI() {
        const apiUrl = `/api/v1/guidance-engine/override?size=${this.pageSize}&page=${this.currentPage}&sort=${this.sortColumn}&direction=${this.sortDirection}`;
        
        fetch(apiUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log('API Response:', data);
                if (data.status === 'true' || data.status === true) {
                    this.allData = data.data.overrideList || [];
                    this.totalItems = data.data.totalItems || 0;
                    this.totalPages = data.data.totalPages || 0;
                    this.renderTable(this.allData);
                    this.renderPaginationUI(data.data);
                } else {
                    console.error('API returned error:', data.message);
                    this.loadMockDataFallback();
                }
            })
            .catch(error => {
                console.error('Error loading data from API:', error);
                // Fallback to mock data if API fails
                this.loadMockDataFallback();
            });
    },
    
    // Fallback: Load mock data locally
    loadMockDataFallback() {
        console.log('Loading fallback mock data...');
        this.allData = [];
        for (let i = 1; i <= 100; i++) {
            this.allData.push({
                uniqueId: i,
                overrideLevel: Math.floor(Math.random() * 90) + 10,
                effectiveDate: '01/01/2025',
                terminationDate: '12/31/2099',
                customerSegment: `SEG_${i}`,
                customerMarket: `MKT_${i}`,
                customerCluster: `EC_${i}`,
                itemNum: 320000 + i,
                productSubCategory: `CAT_${i}`,
                baseMargin: (Math.random() * 50).toFixed(1),
                targetMargin: (Math.random() * 50 + 10).toFixed(1),
                premiumMargin: (Math.random() * 50 + 20).toFixed(1),
                baseCost: (Math.random() * 200).toFixed(2),
                targetCost: (Math.random() * 200 + 50).toFixed(2),
                basePrice: (Math.random() * 500).toFixed(2),
                targetPrice: (Math.random() * 500 + 100).toFixed(2),
                premiumPrice: (Math.random() * 500 + 200).toFixed(2),
                unitOfMeasure: 'EA',
                reasonCode: `RC_${i}`,
                notes: `Note for record ${i}`,
                programId: `PROG_${i}`,
                userId: `USER_${i}`,
                dateUpdated: '01/15/2025',
                timeUpdated: '10:30 AM'
            });
        }
        this.totalItems = this.allData.length;
        this.updateTotalPages();
        this.renderTable(this.allData);
        this.renderPaginationUI({
            currentPage: this.currentPage,
            totalPages: this.totalPages,
            totalItems: this.totalItems,
            hasPrevious: this.currentPage > 0,
            hasNext: this.currentPage < this.totalPages - 1
        });
    },
    
    // Update total pages based on current page size
    updateTotalPages() {
        this.totalPages = Math.ceil(this.totalItems / this.pageSize);
        if (this.currentPage >= this.totalPages) {
            this.currentPage = Math.max(0, this.totalPages - 1);
        }
    },
    
    // Attach click listeners to column headers for sorting
    attachSortListeners() {
        const headers = document.querySelectorAll('th[data-column-key]');
        headers.forEach(header => {
            const columnKey = header.dataset.columnKey;
            if (columnKey && columnKey !== 'ALL') {
                header.style.cursor = 'pointer';
                header.addEventListener('click', () => {
                    this.handleSort(columnKey);
                });
            }
        });
    },
    
    // Handle column sort
    handleSort(columnKey) {
        if (this.sortColumn === columnKey) {
            // Toggle direction if same column clicked
            this.sortDirection = this.sortDirection === 'ASC' ? 'DESC' : 'ASC';
        } else {
            // New column, default to ASC
            this.sortColumn = columnKey;
            this.sortDirection = 'ASC';
        }
        this.currentPage = 0; // Reset to first page
        this.loadDataFromAPI();
        console.log(`Sorting by ${columnKey} - ${this.sortDirection}`);
        this.updateSortIndicators(columnKey);
    },
    
    // Update sort indicators on column headers
    updateSortIndicators(columnKey) {
        const headers = document.querySelectorAll('th[data-column-key]');
        headers.forEach(header => {
            header.classList.remove('sort-asc', 'sort-desc');
        });
        
        const activeHeader = document.querySelector(`th[data-column-key="${columnKey}"]`);
        if (activeHeader) {
            activeHeader.classList.add(this.sortDirection === 'ASC' ? 'sort-asc' : 'sort-desc');
        }
    },
    
    // Render table with paginated data
    renderTable(rows) {
        const tbody = document.querySelector('table tbody');
        if (!tbody) return;
        
        tbody.innerHTML = '';
        
        if (!rows || rows.length === 0) {
            tbody.innerHTML = '<tr><td colspan="26" class="empty">No data available</td></tr>';
            return;
        }
        
        rows.forEach(row => {
            const tr = document.createElement('tr');
            
            // Format dates from yyyy-mm-dd to mm/dd/yyyy
            const formatDate = (dateStr) => {
                if (!dateStr) return '';
                if (dateStr.includes('/')) return dateStr; // Already formatted
                const [year, month, day] = dateStr.split('-');
                return `${month}/${day}/${year}`;
            };
            
            tr.innerHTML = `
                <td class="checkbox-col">
                    <input type="checkbox" class="row-checkbox" name="selectedIds" value="${row.uniqueId}">
                </td>
                <td data-column-key="uniqueId">${row.uniqueId || ''}</td>
                <td data-column-key="overrideLevel">${row.overrideLevel || ''}</td>
                <td data-column-key="effectiveDate">${formatDate(row.effectiveDate)}</td>
                <td data-column-key="terminationDate">${formatDate(row.terminationDate)}</td>
                <td data-column-key="customerSegment">${row.customerSegment || ''}</td>
                <td data-column-key="customerMarket">${row.customerMarket || ''}</td>
                <td data-column-key="customerCluster">${row.customerCluster || ''}</td>
                <td data-column-key="itemNumber">${row.itemNum || ''}</td>
                <td data-column-key="productSubCategory">${row.productSubCategory || ''}</td>
                <td data-column-key="baseMargin">${row.baseMargin ? row.baseMargin + '%' : ''}</td>
                <td data-column-key="targetMargin">${row.targetMargin ? row.targetMargin + '%' : ''}</td>
                <td data-column-key="premiumMargin">${row.premiumMargin ? row.premiumMargin + '%' : ''}</td>
                <td data-column-key="baseCost">${row.baseCost || ''}</td>
                <td data-column-key="targetCost">${row.targetCost || ''}</td>
                <td data-column-key="basePrice">${row.basePrice || ''}</td>
                <td data-column-key="targetPrice">${row.targetPrice || ''}</td>
                <td data-column-key="premiumPrice">${row.premiumPrice || ''}</td>
                <td data-column-key="uom">${row.unitOfMeasure || ''}</td>
                <td data-column-key="reasonCode">${row.reasonCode || ''}</td>
                <td data-column-key="notes">${row.notes || ''}</td>
                <td data-column-key="programId">${row.programId || ''}</td>
                <td data-column-key="userId">${row.userId || ''}</td>
                <td data-column-key="dateUpdated">${row.dateUpdated || ''}</td>
                <td data-column-key="timeUpdated">${row.timeUpdated || ''}</td>
                <td class="actions-col">
                    <button class="action-btn view-btn" onclick="alert('View record ${row.uniqueId}')" title="View">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="action-btn edit-btn" onclick="alert('Edit record ${row.uniqueId}')" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn delete-btn" onclick="alert('Delete record ${row.uniqueId}')" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    },
    
    // Build pagination UI
    renderPaginationUI(data) {
        let paginationDiv = document.getElementById('paginationControls');
        
        if (!paginationDiv) {
            const gridWrapper = document.querySelector('.grid-wrapper');
            paginationDiv = document.createElement('div');
            paginationDiv.id = 'paginationControls';
            paginationDiv.className = 'pagination-controls';
            gridWrapper.parentNode.insertBefore(paginationDiv, gridWrapper.nextSibling);
        }
        
        const startRecord = this.currentPage * this.pageSize + 1;
        const endRecord = Math.min((this.currentPage + 1) * this.pageSize, this.totalItems);
        
        let html = '<div class="pagination-container">';
        html += '<div class="pagination-right">';
        
        // Rows per page
        html += '<div class="pagination-left">';
        html += '<label for="pageSizeSelect" class="pagination-label">Rows per page:</label>';
        html += '<select id="pageSizeSelect" class="pagination-select" onchange="PaginationManager.changePageSize(this.value)">';
        this.pageSizeOptions.forEach(size => {
            html += `<option value="${size}" ${size === this.pageSize ? 'selected' : ''}>${size}</option>`;
        });
        html += '</select>';
        html += '</div>';
        
        // Record info
        html += '<div class="pagination-info">';
        html += `<span>${String(startRecord).padStart(2, '0')}-${String(endRecord).padStart(2, '0')} of ${this.totalItems}</span>`;
        html += '</div>';
        
        // Navigation buttons
        html += '<div class="pagination-nav-buttons">';
        
        // Go to first page
        if (this.currentPage > 0) {
            html += `<button class="pagination-icon-btn" onclick="PaginationManager.goToFirstPage()" title="First Page">
                ⟨⟨
            </button>`;
         } else {
            html += `<button class="pagination-icon-btn" disabled title="First Page">
                ⟨⟨
            </button>`;
        }
        
        // Previous page
        if (this.currentPage > 0) {
            html += `<button class="pagination-icon-btn" onclick="PaginationManager.previousPage()" title="Previous Page">
                ⟨
            </button>`;
        } else {
            html += `<button class="pagination-icon-btn" disabled title="Previous Page">
                ⟨
            </button>`;
        }
        
        // Next page
        if (this.currentPage < this.totalPages - 1) {
            html += `<button class="pagination-icon-btn" onclick="PaginationManager.nextPage()" title="Next Page">
                ⟩
            </button>`;
        } else {
            html += `<button class="pagination-icon-btn" disabled title="Next Page">
                ⟩
            </button>`;
        }

        
        // Go to last page
        if (this.currentPage < this.totalPages - 1) {
            html += `<button class="pagination-icon-btn" onclick="PaginationManager.goToLastPage()" title="Last Page">
                ⟩⟩
            </button>`;
        } else {
            html += `<button class="pagination-icon-btn" disabled title="Last Page">
                ⟩⟩
            </button>`;
        }
        
        html += '</div>';
        html += '</div>';
        html += '</div>';
        paginationDiv.innerHTML = html;
    },
    
    // Change page size
    changePageSize(newSize) {
        this.pageSize = parseInt(newSize);
        this.currentPage = 0; // Reset to first page
        this.loadDataFromAPI();
        console.log(`Page size changed to: ${this.pageSize}`);
    },
    
    // Update pagination UI display
    updatePaginationUI() {
        const paginationDiv = document.getElementById('paginationControls');
        if (!paginationDiv) return;
        
        const startRecord = this.currentPage * this.pageSize + 1;
        const endRecord = Math.min((this.currentPage + 1) * this.pageSize, this.totalItems);
        
        let html = '<div class="pagination-container">';
        html += '<div class="pagination-right">';
        
        // Rows per page
        html += '<div class="pagination-left">';
        html += '<label for="pageSizeSelect" class="pagination-label">Rows per page:</label>';
        html += '<select id="pageSizeSelect" class="pagination-select" onchange="PaginationManager.changePageSize(this.value)">';
        this.pageSizeOptions.forEach(size => {
            html += `<option value="${size}" ${size === this.pageSize ? 'selected' : ''}>${size}</option>`;
        });
        html += '</select>';
        html += '</div>';
        
        // Record info
        html += '<div class="pagination-info">';
        html += `<span>${String(startRecord).padStart(2, '0')}-${String(endRecord).padStart(2, '0')} of ${this.totalItems}</span>`;
        html += '</div>';
        
        // Navigation buttons
        html += '<div class="pagination-nav-buttons">';
        
        // Go to first page
        if (this.currentPage > 0) {
            html += `<button class="pagination-icon-btn" onclick="PaginationManager.goToFirstPage()" title="First Page">
                ⟨⟨
            </button>`;
        } else {
            html += `<button class="pagination-icon-btn" disabled title="First Page">
                ⟨⟨
            </button>`;
        }
        
        // Previous page
        if (this.currentPage > 0) {
            html += `<button class="pagination-icon-btn" onclick="PaginationManager.previousPage()" title="Previous Page">
                ⟨
            </button>`;
        } else {
            html += `<button class="pagination-icon-btn" disabled title="Previous Page">
                ⟨
            </button>`;
        }
        
        // Next page
        if (this.currentPage < this.totalPages - 1) {
            html += `<button class="pagination-icon-btn" onclick="PaginationManager.nextPage()" title="Next Page">
                ⟩
            </button>`;
        } else {
            html += `<button class="pagination-icon-btn" disabled title="Next Page">
                ⟩
            </button>`;
        }
        
        // Go to last page
        if (this.currentPage < this.totalPages - 1) {
            html += `<button class="pagination-icon-btn" onclick="PaginationManager.goToLastPage()" title="Last Page">
                ⟩⟩
            </button>`;
        } else {
            html += `<button class="pagination-icon-btn" disabled title="Last Page">
                ⟩⟩
            </button>`;
        }
        
        html += '</div>';
        html += '</div>';
        html += '</div>';
        paginationDiv.innerHTML = html;
    },
    
    // Navigation methods
    previousPage() {
        if (this.currentPage > 0) {
            this.currentPage--;
            this.loadDataFromAPI();
            console.log(`Navigated to page: ${this.currentPage + 1}`);
        }
    },
    
    nextPage() {
        if (this.currentPage < this.totalPages - 1) {
            this.currentPage++;
            this.loadDataFromAPI();
            console.log(`Navigated to page: ${this.currentPage + 1}`);
        }
    },
    
    goToFirstPage() {
        this.currentPage = 0;
        this.loadDataFromAPI();
        console.log(`Navigated to first page`);
    },
    
    goToLastPage() {
        this.currentPage = this.totalPages - 1;
        this.loadDataFromAPI();
        console.log(`Navigated to last page`);
    },
    
    goToPage(pageNum) {
        this.currentPage = pageNum;
        this.loadDataFromAPI();
        console.log(`Navigated to page: ${this.currentPage + 1}`);
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    PaginationManager.init();
});
