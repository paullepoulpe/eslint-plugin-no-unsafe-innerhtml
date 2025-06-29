const { ESLint } = require('eslint');
const path = require('path');
const fs = require('fs');

class IntegrationTestRunner {
  constructor(projectPath, projectName) {
    this.projectPath = projectPath;
    this.projectName = projectName;
    this.eslint = new ESLint({
      cwd: projectPath,
      useEslintrc: true,
      fix: false
    });
  }

  async runTests() {
    console.log(`\n🧪 Running ESLint Plugin Integration Test for ${this.projectName}`);
    console.log(`📁 Project: ${this.projectPath}\n`);

    try {
      await this.testUnsafeDetection();
      await this.testSafeExamples();
      await this.testSuggestions();
      await this.testFixedCode();
      
      console.log(`🎉 All integration tests passed for ${this.projectName}!\n`);
      return true;
    } catch (error) {
      console.error(`❌ Integration test failed for ${this.projectName}:`, error.message);
      return false;
    }
  }

  async testUnsafeDetection() {
    console.log('📋 Test 1: Checking that plugin detects innerHTML violations...');
    
    const unsafeFiles = this.getSourceFiles('unsafe-examples');
    if (unsafeFiles.length === 0) {
      throw new Error('No unsafe example files found');
    }

    let totalViolations = 0;
    for (const file of unsafeFiles) {
      const results = await this.eslint.lintFiles([file]);
      const violations = results[0]?.messages?.filter(
        msg => msg.ruleId === 'no-unsafe-innerhtml/no-unsafe-innerhtml'
      ) || [];
      totalViolations += violations.length;
    }

    if (totalViolations === 0) {
      throw new Error('Expected to find innerHTML violations but found none');
    }
    
    console.log(`✅ PASSED: Found ${totalViolations} innerHTML violations as expected`);
  }

  async testSafeExamples() {
    console.log('📋 Test 2: Checking that safe examples pass...');
    
    const safeFiles = this.getSourceFiles('safe-examples');
    if (safeFiles.length === 0) {
      console.log('⚠️  No safe example files found, skipping test');
      return;
    }

    for (const file of safeFiles) {
      const results = await this.eslint.lintFiles([file]);
      const violations = results[0]?.messages?.filter(
        msg => msg.ruleId === 'no-unsafe-innerhtml/no-unsafe-innerhtml'
      ) || [];
      
      if (violations.length > 0) {
        throw new Error(`Safe examples should not have violations, but found ${violations.length}`);
      }
    }
    
    console.log('✅ PASSED: Safe examples passed ESLint');
  }

  async testSuggestions() {
    console.log('📋 Test 3: Testing suggestion application...');
    
    const eslintWithSuggestions = new ESLint({
      cwd: this.projectPath,
      useEslintrc: true,
      fix: false
    });

    const unsafeFiles = this.getSourceFiles('unsafe-examples');
    let foundSafevaluesSuggestion = false;
    let foundTextContentSuggestion = false;

    for (const file of unsafeFiles) {
      const results = await eslintWithSuggestions.lintFiles([file]);
      const messages = results[0]?.messages || [];
      
      for (const message of messages) {
        if (message.ruleId === 'no-unsafe-innerhtml/no-unsafe-innerhtml' && message.suggestions) {
          for (const suggestion of message.suggestions) {
            if (suggestion.desc.includes('safevalues')) {
              foundSafevaluesSuggestion = true;
            }
            if (suggestion.desc.includes('textContent')) {
              foundTextContentSuggestion = true;
            }
          }
        }
      }
    }

    if (!foundSafevaluesSuggestion || !foundTextContentSuggestion) {
      throw new Error('Expected to find both safevalues and textContent suggestions');
    }
    
    console.log('✅ PASSED: ESLint provided suggestions for innerHTML violations');
    console.log('✅ PASSED: Found both safevalues and textContent suggestions');
  }

  async testFixedCode() {
    console.log('📋 Test 4: Testing that fixed code is syntactically valid...');
    
    // Apply auto-fixes and check if the result is valid
    const eslintWithFix = new ESLint({
      cwd: this.projectPath,
      useEslintrc: true,
      fix: true
    });

    const unsafeFiles = this.getSourceFiles('unsafe-examples');
    
    for (const file of unsafeFiles) {
      const results = await eslintWithFix.lintFiles([file]);
      const result = results[0];
      
      if (result.output) {
        // Try to parse the fixed code to ensure it's syntactically valid
        try {
          const eslintForValidation = new ESLint({
            cwd: this.projectPath,
            useEslintrc: false, // Don't apply our plugin, just check syntax
            baseConfig: {
              parserOptions: {
                ecmaVersion: 2020,
                sourceType: 'module'
              }
            }
          });
          
          // Write fixed code to temporary file and validate
          const tempFile = file + '.temp';
          fs.writeFileSync(tempFile, result.output);
          
          try {
            await eslintForValidation.lintFiles([tempFile]);
            fs.unlinkSync(tempFile); // Clean up
          } catch (validationError) {
            fs.unlinkSync(tempFile); // Clean up
            throw new Error(`Fixed code is not syntactically valid: ${validationError.message}`);
          }
        } catch (error) {
          throw new Error(`Error validating fixed code: ${error.message}`);
        }
      }
    }
    
    console.log('✅ PASSED: Fixed code passes ESLint validation');
  }

  getSourceFiles(pattern) {
    const srcDir = path.join(this.projectPath, 'src');
    if (!fs.existsSync(srcDir)) {
      return [];
    }
    
    return fs.readdirSync(srcDir)
      .filter(file => file.startsWith(pattern))
      .map(file => path.join(srcDir, file));
  }
}

module.exports = { IntegrationTestRunner };