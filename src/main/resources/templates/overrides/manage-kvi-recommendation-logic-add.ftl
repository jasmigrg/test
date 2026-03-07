<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Manage KVI Recommendation Logic and View Output Data - Add</title>
  <#assign ctx = (request.contextPath)!"" />
  <link rel="stylesheet" href="${ctx}/css/app.css">
  <link rel="stylesheet" href="${ctx}/css/grid.css">
  <link rel="stylesheet" href="${ctx}/css/grid-manager.css">
  <link rel="stylesheet" href="${ctx}/css/grid-page.css">
  <link rel="stylesheet" href="${ctx}/css/action-toolbar.css">
  <link rel="stylesheet" href="${ctx}/css/manage-kvi-recommendation-logic.css">
  <link rel="stylesheet" href="${ctx}/css/bulk-upload-modal.css">
  <link rel="stylesheet" href="${ctx}/css/bulk-upload-flow.css">
  <link rel="stylesheet" href="${ctx}/css/manage-kvi-recommendation-logic-add.css">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">

  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/ag-grid-community@31.0.1/styles/ag-grid.css">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/ag-grid-community@31.0.1/styles/ag-theme-alpine.css">

  <script>
    window.API_BASE_URL = window.API_BASE_URL || '${(apiBaseUrl!'')?js_string}';
    window.GRID_PREF_TEST_USER_ID = window.GRID_PREF_TEST_USER_ID || '${(userId!'defaultUser')?js_string}';
    window.KVI_LIST_PAGE_URL = window.KVI_LIST_PAGE_URL || '${ctx}/manage-kvi-recommendation-logic-view-output-data';
    window.BULK_UPLOAD_SCREEN_CODE = window.BULK_UPLOAD_SCREEN_CODE || 'KVI';
    window.BULK_UPLOAD_USE_MOCK = window.BULK_UPLOAD_USE_MOCK ?? true;
    window.GRID_PREF_SCREEN_ID_BY_GRID = Object.assign({}, window.GRID_PREF_SCREEN_ID_BY_GRID, {
      kviRecommendationParameterAddGrid: 'id_kvi_recommendation_logic_parameter_add'
    });
  </script>

  <script src="${ctx}/js/sidebar.js" defer></script>
  <script src="${ctx}/js/dynamic-grid.js" defer></script>
  <script src="${ctx}/js/grid-manager.js" defer></script>
  <script src="${ctx}/js/grid-toolbar.js" defer></script>
  <script src="${ctx}/js/page-toast.js" defer></script>
  <script src="${ctx}/js/bulk-upload-modal.js" defer></script>
  <script src="${ctx}/js/bulk-upload-flow.js" defer></script>
  <script src="${ctx}/js/csv-upload-utils.js" defer></script>
  <script src="${ctx}/js/grid-filter-operator-utils.js" defer></script>
  <script src="${ctx}/js/manage-kvi-recommendation-logic-add.js" defer></script>
  <script src="https://cdn.jsdelivr.net/npm/ag-grid-community@31.0.1/dist/ag-grid-community.min.js"></script>
