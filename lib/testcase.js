import logger from "./logger.js";
import { getConfig } from "./config_handler.js";
import fs from "fs/promises";
import path from "path";

let testcases_dir = path.join(
  process.env.HOME,
  ".cache",
  "cp_utility",
  "testcases"
);

const filenameFinder = async (options) => {
  try {
    let filename = "";

    if (options.file) {
      filename = options.file.split(".")[0];
    } else {
      const config = await getConfig();
      filename = config.curr_filename;
    }

    return filename;
  } catch (err) {
    logger.error(err);
  }
};

const runTests = async (index, options) => {
  try {
    let filename = await filenameFinder(options);
    const problem_tc_dir = path.join(testcases_dir, filename);
    logger.log(testcases_dir);
  } catch (err) {
    logger.error(err);
  }
};

const showTestcases = async (index, options) => {
  try {
    let filename = await filenameFinder(options);
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
