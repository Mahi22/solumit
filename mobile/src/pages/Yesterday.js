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

const Yesterday = (props) => {
  const { height, width } = props
  const { state, reaction, actions } = useOvermind()

  const yesterday = moment().subtract(1, 'day')

  useEffect(() => {
    console.log('CALL FOR DATA')
    actions.fetchDeviceData(yesterday)
  }, [])

  useEffect(() => reaction(
    ({ activeDevice }) => activeDevice,
    () => {
      actions.fetchDeviceData(yesterday)
    } 
  ))
  return <>
    <Vertical>
      <Horizontal style={{ margin: 8 }}>
        <Horizontal center flex="1">
          <div>
            <LeftDiv use="headline3">
              {yesterday.format('DD')}
            </LeftDiv>
            <RightDiv use="headline5">
              {yesterday.format('MMMM')}
              <br />
              <span>{yesterday.format('dddd')} {yesterday.format('YYYY')}</span>
            </RightDiv>
          </div>
        </Horizontal>
      </Horizontal>
    </Vertical>
    {
      state.deviceData[yesterday.format('DD_MM_YY')] ? (
        <Chart forDate={yesterday.toISOString()} data={state.deviceData[yesterday.format('DD_MM_YY')]} height={height - 88} width={width} />
      ) : (
        <Horizontal center style={{ height: 108 }}>
          <CircularProgress size="large" />
        </Horizontal>
      )
    }
  </>
}

export default Yesterday
