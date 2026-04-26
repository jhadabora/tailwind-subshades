import js from "@eslint/js";
import tseslint from "typescript-eslint";
import unusedImports from "eslint-plugin-unused-imports";

export default [
  {
    ...js.configs.recommended,
    files: ["src/**/*.ts", "test/**/*", "test/**/*.ts"],
  },
  {
    ...tseslint.configs.recommended[0],
    files: ["src/**/*.ts", "test/**/*", "test/**/*.ts"],
  },
  {
    ...tseslint.configs.recommended[1],
    files: ["src/**/*.ts", "test/**/*", "test/**/*.ts"],
  },
  {
    ...tseslint.configs.recommended[2],
    files: ["src/**/*.ts", "test/**/*", "test/**/*.ts"],
  },
  {
    files: ["src/**/*.ts", "test/**/*", "test/**/*.ts"],

    plugins: {
      "unused-imports": unusedImports
    },

    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        sourceType: "module"
      }
    },

    rules: {
      "@typescript-eslint/no-explicit-any": "warn",

      "unused-imports/no-unused-imports": "error",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_"
        }
      ],

      'no-var': 'error',
      "prefer-const": "error",
      'prefer-rest-params': 'error',
      'prefer-spread': 'error',

      "array-callback-return": "off",
    }
  },
  {
    files: ["test/dist/*"],

    rules: {
      '@typescript-eslint/no-require-imports': 'off',
    }
  }
];