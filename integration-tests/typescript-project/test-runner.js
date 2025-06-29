const { IntegrationTestRunner } = require('../shared/test-runner');

async function runTypeScriptIntegrationTest() {
  const runner = new IntegrationTestRunner(__dirname, 'TypeScript Project');
  const success = await runner.runTests();
  
  if (!success) {
    process.exit(1);
  }
}

if (require.main === module) {
  runTypeScriptIntegrationTest();
}