# Core API Replacements Reference

This reference contains detailed replacement tables for deprecated sap.ui.core.Core APIs.

## sap.ui.getCore() Method Replacements

| Deprecated | Replacement Module | Replacement Call |
|------------|-------------------|------------------|
| `sap.ui.getCore().attachInit(fn)` | `sap/ui/core/Core` | `Core.ready().then(fn)` |
| `sap.ui.getCore().byId(id)` | `sap/ui/core/Element` | `Element.getElementById(id)` |
| `sap.ui.getCore().getConfiguration()` | `sap/ui/core/Configuration` | `Configuration` (direct use) |
| `sap.ui.getCore().getEventBus()` | `sap/ui/core/EventBus` | `EventBus.getInstance()` |
| `sap.ui.getCore().getLibraryResourceBundle(lib)` | `sap/ui/core/Lib` | `Lib.getResourceBundleFor(lib)` |
| `sap.ui.getCore().getLibraryResourceBundle()` (no args) | `sap/ui/core/Lib` | `Lib.getResourceBundleFor("sap.ui.core")` — old API defaulted to `"sap.ui.core"`, new API has no default |
| `sap.ui.getCore().loadLibrary(lib, {async:true})` | `sap/ui/core/Lib` | `Lib.load({name: lib})` |
| `sap.ui.getCore().getStaticAreaRef()` | `sap/ui/core/StaticArea` | `StaticArea.getDomRef()` |
| `sap.ui.getCore().isMobile()` | `sap/ui/Device` | `Device.browser.mobile` |
| `sap.ui.getCore().getComponent(id)` | `sap/ui/core/Component` | `Component.getComponentById(id)` |
| `sap.ui.getCore().createComponent(opts)` | `sap/ui/core/Component` | `Component.create(opts)` (async only) |
| `sap.ui.getCore().applyTheme(theme)` | `sap/ui/core/Theming` | `Theming.setTheme(theme)` |

## Extended Core Method Replacements

These Core methods have been moved to dedicated modules:

| Deprecated Core Method | New Module | New API |
|------------------------|------------|---------|
| `Core.initLibrary` | `sap/ui/core/Lib` | `Lib.init` |
| `Core.byFieldGroupId` | `sap/ui/core/Control` | `Control.getControlsByFieldGroupId` |
| `Core.getCurrentFocusedControlId` | `sap/ui/core/Element` | `Element.getActiveElement()?.getId()` |
| `Core.isStaticAreaRef(el)` | `sap/ui/core/StaticArea` | `StaticArea.getDomRef() === el` |
| `Core.notifyContentDensityChanged` | `sap/ui/core/Theming` | `Theming.notifyContentDensityChanged` |
| `Core.attachIntervalTimer` | `sap/ui/core/IntervalTrigger` | `IntervalTrigger.addListener` |
| `Core.detachIntervalTimer` | `sap/ui/core/IntervalTrigger` | `IntervalTrigger.removeListener` |

## Core APIs That Are Removed (No Replacement)

These APIs have been removed in modernized UI5 code and require redesigning the affected code:

| Removed API | Migration Strategy |
|-------------|-------------------|
| `Core.getModel` / `Core.setModel` / `Core.hasModel` | Use model on specific ManagedObject instead |
| `Core.getLoadedLibraries` | Use `Library.isLoaded(name)` for single library check |
| `Core.isInitialized` / `Core.isLocked` / `Core.lock` / `Core.unlock` | Removed - redesign code flow |
| `Core.getRenderManager` / `Core.createRenderManager` | Removed - use control renderer |
| `Core.getApplication` / `Core.getRootComponent` | Removed - use Component.getOwnerComponentFor |
| `Core.registerPlugin` / `Core.unregisterPlugin` | Removed - no replacement |
| `Core.attachControlEvent` / `Core.detachControlEvent` | Removed - no replacement |

## jQuery.sap.* Replacements

Run `npx @ui5/linter --details` to get the suggested replacement module for each jQuery.sap.* API.

| Deprecated | Replacement Module | Replacement Call |
|------------|-------------------|------------------|
| `jQuery.sap.log.*` | `sap/base/Log` | `Log.info()`, `Log.error()`, etc. |
| `jQuery.sap.assert` | `sap/base/assert` | `assert(condition, message)` |
| `jQuery.sap.uid` | `sap/base/util/uid` | `uid()` |
| `jQuery.sap.equal` | `sap/base/util/deepEqual` | `deepEqual(a, b)` |
| `jQuery.sap.extend(true, ...)` | `sap/base/util/merge` | `merge({}, obj1, obj2)` |
| `jQuery.sap.extend(false, ...)` | (native) | `Object.assign({}, obj1, obj2)` |
| `jQuery.sap.resources` | `sap/base/i18n/ResourceBundle` | `ResourceBundle.create({url: ...})` |
| `jQuery.sap.storage` | `sap/ui/util/Storage` | `new Storage(type)` |
| `jQuery.sap.encodeHTML` | `sap/base/security/encodeXML` | `encodeXML(text)` |
| `jQuery.sap.encodeJS` | `sap/base/security/encodeJS` | `encodeJS(text)` |
| `jQuery.sap.encodeURL` | `sap/base/security/encodeURL` | `encodeURL(text)` |
| `jQuery.sap.delayedCall` | (native) | `setTimeout(fn, delay)` |
| `jQuery.sap.clearDelayedCall` | (native) | `clearTimeout(id)` |
| `jQuery.sap.domById` | (native) | `document.getElementById(id)` |
| `jQuery.sap.byId` | `sap/ui/thirdparty/jquery` | `jQuery("#" + id)` |
| `jQuery.sap.getModulePath` | `sap/ui/require` | `sap.ui.require.toUrl(module)` |
| `jQuery.sap.getResourcePath` | `sap/ui/require` | `sap.ui.require.toUrl(path)` |
| `jQuery.sap.registerModulePath` | `sap/ui/loader` | `sap.ui.loader.config({paths: ...})` |

For the complete list, consult the [UI5 Best Practices documentation](https://ui5.sap.com/#/topic/28fcd55b04654977b63dacbee0552712).
