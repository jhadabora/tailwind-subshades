import js from "@eslint/js";
import tseslint from "typescript-eslint";
import importPlugin from 'eslint-plugin-import-x';
import unusedImports from "eslint-plugin-unused-imports";
import prettier from 'eslint-plugin-prettier/recommended';

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
    ...importPlugin.flatConfigs.recommended,
    files: ["src/**/*.ts", "test/**/*", "test/**/*.ts"],
    rules: {
      'import-x/no-unresolved': 'off',
      'import-x/order': [
        "error",
        {
          "groups": [
            // Imports of builtins are first
            "builtin",
            // Then sibling and parent imports. They can be mingled together
            ["sibling", "parent"],
            // Then index file imports
            "index",
            // Then any arcane TypeScript imports
            "object",
            // Then the omitted imports: internal, external, type, unknown
          ],
        },
      ],
    }
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
      "max-len": ["error", { code: 120 }],

      'no-var': 'error',
      "prefer-const": "error",
      'prefer-rest-params': 'error',
      'prefer-spread': 'error',

      "@typescript-eslint/no-explicit-any": "warn",

      "unused-imports/no-unused-imports": "error",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_"
        }
      ],

      "array-callback-return": "off",
    }
  },
  {
    files: ["src/**/*.ts", "test/**/*", "test/**/*.ts"],

    ...prettier,
  },
  {
    files: ["test/dist/*"],

    rules: {
      '@typescript-eslint/no-require-imports': 'off',
    }
  }
];