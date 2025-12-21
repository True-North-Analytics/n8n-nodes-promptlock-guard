const fs = require('fs');
const path = require('path');

describe('Build Tests', () => {
	const distPath = path.join(__dirname, '..', 'dist');

	test('dist directory should exist after build', () => {
		expect(fs.existsSync(distPath)).toBe(true);
	});

	test('credentials should be compiled', () => {
		const credPath = path.join(distPath, 'credentials', 'PromptLockApiKey.credentials.js');
		expect(fs.existsSync(credPath)).toBe(true);
	});

	test('node should be compiled', () => {
		const nodePath = path.join(distPath, 'nodes', 'PromptLockGuard', 'PromptLockGuard.node.js');
		expect(fs.existsSync(nodePath)).toBe(true);
	});

	test('icon should be copied', () => {
		const iconPath = path.join(distPath, 'nodes', 'PromptLockGuard', 'promptlock.svg');
		expect(fs.existsSync(iconPath)).toBe(true);
	});

	test('package.json should have correct n8n configuration', () => {
		const pkg = require('../package.json');

		expect(pkg.n8n).toBeDefined();
		expect(pkg.n8n.credentials).toContain('dist/credentials/PromptLockApiKey.credentials.js');
		expect(pkg.n8n.nodes).toContain('dist/nodes/PromptLockGuard/PromptLockGuard.node.js');
	});
});
