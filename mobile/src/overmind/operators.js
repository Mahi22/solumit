import { mutate } from 'overmind'

export const resetDeviceData = () =>
  mutate(function resetDeviceData({ state }) {
    state.deviceData = {
      today: null
    }
  })

export const setActiveDevice = () =>
  mutate(function setActiveDevice({ state }, device) {
    state.activeDevice = {
      id: device.id,
      name: device.name,
      location: device.location
    }
  })
