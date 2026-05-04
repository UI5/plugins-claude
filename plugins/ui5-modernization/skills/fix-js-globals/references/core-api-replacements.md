# Core API Replacements Reference

This reference contains detailed replacement tables for deprecated sap.ui.core.Core, Configuration, and jQuery.sap APIs that the UI5 linter **cannot** auto-fix. For auto-fixable replacements, the linter's `--fix` flag handles them directly.

---

## 1. sap.ui.getCore() / Core Facade Method Replacements

### Initialization & Lifecycle

| Deprecated | Replacement Module | Replacement Call |
|---|---|---|
| `sap.ui.getCore().attachInit(fn)` | `sap/ui/core/Core` | `Core.ready().then(fn)` |
| `Core.isInitialized()` | — | Removed — redesign code to use `Core.ready()` |
| `Core.isLocked()` / `Core.lock()` / `Core.unlock()` | — | Removed — redesign code flow |

### Element & Component Access

| Deprecated | Replacement Module | Replacement Call |
|---|---|---|
| `sap.ui.getCore().byId(id)` | `sap/ui/core/Element` | `Element.getElementById(id)` |
| `Core.getComponent(id)` | `sap/ui/core/Component` | `Component.getComponentById(id)` |
| `Core.createComponent(opts)` | `sap/ui/core/Component` | `Component.create(opts)` (async only) |
| `Core.getRootComponent()` | — | Removed — use `Component.getOwnerComponentFor()` |
| `Core.getApplication()` | — | Removed — use `Component.getOwnerComponentFor()` |
| `Core.getCurrentFocusedControlId()` | `sap/ui/core/Element` | `Element.getActiveElement()?.getId()` |

### Event Bus & Messaging

| Deprecated | Replacement Module | Replacement Call |
|---|---|---|
| `sap.ui.getCore().getEventBus()` | `sap/ui/core/EventBus` | `EventBus.getInstance()` |
| `Core.getMessageManager()` | `sap/ui/core/Messaging` | `Messaging` (use module directly) |

### Library & Resource Loading

| Deprecated | Replacement Module | Replacement Call |
|---|---|---|
| `sap.ui.getCore().getLibraryResourceBundle(lib)` | `sap/ui/core/Lib` | `Lib.getResourceBundleFor(lib)` |
| `sap.ui.getCore().getLibraryResourceBundle()` (no args) | `sap/ui/core/Lib` | `Lib.getResourceBundleFor("sap.ui.core")` — old API defaulted to `"sap.ui.core"`, new API has no default |
| `sap.ui.getCore().loadLibrary(lib, {async:true})` | `sap/ui/core/Lib` | `Lib.load({name: lib})` |
| `Core.initLibrary(opts)` | `sap/ui/core/Lib` | `Lib.init(opts)` |
| `Core.getLoadedLibraries()` | `sap/ui/core/Lib` | `Lib.all()` (full map) or `Lib.isLoaded(name)` (single library check) |
| `Core.includeLibraryTheme(lib)` | — | Removed — no public replacement; theme is applied automatically when the library is loaded |

### Theming

| Deprecated | Replacement Module | Replacement Call |
|---|---|---|
| `sap.ui.getCore().applyTheme(theme)` | `sap/ui/core/Theming` | `Theming.setTheme(theme)` |
| `Core.attachThemeChanged(fn)` | `sap/ui/core/Theming` | `Theming.attachApplied(fn)` |
| `Core.detachThemeChanged(fn)` | `sap/ui/core/Theming` | `Theming.detachApplied(fn)` |
| `Core.isThemeApplied()` | `sap/ui/core/Theming` | `Theming.attachApplied(fn)` (callback-based, no sync check) |
| `Core.notifyContentDensityChanged()` | `sap/ui/core/Theming` | `Theming.notifyContentDensityChanged()` |

### Localization Events

