import { setWorkspace } from "./config_handler.js";
import { start } from ".server.js";

const init = () => {
  // console.log(process.env.PWD);
  setWorkspace(process.env.PWD);
  start();
};

export default init;
