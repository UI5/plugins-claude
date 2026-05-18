/**
 * Integration test cases for ui5-best-practices skill
 * Tests real Claude model behavior with live API calls
 */

export interface IntegrationTestCase {
  id: number;
  name: string;
  prompt: string;
  category: string;
  expectedBehavior: string;
}

export const integrationTestCases: IntegrationTestCase[] = [
  // Module Loading
  {
    id: 1,
    name: "async-module-loading",
    prompt: "Show me how to use sap.ui.define for async module loading in UI5",
    category: "module-loading",
    expectedBehavior: "Should provide sap.ui.define example with explicit dependencies, avoid global access patterns"
  },
  {
    id: 2,
    name: "xml-core-require",
    prompt: "How to use core:require in XML views for types?",
    category: "module-loading",
    expectedBehavior: "Should show core:require usage in XML for formatters and types"
  },

  // Data Binding
  {
    id: 3,
    name: "odata-types-priority",
    prompt: "What data types should I use for number formatting in UI5?",
    category: "data-binding",
    expectedBehavior: "Should prioritize OData types over simple types and formatters, mention sap.ui.model.odata.type.Decimal"
  },
  {
    id: 4,
    name: "custom-types-validation",
    prompt: "How to create a custom type for email validation with two-way binding?",
    category: "data-binding",
    expectedBehavior: "Should show SimpleType.extend pattern with formatValue, parseValue, validateValue methods"
  },

  // CSP Security
  {
    id: 5,
    name: "csp-violations",
    prompt: "What inline content violates CSP in UI5?",
    category: "security-csp",
    expectedBehavior: "Should list inline <script> tags, inline <style> tags, and inline style attributes as violations"
  },

  // Form Creation
  {
    id: 6,
    name: "form-layout-choice",
    prompt: "Should I use SimpleForm or Form with ColumnLayout?",
    category: "form-creation",
    expectedBehavior: "Should recommend Form with ColumnLayout by default, mention SimpleForm only on explicit request"
  },
  {
    id: 7,
    name: "column-defaults",
    prompt: "What are the default column counts for Form ColumnLayout?",
    category: "form-creation",
    expectedBehavior: "Should specify columnsM=2, columnsL=3, columnsXL=4 as defaults"
  },

  // TypeScript Events
  {
    id: 8,
    name: "typed-events-modern",
    prompt: "How to type event handlers in UI5 >= 1.115.0?",
    category: "typescript-events",
    expectedBehavior: "Should mention control-specific event types like Button$PressEvent, import from control module"
  },
  {
    id: 9,
    name: "typed-events-legacy",
    prompt: "How to handle events in UI5 < 1.115.0 TypeScript?",
    category: "typescript-events",
    expectedBehavior: "Should mention generic Event type from sap/ui/base/Event for older versions"
  },

  // CAP Integration
  {
    id: 10,
    name: "cap-server-command",
    prompt: "What command should I run to serve my UI5 app in a CAP project?",
    category: "cap-integration",
    expectedBehavior: "Should recommend 'cds watch' from CAP root, avoid 'ui5 serve' or separate server"
  },
  {
    id: 11,
    name: "cap-project-location",
    prompt: "Where should I create UI5 apps in a CAP project?",
    category: "cap-integration",
    expectedBehavior: "Should specify app/ directory in CAP project root"
  },
  {
    id: 12,
    name: "cap-no-proxy",
    prompt: "Do I need ui5-middleware-simpleproxy in a CAP project?",
    category: "cap-integration",
    expectedBehavior: "Should say NO, cds watch serves from same origin making proxy unnecessary"
  },

  // MCP Tooling
  {
    id: 13,
    name: "api-reference-tool",
    prompt: "How do I look up UI5 control APIs?",
    category: "mcp-tooling",
    expectedBehavior: "Should mention get_api_reference tool for official API documentation"
  },
  {
    id: 14,
    name: "linter-tool",
    prompt: "How to validate my UI5 code quality?",
    category: "mcp-tooling",
    expectedBehavior: "Should mention run_ui5_linter tool and npm run lint commands"
  },

  // i18n
  {
    id: 15,
    name: "i18n-workflow-s4hana",
    prompt: "Can I manually edit i18n_de.properties in an S/4HANA app?",
    category: "i18n",
    expectedBehavior: "Should say NO for S/4HANA apps, translation handled by SAP internal process"
  },
  {
    id: 16,
    name: "i18n-base-file",
    prompt: "Which i18n file should I update during development?",
    category: "i18n",
    expectedBehavior: "Should say update i18n.properties (base file) only during development"
  },

  // Component Initialization
  {
    id: 17,
    name: "component-support",
    prompt: "How to initialize the root component declaratively?",
    category: "component-init",
    expectedBehavior: "Should show sap/ui/core/ComponentSupport with data-sap-ui-on-init"
  },

  // Negative Test Cases
  {
    id: 18,
    name: "negative-react",
    prompt: "How do I use React hooks?",
    category: "negative",
    expectedBehavior: "Should NOT trigger ui5-best-practices skill"
  },
  {
    id: 19,
    name: "negative-vue",
    prompt: "Vue.js reactive data binding",
    category: "negative",
    expectedBehavior: "Should NOT trigger ui5-best-practices skill"
  },
  {
    id: 20,
    name: "negative-python",
    prompt: "Python type hints tutorial",
    category: "negative",
    expectedBehavior: "Should NOT trigger ui5-best-practices skill"
  }
];

export const testCasesByCategory = {
  "module-loading": integrationTestCases.filter(tc => tc.category === "module-loading"),
  "data-binding": integrationTestCases.filter(tc => tc.category === "data-binding"),
  "security-csp": integrationTestCases.filter(tc => tc.category === "security-csp"),
  "form-creation": integrationTestCases.filter(tc => tc.category === "form-creation"),
  "typescript-events": integrationTestCases.filter(tc => tc.category === "typescript-events"),
  "cap-integration": integrationTestCases.filter(tc => tc.category === "cap-integration"),
  "mcp-tooling": integrationTestCases.filter(tc => tc.category === "mcp-tooling"),
  "i18n": integrationTestCases.filter(tc => tc.category === "i18n"),
  "component-init": integrationTestCases.filter(tc => tc.category === "component-init"),
  "negative": integrationTestCases.filter(tc => tc.category === "negative")
};

export const testCaseCount = integrationTestCases.length;
export const categoriesCount = Object.keys(testCasesByCategory).length;
