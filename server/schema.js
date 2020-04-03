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

  type Query {
    search(query: String): [Contact!]!
    clui: Clui!
    command: String!
    cpu: CPU
    traffic: Traffic
    distribution: [Distribution]
    messages: [Message]
  }

  type Mutation {
    cpu: CPU
    traffic: Traffic
    distribution: [Distribution]
    messages: [Message]
  }

  type Subscription {
    cpu: CPU
    traffic: Traffic
    distribution: [Distribution]
    messages: [Message]
  }
`;

module.exports = schema;
