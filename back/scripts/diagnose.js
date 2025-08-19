/**
 * ODRI API Diagnostic Tool
 * 
 * This script helps diagnose common issues with the ODRI API.
 * Run it with: node scripts/diagnose.js
 */

const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');
const { execSync } = require('child_process');

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
};

// Print a header
console.log(`\n${colors.bright}${colors.cyan}=== ODRI API Diagnostic Tool ===${colors.reset}\n`);

// Check if .env file exists
function checkEnvFile() {
  console.log(`${colors.bright}Checking environment configuration:${colors.reset}`);
  
  const envPath = path.join(__dirname, '..', '.env');
  const envExamplePath = path.join(__dirname, '..', '.env.example');
  
  if (fs.existsSync(envPath)) {
    console.log(`${colors.green}✓ .env file exists${colors.reset}`);
    
    // Read .env file
    const envContent = fs.readFileSync(envPath, 'utf8');
    const envLines = envContent.split('\n').filter(line => line.trim() !== '' && !line.startsWith('#'));
    
    console.log(`${colors.dim}Found ${envLines.length} environment variables${colors.reset}`);
    
    // Check for critical variables
    const criticalVars = ['JWT_SECRET', 'DATABASE_URL', 'DATABASE_HOST', 'DATABASE_PORT', 'DATABASE_USERNAME', 'DATABASE_PASSWORD', 'DATABASE_NAME'];
    const missingVars = [];
    
    criticalVars.forEach(varName => {
      if (!envContent.includes(`${varName}=`)) {
        missingVars.push(varName);
      }
    });
    
    if (missingVars.length > 0) {
      console.log(`${colors.yellow}⚠ Missing critical environment variables: ${missingVars.join(', ')}${colors.reset}`);
    } else {
      console.log(`${colors.green}✓ All critical environment variables are defined${colors.reset}`);
    }
  } else {
    console.log(`${colors.red}✗ .env file not found${colors.reset}`);
    
    if (fs.existsSync(envExamplePath)) {
      console.log(`${colors.yellow}ℹ .env.example file exists. You should copy it to .env and update the values.${colors.reset}`);
      console.log(`${colors.dim}Command: cp .env.example .env${colors.reset}`);
    } else {
      console.log(`${colors.red}✗ .env.example file not found either. You need to create a .env file manually.${colors.reset}`);
    }
  }
  
  console.log('');
}

// Check database connection
function checkDatabase() {
  console.log(`${colors.bright}Checking database connection:${colors.reset}`);
  
  try {
    // Create a temporary script to check database connection
    const tempScriptPath = path.join(__dirname, 'temp-db-check.js');
    
    const scriptContent = `
    const { DataSource } = require('typeorm');
    const dataSource = require('../dist/database/data-source').default;
    
    async function checkConnection() {
      try {
        await dataSource.initialize();
        console.log('Database connection successful');
        await dataSource.destroy();
        process.exit(0);
      } catch (error) {
        console.error('Database connection failed:', error.message);
        process.exit(1);
      }
    }
    
    checkConnection();
    `;
    
    fs.writeFileSync(tempScriptPath, scriptContent);
    
    // Execute the script
    execSync(`node ${tempScriptPath}`, { stdio: 'inherit' });
    
    // Clean up
    fs.unlinkSync(tempScriptPath);
    
    console.log(`${colors.green}✓ Database connection successful${colors.reset}`);
  } catch (error) {
    console.log(`${colors.red}✗ Database connection failed${colors.reset}`);
    console.log(`${colors.dim}Check your database configuration in .env file${colors.reset}`);
  }
  
  console.log('');
}

