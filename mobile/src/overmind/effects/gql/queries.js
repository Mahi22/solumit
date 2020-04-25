import { gql } from 'overmind-graphql'

export const devices = gql`
  query fetchInfo {
    fetchInfo {
      devices {
        id
        name
        location
        startDate
        endDate
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

export const dayDeviceData = gql`
  query dayDeviceData($deviceId: String!, $forDate: String!) {
    dayDeviceData(deviceId: $deviceId, forDate: $forDate) {
      fortime
      energy
      output
      mains
      solar
    }
  }
`

export const weekDeviceData = gql`
  query weekDeviceData($deviceId: String!, $forDate: String!) {
    weekDeviceData(deviceId: $deviceId, forDate: $forDate) {
      fortime
      energy
      output
      mains
      solar
    }
  }
`
