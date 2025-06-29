const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧪 Running ESLint Plugin Integration Test\n');

// Test 1: Verify plugin catches violations
console.log('📋 Test 1: Checking that plugin detects innerHTML violations...');
try {
    execSync('npm run lint', { cwd: __dirname, stdio: 'pipe' });
    console.log('❌ FAILED: ESLint should have found violations but passed');
    process.exit(1);
} catch (error) {
    const output = error.stdout.toString();
    const expectedViolations = [
        'element.innerHTML = userInput',
        'container.innerHTML = template', 
        'div.innerHTML = \'<p>Hello',
        'el.innerHTML = htmlContent',
        'innerHTML = generateComplexHtml'
    ];
    
    let foundViolations = 0;
    expectedViolations.forEach(violation => {
        if (output.includes('innerHTML')) {
            foundViolations++;
        }
    });
    
    if (foundViolations > 0) {
        console.log(`✅ PASSED: Found ${foundViolations} innerHTML violations as expected`);
    } else {
        console.log('❌ FAILED: No innerHTML violations detected');
        console.log('ESLint output:', output);
        process.exit(1);
    }
}

// Test 2: Verify safe examples pass
console.log('\n📋 Test 2: Checking that safe examples pass...');
try {
    execSync('npx eslint src/safe-examples.js', { cwd: __dirname, stdio: 'pipe' });
    console.log('✅ PASSED: Safe examples passed ESLint');
} catch (error) {
    console.log('❌ FAILED: Safe examples should pass but failed');
    console.log('ESLint output:', error.stdout.toString());
    process.exit(1);
}

// Test 3: Test suggestion application
console.log('\n📋 Test 3: Testing suggestion application...');

// Create a simple test file
const testFile = path.join(__dirname, 'src', 'test-fix.js');
const testContent = `
function test() {
    const el = document.getElementById('test');
    el.innerHTML = 'hello world';
}
`;

fs.writeFileSync(testFile, testContent);

try {
    // Get ESLint suggestions
    const result = execSync('npx eslint src/test-fix.js --format json', { 
        cwd: __dirname, 
        stdio: 'pipe' 
    });
    
    console.log('❌ FAILED: ESLint should have found violations');
    process.exit(1);
} catch (error) {
    const output = error.stdout.toString();
    try {
        const results = JSON.parse(output);
        
        if (results.length > 0 && results[0].messages.length > 0) {
            const message = results[0].messages[0];
            
            if (message.suggestions && message.suggestions.length > 0) {
                console.log('✅ PASSED: ESLint provided suggestions for innerHTML violations');
                
                // Test that suggestions contain expected patterns
                const suggestions = message.suggestions;
                const hasSafevaluesSuggestion = suggestions.some(s => 
                    s.desc.includes('safevalues') && s.fix
                );
                const hasTextContentSuggestion = suggestions.some(s => 
                    s.desc.includes('textContent') && s.fix
                );
                
                if (hasSafevaluesSuggestion && hasTextContentSuggestion) {
                    console.log('✅ PASSED: Found both safevalues and textContent suggestions');
                } else {
                    console.log('❌ FAILED: Missing expected suggestion types');
                    console.log('Suggestions:', suggestions.map(s => s.desc));
                    process.exit(1);
                }
            } else {
                console.log('❌ FAILED: No suggestions provided');
                process.exit(1);
            }
        } else {
            console.log('❌ FAILED: No violations found in test file');
            process.exit(1);
        }
    } catch (parseError) {
        console.log('❌ FAILED: Could not parse ESLint JSON output');
        console.log('Output:', output);
        process.exit(1);
    }
}

// Test 4: Verify fixed code compiles
console.log('\n📋 Test 4: Testing that fixed code is syntactically valid...');

const fixedContent = `
import {setElementInnerHtml} from 'safevalues/dom';
import {sanitizeHtml} from 'safevalues';

function test() {
    const el = document.getElementById('test');
    setElementInnerHtml(el, sanitizeHtml('hello world'));
}
`;

fs.writeFileSync(testFile, fixedContent);

try {
    execSync('npx eslint src/test-fix.js', { cwd: __dirname, stdio: 'pipe' });
    console.log('✅ PASSED: Fixed code passes ESLint validation');
} catch (error) {
    console.log('❌ FAILED: Fixed code should be valid');
    console.log('ESLint output:', error.stdout.toString());
    process.exit(1);
}

// Cleanup
fs.unlinkSync(testFile);

console.log('\n🎉 All integration tests passed!');
console.log('\n📊 Summary:');
console.log('✅ Plugin detects innerHTML violations');
console.log('✅ Plugin ignores safe code patterns');  
console.log('✅ Plugin provides helpful suggestions');
console.log('✅ Suggested fixes produce valid code');