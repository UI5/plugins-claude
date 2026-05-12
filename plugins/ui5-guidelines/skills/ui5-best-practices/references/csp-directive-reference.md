## 13. Content Security Policy (CSP) - Directive Reference

### Required CSP Directives for UI5 (Version 1.136.7)

**Minimal Restrictive Policy**
```
Content-Security-Policy:
  script-src 'self' <ui5-cdn>;
  style-src 'self' <ui5-cdn>;
  img-src 'self' data: blob: <ui5-cdn>;
  font-src 'self' data: <ui5-cdn>;
  connect-src 'self' <backend-api>;
  frame-src 'self' data: blob:;
  worker-src 'self' data: blob:;
```

### Directive Breakdown

#### script-src
- **'self'** - Application resources
- **&lt;ui5-cdn&gt;** - UI5 framework source
- **'unsafe-eval'** - Required ONLY for:
  - Synchronous loading (deprecated, avoid)
  - Legacy libraries: `sap.ca.ui`, `sap.makit`, `sap.me`, `sap.ui.commons`, `sap.ui.ux3`, `sap.uiext.inbox`, `sap.viz.*`, `sap.zen.*`
  - Partially required: `sap.apf`, `sap.ovp`, `sap.ushell`, `sap.rules.ui`

#### style-src
- **'self'** - Application styles
- **&lt;ui5-cdn&gt;** - UI5 themes
- **'unsafe-inline'** - Required for:
  - Same legacy libraries as script-src
  - Controls with inline styles: `sap.m.FormattedText`, `sap.ui.core.HTML`
  - Partially required: `sap.gantt`, `sap.ui.vk`, `sap.ushell`

#### img-src, font-src
- **data:** - Inline images/fonts (UI5 features)
- **blob:** - Dynamically generated content

#### worker-src / child-src
- Required for UI5 web workers
- **blob:** may be needed for specific functionality

#### connect-src
- **'self'** - Application APIs
- **&lt;backend-api&gt;** - OData services, REST endpoints
- **wss:** - WebSocket connections (specific features)

### Testing CSP Policies

**Report-Only Mode** (Recommended for testing)
```
Content-Security-Policy-Report-Only:
  script-src 'self';
  style-src 'self';
  report-uri /csp-violation-report;
```

1. Start with most restrictive policy
2. Monitor violation reports
3. Add required sources iteratively
4. Switch to enforce mode once stable

### CSP Compliance Dos and Don'ts

**DO**:
- ✅ Use external stylesheets (no inline styles)
- ✅ Use async loading (`data-sap-ui-async="true"`)
- ✅ Leverage library preloads
- ✅ Use `ComponentSupport` for initialization

**DON'T**:
- ❌ Use `<script>` with inline code
- ❌ Use inline event handlers (`onclick="..."`)
- ❌ Use `javascript:` URLs
- ❌ Use `document.write()` or `createElement('script')` for inline scripts
- ❌ Use `eval()`, `new Function()`, `setTimeout(<string>)`

### Library-Specific CSP Issues

**sap.ui.richtexteditor**
- Requires `script-src 'unsafe-inline'` for plugins: `linkchecker`, `preview`

**sap.ui.core (Hyphenation)**
- Requires `script-src 'wasm-unsafe-eval'` for WebAssembly

**sap.ushell**
- Requires `script-src 'unsafe-eval'` for App Finder and custom tiles

## 14. Modern Test Setup (Test Starter)