</head>
<body class="mfi-page kvi-page kvi-add-page">
  <#include "/components/header.ftl">
  <#import "/components/sidebar.ftl" as sidebar>
  <#import "/components/page-header.ftl" as pageHeader>
  <#import "/components/grid-manager-macro.ftl" as gridManager>
  <#import "/components/action-toolbar.ftl" as actionToolbar>
  <#import "/components/grid-view-actions.ftl" as gridViewActions>

  <input type="hidden" id="currentUserId" value="${userId!'defaultUser'}" />

  <div class="app-shell">
    <@sidebar.navigation currentPath="/manage-kvi-recommendation-logic-view-output-data" />

    <main class="content">
      <div class="content-card">
        <@pageHeader.render
          title="Manage KVI Recommendation Logic and View Output Data"
          crumbs=[{"label":"Home","href":"${ctx}/"},{"label":"Manage KVI Recommendation Logic and View Output Data"}]
        />

        <#assign iconBack><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 6L9 12L15 18" /></svg></#assign>
        <#assign iconDelete><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 6H19M9 6V4H15V6M8 6V19H16V6" /></svg></#assign>
        <#assign iconSave><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4H17L20 7V20H5Z" /><path d="M8 4V10H16V4" /></svg></#assign>
        <#assign iconSubmit><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 19V5M5 12L12 5L19 12" /></svg></#assign>
        <#assign iconExecute><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="M20 20L16.5 16.5" /></svg></#assign>
        <#assign actionItems=[
          {"id":"back","label":"Back","iconOnly":true,"className":"icon-only is-back","iconHtml":iconBack},
          {"id":"delete","label":"Delete","iconHtml":iconDelete},
          {"id":"saveDraft","label":"Save Draft","iconHtml":iconSave},
          {"id":"submit","label":"Submit","iconHtml":iconSubmit},
          {"id":"execute","label":"Execute","iconHtml":iconExecute}
        ] />

        <@actionToolbar.render actions=actionItems toolbarLabel="KVI recommendation parameter add actions" rightSectionLabel="Grid manager view actions">
          <@gridManager.gridManager />
          <@gridViewActions.render defaultDensity="compact" showDownload=false />
        </@actionToolbar.render>

        <section class="kvi-batch-section bulk-upload-batch-section" aria-label="KVI upload batches">
          <div class="kvi-batch-info-row bulk-upload-batch-info-row">
            <div class="kvi-batch-info-left bulk-upload-batch-info-left">
              <span class="kvi-batch-info-icon bulk-upload-batch-info-icon" aria-hidden="true">i</span>
              <span class="kvi-batch-info-text bulk-upload-batch-info-text">You Have [X] Unfinished Uploads.</span>
            </div>
            <button type="button" class="kvi-batch-collapse-btn bulk-upload-batch-collapse-btn" id="kviBatchCollapseBtn" aria-label="Collapse unfinished uploads" aria-expanded="true">⌃</button>
          </div>
          <div id="kviBatchGrid" class="kvi-batch-grid bulk-upload-batch-grid">
            <div class="kvi-batch-columns bulk-upload-batch-columns" aria-hidden="true">
              <span class="kvi-batch-col bulk-upload-batch-col">Batch Number</span>
              <span class="kvi-batch-col bulk-upload-batch-col">Batch Status</span>
              <span class="kvi-batch-col bulk-upload-batch-col">Records Count</span>
              <span class="kvi-batch-col bulk-upload-batch-col">Error Count</span>
              <span class="kvi-batch-col bulk-upload-batch-col">Created By</span>
              <span class="kvi-batch-col bulk-upload-batch-col">Price Rule Level</span>
              <span class="kvi-batch-col bulk-upload-batch-col">Start Date</span>
              <span class="kvi-batch-col bulk-upload-batch-col">End Date</span>
              <span class="kvi-batch-col bulk-upload-batch-col">Program ID</span>
              <span class="kvi-batch-col bulk-upload-batch-col">User ID</span>
              <span class="kvi-batch-col bulk-upload-batch-col">Workstation ID</span>
              <span class="kvi-batch-col bulk-upload-batch-col">Date Updated</span>
              <span class="kvi-batch-col bulk-upload-batch-col">Delete</span>
            </div>
            <div id="kviBatchTableBody" class="kvi-batch-list bulk-upload-batch-list" role="list" aria-label="Unfinished upload batches"></div>
          </div>
        </section>

        <section class="kvi-add-upload-row">
          <button type="button" class="kvi-add-bulk-upload-btn" data-action="bulk-upload">Bulk Upload</button>
        </section>

        <section class="kvi-upload-status-row" id="kviUploadStatusRow" hidden>
          <label class="kvi-upload-status-option">
            <input type="radio" name="kviUploadStatus" value="all" checked />
            <span>All</span>
          </label>
          <label class="kvi-upload-status-option">
            <input type="radio" name="kviUploadStatus" value="success" />
            <span>Success</span>
          </label>
          <label class="kvi-upload-status-option">
            <input type="radio" name="kviUploadStatus" value="error" />
            <span>Error</span>
          </label>
        </section>

        <section class="grid-wrapper">
          <div id="kviRecommendationParameterAddGrid" class="ag-theme-alpine app-grid"></div>
        </section>
      </div>
    </main>
  </div>

  <div class="kvi-bulk-upload-modal" id="kviBulkUploadModal" hidden aria-hidden="true">
    <div class="kvi-bulk-upload-backdrop" data-bulk-close></div>
    <section class="kvi-bulk-upload-dialog" role="dialog" aria-modal="true" aria-labelledby="kviBulkUploadTitle">
      <header class="kvi-bulk-upload-header">
        <div>
          <h2 id="kviBulkUploadTitle">Bulk Upload</h2>
          <p>Add your document here.</p>
        </div>
        <button type="button" class="kvi-bulk-upload-close" aria-label="Close bulk upload" data-bulk-close>×</button>
      </header>

      <input id="kviBulkUploadInput" type="file" accept=".csv,text/csv" hidden />

      <div class="kvi-bulk-upload-dropzone" id="kviBulkUploadDropzone">
        <div class="kvi-bulk-upload-icon" aria-hidden="true">⬆</div>
        <p class="kvi-bulk-upload-main-text">Drag your file(s) to start uploading</p>
        <p class="kvi-bulk-upload-or">OR</p>
        <button type="button" class="kvi-bulk-upload-browse-btn" id="kviBulkUploadBrowseBtn">Browse files</button>
      </div>

      <p class="kvi-bulk-upload-help">Only support .csv files</p>
      <p class="kvi-bulk-upload-error" id="kviBulkUploadError" hidden>Please upload a valid .csv file.</p>
      <div class="kvi-bulk-upload-file-card" id="kviBulkUploadFileCard" hidden>
        <div class="kvi-bulk-upload-file-icon" aria-hidden="true">CSV</div>
        <div class="kvi-bulk-upload-file-meta">
          <p class="kvi-bulk-upload-file-name" id="kviBulkUploadSelectedFile"></p>
          <p class="kvi-bulk-upload-file-size" id="kviBulkUploadFileSize"></p>
        </div>
        <button type="button" class="kvi-bulk-upload-file-remove" id="kviBulkUploadFileRemoveBtn" aria-label="Remove selected file">×</button>
      </div>

      <footer class="kvi-bulk-upload-footer">
        <button type="button" class="kvi-bulk-upload-cancel-btn" data-bulk-close>Cancel</button>
        <button type="button" class="kvi-bulk-upload-next-btn" id="kviBulkUploadNextBtn">Next</button>
      </footer>
    </section>
  </div>

  <@gridManager.preferenceModal />
</body>
</html>