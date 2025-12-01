// QBE (Query By Example) - Build parameters and submit to backend

const QBEFilter = {
    initQBEFiltering() {
        // Attach event listeners to QBE inputs
        const qbeInputs = document.querySelectorAll('.qbe-input');
        qbeInputs.forEach(input => {
            input.addEventListener('keypress', (e) => {
                // Submit on Enter key
                if (e.key === 'Enter') {
                    this.submitQBEFilters();
                }
            });
        });
    },

    submitQBEFilters() {
        // Build QBE parameters, preserving pagination/sort state
        const qbeParams = new URLSearchParams();

        // Add pagination and sort params from PaginationManager
        qbeParams.append('size', PaginationManager.pageSize);
        qbeParams.append('page', 0); // Reset to first page when filtering
        qbeParams.append('sort', PaginationManager.sortColumn);
        qbeParams.append('direction', PaginationManager.sortDirection);

        // Add QBE filter values
        const qbeInputs = document.querySelectorAll('.qbe-input');
        qbeInputs.forEach(input => {
            const value = input.value.trim();
            if (value) {
                // Use the input name as-is (e.g., "qbe.overrideLevel" or "qbe.effectiveDate")
                qbeParams.append(input.name.replace('qbe.', ''), value);
            }
        });

        // Submit to backend using the same API endpoint
        const queryString = qbeParams.toString();
        const apiUrl = `/api/v1/guidance-engine/override?${queryString}`;

        console.log('QBE Filter URL:', apiUrl);

        // Fetch data with QBE filters
        fetch(apiUrl)
            .then(response => response.json())
            .then(data => {
                console.log('QBE API Response:', data);
                if (data.status === 'true' || data.status === true) {
                    PaginationManager.allData = data.data.overrideList || [];
                    PaginationManager.totalItems = data.data.totalItems || 0;
                    PaginationManager.totalPages = data.data.totalPages || 0;
                    PaginationManager.currentPage = 0;
                    PaginationManager.renderTable(PaginationManager.allData);
                    PaginationManager.renderPaginationUI(data.data);
                } else {
                    console.error('QBE API error:', data.message);
                    GridManager.showToast('Filter failed', 'error');
                }
            })
            .catch(error => {
                console.error('QBE API error:', error);
                GridManager.showToast('Filter error: ' + error.message, 'error');
            });
    },

    clearQBEFilters() {
        // Clear all QBE inputs
        const qbeInputs = document.querySelectorAll('.qbe-input');
        qbeInputs.forEach(input => {
            input.value = '';
        });

        // Reload with cleared filters
        PaginationManager.currentPage = 0;
        PaginationManager.loadDataFromAPI();
    }
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    if (typeof QBEFilter !== 'undefined') {
        QBEFilter.initQBEFiltering();
    }
});
