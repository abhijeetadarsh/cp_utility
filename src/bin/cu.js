#!/usr/bin/env node

import { Command } from "commander";
import { start, stop } from "../lib/server.js";
import init from "../lib/init.js";
import { setExtension } from "../lib/config_handler.js";
import { runTests, showTestcases } from "../lib/testcase.js";

const program = new Command();

program
  .command("init")
  .description("Set workspace as pwd and start the server if not running")
  .action(init);

program
  .command("start")
  .description("Start the server if not running")
  .action(start);

program.command("stop").description("Stop the server if running").action(stop);

program
  .command("ext <extension>")
  .description("Set extension as <extension> if supported")
  .action(setExtension);

program
  .command("test")
  .alias("t")
  .option("-f, --file <filename>")
  .action((options) => runTests(options));

program.parse(process.argv);
