import js from "@eslint/js";
import tsParser from "@typescript-eslint/parser";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";

export default [
  {
    ignores: [
      "dist/**",
      "node_modules/**",
      "data/**",
      "server.js",
      "src/app/components/ui/**",
      "src/app/components/design-system/**",
      "src/app/components/ArtifactStatesDemo.tsx",
      "src/app/components/MatchedCasesStatesDemo.tsx",
      "src/app/components/OrganizationStatesDemo.tsx",
      "src/app/components/UploadStatesDemo.tsx",
      "src/app/components/DesignSystemPage.tsx",
      "src/app/components/NavigationHub.tsx"
    ],
  },
  js.configs.recommended,
  {
    files: ["src/**/*.{ts,tsx}", "vite.config.ts", "vitest.config.ts", "playwright.config.ts"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: "./tsconfig.json",
        tsconfigRootDir: import.meta.dirname,
      },
      globals: {
        window: "readonly",
        document: "readonly",
        navigator: "readonly",
        FileReader: "readonly",
        crypto: "readonly",
      },
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": "off",
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/purity": "off",
      "no-undef": "off",
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
];
