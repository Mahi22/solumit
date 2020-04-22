import { gql } from 'overmind-graphql'

export const devices = gql`
  query fetchInfo {
    fetchInfo {
      devices {
        id
        name
        location
      }
      error
    }
  }
`

export const deviceData = gql`
  query DeviceData($deviceId: String!, $forDate: String!) {
    deviceData(deviceId: $deviceId, forDate: $forDate) {
      max {
        output
        mains
        solar
      }
      values {
        fortime
        output
        mains
        solar
      }
    }
  }
`
