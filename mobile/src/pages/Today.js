import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import moment from 'moment'
import { requestInterval, clearRequestInterval } from '@essentials/request-interval'
import { createHook } from 'overmind-react'
import { Typography } from '@rmwc/typography'
import { CircularProgress } from '@rmwc/circular-progress'

import Chart from './Chart'
import { Vertical, Horizontal } from '../styles'

import useDimensions from '../hooks/useDimensions'

import { ReactComponent as IconSolar } from '../assets/solar.svg'
import { ReactComponent as IconGrid } from '../assets/grid.svg'
import { ReactComponent as IconOutput } from '../assets/output.svg'

const useOvermind = createHook()

const LeftDiv = styled(Typography)`
  display: inline-block;

`

const RightDiv = styled(Typography)`
  display: inline-block;
  margin-left: 2px;
  line-height: 28px;
  span {
    font-weight: 100;
    font-size: 12px;
  }
`

const EnergyLabel = styled(Typography)`
  font-weight: 100;
`

const EnergyValue = styled(Typography)`
  font-weight: 700;
`

const toExactMinute = 60000 - (new Date().getTime() % 60000)

const Today = (props) => {
  const { height } = props
  const [today, updateToday] = useState(moment())
  const { state, reaction, actions } = useOvermind()
  const [ref, { infoHeight }] = useDimensions({ selector: 'info' })

  useEffect(() => {
    // fetching todaysData
    actions.fetchTodayDeviceData()
    let timer = null;
    const timerStart = setTimeout(() => {
      timer = requestInterval(() => {
        console.log('FETCH TODAY DATA')
        actions.fetchTodayDeviceData()
        updateToday(moment())
      }, 60000);
      actions.fetchTodayDeviceData()
      updateToday(moment())
    }, toExactMinute)
    return () => {
      clearTimeout(timerStart)
      if (timer) clearRequestInterval(timer)
    }
  }, [])

  useEffect(() => reaction(
    ({ activeDevice }) => activeDevice,
    () => {
      actions.fetchTodayDeviceData()
    } 
  ))
  return <>
    <Vertical ref={ref}>
      <Horizontal style={{ margin: 8 }}>
        <Horizontal flex="1">
          <div>
            <LeftDiv use="headline2">
              {today.format('hh')}
            </LeftDiv>
            <RightDiv use="headline5">
              {today.format('mm')}<br /><span>{today.format('A')}</span>
            </RightDiv>
          </div>
        </Horizontal>
        <Horizontal flex="1">
          <div>
            <LeftDiv use="headline2">
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
      <Vertical center style={{ backgroundColor: '#F5F5F5', color: '#626262', padding: 8 }}>
        <EnergyLabel use="headline5">
          Today's Energy Generation is
        </EnergyLabel>
        <EnergyValue use="headline2">
          155 kWh
        </EnergyValue>
        <EnergyLabel use="headline5">
          @ {state.activeDevice.location}
        </EnergyLabel>
      </Vertical>
      {
        state.deviceData.today ? (
          <Horizontal center spaceBetween>
            <Vertical center flex="1">
              <Typography use="headline4">150</Typography>
              <IconSolar />
              <Typography use="body1">Solar</Typography>
            </Vertical>
            <Vertical center flex="1">
              <Typography use="headline4">150</Typography>
              <IconGrid />
              <Typography use="body1">Grid</Typography>
            </Vertical>
            <Vertical center flex="1">
              <Typography use="headline4">150</Typography>
              <IconOutput />
              <Typography use="body1">Inverter</Typography>
            </Vertical>
          </Horizontal>
        ) : (
          <Horizontal center style={{ height: 108 }}>
            <CircularProgress size="large" />
          </Horizontal>
        )
      }
    </Vertical>
    {infoHeight && <Chart data={state.deviceData.today} height={height - infoHeight} />}
  </>
}

export default Today
