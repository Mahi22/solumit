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

export const fetchTodayDeviceData = async ({ state, effects }) => {
  const { deviceData } = await effects.gql.queries.deviceData({ deviceId: state.activeDevice.id, forDate: moment().toISOString() })
  state.deviceData.today = deviceData
}