// Check if the API is running
function checkApiRunning() {
  console.log(`${colors.bright}Checking if API is running:${colors.reset}`);
  
  // Try to connect to the health endpoint
  const options = {
    hostname: 'localhost',
    port: process.env.PORT || 3000,
    path: '/api/health',
    method: 'GET',
    timeout: 3000,
  };
  
  const req = http.request(options, (res) => {
    if (res.statusCode === 200) {
      console.log(`${colors.green}✓ API is running (status code: ${res.statusCode})${colors.reset}`);
      
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const healthData = JSON.parse(data);
          console.log(`${colors.dim}Health data: ${JSON.stringify(healthData)}${colors.reset}`);
        } catch (e) {
          console.log(`${colors.dim}Received response: ${data}${colors.reset}`);
        }
      });
    } else {
      console.log(`${colors.yellow}⚠ API responded with status code: ${res.statusCode}${colors.reset}`);
    }
  });
  
  req.on('error', (error) => {
    console.log(`${colors.red}✗ API is not running or not accessible${colors.reset}`);
    console.log(`${colors.dim}Error: ${error.message}${colors.reset}`);
    console.log(`${colors.yellow}ℹ Start the API with: npm run start:dev${colors.reset}`);
  });
  
  req.on('timeout', () => {
    req.destroy();
    console.log(`${colors.red}✗ API request timed out${colors.reset}`);
  });
  
  req.end();
}

// Check for common issues
function checkCommonIssues() {
  console.log(`${colors.bright}Checking for common issues:${colors.reset}`);
  
  // Check if dist directory exists
  const distPath = path.join(__dirname, '..', 'dist');
  if (!fs.existsSync(distPath)) {
    console.log(`${colors.yellow}⚠ dist directory not found. You need to build the project.${colors.reset}`);
    console.log(`${colors.dim}Command: npm run build${colors.reset}`);
  } else {
    console.log(`${colors.green}✓ dist directory exists${colors.reset}`);
  }
  
  // Check if node_modules directory exists
  const nodeModulesPath = path.join(__dirname, '..', 'node_modules');
  if (!fs.existsSync(nodeModulesPath)) {
    console.log(`${colors.yellow}⚠ node_modules directory not found. You need to install dependencies.${colors.reset}`);
    console.log(`${colors.dim}Command: npm install${colors.reset}`);
  } else {
    console.log(`${colors.green}✓ node_modules directory exists${colors.reset}`);
  }
  
  // Check for common port conflicts
  try {
    const netstat = execSync('netstat -ano | findstr "3000"').toString();
    if (netstat.includes('LISTENING')) {
      console.log(`${colors.yellow}⚠ Port 3000 is already in use. This might cause conflicts if you're trying to run the API on this port.${colors.reset}`);
    }
  } catch (error) {
    // Ignore errors from netstat command
  }
  
  console.log('');
}

// Provide troubleshooting tips
function provideTroubleshootingTips() {
  console.log(`${colors.bright}${colors.cyan}Troubleshooting Tips:${colors.reset}\n`);
  
  console.log(`${colors.bright}1. JWT Authentication Issues:${colors.reset}`);
  console.log(`   - Check that JWT_SECRET is properly set in .env`);
  console.log(`   - Ensure tokens are properly formatted with Bearer prefix`);
  console.log(`   - Verify token expiration settings\n`);
  
  console.log(`${colors.bright}2. API Versioning Issues:${colors.reset}`);
  console.log(`   - All protected endpoints should be accessed with /api/v1/ prefix`);
  console.log(`   - Public endpoints don't require versioning`);
  console.log(`   - Check that frontend requests include the correct version\n`);
  
  console.log(`${colors.bright}3. Database Issues:${colors.reset}`);
  console.log(`   - Verify database credentials in .env`);
  console.log(`   - Ensure database server is running`);
  console.log(`   - Run migrations: npm run migration:run\n`);
  
  console.log(`${colors.bright}4. Common Commands:${colors.reset}`);
  console.log(`   - Start development server: npm run start:dev`);
  console.log(`   - Build the project: npm run build`);
  console.log(`   - Run migrations: npm run migration:run`);
  console.log(`   - Generate migration: npm run migration:generate -- -n MigrationName\n`);
  
  console.log(`${colors.bright}5. Logs:${colors.reset}`);
  console.log(`   - Check logs in the logs/ directory`);
  console.log(`   - Enable debug logging by setting LOG_LEVEL=debug in .env\n`);
}

// Run all checks
function runDiagnostics() {
  checkEnvFile();
  checkCommonIssues();
  checkApiRunning();
  provideTroubleshootingTips();
  
  console.log(`\n${colors.bright}${colors.cyan}Diagnostic complete. See above for any issues and recommendations.${colors.reset}\n`);
}

// Run the diagnostics
runDiagnostics();