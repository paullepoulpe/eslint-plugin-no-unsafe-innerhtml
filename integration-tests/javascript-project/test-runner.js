const { IntegrationTestRunner } = require('../shared/test-runner');

async function runJavaScriptIntegrationTest() {
  const runner = new IntegrationTestRunner(__dirname, 'JavaScript Project');
  const success = await runner.runTests();
  
  if (!success) {
    process.exit(1);
  }
}

if (require.main === module) {
  runJavaScriptIntegrationTest();
}