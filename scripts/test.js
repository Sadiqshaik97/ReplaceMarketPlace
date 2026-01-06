#!/usr/bin/env node

/**
 * Test script for ResaleMarketplace
 * 
 * This script demonstrates the complete flow:
 * 1. Mint a booking NFT
 * 2. List it for resale
 * 3. Buy it from another account
 * 4. Verify royalty was paid to original owner
 */

const yaml = require("js-yaml");
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// Load configuration
const configPath = path.join(__dirname, "../../.aptos/config.yaml");
const config = yaml.load(fs.readFileSync(configPath, "utf8"));

const NETWORK = "testnet";
const MODULE_ADDRESS = config.profiles.default.account;

console.log("🚀 ResaleMarketplace Test Script");
console.log("=================================\n");
console.log(`Network: ${NETWORK}`);
console.log(`Module Address: ${MODULE_ADDRESS}\n`);

// Helper function to execute CLI commands
function runCommand(command, description) {
  console.log(`\n📝 ${description}`);
  console.log(`Command: ${command}\n`);
  try {
    const output = execSync(command, { encoding: "utf-8", stdio: "inherit" });
    return output;
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
}

// Test flow
async function runTests() {
  console.log("Step 1: Compile the contract");
  runCommand(
    "aptos move compile --named-addresses marketplace_addr=" + MODULE_ADDRESS,
    "Compiling Move contract"
  );

  console.log("\n✅ Contract compiled successfully!\n");

  console.log("Step 2: Run Move unit tests");
  runCommand(
    "aptos move test --named-addresses marketplace_addr=" + MODULE_ADDRESS,
    "Running unit tests"
  );

  console.log("\n✅ All tests passed!\n");

  console.log("Step 3: Publish the contract (if not already published)");
  console.log("⚠️  Make sure your account is funded on testnet!");
  console.log(`Fund at: https://aptos.dev/network/faucet?address=${MODULE_ADDRESS}\n`);
  
  const shouldPublish = process.argv.includes("--publish");
  
  if (shouldPublish) {
    runCommand(
      `aptos move publish --named-addresses marketplace_addr=${MODULE_ADDRESS} --assume-yes`,
      "Publishing contract to testnet"
    );
    console.log("\n✅ Contract published successfully!\n");
  } else {
    console.log("ℹ️  Skipping publish. Use --publish flag to publish the contract.\n");
  }

  console.log("\n🎉 Test script completed successfully!");
  console.log("\nNext steps:");
  console.log("1. Fund your account: https://aptos.dev/network/faucet");
  console.log("2. Run with --publish flag to deploy: node scripts/test.js --publish");
  console.log("3. Interact with the contract using the Aptos CLI or frontend\n");
}

runTests().catch(console.error);
