import fs from "fs/promises";
import path from "path";
import logger from "./logger.js";

const is_alphabet = (ch) => {
  return ("a" <= ch && ch <= "z") || ("A" <= ch && ch <= "Z");
};

const is_digit = (ch) => {
  return "0" <= ch && ch <= "9";
};

const gen_filename = (name) => {
  let filename = new String();
  for (let i = 0; i < name.length; i++) {
    if (is_alphabet(name[i])) {
      if (
        filename.lenght != 0 &&
        is_digit(filename.charAt(filename.length - 1))
      ) {
        filename += "_";
      }
      filename += name[i];
    } else if (is_digit(name[i])) {
      if (
        filename.lenght != 0 &&
        is_alphabet(filename.charAt(filename.length - 1))
      ) {
        filename += "_";
      }
      filename += name[i];
    } else {
      if (filename.lenght != 0 && filename.charAt(filename.length - 1) != "_") {
        filename += "_";
      }
    }
  }
  if (filename.lenght != 0 && filename.charAt(filename.length - 1) === "_") {
    filename = filename.slice(0, -1);
  }

  return filename;
};

const handle_req = async (req_body) => {
  try {
    const code_filename = gen_filename(req_body.name);
    const config_filepath = path.join(
      process.env.HOME,
      ".config",
      "cp_utility",
      "config.json"
    );

    // Reading config file
    const data = await fs.readFile(config_filepath, "utf8");
    const config = JSON.parse(data);
    logger.log(config);

    // Creating Code file
    const code_filepath = path.join(
      config.workspace,
      `${code_filename}.${config.extension}`
    );
    await fs.writeFile(code_filepath, "", { flag: "a" });
    logger.info(`${code_filepath} created.`);

    // Removing existing testcases directory
    const testcases_dir = path.join(
      process.env.HOME,
      ".cache",
      "cp_utility",
      "testcases",
      code_filename
    );
    await fs.rm(testcases_dir, { recursive: true, force: true });
    logger.info(`${testcases_dir} removed.`);

    // Creating testcases directory
    await fs.mkdir(testcases_dir, { recursive: true });
    logger.info(`${testcases_dir} created.`);

    // Saving testcases
    for (let i = 0; i < req_body.tests.length; i++) {
      const testcase = req_body.tests[i];
      const input_filepath = path.join(testcases_dir, `in${i}`);
      const output_filepath = path.join(testcases_dir, `out${i}`);

      await fs.writeFile(input_filepath, testcase.input);
      logger.info(`${input_filepath} created.`);

      await fs.writeFile(output_filepath, testcase.output);
      logger.info(`${output_filepath} created.`);
    }

    // Updating config file
    config.curr_filename = code_filename;
    await fs.writeFile(config_filepath, JSON.stringify(config));
  } catch (err) {
    logger.error(err);
  }
};

export default handle_req;
