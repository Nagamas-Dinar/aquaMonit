require("dotenv").config();

const mysql = require("mysql");

var config = {
  user: process.env.MYSQL_UID,
  password: process.env.MYSQL_PWD,
  host: process.env.MYSQL_SERVER,
  database: process.env.MYSQL_DB,
  port: process.env.MYSQL_PORT,
  timezone: "UTC",
  multipleStatements: true,
};

function convertDateTime(dateString) {
  let today = new Date(dateString);
  if (today.getFullYear() === 1970) {
    return null;
  } else {
    const options = { timeZone: "Asia/Jakarta", hour12: false };
    const formattedDateTime = new Date(today.getTime())
      .toISOString()
      .replace("T", " ")
      .replace(/\..+/, "");
    return formattedDateTime;
  }
}

function convertDate(dateString) {
  let today = new Date(dateString);

  if (today.getFullYear() === 1970) {
    return null;
  } else {
    const formattedDateTime = new Date(today.getTime())
      .toISOString()
      .replace("T", " ")
      .replace(/\..+/, "");
    return formattedDateTime.substring(0, 10);
  }
}

const runQueryAsync = (str, data) => {
  return new Promise((resolve, reject) => {
    var conn = mysql.createConnection(config);

    conn.connect((err) => {
      if (err) {
        reject(err);
      } else {
        conn.query(str, data, function (error, results, fields) {
          conn.end();

          if (error) {
            reject(error);
          } else {
            if (fields) {
              const colname = [];
              const coltype = [];
              const collength = [];
              const orgtable = [];
              // && input.name.toLowerCase()!=="picture"
              fields = fields.filter((input) => {
                return (
                  input.name.toLowerCase() !== "password" &&
                  input.name.toLowerCase().includes("sync") == false
                );
              });
              // console.log(fields);
              for (let index = 0; index < fields.length; index++) {
                const element = fields[index];
                colname.push(element.name);
                orgtable.push(element.orgTable);
                switch (element.type) {
                  case 1:
                    coltype.push("TINYINT");
                    collength.push(element.length);
                    break;
                  case 3:
                    coltype.push("INT");
                    collength.push(element.length);
                    break;
                  case 4:
                    coltype.push("FLOAT");
                    collength.push(element.length);
                    break;
                  case 7:
                    coltype.push("TIMESTAMP");
                    collength.push(element.length);
                    break;
                  case 8:
                    coltype.push("BIGINT");
                    collength.push(element.length);
                    break;
                  case 12:
                    coltype.push("DATETIME");
                    collength.push(element.length);
                    break;
                  case 10:
                    coltype.push("DATE");
                    collength.push(element.length);
                    break;
                  case 252:
                    coltype.push("IMAGE");
                    collength.push(element.length);
                    break;
                  case 253:
                    coltype.push("STRING");
                    collength.push(element.length / 3);
                    break;
                  default:
                    coltype.push("UNREG(" + element.type + ")");
                    collength.push(element.length);
                }
              }

              results.map((res) => {
                Object.keys(res).map((key) => {
                  // || key.toLowerCase()==="picture"
                  if (coltype[colname.indexOf(key)] == "DATETIME") {
                    res[key] = convertDateTime(res[key]);
                  }
                  if (coltype[colname.indexOf(key)] == "DATE") {
                    res[key] = convertDate(res[key]);
                  }
                  if (coltype[colname.indexOf(key)] == "TIMESTAMP") {
                    res[key] = convertDateTime(res[key]);
                  }
                  if (
                    key.toLowerCase() === "password" ||
                    key.toLowerCase().includes("sync") == true
                  ) {
                    delete res[key];
                  }
                });
              });

              const datout = {
                val: results,
                col: {
                  name: colname,
                  type: coltype,
                  length: collength,
                  table: orgtable,
                },
              };

              resolve(datout);
            } else {
              resolve({ id: results.insertId });
            }
          }
        });
      }
    });
  });
};

const runQueryAsyncMultiple = (str, data) => {
  return new Promise((resolve, reject) => {
    var conn = mysql.createConnection(config);

    conn.connect((err) => {
      if (err) {
        reject(err);
      } else {
        conn.query(str, data, function (error, results, fields) {
          conn.end();

          if (error) {
            reject(error);
          } else {
            resolve({ id: "OK" });
          }
        });
      }
    });
  });
};

function parseData(data) {
  return JSON.parse(
    JSON.stringify(
      data,
      (key, value) => (typeof value === "bigint" ? value.toString() : value) // return everything else unchanged
    )
  );
}

module.exports = { runQueryAsync, runQueryAsyncMultiple, parseData };
