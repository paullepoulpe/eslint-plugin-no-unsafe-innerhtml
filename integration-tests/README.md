# Integration Tests for eslint-plugin-no-unsafe-innerhtml

This directory contains comprehensive integration tests that verify the ESLint plugin works correctly across different project types and configurations.

## Structure

```
integration-tests/
├── run-all-tests.js          # Main test runner for all projects
├── shared/
│   └── test-runner.js        # Shared test logic
├── javascript-project/       # JavaScript ES6+ project tests
│   ├── package.json
│   ├── .eslintrc.js
│   ├── test-runner.js
│   └── src/
│       ├── unsafe-examples.js
│       └── safe-examples.js
└── typescript-project/       # TypeScript project tests
    ├── package.json
    ├── .eslintrc.js
    ├── tsconfig.json
    ├── test-runner.js
    └── src/
        ├── unsafe-examples.ts
        └── safe-examples.ts
```

## Running Tests

### Run All Integration Tests
```bash
cd integration-tests
node run-all-tests.js
```

### Run Individual Project Tests
```bash
# JavaScript project
cd integration-tests/javascript-project
npm install
npm test

# TypeScript project  
cd integration-tests/typescript-project
npm install
npm test
```

### Manual Linting
```bash
# JavaScript project
cd integration-tests/javascript-project
npm run lint              # See violations
npm run lint:fix          # Apply automatic fixes

# TypeScript project
cd integration-tests/typescript-project
npm run lint              # See violations
npm run lint:fix          # Apply automatic fixes
npm run build             # Type check
```

## Test Coverage

Each integration test verifies:

1. **Plugin Detection**: Confirms the plugin correctly identifies `innerHTML` assignments
2. **Safe Code Acceptance**: Ensures safe patterns are not flagged
3. **Suggestion Quality**: Validates that suggestions are provided and work correctly
4. **Code Transformation**: Verifies suggested fixes result in syntactically valid code

## Project Types

### JavaScript Project
- Tests ES6+ JavaScript with modern syntax
- Uses standard ESLint configuration
- Covers common DOM manipulation patterns
- Includes module imports/exports

### TypeScript Project  
- Tests TypeScript with strict type checking
- Uses @typescript-eslint parser and plugins
- Covers TypeScript-specific patterns (interfaces, classes, generics)
- Includes proper type annotations
- Verifies compatibility with TypeScript compiler

## Expected Results

When tests pass, you'll see output like:

```
🚀 Running All Integration Tests for eslint-plugin-no-unsafe-innerhtml

Found 2 integration test projects:
  - javascript-project
  - typescript-project

🧪 Running ESLint Plugin Integration Test for JavaScript Project
📁 Project: /path/to/integration-tests/javascript-project

📋 Test 1: Checking that plugin detects innerHTML violations...
✅ PASSED: Found 8 innerHTML violations as expected

📋 Test 2: Checking that safe examples pass...
✅ PASSED: Safe examples passed ESLint

📋 Test 3: Testing suggestion application...
✅ PASSED: ESLint provided suggestions for innerHTML violations
✅ PASSED: Found both safevalues and textContent suggestions

📋 Test 4: Testing that fixed code is syntactically valid...
✅ PASSED: Fixed code passes ESLint validation

🎉 All integration tests passed for JavaScript Project!

🧪 Running ESLint Plugin Integration Test for TypeScript Project
📁 Project: /path/to/integration-tests/typescript-project

📋 Test 1: Checking that plugin detects innerHTML violations...
✅ PASSED: Found 7 innerHTML violations as expected

📋 Test 2: Checking that safe examples pass...
✅ PASSED: Safe examples passed ESLint

📋 Test 3: Testing suggestion application...
✅ PASSED: ESLint provided suggestions for innerHTML violations
✅ PASSED: Found both safevalues and textContent suggestions

📋 Test 4: Testing that fixed code is syntactically valid...
✅ PASSED: Fixed code passes ESLint validation

🎉 All integration tests passed for TypeScript Project!

🎉 All integration tests passed across all projects!
```

## Adding New Projects

To add a new project type:

1. Create a new directory under `integration-tests/`
2. Add `package.json` with appropriate dependencies
3. Add ESLint configuration (`.eslintrc.js`)
4. Create `src/` directory with `unsafe-examples.*` and `safe-examples.*`
5. Add `test-runner.js` that uses the shared test runner
6. The main test runner will automatically discover and run the new project

## Maintenance

- Update dependencies regularly across all projects
- Add new test cases when new vulnerabilities or patterns are discovered
- Ensure TypeScript project stays compatible with latest TypeScript versions
- Test against different ESLint versions periodically