| Deprecated | Replacement Module | Replacement Call |
|---|---|---|
| `Core.attachLocalizationChanged(fn)` | `sap/base/i18n/Localization` | `Localization.attachChange(fn)` |
| `Core.detachLocalizationChanged(fn)` | `sap/base/i18n/Localization` | `Localization.detachChange(fn)` |

### Validation & Format Events (on ManagedObject)

| Deprecated | Replacement Module | Replacement Call |
|---|---|---|
| `Core.attachFormatError(fn)` | `sap/ui/base/ManagedObject` | `ManagedObject.attachFormatError(fn)` |
| `Core.detachFormatError(fn)` | `sap/ui/base/ManagedObject` | `ManagedObject.detachFormatError(fn)` |
| `Core.fireFormatError(params)` | `sap/ui/base/ManagedObject` | `ManagedObject.fireFormatError(params)` |
| `Core.attachParseError(fn)` | `sap/ui/base/ManagedObject` | `ManagedObject.attachParseError(fn)` |
| `Core.detachParseError(fn)` | `sap/ui/base/ManagedObject` | `ManagedObject.detachParseError(fn)` |
| `Core.fireParseError(params)` | `sap/ui/base/ManagedObject` | `ManagedObject.fireParseError(params)` |
| `Core.attachValidationError(fn)` | `sap/ui/base/ManagedObject` | `ManagedObject.attachValidationError(fn)` |
| `Core.detachValidationError(fn)` | `sap/ui/base/ManagedObject` | `ManagedObject.detachValidationError(fn)` |
| `Core.fireValidationError(params)` | `sap/ui/base/ManagedObject` | `ManagedObject.fireValidationError(params)` |
| `Core.attachValidationSuccess(fn)` | `sap/ui/base/ManagedObject` | `ManagedObject.attachValidationSuccess(fn)` |
| `Core.detachValidationSuccess(fn)` | `sap/ui/base/ManagedObject` | `ManagedObject.detachValidationSuccess(fn)` |
| `Core.fireValidationSuccess(params)` | `sap/ui/base/ManagedObject` | `ManagedObject.fireValidationSuccess(params)` |

### UI Area & Rendering

| Deprecated | Replacement Module | Replacement Call |
|---|---|---|
| `Core.createUIArea(domRef)` | `sap/ui/core/Control` | `oControl.placeAt(domRef)` |
| `Core.setRoot(domRef, ctrl)` | `sap/ui/core/Control` | `oControl.placeAt(domRef, "only")` |
| `Core.getUIArea(id)` | `sap/ui/core/StaticArea` | `StaticArea.getUIArea()` (for static area only) |
| `sap.ui.getCore().getStaticAreaRef()` | `sap/ui/core/StaticArea` | `StaticArea.getDomRef()` |
| `Core.isStaticAreaRef(el)` | `sap/ui/core/StaticArea` | `StaticArea.contains(el)` |
| `Core.getRenderManager()` / `Core.createRenderManager()` | — | Removed — use control renderer |

### Timer & Field Groups

| Deprecated | Replacement Module | Replacement Call |
|---|---|---|
| `Core.attachIntervalTimer(fn)` | `sap/ui/core/IntervalTrigger` | `IntervalTrigger.addListener(fn)` |
| `Core.detachIntervalTimer(fn)` | `sap/ui/core/IntervalTrigger` | `IntervalTrigger.removeListener(fn)` |
| `Core.byFieldGroupId(ids)` | `sap/ui/core/Control` | `Control.getControlsByFieldGroupId(ids)` |

### Configuration (via Core)

| Deprecated | Replacement Module | Replacement Call |
|---|---|---|
| `sap.ui.getCore().getConfiguration()` | See Section 2 | Use specific Configuration replacement modules |
| `sap.ui.getCore().isMobile()` | `sap/ui/Device` | `Device.browser.mobile` |

### Model APIs (Removed — No Direct Replacement)

| Removed API | Migration Strategy |
|---|---|
| `Core.getModel()` / `Core.setModel()` / `Core.hasModel()` | Use model on a specific ManagedObject (e.g., component, view, or control) instead |

