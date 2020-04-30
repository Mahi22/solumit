import React from 'react';
import styled from 'styled-components'
import { createHook } from 'overmind-react'
import moment from 'moment'
import { Typography } from '@rmwc/typography'
import { Horizontal } from '../styles'

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

const useOvermind = createHook()

const Overall = () => {

  const { state, reaction, actions } = useOvermind()

  const startDay = state.activeDevice.startDate ? moment(state.activeDevice.startDate) : moment()
  const today = state.activeDevice.endDate ? moment(state.activeDevice.endDate) : moment()

  // const startDay = moment('2020-02-15').startOf('day')
  // const today = moment()

  return (
    <>
      <Horizontal center spaceBetween  style={{ margin: 8 }}>
          <Horizontal>
              <LeftDiv use="headline3">
                {startDay.format('DD')}
              </LeftDiv>
              <RightDiv use="headline5">
                {startDay.format('MMM')} <span>{startDay.format('YYYY')}</span>
                <br />
                <span>{startDay.format('hh::mm A')}</span>
              </RightDiv>
          </Horizontal>
          <Horizontal><Typography use="headline3">-</Typography></Horizontal>
          <Horizontal>
              <LeftDiv use="headline3">
                {today.format('DD')}
              </LeftDiv>
              <RightDiv use="headline5">
                {today.format('MMM')} <span>{today.format('YYYY')}</span>
                <br />
                <span>{today.format('hh::mm A')}</span>
              </RightDiv>
          </Horizontal>
      </Horizontal>
    </>
  )
}

export default Overall
