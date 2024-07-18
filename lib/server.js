import express from "express";
import handle_req from "./request_handler.js";
import logger from "./logger.js";

logger.setLevel("info");

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

const server = app.listen(PORT, () => {
  logger.info(`App is listening at port ${PORT}`);
});

export default server;
