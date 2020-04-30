import React, { useState, useEffect } from 'react'
import { createHook } from 'overmind-react'
import moment from 'moment'
import { CalendarNavigation } from 'react-nice-dates'
import { startOfMonth } from 'date-fns'
import { enGB } from 'date-fns/locale'
import { CircularProgress } from '@rmwc/circular-progress'
// import { useControllableState } from '../dateUtils'

import Chart from './RangeChart'
import { Horizontal, Vertical } from '../styles'

const useOvermind = createHook()

const Month = (props) => {
  const { height, width } = props
  const { state, reaction, actions } = useOvermind()
  // const [month, setMonth] = useControllableState(null, null, startOfMonth(new Date()))

  // const minimumDate = state.activeDevice.startDate ? new Date(state.activeDevice.startDate) : new Date()
  // const maximumDate = state.activeDevice.endDate ? new Date(state.activeDevice.endDate) : new Date()

  useEffect(() => reaction(
    ({ activeDevice }) => activeDevice,
    () => {
      if (state.selectedDateWeek) {
        actions.fetchDeviceMonthData(moment(state.selectedDateMonth))
      }
    } 
  ))

  useEffect(() => {
    if (state.selectedDateMonth === null) {
      const month = startOfMonth(new Date())
      actions.selectDateMonth(month)
      actions.fetchDeviceMonthData(moment(month))
    }
  }, [])
  
  if (state.selectedDateMonth === null) {
    return <div>Loading</div>
  }

  const data = state.deviceData[`${moment(state.selectedDateMonth).format('DD_MM_YY')}_month`]

  return (
    <>
      <CalendarNavigation
        locale={enGB}
        minimumDate={new Date('2020-02-15')}
        maximumDate={new Date()}
        month={state.selectedDateMonth}
        onMonthChange={month => {
          actions.selectDateMonth(startOfMonth(month))
          actions.fetchDeviceMonthData(moment(month))
        }}
      />
      {
        data ? (
          <Chart
            forDate={moment(state.selectedDateMonth)}
            data={data}
            height={height - 66}
            width={width}
            size={4}
            offset={1.5}
          />
        ) : (
          <Horizontal center style={{ height: 108 }}>
            <CircularProgress size="large" />
          </Horizontal>
        )
      }
    </>
  )
}

export default Month
