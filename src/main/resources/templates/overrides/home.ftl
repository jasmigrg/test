<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Home</title>
  <#assign ctx = (request.contextPath)!"" />
  <link rel="stylesheet" href="${ctx}/css/app.css" />
  <link rel="stylesheet" href="${ctx}/css/pricing-inquiry.css" />
</head>
<body>
  <div class="app-shell">
    <#include "components/header.ftl">
    <#import "/components/page-header.ftl" as pageHeader>

    <#include "/components/sidebar.ftl">
    <@navigation currentPath="/" />

    <main class="content">
      <@pageHeader.render
        title="Home"
        crumbs=[{"label":"Home"}]
      />
      <div class="card" style="max-width: 520px;">
        <h2>Home</h2>
        <p style="margin: 10px 0 16px;">Use the links below to open the demo screens.</p>
        <a class="primary" href="${ctx}/pricing-inquiry" style="display: inline-block; text-decoration: none; text-align: center;">Go to Pricing Inquiry</a>
        <a class="primary" href="${ctx}/margin-funding-maintenance" style="display: inline-block; text-decoration: none; text-align: center; margin-top: 10px;">Go to Margin Funding Item Maintenance</a>
        <a class="primary" href="${ctx}/cams-eligibility" style="display: inline-block; text-decoration: none; text-align: center; margin-top: 10px;">Go to CAMS Eligibility</a>
      </div>
    </main>
  </div>
  <script src="${ctx}/js/sidebar.js"></script>
</body>
</html>