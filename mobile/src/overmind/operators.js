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
      location: device.location,
      startDate: device.startDate,
      endDate: device.endDate
    }
  })

export const setSelectedDate = () =>
  mutate(function setSelectedDate({ state }, date) {
    state.selectedDate = date
  })

export const setSelectedDateWeek = () =>
  mutate(function setSelectedDateWeek({ state }, date) {
    state.selectedDateWeek = date
  })
