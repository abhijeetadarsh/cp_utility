import chalk from "chalk";

// Define logging levels
const levels = {
  none: 0,
  error: 1,
  warn: 2,
  info: 3,
  log: 4,
};

// Current logging level
let currentLevel = levels.log;

// Function to set the logging level
function setLevel(level) {
  if (levels[level] !== undefined) {
    currentLevel = levels[level];
  } else {
    console.warn(`Unknown logging level: ${level}`);
  }
}

// Custom logger functions
const customConsole = {
  log: function (message) {
    if (currentLevel >= levels.log) {
      console.log(chalk.white("[LOG] "), message);
    }
  },
  info: function (message) {
    if (currentLevel >= levels.info) {
      console.info(chalk.blue("[INFO] "), message);
    }
  },
  warn: function (message) {
    if (currentLevel >= levels.warn) {
      console.warn(chalk.yellow("[WARN] "), message);
    }
  },
  error: function (message) {
    if (currentLevel >= levels.error) {
      console.error(chalk.red("[ERROR] "), message);
    }
  },
  setLevel: setLevel,
};

// Export the custom logger
export default customConsole;
