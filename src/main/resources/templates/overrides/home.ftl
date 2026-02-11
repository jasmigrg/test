<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Home</title>
  <#assign ctx = (request.contextPath)!"" />
  <link rel="stylesheet" href="${ctx}/css/pricing-inquiry.css?v=2" />
  <link rel="stylesheet" href="${ctx}/css/header.css?v=1" />
  <link rel="stylesheet" href="${ctx}/css/sidebar.css?v=1" />
</head>
<body>
  <div class="app-shell">
    <#include "components/header.ftl">

    <#include "/components/sidebar.ftl">
    <@navigation currentPath="/" />

    <main class="content">
      <div class="breadcrumb">Home</div>
      <div class="page-title">
        <div class="title-icon"></div>
        <h1>Home</h1>
      </div>
      <div class="card" style="max-width: 520px;">
        <h2>Home</h2>
        <p style="margin: 10px 0 16px;">Use the link below to open the Pricing Inquiry screen.</p>
        <a class="primary" href="${ctx}/pricing-inquiry" style="display: inline-block; text-decoration: none; text-align: center;">Go to Pricing Inquiry</a>
      </div>
    </main>
  </div>
  <script src="${ctx}/js/sidebar.js?v=1"></script>
</body>
</html>