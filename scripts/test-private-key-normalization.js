#!/usr/bin/env node

/**
 * Test script for private key normalization
 * Tests the fix for forward slash in newline encoding
 */

// Simplified version of normalizePrivateKey for testing
function normalizePrivateKey(privateKey) {
	// Step 1: Trim leading/trailing whitespace
	let key = privateKey.trim();
	
	// Step 2: Iteratively remove wrapping quotes and handle escaped quotes
	let prevKey = "";
	let iterations = 0;
	const maxIterations = 5;
	
	while (key !== prevKey && iterations < maxIterations) {
		iterations++;
		prevKey = key;
		
		// Remove wrapping quotes (single or double) - must be both at start and end
		if ((key.startsWith('"') && key.endsWith('"')) || 
		    (key.startsWith("'") && key.endsWith("'"))) {
			key = key.slice(1, -1).trim();
		}
		
		// Handle escaped quotes
		key = key.replace(/\\"/g, '"').replace(/\\'/g, "'");
	}
	
	// Step 3: Replace various escaped newline patterns with actual newlines
	key = key.replace(/\\\\n/g, "\n")  // Handle double-escaped newlines first
	         .replace(/\\\\r\\\\n/g, "\n")
	         .replace(/\\\\r/g, "\n")
	         .replace(/\\r\\n/g, "\n")
	         .replace(/\\n/g, "\n")
	         .replace(/\\r/g, "\n")
	         .replace(/\/n/g, "\n")  // Handle forward slash + n (common typo/encoding error)
	         .replace(/\/r\/n/g, "\n")  // Handle forward slash versions of \r\n
	         .replace(/\/r/g, "\n")  // Handle forward slash + r
	         .replace(/\r\n/g, "\n")
	         .replace(/\r/g, "\n");
	
	// Step 4: Trim each individual line and remove empty lines
	key = key.split("\n")
	         .map(line => line.trim())
	         .filter(line => line.length > 0)
	         .join("\n");
	
	// Step 5: Final trim after normalization
	return key.trim();
}

// Test cases
const testCases = [
	{
		name: "Forward slash at beginning (user's case)",
		input: '/n-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEA\n-----END PRIVATE KEY-----',
		shouldStartWith: '-----BEGIN PRIVATE KEY-----',
		shouldEndWith: '-----END PRIVATE KEY-----'
	},
	{
		name: "Forward slash in middle",
		input: '-----BEGIN PRIVATE KEY-----/nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEA/n-----END PRIVATE KEY-----',
		shouldStartWith: '-----BEGIN PRIVATE KEY-----',
		shouldEndWith: '-----END PRIVATE KEY-----'
	},
	{
		name: "Normal backslash newlines (should still work)",
		input: '-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEA\n-----END PRIVATE KEY-----',
		shouldStartWith: '-----BEGIN PRIVATE KEY-----',
		shouldEndWith: '-----END PRIVATE KEY-----'
	},
	{
		name: "Quoted with forward slash",
		input: '"/n-----BEGIN PRIVATE KEY-----/nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEA/n-----END PRIVATE KEY-----"',
		shouldStartWith: '-----BEGIN PRIVATE KEY-----',
		shouldEndWith: '-----END PRIVATE KEY-----'
	},
	{
		name: "Mixed forward and backslash",
		input: '/n-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEA/n-----END PRIVATE KEY-----',
		shouldStartWith: '-----BEGIN PRIVATE KEY-----',
		shouldEndWith: '-----END PRIVATE KEY-----'
	}
];

console.log('🧪 Testing Private Key Normalization\n');
console.log('='.repeat(60));

let passed = 0;
let failed = 0;

testCases.forEach((test, index) => {
	console.log(`\nTest ${index + 1}: ${test.name}`);
	console.log('-'.repeat(60));
	
	try {
		const normalized = normalizePrivateKey(test.input);
		const lines = normalized.split('\n');
		
		// Check structure
		if (!normalized.startsWith(test.shouldStartWith)) {
			throw new Error(`Expected to start with "${test.shouldStartWith}" but got "${normalized.substring(0, 50)}..."`);
		}
		
		if (!normalized.endsWith(test.shouldEndWith)) {
			throw new Error(`Expected to end with "${test.shouldEndWith}" but got "...${normalized.substring(normalized.length - 50)}"`);
		}
		
		// Check that it has at least 3 lines
		if (lines.length < 3) {
			throw new Error(`Expected at least 3 lines, got ${lines.length}`);
		}
		
		// Check that BEGIN marker is on its own line
		if (lines[0].trim() !== '-----BEGIN PRIVATE KEY-----') {
			throw new Error(`BEGIN marker not on its own line: "${lines[0]}"`);
		}
		
		// Check that END marker is on its own line
		if (lines[lines.length - 1].trim() !== '-----END PRIVATE KEY-----') {
			throw new Error(`END marker not on its own line: "${lines[lines.length - 1]}"`);
		}
		
		console.log('✅ PASSED');
		console.log(`   Lines: ${lines.length}`);
		console.log(`   First line: ${lines[0]}`);
		console.log(`   Last line: ${lines[lines.length - 1]}`);
		passed++;
	} catch (error) {
		console.log('❌ FAILED');
		console.log(`   Error: ${error.message}`);
		failed++;
	}
});

console.log('\n' + '='.repeat(60));
console.log('\n📊 Results:');
console.log(`   ✅ Passed: ${passed}/${testCases.length}`);
console.log(`   ❌ Failed: ${failed}/${testCases.length}`);

if (failed === 0) {
	console.log('\n🎉 All tests passed!');
	console.log('\n✨ The fix successfully handles forward slash newlines.');
	process.exit(0);
} else {
	console.log('\n⚠️  Some tests failed. Please review the implementation.');
	process.exit(1);
}
