import { exec } from "child_process";
import util from "util";
import logger from "./logger.js";
import { getConfig } from "./config_handler.js";
import fs from "fs/promises";
import path from "path";
import os from "os";

const execPromise = util.promisify(exec);
let testcases_dir = path.join(
  process.env.HOME,
  ".cache",
  "cp_utility",
  "testcases"
);

const fileFinder = async (options) => {
  try {
    let filename = "";
    let filepath = "";

    if (options.file) {
      filename = options.file.split(".")[0];
      filepath = path.join(process.env.PWD, options.file);
    } else {
      const config = await getConfig();
      filename = config.curr_filename;
      filepath = path.join(
        config.workspace,
        `${config.curr_filename}.${config.extension}`
      );
    }

    return [filename, filepath];
  } catch (err) {
    logger.error(err);
  }
};

// Helper function to create a temporary input file
const createTempInputFile = async (inputContent) => {
  const tempInputFile = path.join(os.tmpdir(), "__tmpinputfile.txt");
  // logger.log(tempInputFile);
  await fs.writeFile(tempInputFile, inputContent);
  return tempInputFile;
};

// Function to run test based on file extension
const runTest = async (filepath, inputContent) => {
  const extension = path.extname(filepath);
  const binaryPath = path.join(testcases_dir, "binary.exe");
  const tempInputFile = await createTempInputFile(inputContent);
  let command;

  switch (extension) {
    case ".c":
      command = `gcc ${filepath} -o ${binaryPath} && ${binaryPath} < ${tempInputFile}`;
      break;
    case ".cpp":
      command = `g++ -std=c++20 ${filepath} -o ${binaryPath} && ${binaryPath} < ${tempInputFile}`;
      break;
    case ".rs":
      command = `rustc ${filepath} -o ${binaryPath} && ${binaryPath} < ${tempInputFile}`;
      break;
    case ".py":
      command = `python ${filepath} < ${tempInputFile}`;
      break;
    default:
      throw new Error(`Unsupported file extension: ${extension}`);
  }

  try {
    const { stdout, stderr } = await execPromise(command, { timeout: 5000 });
    if (stderr) {
      throw new Error(stderr);
    }
    return stdout;
  } catch (err) {
    if (err.killed) {
      throw new Error("Test execution timed out");
    }
    throw new Error(err.message);
  }
};

const runTests = async (index, options) => {
  try {
    let [filename, filepath] = await fileFinder(options);
    const problem_tc_dir = path.join(testcases_dir, filename);
    const files = await fs.readdir(problem_tc_dir);

    const runTestCase = async (i) => {
      const inputContent = await fs.readFile(
        path.join(problem_tc_dir, `in${i}`),
        "utf-8"
      );
      const expectedOutput = await fs.readFile(
        path.join(problem_tc_dir, `out${i}`),
        "utf-8"
      );

      // Assuming runTest is a function that runs the test case
      const actualOutput = await runTest(filepath, inputContent);

      if (actualOutput.trim() === expectedOutput.trim()) {
        logger.info(`Test case ${i} passed`);
      } else {
        logger.error(`Test case ${i} failed`);
        logger.info(`Input:\n${inputContent}`);
        logger.info(`Expected:\n${expectedOutput}`);
        logger.info(`Actual:\n${actualOutput}`);
      }
    };

    if (index === undefined) {
      for (let i = 0; i < files.length / 2; i++) {
        await runTestCase(i);
      }
    } else if (0 <= index && index < files.length / 2) {
      await runTestCase(index);
    } else {
      logger.error(`Invalid index: ${index}`);
    }
  } catch (err) {
    logger.error(err);
  }
};

const showTestcases = async (index, options) => {
  try {
    let [filename, _] = await fileFinder(options);
    const problem_tc_dir = path.join(testcases_dir, filename);

    // Reading all input and output files in the directory
    const files = await fs.readdir(problem_tc_dir);

    const showIthTestcase = async (i) => {
      const inputContent = await fs.readFile(
        path.join(problem_tc_dir, `in${i}`),
        "utf-8"
      );
      const outputContent = await fs.readFile(
        path.join(problem_tc_dir, `out${i}`),
        "utf-8"
      );

      // Logging the contents
      logger.info(`in${i}\n${inputContent}`);
      logger.info(`out${i}\n${outputContent}`);
    };

    if (index === undefined) {
      for (let i = 0; i < files.length / 2; i++) {
        await showIthTestcase(i);
      }
    } else if (0 <= index && index < files.length / 2) {
      await showIthTestcase(index);
    } else {
      logger.error(`Invalid index: ${index}`);
    }
  } catch (err) {
    logger.error(err);
  }
};

export { runTests, showTestcases };
