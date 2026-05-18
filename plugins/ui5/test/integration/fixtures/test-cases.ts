/**
 * Integration test cases for ui5-best-practices skill
 * Tests real Claude model behavior with Claude Code CLI
 */

import type { IntegrationTestCase } from '../types.js';

export const testCases: IntegrationTestCase[] = [
  // Module Loading (2 tests)
  {
    id: 1,
    name: "async-module-loading",
    description: "Async module loading with sap.ui.define",
    prompt: "Show me how to use sap.ui.define for async module loading in UI5",
    category: "module-loading",
    expectedSkill: "ui5-best-practices",
    expectedContent: "sap.ui.define"
  },
  {
    id: 2,
    name: "xml-core-require",
    description: "XML core:require for types",
    prompt: "How to use core:require in XML views for types?",
    category: "module-loading",
    expectedSkill: "ui5-best-practices",
    expectedContent: "core:require"
  },

  // Data Binding (2 tests)
  {
    id: 3,
    name: "odata-types-priority",
    description: "OData types for number formatting",
    prompt: "What data types should I use for number formatting in UI5?",
    category: "data-binding",
    expectedSkill: "ui5-best-practices",
    expectedContent: "odata.type.Decimal"
  },
  {
    id: 4,
    name: "custom-types-validation",
    description: "Custom type for two-way binding validation",
    prompt: "How to create a custom type for email validation with two-way binding?",
    category: "data-binding",
    expectedSkill: "ui5-best-practices",
    expectedContent: "SimpleType.extend"
  },

  // CSP Security (1 test)
  {
    id: 5,
    name: "csp-violations",
    description: "CSP inline content violations",
    prompt: "What inline content violates CSP in UI5?",
    category: "security-csp",
    expectedSkill: "ui5-best-practices",
    expectedContent: "inline"
  },

  // Form Creation (2 tests)
  {
    id: 6,
    name: "form-layout-choice",
    description: "Form vs SimpleForm layout choice",
    prompt: "Should I use SimpleForm or Form with ColumnLayout?",
    category: "form-creation",
    expectedSkill: "ui5-best-practices",
    expectedContent: "ColumnLayout"
  },
  {
    id: 7,
    name: "column-defaults",
    description: "Form ColumnLayout default columns",
    prompt: "What are the default column counts for Form ColumnLayout?",
    category: "form-creation",
    expectedSkill: "ui5-best-practices",
    expectedContent: "columnsM"
  },

  // TypeScript Events (2 tests)
  {
    id: 8,
    name: "typed-events-modern",
    description: "TypeScript event types UI5 >= 1.115.0",
    prompt: "How to type event handlers in UI5 >= 1.115.0?",
    category: "typescript-events",
    expectedSkill: "ui5-best-practices",
    expectedContent: "Button$PressEvent"
  },
  {
    id: 9,
    name: "typed-events-legacy",
    description: "TypeScript event types UI5 < 1.115.0",
    prompt: "How to handle events in UI5 < 1.115.0 TypeScript?",
    category: "typescript-events",
    expectedSkill: "ui5-best-practices",
    expectedContent: "Event"
  },

  // CAP Integration (3 tests)
  {
    id: 10,
    name: "cap-server-command",
    description: "CAP server command for UI5",
    prompt: "What command should I run to serve my UI5 app in a CAP project?",
    category: "cap-integration",
    expectedSkill: "ui5-best-practices",
    expectedContent: "cds watch"
  },
  {
    id: 11,
    name: "cap-project-location",
    description: "CAP UI5 app location",
    prompt: "Where should I create UI5 apps in a CAP project?",
    category: "cap-integration",
    expectedSkill: "ui5-best-practices",
    expectedContent: "app/"
  },
  {
    id: 12,
    name: "cap-no-proxy",
    description: "CAP no proxy needed",
    prompt: "Do I need ui5-middleware-simpleproxy in a CAP project?",
    category: "cap-integration",
    expectedSkill: "ui5-best-practices",
    expectedContent: "same origin"
  },

  // MCP Tooling (2 tests)
  {
    id: 13,
    name: "api-reference-tool",
    description: "UI5 API reference lookup",
    prompt: "How do I look up UI5 control APIs?",
    category: "mcp-tooling",
    expectedSkill: "ui5-best-practices",
    expectedContent: "get_api_reference"
  },
  {
    id: 14,
    name: "linter-tool",
    description: "UI5 code quality validation",
    prompt: "How to validate my UI5 code quality?",
    category: "mcp-tooling",
    expectedSkill: "ui5-best-practices",
    expectedContent: "linter"
  },

  // i18n (2 tests)
  {
    id: 15,
    name: "i18n-workflow-s4hana",
    description: "i18n workflow for S/4HANA apps",
    prompt: "Can I manually edit i18n_de.properties in an S/4HANA app?",
    category: "i18n",
    expectedSkill: "ui5-best-practices",
    expectedContent: "translation"
  },
  {
    id: 16,
    name: "i18n-base-file",
    description: "i18n base file during development",
    prompt: "Which i18n file should I update during development?",
    category: "i18n",
    expectedSkill: "ui5-best-practices",
    expectedContent: "i18n.properties"
  },

  // Component Initialization (1 test)
  {
    id: 17,
    name: "component-support",
    description: "Declarative component initialization",
    prompt: "How to initialize the root component declaratively?",
    category: "component-init",
    expectedSkill: "ui5-best-practices",
    expectedContent: "ComponentSupport"
  },

  // Negative Test Cases (3 tests)
  {
    id: 18,
    name: "negative-react",
    description: "React hooks (should NOT trigger)",
    prompt: "How do I use React hooks?",
    category: "negative",
    expectedSkill: null,
  },
  {
    id: 19,
    name: "negative-vue",
    description: "Vue.js reactivity (should NOT trigger)",
    prompt: "Vue.js reactive data binding",
    category: "negative",
    expectedSkill: null,
  },
  {
    id: 20,
    name: "negative-python",
    description: "Python types (should NOT trigger)",
    prompt: "Python type hints tutorial",
    category: "negative",
    expectedSkill: null,
  }
];

export const testCasesByCategory = {
  "module-loading": testCases.filter(tc => tc.category === "module-loading"),
  "data-binding": testCases.filter(tc => tc.category === "data-binding"),
  "security-csp": testCases.filter(tc => tc.category === "security-csp"),
  "form-creation": testCases.filter(tc => tc.category === "form-creation"),
  "typescript-events": testCases.filter(tc => tc.category === "typescript-events"),
  "cap-integration": testCases.filter(tc => tc.category === "cap-integration"),
  "mcp-tooling": testCases.filter(tc => tc.category === "mcp-tooling"),
  "i18n": testCases.filter(tc => tc.category === "i18n"),
  "component-init": testCases.filter(tc => tc.category === "component-init"),
  "negative": testCases.filter(tc => tc.category === "negative")
};

export const testCaseCount = testCases.length;
export const categoriesCount = Object.keys(testCasesByCategory).length;
