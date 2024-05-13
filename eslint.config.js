const globals = require("globals");
const pluginJs = require("@eslint/js");
const tseslint = require("typescript-eslint");


module.exports = [
  { languageOptions: { globals: globals.browser } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
];
