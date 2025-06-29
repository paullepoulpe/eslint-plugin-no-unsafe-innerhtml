# Integration Test for eslint-plugin-no-unsafe-innerhtml

This directory contains a complete integration test suite for the ESLint plugin that verifies:

1. **Plugin Detection**: Confirms the plugin correctly identifies `innerHTML` assignments
2. **Safe Code Acceptance**: Ensures safe patterns are not flagged
3. **Suggestion Quality**: Validates that suggestions are provided and work correctly
4. **Code Compilation**: Verifies suggested fixes result in syntactically valid code

## Running the Tests

```bash
npm install
npm test
```

## Test Structure

- `src/unsafe-examples.js` - Contains various `innerHTML` violations that should be caught
- `src/safe-examples.js` - Contains safe patterns that should NOT be flagged  
- `test-runner.js` - Comprehensive test script that validates all functionality
- `.eslintrc.js` - ESLint configuration using the plugin

## Expected Results

When running the tests, you should see:

```
🧪 Running ESLint Plugin Integration Test

📋 Test 1: Checking that plugin detects innerHTML violations...
✅ PASSED: Found 5 innerHTML violations as expected

📋 Test 2: Checking that safe examples pass...
✅ PASSED: Safe examples passed ESLint

📋 Test 3: Testing suggestion application...
✅ PASSED: ESLint provided suggestions for innerHTML violations
✅ PASSED: Found both safevalues and textContent suggestions

📋 Test 4: Testing that fixed code is syntactically valid...
✅ PASSED: Fixed code passes ESLint validation

🎉 All integration tests passed!
```

## Manual Testing

You can also run ESLint manually to see the plugin in action:

```bash
# See all violations
npm run lint

# Apply suggested fixes (where possible)
npm run lint:fix
```