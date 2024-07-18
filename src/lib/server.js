import express from "express";
import handle_req from "./request_handler.js";
import logger from "../logger.js";

logger.setLevel("error");

const app = express();
const PORT = 4729;

app.use(express.json());

app.get("/", (req, res) => {
  res.send("CP Utility is Active.");
});

app.post("/", (req, res) => {
  logger.log(req.body);
  handle_req(req.body);
  res.send(`Received data from :\n${req.body.url}`);
});

let server;

export function start() {
  if (server) {
    logger.error("Server is already running.");
    return;
  }
  server = app.listen(PORT, () => {
    logger.info(`App is listening at port ${PORT}`);
  });
}

export function stop() {
  if (!server) {
    logger.error("Server is not running.");
    return;
  }
  server.close(() => {
    logger.info("Server stopped.");
    server = null;
  });
}

// Default export for running the server directly if needed
export default { start, stop };
