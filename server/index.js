require("dotenv").config();
const { ApolloServer } = require("apollo-server-express");
const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const http = require("http");
const cors = require("cors");
const typeDefs = require("./schema");
const resolvers = require("./resolvers");

const excelExport = require("./excelExport");

const PORT = 8080;

// Server
const server = new ApolloServer({ typeDefs, resolvers });

const app = express();

app.use(cors());

server.applyMiddleware({ app, path: "/graphql" });

app.use("/logs", express.static(path.join(__dirname, "../worker/logs")));

app.use(bodyParser.json());

excelExport(app);

// Subscriptions
const httpServer = http.createServer(app);
server.installSubscriptionHandlers(httpServer);

// app.listen({ port }, () => {
//   console.log(`🚀  Server ready at ${port}`);
// });
httpServer.listen({ port: PORT }, () => {
  console.log(
    `🚀 Server ready at http://${process.env.SERVER}:${PORT}${
      server.graphqlPath
    }`
  );
  console.log(
    `🚀 Subscriptions ready at ws://${process.env.SERVER}:${PORT}${
      server.subscriptionsPath
    }`
  );
});

var options = {
  dotfiles: "ignore",
  etag: true,
  extensions: ["htm", "html"],
  index: "index.html",
  lastModified: true,
  maxAge: "1d",
  setHeaders: function(res, path, stat) {
    res.set("x-timestamp", Date.now());
    res.header("Cache-Control", "public, max-age=1d");
  }
};

// app.use("/app", express.static(path.join(__dirname, "../mobile/build")));

app.get("/app/*", function(req, res) {
  res.sendFile("index.html", {
    root: path.join(__dirname, "../mobile/build/")
  });
});

app.use("/", express.static(path.join(__dirname, "../client/build")));
app.get("*", function(req, res) {
  res.sendFile("index.html", {
    root: path.join(__dirname, "../client/build/")
  });
});
