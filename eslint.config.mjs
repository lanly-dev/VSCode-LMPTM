import typescriptEslint from "@typescript-eslint/eslint-plugin"
import tsParser from "@typescript-eslint/parser"

export default [{
  files: [`**/*.ts`]
}, {
  ignores: [`**/dist`]
}, {
  plugins: {
    "@typescript-eslint": typescriptEslint
  },
  languageOptions: {
    parser: tsParser,
    ecmaVersion: 2022,
    sourceType: `module`
  },
  rules: {
    "@typescript-eslint/naming-convention": [`warn`, { selector: `import`, format: [`camelCase`, `PascalCase`] }],
    "comma-dangle": [`error`, `never`],
    "no-throw-literal": `warn`,
    "quote-props": [`error`, `as-needed`],
    curly: [`error`, `multi-or-nest`],
    eqeqeq: `error`,
    quotes: [`error`, `backtick`],
    semi: [`error`, `never`]
  }
}]