### Plugin & Control Events (Removed — No Direct Replacement)

| Removed API | Migration Strategy |
|---|---|
| `Core.registerPlugin()` / `Core.unregisterPlugin()` | Use `sap/ui/core/ElementRegistry` or `sap/ui/core/ComponentRegistry` |
| `Core.attachControlEvent()` / `Core.detachControlEvent()` | Removed — no replacement |

---

## 2. Configuration API Replacements

Since UI5 1.120, `sap.ui.core.Configuration` and `sap.ui.core.Configuration.FormatSettings` are deprecated. Methods are replaced by dedicated modules.

> **Note**: In this section, the replacement module is shown in each sub-section heading (e.g., `→ sap/base/i18n/Localization`). Tables below use two columns: deprecated method and replacement call.

### Localization Settings → `sap/base/i18n/Localization`

| Deprecated | Replacement |
|---|---|
| `Configuration.getLanguage()` | `Localization.getLanguage()` |
| `Configuration.setLanguage(lang)` | `Localization.setLanguage(lang)` |
| `Configuration.getLanguageTag()` | `Localization.getLanguageTag()` |
| `Configuration.getRTL()` | `Localization.getRTL()` |
| `Configuration.setRTL(rtl)` | `Localization.setRTL(rtl)` |
| `Configuration.getSAPLogonLanguage()` | `Localization.getSAPLogonLanguage()` |
| `Configuration.getTimezone()` | `Localization.getTimezone()` |
| `Configuration.setTimezone(tz)` | `Localization.setTimezone(tz)` |
| `Configuration.getActiveTerminologies()` | `Localization.getActiveTerminologies()` |

### Formatting Settings → `sap/base/i18n/Formatting`

| Deprecated | Replacement |
|---|---|
| `Configuration.getCalendarType()` | `Formatting.getCalendarType()` |
| `Configuration.setCalendarType(type)` | `Formatting.setCalendarType(type)` |
| `Configuration.getCalendarWeekNumbering()` | `Formatting.getCalendarWeekNumbering()` |
| `Configuration.setCalendarWeekNumbering(v)` | `Formatting.setCalendarWeekNumbering(v)` |
| `Configuration.getFormatLocale()` | `Formatting.getLanguageTag()` |
| `Configuration.setFormatLocale(locale)` | `Formatting.setLanguageTag(locale)` |
| `Configuration.getFormatSettings()` | See FormatSettings table below |

### FormatSettings → `sap/base/i18n/Formatting`

| Deprecated (`FormatSettings.`) | Replacement (`Formatting.`) |
|---|---|
| `getDatePattern(style)` | `getDatePattern(style)` |
| `setDatePattern(style, pattern)` | `setDatePattern(style, pattern)` |
| `getTimePattern(style)` | `getTimePattern(style)` |
| `setTimePattern(style, pattern)` | `setTimePattern(style, pattern)` |
| `getNumberSymbol(type)` | `getNumberSymbol(type)` |
| `setNumberSymbol(type, symbol)` | `setNumberSymbol(type, symbol)` |
| `getCustomCurrencies()` | `getCustomCurrencies()` |
| `setCustomCurrencies(currencies)` | `setCustomCurrencies(currencies)` |
| `addCustomCurrencies(currencies)` | `addCustomCurrencies(currencies)` |
| `getLegacyDateFormat()` | `getABAPDateFormat()` |
| `getLegacyTimeFormat()` | `getABAPTimeFormat()` |
| `getLegacyNumberFormat()` | `getABAPNumberFormat()` |
| `getLegacyDateCalendarCustomizing()` | `getCustomIslamicCalendarData()` |
| `setLegacyDateCalendarCustomizing(data)` | `setCustomIslamicCalendarData(data)` |
| `setTrailingCurrencyCode(bool)` | `setTrailingCurrencyCode(bool)` |
| `getTrailingCurrencyCode()` | `getTrailingCurrencyCode()` |
| `setCustomUnits(units)` | `setCustomUnits(units)` |
| `addCustomUnits(units)` | `addCustomUnits(units)` |

