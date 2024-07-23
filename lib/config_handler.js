import fs from "fs/promises";
import path from "path";
import logger from "./logger.js";
import clipboardy from "clipboardy";

const config_filepath = path.join(
  process.env.HOME,
  ".config",
  "cp_utility",
  "config.json"
);

const getConfig = async () => {
  try {
    // Reading config file
    const data = await fs.readFile(config_filepath, "utf8");
    let config = JSON.parse(data);
    return config;
  } catch (err) {
    logger.error(err);
  }
};

const updateConfig = async (updated_field) => {
  try {
    // Reading config file
    const data = await fs.readFile(config_filepath, "utf8");
    let config = JSON.parse(data);

    // Updating config file
    config = { ...config, ...updated_field };

    await fs.writeFile(config_filepath, JSON.stringify(config));

    logger.info("Config updated with:");
    logger.info(config);
  } catch (err) {
    logger.error(err);
  }
};

const showConfig = async () => {
  const config = await getConfig();
  clipboardy.writeSync(config.workspace);
  logger.info(config);
};

export { getConfig, updateConfig, showConfig };
