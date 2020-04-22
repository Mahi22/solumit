export const loginChart = {
  initial: 'LOGIN',
  states: {
    LOGIN: {
      on: {
        changeUsername: null,
        changePassword: null,
        login: 'AUTHENTICATING'
      }
    },
    AUTHENTICATING: {
      on: {
        resolveUser: 'AUTHENTICATED',
        rejectUser: 'ERROR'
      }
    },
    AUTHENTICATED: {
      on: {
        logout: 'LOGIN'
      }
    },
    ERROR: {
      on: {
        tryAgain: 'LOGIN'
      }
    }
  }
}

export const appChart = {
  initial: 'LOADING',
  states: {
    LOADING: {
      on: {
        fetchInfo: 'DEVICES'
      }
    },
    DEVICES: {
      on: {
        selectDevice: 'READY'
      }
    },
    READY: {
      on: {
        // showChart: 'DEVICEDATA',
        selectDevice: 'READY',
        fetchTodayDeviceData: 'READY'
      }
      // entry: 'fetchDeviceData'
    }
    // DEVICEDATA: {
    //   on: {
    //     closeChart: 'READY'
    //   },
    //   entry: 'fetchDeviceData'
    // }
  }
}