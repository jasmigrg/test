<#-- filepath: /Users/jasmi/Desktop/Guidance-Override/src/main/resources/templates/overrides/browse.ftl -->
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Guidance Override Rules</title>
    <link rel="stylesheet" href="/css/overrides.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    
    <!-- Grid Manager and other modules - Load in specific order -->
    <script src="/js/grid-manager.js" defer></script>
    <script src="/js/row-selection.js" defer></script>
    <script src="/js/toolbar-actions.js" defer></script>
    <script src="/js/qbe-filter.js" defer></script>
    <script src="/js/pagination.js" defer></script>
    <script src="/js/override-browse.js" defer></script>
</head>
<body>
    <!-- Top Shell -->
    <header class="app-header">
        <div class="app-header-left">
            <div class="Logo">Logo</div>
            <button class="icon-btn">
                <i class="fas fa-home icon-img"></i>
            </button>
            <button class="icon-btn">
                <i class="fas fa-desktop dashboard-img"></i>
            </button>
        </div>
        <div class="app-header-center">
            <div class="search-box">
                <input type="text" placeholder="Search..."/>
                <i class="fas fa-search search-icon-img"></i>
            </div>
        </div>
        <div class="app-header-right">
            <div class="user-chip">
                <button class="icon-btn notification-btn" aria-label="Notifications">
                    <i class="fas fa-bell icon-img"></i>
                </button>
                <div class="avatar">
                    <i class="fas fa-user-circle avatar-img"></i>
                </div>
                <div class="user-text">
                    <div class="user-name">User Name</div>
                    <div class="user-role">Role 01</div>
                </div>
            </div>
        </div>
    </header>

    <div class="app-shell">
        <nav class="side-nav" id="sideNav">
            <button type="button" class="side-nav-toggle">
                <i class="fas fa-bars side-nav-icon"></i>
            </button>
            <button class="side-nav-item active" aria-label="Overview">
                <i class="fas fa-star side-nav-icon"></i>
            </button>
            <button class="side-nav-item">
                <i class="fas fa-search side-nav-icon"></i>
            </button>
            <button class="side-nav-item">
                <i class="fas fa-clipboard-list side-nav-icon"></i>
            </button>
        </nav>

        <main class="content">
            <div class="content-card">
                <section class="toolbar">
                    <div class="toolbar-left">
                        <h1 class="page-title">Override Guidance UI</h1>
                    </div>
                    <div class="toolbar-right">
                        <button class="btn secondary" type="button" onclick="closeWindow()">
                            <i class="fas fa-times btn-icon"></i>Close Window
                        </button>
                        <button class="btn secondary" type="button" onclick="QBEFilter.clearQBEFilters()">
                            <i class="fas fa-redo btn-icon"></i>Clear
                        </button>
                        <button class="btn secondary" type="button" onclick="QBEFilter.submitQBEFilters()">
                            <i class="fas fa-search btn-icon"></i>Find
                        </button>
                        <button class="btn secondary" type="button" onclick="importOverrides()">
                            <i class="fas fa-file-import btn-icon"></i>Import
                        </button>
                        <button class="btn primary" type="button" onclick="exportOverrides()">
                            <i class="fas fa-file-export btn-icon"></i>Export
                        </button>
                        <button class="btn primary" type="button" onclick="saveOverrides()">
                            <i class="fas fa-save btn-icon"></i>Save
                        </button>
                    </div>
                </section>

                <section class="grid-manager-section grid-manager-bar">
                    <div class="grid-manager-row">
                        <span class="grid-manager-title">Grid Manager :</span>
                        <div class="grid-manager-group">
                            <span class="grid-manager-label">Columns :</span>
                            <div class="gm-dropdown dropdown">
                                <button type="button" id="columnsToggle" class="gm-toggle dropdown-toggle">
                                    Select Columns
                                </button>
                                <div class="gm-menu dropdown-menu" id="columnsMenu">
                                    <div class="gm-menu-header">
                                        <input type="text" id="columnsSearch" placeholder="Search columns" />
                                    </div>
                                    <div class="gm-menu-body">
                                        <label class="gm-menu-item">
                                            <input type="checkbox" id="columnsAll" data-column-key="ALL" />
                                            <span>All</span>
                                        </label>
                                        <label class="gm-menu-item" draggable="true" data-column-key="uniqueId">
                                            <input type="checkbox" data-column-key="uniqueId" checked>
                                            <span>Unique ID</span>
                                            <span class="drag-handle"><i class="fas fa-grip-vertical"></i></span>
                                        </label>
                                        <label class="gm-menu-item" draggable="true" data-column-key="overrideLevel">
                                            <input type="checkbox" data-column-key="overrideLevel" checked>
                                            <span>Override Level</span>
                                            <span class="drag-handle"><i class="fas fa-grip-vertical"></i></span>
                                        </label>
                                        <label class="gm-menu-item" draggable="true" data-column-key="effectiveDate">
                                            <input type="checkbox" data-column-key="effectiveDate" checked>
                                            <span>Effective Date</span>
                                            <span class="drag-handle"><i class="fas fa-grip-vertical"></i></span>
                                        </label>
                                        <label class="gm-menu-item" draggable="true" data-column-key="terminationDate">
                                            <input type="checkbox" data-column-key="terminationDate" checked>
                                            <span>Termination Date</span>
                                            <span class="drag-handle"><i class="fas fa-grip-vertical"></i></span>
                                        </label>
                                        <label class="gm-menu-item" draggable="true" data-column-key="customerSegment">
                                            <input type="checkbox" data-column-key="customerSegment" checked>
                                            <span>Customer Segment</span>
                                            <span class="drag-handle"><i class="fas fa-grip-vertical"></i></span>
                                        </label>
                                        <label class="gm-menu-item" draggable="true" data-column-key="customerMarket">
                                            <input type="checkbox" data-column-key="customerMarket" checked>
                                            <span>Customer Market</span>
                                            <span class="drag-handle"><i class="fas fa-grip-vertical"></i></span>
                                        </label>
                                        <label class="gm-menu-item" draggable="true" data-column-key="customerCluster">
                                            <input type="checkbox" data-column-key="customerCluster" checked>
                                            <span>Customer Cluster</span>
                                            <span class="drag-handle"><i class="fas fa-grip-vertical"></i></span>
                                        </label>
                                        <label class="gm-menu-item" draggable="true" data-column-key="itemNumber">
                                            <input type="checkbox" data-column-key="itemNumber" checked>
                                            <span>Item #</span>
                                            <span class="drag-handle"><i class="fas fa-grip-vertical"></i></span>
                                        </label>
                                        <label class="gm-menu-item" draggable="true" data-column-key="productSubCategory">
                                            <input type="checkbox" data-column-key="productSubCategory" checked>
                                            <span>Product Sub Category</span>
                                            <span class="drag-handle"><i class="fas fa-grip-vertical"></i></span>
                                        </label>
                                        <label class="gm-menu-item" draggable="true" data-column-key="baseMargin">
                                            <input type="checkbox" data-column-key="baseMargin" checked>
                                            <span>Base Margin</span>
                                            <span class="drag-handle"><i class="fas fa-grip-vertical"></i></span>
                                        </label>
                                        <label class="gm-menu-item" draggable="true" data-column-key="targetMargin">
                                            <input type="checkbox" data-column-key="targetMargin" checked>
                                            <span>Target Margin</span>
                                            <span class="drag-handle"><i class="fas fa-grip-vertical"></i></span>
                                        </label>
                                        <label class="gm-menu-item" draggable="true" data-column-key="premiumMargin">
                                            <input type="checkbox" data-column-key="premiumMargin" checked>
                                            <span>Premium Margin</span>
                                            <span class="drag-handle"><i class="fas fa-grip-vertical"></i></span>
                                        </label>
                                        <label class="gm-menu-item" draggable="true" data-column-key="baseCost">
                                            <input type="checkbox" data-column-key="baseCost" checked>
                                            <span>Base Cost</span>
                                            <span class="drag-handle"><i class="fas fa-grip-vertical"></i></span>
                                        </label>
                                        <label class="gm-menu-item" draggable="true" data-column-key="targetCost">
                                            <input type="checkbox" data-column-key="targetCost" checked>
                                            <span>Target Cost</span>
                                            <span class="drag-handle"><i class="fas fa-grip-vertical"></i></span>
                                        </label>
                                        <label class="gm-menu-item" draggable="true" data-column-key="basePrice">
                                            <input type="checkbox" data-column-key="basePrice" checked>
                                            <span>Base Price</span>
                                            <span class="drag-handle"><i class="fas fa-grip-vertical"></i></span>
                                        </label>
                                        <label class="gm-menu-item" draggable="true" data-column-key="targetPrice">
                                            <input type="checkbox" data-column-key="targetPrice" checked>
                                            <span>Target Price</span>
                                            <span class="drag-handle"><i class="fas fa-grip-vertical"></i></span>
                                        </label>
                                        <label class="gm-menu-item" draggable="true" data-column-key="premiumPrice">
                                            <input type="checkbox" data-column-key="premiumPrice" checked>
                                            <span>Premium Price</span>
                                            <span class="drag-handle"><i class="fas fa-grip-vertical"></i></span>
                                        </label>
                                        <label class="gm-menu-item" draggable="true" data-column-key="uom">
                                            <input type="checkbox" data-column-key="uom" checked>
                                            <span>Unit of Measure</span>
                                            <span class="drag-handle"><i class="fas fa-grip-vertical"></i></span>
                                        </label>
                                        <label class="gm-menu-item" draggable="true" data-column-key="reasonCode">
                                            <input type="checkbox" data-column-key="reasonCode" checked>
                                            <span>Reason Code</span>
                                            <span class="drag-handle"><i class="fas fa-grip-vertical"></i></span>
                                        </label>
                                        <label class="gm-menu-item" draggable="true" data-column-key="notes">
                                            <input type="checkbox" data-column-key="notes" checked>
                                            <span>Notes</span>
                                            <span class="drag-handle"><i class="fas fa-grip-vertical"></i></span>
                                        </label>
                                        <label class="gm-menu-item" draggable="true" data-column-key="programId">
                                            <input type="checkbox" data-column-key="programId" checked>
                                            <span>Program ID</span>
                                            <span class="drag-handle"><i class="fas fa-grip-vertical"></i></span>
                                        </label>
                                        <label class="gm-menu-item" draggable="true" data-column-key="userId">
                                            <input type="checkbox" data-column-key="userId" checked>
                                            <span>User ID</span>
                                            <span class="drag-handle"><i class="fas fa-grip-vertical"></i></span>
                                        </label>
                                        <label class="gm-menu-item" draggable="true" data-column-key="dateUpdated">
                                            <input type="checkbox" data-column-key="dateUpdated" checked>
                                            <span>Date Updated</span>
                                            <span class="drag-handle"><i class="fas fa-grip-vertical"></i></span>
                                        </label>
                                        <label class="gm-menu-item" draggable="true" data-column-key="timeUpdated">
                                            <input type="checkbox" data-column-key="timeUpdated" checked>
                                            <span>Time Updated</span>
                                            <span class="drag-handle"><i class="fas fa-grip-vertical"></i></span>
                                        </label>
                                    </div>
                                    <div class="gm-menu-footer">
                                        <button type="button" class="btn btn-primary" id="savePreferenceBtn" onclick="GridManager.savePreference()">
                                            Save Preferences
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="grid-manager-group">
                            <span class="grid-manager-label">Preference :</span>
                            <div class="gm-dropdown dropdown">
                                <button type="button" id="preferenceToggle" class="gm-toggle dropdown-toggle">
                                    Select Preference
                                </button>
                                <div class="gm-menu dropdown-menu" id="preferenceMenu">
                                    <div class="gm-menu-body">
                                        <label class="dropdown-item">
                                            <input type="radio" name="gridPreference" value="default" checked/>
                                            Default Preference
                                        </label>
                                        <#--later loop preference from backend goes here-->
                                    </div>
                                    <div class="gm-menu-footer">
                                        <button type="button" class="btn btn-primary" id="applyPreferenceBtn" onclick="GridManager.applySelectedPreference()">
                                            Apply
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section class="grid-wrapper">
                    <table class="grid" id="OverridesTable">
                        <thead>
                            <tr class="header-row">
                                <th class="checkbox-col"><input type="checkbox" id="selectAllRows"></th>
                                <th data-column-key="uniqueId">Unique ID</th>
                                <th data-column-key="overrideLevel">Override Level</th>
                                <th data-column-key="effectiveDate">Effective Date</th>
                                <th data-column-key="terminationDate">Termination Date</th>
                                <th data-column-key="customerSegment">Customer Segment</th>
                                <th data-column-key="customerMarket">Customer Market</th>
                                <th data-column-key="customerCluster">Customer Cluster</th>
                                <th data-column-key="itemNumber">Item #</th>
                                <th data-column-key="productSubCategory">Product Sub Category</th>
                                <th data-column-key="baseMargin">Base Margin</th>
                                <th data-column-key="targetMargin">Target Margin</th>
                                <th data-column-key="premiumMargin">Premium Margin</th>
                                <th data-column-key="baseCost">Base Cost</th>
                                <th data-column-key="targetCost">Target Cost</th>
                                <th data-column-key="basePrice">Base Price</th>
                                <th data-column-key="targetPrice">Target Price</th>
                                <th data-column-key="premiumPrice">Premium Price</th>
                                <th data-column-key="uom">Unit of Measure</th>
                                <th data-column-key="reasonCode">Reason Code</th>
                                <th data-column-key="notes">Notes</th>
                                <th data-column-key="programId">Program ID</th>
                                <th data-column-key="userId">User ID</th>
                                <th data-column-key="dateUpdated">Date Updated</th>
                                <th data-column-key="timeUpdated">Time Updated</th>
                                <th class="actions-col">Actions</th>
                            </tr>
                            <tr class="qbe-row">
                                <th class="checkbox-col"></th>
                                <th data-column-key="uniqueId">
                                    <input name="qbe.uniqueId" value="${qbe['uniqueId']!}" class="qbe-input" title="Visual assist: unique override identifier">
                                </th>
                                <th data-column-key="overrideLevel">
                                    <input name="qbe.overrideLevel" value="${qbe['overrideLevel']!}" class="qbe-input" title="Visual assist: level of the override(10-90)">
                                </th>
                                <th data-column-key="effectiveDate">
                                    <input name="qbe.effectiveDate" value="${qbe['effectiveDate']!}" class="qbe-input" type="date" title="Visual assist: effective date">
                                </th>
                                <th data-column-key="terminationDate">
                                    <input name="qbe.terminationDate" value="${qbe['terminationDate']!}" class="qbe-input" type="date" title="Visual assist: termination date">
                                </th>
                                <th data-column-key="customerSegment">
                                    <input name="qbe.customerSegment" value="${qbe['customerSegment']!}" class="qbe-input">
                                </th>
                                <th data-column-key="customerMarket">
                                    <input name="qbe.customerMarket" value="${qbe['customerMarket']!}" class="qbe-input">
                                </th>
                                <th data-column-key="customerCluster">
                                    <input name="qbe.customerCluster" value="${qbe['customerCluster']!}" class="qbe-input">
                                </th>
                                <th data-column-key="itemNumber">
                                    <input name="qbe.itemNumber" value="${qbe['itemNumber']!}" class="qbe-input">
                                </th>
                                <th data-column-key="productSubCategory">
                                    <input name="qbe.productSubCategory" value="${qbe['productSubCategory']!}" class="qbe-input">
                                </th>
                                <th data-column-key="baseMargin">
                                    <input name="qbe.baseMargin" value="${qbe['baseMargin']!}" class="qbe-input">
                                </th>
                                <th data-column-key="targetMargin">
                                    <input name="qbe.targetMargin" value="${qbe['targetMargin']!}" class="qbe-input">
                                </th>
                                <th data-column-key="premiumMargin">
                                    <input name="qbe.premiumMargin" value="${qbe['premiumMargin']!}" class="qbe-input">
                                </th>
                                <th data-column-key="baseCost">
                                    <input name="qbe.baseCost" value="${qbe['baseCost']!}" class="qbe-input">
                                </th>
                                <th data-column-key="targetCost">
                                    <input name="qbe.targetCost" value="${qbe['targetCost']!}" class="qbe-input">
                                </th>
                                <th data-column-key="basePrice">
                                    <input name="qbe.basePrice" value="${qbe['basePrice']!}" class="qbe-input">
                                </th>
                                <th data-column-key="targetPrice">
                                    <input name="qbe.targetPrice" value="${qbe['targetPrice']!}" class="qbe-input">
                                </th>
                                <th data-column-key="premiumPrice">
                                    <input name="qbe.premiumPrice" value="${qbe['premiumPrice']!}" class="qbe-input">
                                </th>
                                <th data-column-key="uom">
                                    <input name="qbe.uom" value="${qbe['uom']!}" class="qbe-input">
                                </th>
                                <th data-column-key="reasonCode">
                                    <input name="qbe.reasonCode" value="${qbe['reasonCode']!}" class="qbe-input">
                                </th>
                                <th data-column-key="notes">
                                    <input name="qbe.notes" value="${qbe['notes']!}" class="qbe-input">
                                </th>
                                <th data-column-key="programId">
                                    <input name="qbe.programId" value="${qbe['programId']!}" class="qbe-input">
                                </th>
                                <th data-column-key="userId">
                                    <input name="qbe.userId" value="${qbe['userId']!}" class="qbe-input">
                                </th>
                                <th data-column-key="dateUpdated">
                                    <input name="qbe.dateUpdated" value="${qbe['dateUpdated']!}" class="qbe-input" type="date">
                                </th>
                                <th data-column-key="timeUpdated">
                                    <input name="qbe.timeUpdated" value="${qbe['timeUpdated']!}" class="qbe-input" placeholder="HH:MM">
                                </th>
                                <th class="actions-col"></th>
                            </tr>
                        </thead>
                        <tbody>
                            <#assign rows = rows![]>
                            <#if rows?has_content>
                                <#list rows as r>
                                    <tr>
                                        <td class="checkbox-col">
                                            <input type="checkbox" class="row-checkbox" name="selectedIds" value="${r.id}">
                                        </td>
                                        <td data-column-key="uniqueId">${r.id!}</td>
                                        <td data-column-key="overrideLevel">${r.overrideLevel!}</td>
                                        <td data-column-key="effectiveDate">${r.getEffectiveDateFormatted()!}</td>
                                        <td data-column-key="terminationDate">${r.getTerminationDateFormatted()!}</td>
                                        <td data-column-key="customerSegment">${r.customerSegment!}</td>
                                        <td data-column-key="customerMarket">${r.customerMarket!}</td>
                                        <td data-column-key="customerCluster">${r.customerCluster!}</td>
                                        <td data-column-key="itemNumber">${r.itemNumber!}</td>
                                        <td data-column-key="productSubCategory">${r.productSubCategory!}</td>
                                        <td data-column-key="baseMargin">${(r.baseMargin!0)?string("0.0")}%</td>
                                        <td data-column-key="targetMargin">${(r.targetMargin!0)?string("0.0")}%</td>
                                        <td data-column-key="premiumMargin">${(r.premiumMargin!0)?string("0.0")}%</td>
                                        <td data-column-key="baseCost">${(r.baseCost!0)?string("0.0")}</td>
                                        <td data-column-key="targetCost">${(r.targetCost!0)?string("0.0")}</td>
                                        <td data-column-key="basePrice">${(r.basePrice!0)?string("0.0")}</td>
                                        <td data-column-key="targetPrice">${(r.targetPrice!0)?string("0.0")}</td>
                                        <td data-column-key="premiumPrice">${(r.premiumPrice!0)?string("0.0")}</td>
                                        <td data-column-key="uom">${r.uom!}</td>
                                        <td data-column-key="reasonCode">${r.reasonCode!}</td>
                                        <td data-column-key="notes">${r.notes!}</td>
                                        <td data-column-key="programId">${r.programId!}</td>
                                        <td data-column-key="userId">${r.userId!}</td>
                                        <td data-column-key="dateUpdated">${r.dateUpdated!}</td>
                                        <td data-column-key="timeUpdated">${r.timeUpdated!}</td>
                                    </tr>
                                </#list>
                            <#else>
                                <tr>
                                    <td colspan="25" class="empty">No data available</td>
                                </tr>
                            </#if>
                        </tbody>
                    </table>
                </section>
            </div>
        </main>
    </div>

    <!-- Preference Dialog Modal -->
    <div id="preferenceModal" class="preference-modal">
        <div class="preference-modal-content">
            <div class="preference-modal-header">
                <h2>Save Column Preference</h2>
                <button type="button" class="preference-modal-close" onclick="GridManager.closePreferenceModal()">
                    <i class="fas fa-times"></i>
                </button>
            </div>

            <div class="preference-modal-body">
                <!-- Suggested Names Option -->
                <div class="preference-option">
                    <label class="preference-option-label">
                        <input type="radio" name="preferenceType" value="suggested" checked/>
                        <span>Save with suggested name</span>
                    </label>
                    <div class="preference-option-content">
                        <div class="preference-suggestions">
                            <span>Suggestions:</span>
                            <div class="suggestion-list">
                                <a href="#" class="suggestion-link" onclick="document.getElementById('suggestedPreferenceName').value='Preference 1'; event.preventDefault();">Preference 1</a>
                                <a href="#" class="suggestion-link" onclick="document.getElementById('suggestedPreferenceName').value='Preference 2'; event.preventDefault();">Preference 2</a>
                                <a href="#" class="suggestion-link" onclick="document.getElementById('suggestedPreferenceName').value='Preference 3'; event.preventDefault();">Preference 3</a>
                            </div>
                        </div>
                        <input type="text" id="suggestedPreferenceName" class="preference-input" placeholder="Selected preference name will appear here" readonly/>
                    </div>
                </div>

                <!-- Custom Name Option -->
                <div class="preference-option">
                    <label class="preference-option-label">
                        <input type="radio" name="preferenceType" value="custom"/>
                        <span>Save custom name</span>
                    </label>
                    <div class="preference-option-content">
                        <input type="text" id="customPreferenceName" class="preference-input" placeholder="Enter custom preference name" disabled/>
                    </div>
                </div>
            </div>

            <div class="preference-modal-footer">
                <button type="button" class="btn btn-cancel" onclick="GridManager.closePreferenceModal()">
                    Cancel
                </button>
                <button type="button" class="btn btn-save-preference" onclick="GridManager.savePreferenceFromModal()">
                    Save Preference
                </button>
            </div>
        </div>
    </div>

    <!-- Success Dialog Modal -->
    <div id="successModal" class="success-modal">
        <div class="success-modal-content">
            <div class="success-icon">
                <i class="fas fa-check"></i>
            </div>
            <h2>Preference Saved</h2>
            <p id="successMessage">Your preference has been saved successfully!</p>
            <button type="button" class="success-modal-button" onclick="GridManager.closeSuccessModal()">
                OK
            </button>
        </div>
    </div>

    <!-- Applied Preference Success Modal -->
    <div id="appliedSuccessModal" class="success-modal">
        <div class="success-modal-content">
            <div class="success-icon">
                <i class="fas fa-check"></i>
            </div>
            <h2>Preference Applied</h2>
            <p id="appliedSuccessMessage">Your preference has been applied successfully!</p>
            <button type="button" class="success-modal-button" onclick="GridManager.closeAppliedSuccessModal()">
                OK
            </button>
        </div>
    </div>

</body>
</html>