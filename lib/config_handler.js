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
    // Check if the config file exists
    const fileExists = await fs.access(config_filepath).then(() => true).catch(() => false);

    if (!fileExists) {
      // Create an empty config file
      await fs.writeFile(config_filepath, JSON.stringify({ "workspace": process.env.HOME, "extension": "c"}), "utf8");
      logger.info(`Created empty config file at: ${config_filepath}`);
    }

    // Reading config file
    const data = await fs.readFile(config_filepath, "utf8");
    const config = JSON.parse(data);
    return config;
  } catch (err) {
    logger.error(err);
    return {}; // Return a default empty object in case of an error
  }
};

const updateConfig = async (updated_field) => {
  try {
    // Get the current config (ensures the file exists)
    let config = await getConfig();

    // Updating config file
    config = { ...config, ...updated_field };

    await fs.writeFile(config_filepath, JSON.stringify(config), "utf8");

    logger.info("Config updated with:");
    logger.info(config);
  } catch (err) {
    logger.error(err);
  }
};

const showConfig = async () => {
  const config = await getConfig();

  if (config.workspace) {
    clipboardy.writeSync(config.workspace);
  } else {
    logger.error("Workspace is undefined in the config.");
  }

  logger.info(config);
};

export { getConfig, updateConfig, showConfig };
