<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Margin Funding Item Maintenance</title>
  <#assign ctx = (request.contextPath)!"" />
  <link rel="stylesheet" href="${ctx}/css/app.css">
  <link rel="stylesheet" href="${ctx}/css/grid.css">
  <link rel="stylesheet" href="${ctx}/css/grid-manager.css">
  <link rel="stylesheet" href="${ctx}/css/grid-page.css">
  <link rel="stylesheet" href="${ctx}/css/margin-funding-maintenance.css">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">

  <!-- AG-Grid CSS -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/ag-grid-community@31.0.1/styles/ag-grid.css">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/ag-grid-community@31.0.1/styles/ag-theme-alpine.css">

  <script src="${ctx}/js/sidebar.js" defer></script>
  <script src="${ctx}/js/dynamic-grid.js" defer></script>
  <script src="${ctx}/js/grid-manager.js" defer></script>
  <script src="${ctx}/js/margin-funding-maintenance.js" defer></script>

  <!-- AG-Grid JavaScript -->
  <script src="https://cdn.jsdelivr.net/npm/ag-grid-community@31.0.1/dist/ag-grid-community.min.js"></script>
</head>
<body class="mfi-page">

  <#include "/components/header.ftl">
  <#import "/components/sidebar.ftl" as sidebar>
  <#import "/components/page-header.ftl" as pageHeader>
  <#import "/components/grid-manager-macro.ftl" as gridManager>

  <input type="hidden" id="currentUserId" value="${userId!'defaultUser'}" />

  <div class="app-shell">
    <@sidebar.navigation currentPath="/margin-funding-maintenance" />

    <main class="content">
      <div class="content-card">
        <@pageHeader.render
          title="Margin Funding Item Maintenance"
          crumbs=[{"label":"Home","href":"${ctx}/"},{"label":"Margin Funding Item Maintenance"}]
        />

        <section class="mfi-grid-controls">
          <div class="mfi-action-toolbar" role="toolbar" aria-label="Margin funding actions">
            <button type="button" class="mfi-action-btn icon-only" aria-label="Back">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M15 6L9 12L15 18" />
              </svg>
            </button>

            <button type="button" class="mfi-action-btn icon-only is-add" aria-label="Add">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 5V19M5 12H19" />
              </svg>
            </button>

            <button type="button" class="mfi-action-btn" aria-label="Tools">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 8.5A3.5 3.5 0 1 1 12 15.5A3.5 3.5 0 0 1 12 8.5Z" />
                <path d="M19.4 15A1 1 0 0 0 19.6 16.1L19.7 16.2A1 1 0 0 1 18.3 17.6L18.2 17.5A1 1 0 0 0 17.1 17.3A1 1 0 0 0 16.5 18.2V18.5A1 1 0 0 1 14.5 18.5V18.2A1 1 0 0 0 13.9 17.3A1 1 0 0 0 12.8 17.5L12.7 17.6A1 1 0 0 1 11.3 16.2L11.4 16.1A1 1 0 0 0 11.6 15A1 1 0 0 0 10.7 14.4H10.4A1 1 0 0 1 10.4 12.4H10.7A1 1 0 0 0 11.6 11.8A1 1 0 0 0 11.4 10.7L11.3 10.6A1 1 0 0 1 12.7 9.2L12.8 9.3A1 1 0 0 0 13.9 9.1A1 1 0 0 0 14.5 8.2V7.9A1 1 0 0 1 16.5 7.9V8.2A1 1 0 0 0 17.1 9.1A1 1 0 0 0 18.2 9.3L18.3 9.2A1 1 0 0 1 19.7 10.6L19.6 10.7A1 1 0 0 0 19.4 11.8A1 1 0 0 0 20.3 12.4H20.6A1 1 0 0 1 20.6 14.4H20.3A1 1 0 0 0 19.4 15Z" />
              </svg>
              <span>Tools</span>
            </button>

            <button type="button" class="mfi-action-btn" aria-label="Disable">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <rect x="5" y="6" width="14" height="12" rx="2" />
                <path d="M9 9L15 15M15 9L9 15" />
              </svg>
              <span>Disable</span>
            </button>

            <button type="button" class="mfi-action-btn" aria-label="Update Termination Date">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <rect x="4" y="5" width="16" height="14" rx="2" />
                <path d="M8 3V7M16 3V7M4 10H20M8 14H12" />
              </svg>
              <span>Update Termination Date</span>
            </button>

            <button type="button" class="mfi-action-btn" aria-label="Refresh">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M20 12A8 8 0 1 1 17.6 6.2" />
                <path d="M20 4V10H14" />
              </svg>
              <span>Refresh</span>
            </button>

            <button type="button" class="mfi-action-btn" aria-label="Execute">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="11" cy="11" r="7" />
                <path d="M20 20L16.5 16.5" />
              </svg>
              <span>Execute</span>
            </button>
          </div>

          <div class="mfi-grid-manager-tools" role="toolbar" aria-label="Grid manager view actions">
            <@gridManager.gridManager />

            <div class="mfi-view-actions">
              <button type="button" class="mfi-view-btn" data-density="comfortable" aria-label="Comfortable rows" title="Comfortable rows">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M3 6H21M3 12H21M3 18H21" />
                </svg>
              </button>

              <button type="button" class="mfi-view-btn is-active" data-density="compact" aria-label="Compact rows" title="Compact rows">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M3 6H21M3 12H21M3 18H21" />
                </svg>
              </button>

              <button type="button" class="mfi-view-btn" data-density="spacious" aria-label="Spacious rows" title="Spacious rows">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M3 7H21M3 12H21M3 17H21" />
                </svg>
              </button>

              <span class="mfi-view-divider" aria-hidden="true"></span>

              <button type="button" class="mfi-view-btn" data-action="download" aria-label="Download CSV" title="Download CSV">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 3V15" />
                  <path d="M7 10L12 15L17 10" />
                  <path d="M4 20H20" />
                </svg>
              </button>
            </div>
          </div>
        </section>

        <section class="grid-wrapper">
          <div id="mfiGrid" class="ag-theme-alpine app-grid"></div>
        </section>
      </div>
    </main>
  </div>

  <@gridManager.preferenceModal />

</body>
</html>
