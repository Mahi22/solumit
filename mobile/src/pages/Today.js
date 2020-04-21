import React from 'react'
import styled from 'styled-components'
import moment from 'moment'
import { Typography } from '@rmwc/typography'
import { Icon } from '@rmwc/icon'
import { Vertical, Horizontal } from '../styles'

const LeftDiv = styled(Typography)`
  display: inline-block;

`

const RightDiv = styled(Typography)`
  display: inline-block;
  margin-left: 2px;
  line-height: 28px;
  span {
    font-weight: 100;
    font-size: 16px;
  }
`

const EnergyLabel = styled(Typography)`
  font-weight: 100;
`

const EnergyValue = styled(Typography)`
  font-weight: 700;
`

const Today = (props) => {
  const { height } = props;
  const today = moment();
  return <>
    <Vertical style={{ height: height - 48 }}>
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
      <Vertical flex="1" center style={{ backgroundColor: '#F5F5F5', color: '#626262' }}>
        <EnergyLabel use="headline5">
          Today's Energy Generation is
        </EnergyLabel>
        <EnergyValue use="headline2">
          155 kWh
        </EnergyValue>
        <EnergyLabel use="headline5">
          @ Sindh Colony
        </EnergyLabel>
      </Vertical>
      <Horizontal center spaceBetween flex="1">
        <Vertical center flex="1">
          <Typography use=""></Typography>
          <Icon icon="flash_on" />
          <Typography use="body1">Solar</Typography>
        </Vertical>
        <Vertical center flex="1">
          Grid
        </Vertical>
        <Vertical center flex="1">
          Inverter
        </Vertical>
      </Horizontal>
    </Vertical>
  </>
}

export default Today