### Theming → `sap/ui/core/Theming`

| Deprecated | Replacement |
|---|---|
| `Configuration.getTheme()` | `Theming.getTheme()` |
| `Configuration.setTheme(theme)` | `Theming.setTheme(theme)` |

### Animation & Accessibility → `sap/ui/core/ControlBehavior`

| Deprecated | Replacement |
|---|---|
| `Configuration.getAccessibility()` | `ControlBehavior.isAccessibilityEnabled()` |
| `Configuration.getAnimation()` | `ControlBehavior.isAnimationEnabled()` |
| `Configuration.getAnimationMode()` | `ControlBehavior.getAnimationMode()` |
| `Configuration.setAnimationMode(mode)` | `ControlBehavior.setAnimationMode(mode)` |

### Security → `sap/ui/security/Security`

| Deprecated | Replacement |
|---|---|
| `Configuration.getAllowlistService()` | `Security.getAllowlistService()` |
| `Configuration.getWhitelistService()` | `Security.getAllowlistService()` |
| `Configuration.getFrameOptions()` | `Security.getFrameOptions()` |
| `Configuration.getSecurityTokenHandlers()` | `Security.getSecurityTokenHandlers()` |
| `Configuration.setSecurityTokenHandlers(h)` | `Security.setSecurityTokenHandlers(h)` |

### Version → `sap/ui/VersionInfo`

| Deprecated | Replacement |
|---|---|
| `Configuration.getVersion()` | `VersionInfo.load()` (returns a Promise) |

### Other Configuration

| Deprecated | Replacement Module | Replacement |
|---|---|---|
| `Configuration.getUIDPrefix()` | `sap/ui/base/ManagedObjectMetadata` | `ManagedObjectMetadata.getUIDPrefix()` |

---

## 3. jQuery.sap.* Replacements (Non-Auto-Fixable)

The UI5 linter auto-fixes most jQuery.sap.* simple replacements. The entries below are cases that require **manual migration** because they involve structural changes, conditional logic, or APIs with different signatures.

Run `npx @ui5/linter --details` to get the suggested replacement module for each jQuery.sap.* API.

### Object Path & Module System

| Deprecated | Replacement Module | Replacement Call |
|---|---|---|
| `jQuery.sap.getObject(name)` | `sap/base/util/ObjectPath` | `ObjectPath.get(name)` |
| `jQuery.sap.setObject(name, value)` | `sap/base/util/ObjectPath` | `ObjectPath.set(name, value)` |
| `jQuery.sap.registerModulePath(name, path)` | `sap/ui/loader` | `sap.ui.loader.config({paths: {name: path}})` — or use manifest `resourceRoots` |
| `jQuery.sap.registerResourcePath(name, path)` | `sap/ui/loader` | `sap.ui.loader.config({paths: {name: path}})` |
| `jQuery.sap.getModulePath(name)` | `sap/ui/require` | `sap.ui.require.toUrl(name.replace(/\./g, "/"))` |
| `jQuery.sap.getResourcePath(name)` | `sap/ui/require` | `sap.ui.require.toUrl(name)` |

### URL & URI Handling

| Deprecated | Replacement | Notes |
|---|---|---|
| `jQuery.sap.getUriParameters()` | `new URLSearchParams(window.location.search)` | Native browser API; for `sap.ui.require.toUrl`-based, use URL constructor |
| `jQuery.sap.getUriParameters().get(key)` | `new URLSearchParams(window.location.search).get(key)` | Direct replacement |
| `jQuery.sap.encodeURL(text)` | `sap/base/security/encodeURL` | `encodeURL(text)` |

### Object Manipulation

| Deprecated | Replacement | Notes |
|---|---|---|
| `jQuery.sap.extend(true, {}, obj)` | `sap/base/util/merge` | `merge({}, obj)` — deep copy |
| `jQuery.sap.extend(false, {}, obj)` | Native | `Object.assign({}, obj)` — shallow copy |
| `jQuery.sap.each(obj, fn)` | Native | `Object.keys(obj).forEach(fn)` or `for...of` |

