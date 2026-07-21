import coreWebVitals from "eslint-config-next/core-web-vitals";
import typescript from "eslint-config-next/typescript";

const eslintConfig = [
	{
		ignores: [
			".next/**",
			".open-next/**",
			".wrangler/**",
			"node_modules/**",
			"playwright-report/**",
			"test-results/**",
			"cloudflare-env.d.ts",
			"next-env.d.ts",
		],
	},
	...coreWebVitals,
	...typescript,
];

export default eslintConfig;
