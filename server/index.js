require("dotenv").config();
const { ApolloServer } = require("apollo-server-express");
const express = require("express");
const bodyParser = require("body-parser");
const http = require("http");
const cors = require("cors");
const typeDefs = require("./schema");
const resolvers = require("./resolvers");

const excelExport = require("./excelExport");

const PORT = 4000;

// Server
const server = new ApolloServer({ typeDefs, resolvers });

const app = express();
app.use(cors());

server.applyMiddleware({ app, path: "/graphql" });

app.use("/logs", express.static("logs"));

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
    `🚀 Server ready at http://localhost:${PORT}${server.graphqlPath}`
  );
  console.log(
    `🚀 Subscriptions ready at ws://localhost:${PORT}${
      server.subscriptionsPath
    }`
  );
});
