#!/usr/bin/env node

import { Command } from "commander";
import { execSync } from "child_process";
import { showConfig, updateConfig } from "../lib/config_handler.js";
import logger from "../lib/logger.js";
import path from "path";
import { fileURLToPath } from "url";
import { runTests, showTestcases } from "../lib/testcase.js";

const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory
const SERVER_PATH = path.join(__dirname, "..", "lib", "server.js");
const SERVER_NAME = "cp-utility-server";
const program = new Command();

// Utility function to check if the server is running
function isServerRunning() {
  try {
    const result = execSync("pm2 jlist").toString();
    const processList = JSON.parse(result);
    const server = processList.find((proc) => proc.name === SERVER_NAME);
    return server && server.pm2_env.status === "online";
  } catch (error) {
    return false;
  }
}

// Set the global option
program.option(
  "-e, --extension <extension>",
  "Set extension as <extension> if supported"
);

// Define the init command
program
  .command("init")
  .description("Set workspace as pwd.")
  .action(() => {
    const options = program.opts();
    updateConfig({ workspace: process.env.PWD, ...options });
  });

// Define the start command
program
  .command("start")
  .description("Start the server if not running.")
  .action(() => {
    if (!isServerRunning()) {
      execSync(`pm2 start ${SERVER_PATH} --name ${SERVER_NAME}`, {
        stdio: "inherit",
      });
    } else {
      logger.info("Server is already running.");
    }
  });

// Define the stop command
program
  .command("stop")
  .description("Stop the server if running.")
  .action(() => {
    if (isServerRunning()) {
      execSync(`pm2 stop ${SERVER_NAME}`, { stdio: "inherit" });
    } else {
      logger.info("Server is not running.");
    }
  });

// Define the restart command
program
  .command("restart")
  .description("Restart the server.")
  .action(() => {
    if (isServerRunning()) {
      execSync(`pm2 restart ${SERVER_NAME}`, { stdio: "inherit" });
    } else {
      execSync(`pm2 start ${SERVER_PATH} --name ${SERVER_NAME}`, {
        stdio: "inherit",
      });
    }
  });

// Define the kill command
program
  .command("kill")
  .description("Kill the server.")
  .action(() => {
    if (isServerRunning()) {
      execSync(`pm2 delete ${SERVER_NAME}`, { stdio: "inherit" });
    } else {
      logger.info("Server is not running.");
    }
  });

// Define the status command
program
  .command("status")
  .description("Show config and server status.")
  .action(() => {
    showConfig();
    if (isServerRunning()) {
      logger.info("Server is running.");
    } else {
      logger.info("Server is not running.");
    }
  });

// Define `test` and `t` commands as aliases with an option for `-f`
program
  .command("test [index]")
  .alias("t")
  .description("Check testcases of the last parsed problem or a specific file.")
  .option("-f, --file <filename>", "Specify a file to check testcases for.")
  .action((index, options) => {
    // console.log(index, options);
    runTests(index, options);
  });

// Define `testcase` and `tc` commands as aliases with an option for `-f`
program
  .command("testcase [index]")
  .alias("tc")
  .description("Show testcases of the last parsed problem or a specific file.")
  .option("-f, --file <filename>", "Specify a file to show testcases for.")
  .action((index, options) => {
    // console.log(index, options);
    showTestcases(index, options);
  });

// Handle the global option when no command is provided
program.action(() => {
  const options = program.opts();
  if (options.extension) {
    updateConfig(options);
  } else {
    program.help(); // Show help if no command is provided and no valid option
  }
});

// Parse the command-line arguments
program.parse(process.argv);