### jQuery Extension Modules

These jQuery plugins must be replaced with their modular equivalents. Import them explicitly:

| Deprecated | Replacement Module | Notes |
|---|---|---|
| `jQuery.fn.control()` | `sap/ui/core/Element` | `Element.closestTo(domRef)` |
| `jQuery(domRef).control()` | `sap/ui/core/Element` | `Element.closestTo(domRef)` |
| `jQuery.sap.KeyCodes` | `sap/ui/events/KeyCodes` | `KeyCodes.ENTER`, etc. |

### Timing & Async

| Deprecated | Replacement | Notes |
|---|---|---|
| `jQuery.sap.delayedCall(delay, ctx, fn)` | Native | `setTimeout(fn.bind(ctx), delay)` |
| `jQuery.sap.clearDelayedCall(id)` | Native | `clearTimeout(id)` |
| `jQuery.sap.intervalCall(interval, ctx, fn)` | Native | `setInterval(fn.bind(ctx), interval)` |
| `jQuery.sap.clearIntervalCall(id)` | Native | `clearInterval(id)` |

### Logging

| Deprecated | Replacement Module | Replacement Call |
|---|---|---|
| `jQuery.sap.log.info(msg)` | `sap/base/Log` | `Log.info(msg)` |
| `jQuery.sap.log.error(msg)` | `sap/base/Log` | `Log.error(msg)` |
| `jQuery.sap.log.warning(msg)` | `sap/base/Log` | `Log.warning(msg)` |
| `jQuery.sap.log.debug(msg)` | `sap/base/Log` | `Log.debug(msg)` |
| `jQuery.sap.log.setLevel(level)` | `sap/base/Log` | `Log.setLevel(level)` |
| `jQuery.sap.log.getLog()` | `sap/base/Log` | `Log.getLogEntries()` |
| `jQuery.sap.log.Level.*` | `sap/base/Log` | `Log.Level.*` |

### Misc Utilities

| Deprecated | Replacement Module | Replacement Call |
|---|---|---|
| `jQuery.sap.assert(cond, msg)` | `sap/base/assert` | `assert(cond, msg)` |
| `jQuery.sap.uid()` | `sap/base/util/uid` | `uid()` |
| `jQuery.sap.equal(a, b)` | `sap/base/util/deepEqual` | `deepEqual(a, b)` |
| `jQuery.sap.resources(opts)` | `sap/base/i18n/ResourceBundle` | `ResourceBundle.create(opts)` |
| `jQuery.sap.storage(type)` | `sap/ui/util/Storage` | `new Storage(type)` |
| `jQuery.sap.encodeHTML(text)` | `sap/base/security/encodeXML` | `encodeXML(text)` |
| `jQuery.sap.encodeJS(text)` | `sap/base/security/encodeJS` | `encodeJS(text)` |
| `jQuery.sap.domById(id)` | Native | `document.getElementById(id)` |
| `jQuery.sap.byId(id)` | `sap/ui/thirdparty/jquery` | `jQuery(document.getElementById(id))` — note: old API escaped `:` and `.` in IDs; if ID contains these characters, use `jQuery("#" + id.replace(/([:.])/g, "\\$1"))` |

---

## Notes

- The linter auto-fixes simple 1-to-1 jQuery.sap and Core API chain replacements. The entries above focus on cases requiring structural changes or where the linter cannot auto-fix.
- For the complete list of all deprecated APIs, consult the [UI5 Deprecation and Migration Guide](https://ui5.sap.com/#/topic/3b877a1.html).
- When migrating `Core.getConfiguration().getFormatSettings()` chains, collapse the two-step access into a direct `Formatting.*` call.
- `Core.ready()` returns a Promise — wrap `attachInit` callbacks accordingly.
- `Messaging` replaces both `MessageManager` (the class) and `Core.getMessageManager()` (the accessor).
