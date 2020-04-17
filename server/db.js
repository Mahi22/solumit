const knex = require("knex");

const db = knex({
  client: process.env.DB_CLIENT || "pg",
  connection: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    socketPath: process.env.DB_SOCKET_PATH,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    ssl: process.env.DB_SSL,
    multipleStatements: true,
    charset: "utf8"
  }
});

module.exports = db;
