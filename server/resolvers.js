const { introspectionFromSchema } = require("graphql");
const { toCommand } = require("@replit/clui-gql");
const Particle = require("particle-api-js");
const json2md = require("json2md");
const moment = require("moment");
const pubsub = require("./pubsub");
const {
  cpuData,
  regionData,
  messageData,
  trafficData
} = require("./utils/generator");
const { get, set } = require("./utils/redis");
const { deviceData, deviceDayData, deviceWeekData } = require("./deviceData");

// const db = knex({
//   client: process.env.DB_CLIENT || "pg",
//   connection: {
//     host: process.env.DB_HOST,
//     user: process.env.DB_USER,
//     socketPath: process.env.DB_SOCKET_PATH,
//     password: process.env.DB_PASSWORD,
//     database: process.env.DB_DATABASE,
//     ssl: process.env.DB_SSL,
//     multipleStatements: true,
//     charset: "utf8"
//   }
// });

const COMPONENTS = {
  CPU: "cpu",
  TRAFFIC: "traffic",
  DISTRIBUTION: "distribution",
  MESSAGES: "messages"
};

const contacts = [
  {
    name: "Mahesh",
    email: "mahesh.masalkar22@gmail.com"
  },
  {
    name: "Krishna",
    email: "krishna@accui.site"
  }
];

const deviceList = [
  {
    id: 1,
    name: "SolAce_1",
    location: "Vidya_Valley",
    startDate: "2020-02-15"
  },
  {
    id: 2,
    name: "SolAce_2",
    location: "Ahmednagar",
    startDate: "2020-02-15"
  },
  {
    id: 3,
    name: "SolAce_3",
    location: "Sindh",
    startDate: "2020-02-15"
  }
];

/**
 * (1) Get random data for `component` by calling `generator` function
 * (2) Publish the data to channel for `component`
 * (3) Cache the data in redis against key `component`
 *
 * @param {function} generator - Corresponding data generator function for `component`
 * @param {string} component
 */
const publishRandomData = async (generator, component) => {
  const data = generator();
  pubsub.publish(component, { [component]: data });
  await set(component, data);
  return data;
};

