import { pipe } from 'overmind'
import moment from 'moment'
import { setActiveDevice, resetDeviceData, setSelectedDate, setSelectedDateWeek, setSelectedDateMonth } from './operators'

export const fetchInfo = async ({ state, actions, effects }) => {
  const { fetchInfo } =  await effects.gql.queries.devices()
  if (fetchInfo.error) {
    console.log(fetchInfo.error);
  } else {
    state.devices = fetchInfo
    await actions.selectDevice(fetchInfo.devices[0])
  }
}

export const selectDevice = pipe(
  resetDeviceData(),
  setActiveDevice()
)

export const fetchDeviceData = async ({ state, effects }, forDate) => {
  // const { deviceData } = await effects.gql.queries.deviceData({ deviceId: state.activeDevice.id, forDate: moment('03/03/2020').toISOString() })
  // state.deviceData.today = deviceData
  const { dayDeviceData } = await effects.gql.queries.dayDeviceData({ deviceId: state.activeDevice.id, forDate: forDate.toISOString() })
  state.deviceData[forDate.format('DD_MM_YY')] = dayDeviceData
}

export const fetchDeviceWeekData = async ({ state, effects }, forDate) => {
  const { weekDeviceData } = await effects.gql.queries.weekDeviceData({ deviceId: state.activeDevice.id, forDate: forDate.toISOString() })
  state.deviceData[`${forDate.format('DD_MM_YY')}_week`] = weekDeviceData
}

export const fetchDeviceMonthData = async ({ state, effects }, forDate) => {
  const { monthDeviceData } = await effects.gql.queries.monthDeviceData({ deviceId: state.activeDevice.id, forDate: forDate.toISOString() })
  state.deviceData[`${forDate.format('DD_MM_YY')}_month`] = monthDeviceData
}

export const selectDate = setSelectedDate()

export const selectDateWeek = setSelectedDateWeek()

export const selectDateMonth = setSelectedDateMonth()