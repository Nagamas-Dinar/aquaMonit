require("dotenv").config();
const {
  runQueryAsync,
  runQueryAsyncMultiple,
  parseData,
} = require("../initsql");

async function getDataAPI(query, res, data) {
  try {
    const result = await runQueryAsync(query, data);
    // console.log(query)
    res.send(result);
  } catch (error) {
    res.send({ error: error.toString(), stack: error.stack.toString() });
  }
}

function getData(req, res) {
  const str = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
  let ip = str.split(":").pop();
  let table = req.params.table;
  getDataTable(req, res, table);
}

function insertData(req, res) {
  let { data, tablename } = parseReq(req);

  saveDataAPI(data, tablename, 1, res);
}

function updateData(req, res) {
  let { data, tablename } = parseReq(req);

  saveDataAPI(data, tablename, 0, res);
}

function deleteData(req, res) {
  let { data, tablename } = parseReq(req);
  deleteDataAPI(data, tablename, res);
}

async function deleteDataAPI(data, tablename, res) {
  let id = "";
  if (tablename.toLowerCase() == "material_target") {
    tablename = "material";
  }
  const element = data.val;
  for (let index = 0; index < data.col.name.length; index++) {
    const colname = data.col.name[index];
    if (colname.toLowerCase() === tablename.toLowerCase() + "id") {
      id = colname;
    }
  }
  if (tablename.toLowerCase() == "announcement") {
    var query =
      "update " +
      tablename +
      " set done=now() where done is null and " +
      tablename +
      "ID=" +
      element[id];
  } else {
    var query =
      "delete from " + tablename + " where " + tablename + "ID=" + element[id];
  }

  try {
    await runQueryAsync(query);
    res.send({ stat: "OK", query: query });
  } catch (error) {
    res.send({
      error: error.toString(),
      stat: "ERR",
      val: error.toString(),
      query: query,
      stack: error.stack.toString(),
    });
  }
}

function getDataTable(req, res, table) {
  switch (table.toLowerCase()) {
    case "temp":
      getDataAPI(
        "SELECT * FROM log_temp WHERE DATE(time)=CURDATE() ORDER BY time ASC",
        res
      );
      break;
    case "ammonia":
      getDataAPI("SELECT * FROM log_ammonia WHERE DATE(time)=CURDATE() ORDER BY time ASC", res);
      break;
    default:
      break;
  }
}

module.exports = {
  getData,
  getDataTable,
  insertData,
  updateData,
  deleteData,
  runQueryAsync,
};
