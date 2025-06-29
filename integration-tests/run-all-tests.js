#!/usr/bin/env node

const { IntegrationTestRunner } = require('./shared/test-runner');
const path = require('path');
const fs = require('fs');

async function runAllIntegrationTests() {
  console.log('🚀 Running All Integration Tests for eslint-plugin-no-unsafe-innerhtml\n');
  
  const integrationDir = __dirname;
  const projects = [];
  
  // Discover all project directories
  const entries = fs.readdirSync(integrationDir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory() && entry.name !== 'shared' && !entry.name.startsWith('.')) {
      const projectPath = path.join(integrationDir, entry.name);
      const packageJsonPath = path.join(projectPath, 'package.json');
      
      if (fs.existsSync(packageJsonPath)) {
        projects.push({
          name: entry.name,
          path: projectPath
        });
      }
    }
  }
  
  if (projects.length === 0) {
    console.log('❌ No integration test projects found');
    process.exit(1);
  }
  
  console.log(`Found ${projects.length} integration test projects:`);
  projects.forEach(project => console.log(`  - ${project.name}`));
  console.log('');
  
  let allPassed = true;
  
  for (const project of projects) {
    const runner = new IntegrationTestRunner(project.path, project.name);
    const passed = await runner.runTests();
    
    if (!passed) {
      allPassed = false;
    }
  }
  
  if (allPassed) {
    console.log('🎉 All integration tests passed across all projects!');
    process.exit(0);
  } else {
    console.log('❌ Some integration tests failed');
    process.exit(1);
  }
}

// Install dependencies for all projects if needed
async function installDependencies() {
  const { execSync } = require('child_process');
  const integrationDir = __dirname;
  
  const entries = fs.readdirSync(integrationDir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory() && entry.name !== 'shared' && !entry.name.startsWith('.')) {
      const projectPath = path.join(integrationDir, entry.name);
      const packageJsonPath = path.join(projectPath, 'package.json');
      const nodeModulesPath = path.join(projectPath, 'node_modules');
      
      if (fs.existsSync(packageJsonPath) && !fs.existsSync(nodeModulesPath)) {
        console.log(`📦 Installing dependencies for ${entry.name}...`);
        try {
          execSync('npm install', { cwd: projectPath, stdio: 'inherit' });
        } catch (error) {
          console.error(`❌ Failed to install dependencies for ${entry.name}:`, error.message);
          process.exit(1);
        }
      }
    }
  }
}

if (require.main === module) {
  installDependencies().then(() => {
    runAllIntegrationTests();
  });
}

module.exports = { runAllIntegrationTests };