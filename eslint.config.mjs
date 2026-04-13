import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      /** Legitimate for drawer/modal reset, URL sync, and hydration — flags most `useEffect` + `setState` flows. */
      "react-hooks/set-state-in-effect": "off",
      /** Ref-mirror pattern for stable callbacks (e.g. checkout drawer) is intentional. */
      "react-hooks/refs": "off",
      /** Manual `useMemo` deps are often narrower than the compiler’s inference; disabling avoids false positives on large screens. */
      "react-hooks/preserve-manual-memoization": "off",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
