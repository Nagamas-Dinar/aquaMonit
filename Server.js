const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const fs = require("fs");

const corsOptions = require("./config/corsOptions");

const { SerialPort } = require("serialport");
const { ReadlineParser } = require("@serialport/parser-readline");

const { getrouter, getController } = require("./api/get");

const app = express();
app.use(cors(corsOptions));

//Web PORT
const PORT = process.env.PORT || 3500;
const portName = "/dev/ttyUSB0";   //Raspi
// const portName = "COM5"; //PC

// console.log("Port name:", portName);
const portOptions = {
  path: portName,
  baudRate: 9600,
};

const port = new SerialPort(portOptions);
const parser = port.pipe(new ReadlineParser({ delimiter: "\n" }));
parser.on("data", async (data) => {
  const matches = data.match(/[\d.]+/g);
  const [temp, ppm] = matches.map(Number);
  // console.log("Value Read: ", temp, typeof temp);
  const resTemp = await inserValue(temp, "log_temp");
  const resPpm = await inserValue(ppm, "log_ammonia");
  console.log(`Added Value: ${resTemp}[C], ${resPpm}[ppm]`);
});

// Open errors will be emitted as an error event
port.on("error", function (err) {
  console.error("Error: ", err.message);
});

//Accessible Route
app.get("/select/temp", (req, res) => {
  getController.getDataTable(req, res, "temp");
});
app.get("/select/ammonia", (req, res) => {
  getController.getDataTable(req, res, "ammonia");
});

//insert function
async function inserValue(value, tableName) {
  try {
    if (typeof value === "number" && !Number.isNaN(value)) {
      // console.log("Get Value",value);
      const query =
        "INSERT INTO " + tableName + " (value) values('" + value + "')";
      await getController.runQueryAsync(query);
      return value;
    }
  } catch (error) {
    console.log(`error ${error.message}`);
  }
}

//Build HTTP
const http = require("http");
const app_exp = express();
const path = require("path");

const options = {
  key: fs.readFileSync("./certs/localhost.key"),
  cert: fs.readFileSync("./certs/localhost.crt"),
};

app_exp.use(express.static(path.join(__dirname, "build")));

app_exp.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "build/index.html"));
});

const server_exp = http.createServer(options, app_exp);
server_exp.listen(4001, () => console.log("Client HTTP running on port 4001"));

const server = http.createServer(options, app);

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