module.exports = {
  Query: {
    clui: () => ({}),
    search: (ctx, args) => {
      const filtered = args.query
        ? contacts.filter(
            c =>
              c.name.toLowerCase().includes(args.query.toLowerCase()) ||
              c.email.toLowerCase().includes(args.query.toLowerCase())
          )
        : contacts.slice(0, 10);

      return filtered;
    },
    fetchInfo: (ctx, args) => {
      return {
        devices: deviceList
      };
    },
    searchDevice: (ctx, args) => {
      const filtered = args.query
        ? deviceList.filter(
            c =>
              c.name.toLowerCase().includes(args.query.toLowerCase()) ||
              c.location.toLowerCase().includes(args.query.toLowerCase())
          )
        : deviceList.slice(0, 10);

      return filtered;
    },
    command: (_, __, ___, { schema }) => {
      const introspection = introspectionFromSchema(schema);

      // Create a command tree from graphql introspection data. This could be done on
      // the server or the client.
      const root = toCommand({
        // 'query' or 'mutation'
        operation: "query",

        // The name of the graphql type that has the fields that act as top level commands
        rootTypeName: "Clui",

        // the path at wich the above type appears in the graph
        mountPath: ["clui"],

        // GraphQL introspection data
        introspectionSchema: introspection.__schema,

        // Configure fields and fragments for the output of the GraphQL operation string
        output: () => ({
          fields: "...CluiOutput",
          fragments: `
fragment CluiOutput on CluiOutput {
  ...on CluiSuccessOutput {
    message
  }
  ...on CluiMarkdownOutput {
    markdown
  }
  ...on CluiErrorOutput {
    error
  }
}`
        })
      });

      return JSON.stringify(root);
    },
    cpu: () => get(COMPONENTS.CPU),
    traffic: () => get(COMPONENTS.TRAFFIC),
    distribution: () => get(COMPONENTS.DISTRIBUTION),
    messages: () => get(COMPONENTS.MESSAGES),
    deviceData: (ctx, args) => deviceData(args.deviceId, args.forDate),
    dayDeviceData: (ctx, args) => deviceDayData(args.deviceId, args.forDate),
    weekDeviceData: (ctx, args) => deviceWeekData(args.deviceId, args.forDate)
  },
  Clui: {
    contacts: () => ({}),
    system: () => ({}),
    device: () => ({})
  },
  System: {
    cpu: () => {
      return { message: "CPU percentage" };
    }
  },
  Contacts: {
    list: () => {
      const markdown = json2md([
        {
          table: {
            headers: ["name", "email"],
            rows: contacts.map(c => ({ name: c.name, email: c.email }))
          }
        }
      ]);

      return { markdown };
    },
    add: (ctx, args) => {
      const existing = contacts.find(c => c.email === args.email);

      if (existing) {
        return { error: `Contact with email: "${args.email}" already exists` };
      }

      contacts.push(args);

      const markdown = json2md([
        {
          p: "Added contact"
        },
        {
          table: {
            headers: ["name", "email"],
            rows: [args]
          }
        }
      ]);

      return { markdown };
    },
    remove: (ctx, args) => {
      const existing = contacts.find(c => c.email === args.email);

      if (!existing) {
        return { error: `Contact with email: "${args.email}" not found` };
      }

      contacts = contacts.filter(c => c.email !== existing.email);

      return { message: `Removed contact: "${existing.email}"` };
    }
  },
  Device: {
    list: () => {
      var particle = new Particle();

      var token = "1efe3ec01ee1c716498e13b4a988dfc51d6f63c9";
      var devicesPr = particle.listDevices({ auth: token });

      return devicesPr.then(
        function(devices) {
          console.log("Devices: ", devices.body);

          console.log(
            devices.body.map(d => ({
              name: d.name,
              last_heard: d.last_heard
                ? moment(d.last_heard)
                    .utcOffset("+5:30")
                    .format("MMMM Do YYYY, h:mm:ss a")
                : "",
              last_handshake_at: d.last_handshake_at
                ? moment(d.last_handshake_at)
                    .utcOffset("+5:30")
                    .format("MMMM Do YYYY, h:mm:ss a")
                : "",
              connected: `${d.connected}`,
              notes: d.notes,
              status: d.status
            }))
          );

          const markdown = json2md([
            {
              table: {
                headers: [
                  "name",
                  "last_heard",
                  "last_handshake_at",
                  "connected",
                  "notes",
                  "status"
                ],
                rows: devices.body.map(d => ({
                  name: d.name,
                  last_heard: d.last_heard
                    ? moment(d.last_heard)
                        .utcOffset("+5:30")
                        .format("MMMM Do YYYY, h:mm:ss a")
                    : "",
                  last_handshake_at: d.last_handshake_at
                    ? moment(d.last_handshake_at)
                        .utcOffset("+5:30")
                        .format("MMMM Do YYYY, h:mm:ss a")
                    : "",
                  connected: `${d.connected}`,
                  notes: d.notes,
                  status: d.status
                }))
              }
            }
          ]);
          return { markdown };
        },
        function(err) {
          // console.log("List devices call failed: ", err);
          return { error: "Error in Particle API" };
        }
      );
    },
    changeLog: (ctx, args) => {
      console.log(args);
      return { message: "Show change table" };
    }
  },
  Mutation: {
    cpu: () => publishRandomData(cpuData, COMPONENTS.CPU),
    traffic: () => publishRandomData(trafficData, COMPONENTS.TRAFFIC),
    distribution: () => publishRandomData(regionData, COMPONENTS.DISTRIBUTION),
    messages: () => publishRandomData(messageData, COMPONENTS.MESSAGES),
    logRequest: async (ctx, args) => {
      console.log(args);
      switch (args.type) {
        case "excel":
          const fordate = moment(args.date).toISOString();
          return {
            success: `http://139.59.37.105:8080/excel?startDate=${fordate}&endDate=${fordate}&deviceId=${
              args.deviceId
            }`
          };
        case "changeLogs":
          const changeLogdate = moment(args.date).format("DD_MM_YYYY");
          return {
            success: `http://139.59.37.105:8080/logs/device${
              args.deviceId
            }_change_${changeLogdate}.log`
          };
        case "allLogs":
          const logdate = moment(args.date).format("DD_MM_YYYY");
          return {
            success: `http://139.59.37.105:8080/logs/device${
              args.deviceId
            }_${logdate}.log`
          };
        default:
          return { error: "Params missing" };
      }
    }
  },
  Subscription: {
    cpu: {
      subscribe: () => pubsub.asyncIterator(COMPONENTS.CPU)
    },
    traffic: {
      subscribe: () => pubsub.asyncIterator(COMPONENTS.TRAFFIC)
    },
    distribution: {
      subscribe: () => pubsub.asyncIterator(COMPONENTS.DISTRIBUTION)
    },
    messages: {
      subscribe: () => pubsub.asyncIterator(COMPONENTS.MESSAGES)
    }
  },
  CluiOutput: {
    __resolveType(obj) {
      if (obj.error) {
        return "CluiErrorOutput";
      }

      if (obj.markdown) {
        return "CluiMarkdownOutput";
      }

      return "CluiSuccessOutput";
    }
  }
};
