import { pipe } from 'overmind'
import moment from 'moment'
import { setActiveDevice, resetDeviceData } from './operators'

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
  console.log('Calling', forDate)
  // const { deviceData } = await effects.gql.queries.deviceData({ deviceId: state.activeDevice.id, forDate: moment('03/03/2020').toISOString() })
  // state.deviceData.today = deviceData
  const { dayDeviceData } = await effects.gql.queries.dayDeviceData({ deviceId: state.activeDevice.id, forDate: forDate.toISOString() })
  state.deviceData[forDate.format('DD_MM_YY')] = dayDeviceData
}

