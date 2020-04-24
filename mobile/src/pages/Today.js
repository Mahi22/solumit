import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import moment from 'moment'
import { requestInterval, clearRequestInterval } from '@essentials/request-interval'
import { createHook } from 'overmind-react'
import { Typography } from '@rmwc/typography'
import { CircularProgress } from '@rmwc/circular-progress'

// import Chart from './Chart'
import Chart from './DayChart'
import { Vertical, Horizontal } from '../styles'

import useDimensions from '../hooks/useDimensions'

const useOvermind = createHook()

const LeftDiv = styled(Typography)`
  display: inline-block;

`

const RightDiv = styled(Typography)`
  display: inline-block;
  margin-left: 4px;
  line-height: 18px;
  span {
    font-weight: 100;
    font-size: 12px;
  }
`

const toExactMinute = 60000 - (new Date().getTime() % 60000)

const Today = (props) => {
  const { height, width } = props
  const [today, updateToday] = useState(moment())
  const { state, reaction, actions } = useOvermind()

  useEffect(() => {
    // fetching todaysData
    const today = moment()
    actions.fetchDeviceData(today)
    let timer = null;
    const timerStart = setTimeout(() => {
      timer = requestInterval(() => {
        // actions.fetchDeviceData(today)
        updateToday(today)
      }, 60000);
      // actions.fetchDeviceData(today)
      updateToday(today)
    }, toExactMinute)

    const fetchTimer = requestInterval(() => {
      actions.fetchDeviceData(today)
    }, 600000)
    return () => {
      clearTimeout(timerStart)
      if (timer) clearRequestInterval(timer)
      if (fetchTimer) clearRequestInterval(fetchTimer)
    }
  }, [])

  useEffect(() => reaction(
    ({ activeDevice }) => activeDevice,
    () => {
      actions.fetchDeviceData(moment())
    } 
  ))
  return <>
    <Vertical>
      <Horizontal style={{ margin: 8 }}>
        <Horizontal flex="1">
          <div>
            <LeftDiv use="headline3">
              {today.format('hh')}
            </LeftDiv>
            <RightDiv use="headline5">
              {today.format('mm')}<br /><span>{today.format('A')}</span>
            </RightDiv>
          </div>
        </Horizontal>
        <Horizontal flex="1">
          <div>
            <LeftDiv use="headline3">
              {today.format('DD')}
            </LeftDiv>
            <RightDiv use="headline5">
              {today.format('MMMM')}
              <br />
              <span>{today.format('dddd')} {today.format('YYYY')}</span>
            </RightDiv>
          </div>
        </Horizontal>
      </Horizontal>
    </Vertical>
    {
      state.deviceData[today.format('DD_MM_YY')] ? (
        <Chart forDate={today.toISOString()} data={state.deviceData[today.format('DD_MM_YY')]} height={height - 88} width={width} />
      ) : (
        <Horizontal center style={{ height: 108 }}>
          <CircularProgress size="large" />
        </Horizontal>
      )
    }
  </>
}

export default Today
