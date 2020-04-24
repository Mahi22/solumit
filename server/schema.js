const { gql } = require("apollo-server");

const schema = gql`
  type CluiSuccessOutput {
    message: String!
  }

  type CluiMarkdownOutput {
    markdown: String!
  }

  type CluiErrorOutput {
    error: String!
  }

  type Clui {
    "Manage system"
    system: System
    "Manage Devices"
    device: Device
    "Manage contacts"
    contacts: Contacts
  }

  type Contact {
    name: String!
    email: String!
  }

  type DeviceInfo {
    id: String!
    name: String!
    location: String!
  }

  union CluiOutput = CluiSuccessOutput | CluiMarkdownOutput | CluiErrorOutput

  "Manage contacts"
  type Contacts {
    "List contacts"
    list: CluiOutput
    "Add a new contact"
    add(name: String!, email: String!): CluiOutput
    "Remove an existing contact"
    remove(email: String!): CluiOutput
  }

  "Manage System"
  type System {
    "CPU Percentage"
    cpu: CluiOutput
  }

  "Manage Devices"
  type Device {
    "List Devices"
    list: CluiOutput
    "View Change Logs"
    changeLog(deviceId: String!, date: String!): CluiOutput
  }

  type Dps {
    timestamp: Int!
    value: Float!
  }

  type Traffic {
    total: Int!
    dps: [Dps]
  }

  type CPU {
    percentage: Float!
  }

  type Distribution {
    region: String!
    percentage: Float!
  }

  type Message {
    title: String!
    description: String!
    color: String!
  }

  type DeviceData {
    fortime: String!
    energy: Float
    output: Float
    mains: Float
    solar: Float
  }

  type maxDeviceData {
    output: Float
    mains: Float
    solar: Float
  }

  type DeviceDataPayload {
    max: maxDeviceData
    values: [DeviceData]
  }

  type fetchInfoPayload {
    devices: [DeviceInfo]
    error: String
  }

  type Query {
    search(query: String): [Contact!]!
    searchDevice(query: String): [DeviceInfo!]
    fetchInfo: fetchInfoPayload
    dayDeviceData(deviceId: String!, forDate: String!): [DeviceData]
    deviceData(deviceId: String!, forDate: String!): DeviceDataPayload
    clui: Clui!
    command: String!
    cpu: CPU
    traffic: Traffic
    distribution: [Distribution]
    messages: [Message]
  }

  type ResultPayload {
    success: String
    error: String
  }

  type Mutation {
    cpu: CPU
    traffic: Traffic
    distribution: [Distribution]
    messages: [Message]
    logRequest(deviceId: String!, date: String!, type: String!): ResultPayload
  }

  type Subscription {
    cpu: CPU
    traffic: Traffic
    distribution: [Distribution]
    messages: [Message]
  }
`;

module.exports = schema;
