module.exports = {
	root: true,
	env: {
		browser: true,
		es6: true,
		node: true,
	},
	parser: '@typescript-eslint/parser',
	parserOptions: {
		project: './tsconfig.json',
		sourceType: 'module',
		ecmaVersion: 2020,
	},
	plugins: ['@typescript-eslint'],
	extends: ['eslint:recommended'],
	rules: {
		'@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
		'@typescript-eslint/explicit-function-return-type': 'off',
		'@typescript-eslint/no-explicit-any': 'warn',
		'no-unused-vars': 'off',
	},
	ignorePatterns: ['dist/**', 'node_modules/**'],
};
