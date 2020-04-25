import React, { useState, useEffect } from 'react'
import { createHook } from 'overmind-react'
import moment from 'moment'
import { enGB } from 'date-fns/locale'
import { DatePickerCalendar } from 'react-nice-dates'
import styled from 'styled-components'
import { Button } from '@rmwc/button'
import { Typography } from '@rmwc/typography'
import { CircularProgress } from '@rmwc/circular-progress'

import Chart from './DayChart'
import { Horizontal, Vertical } from '../styles'

const useOvermind = createHook()

const Info = styled.div`
  margin: 16px;
  text-align: center;
`

const CancelButton = styled(Button)`
  margin-right: 8px;
`

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

const Day = (props) => {
  const { height, width } = props
  const { state, reaction, actions } = useOvermind()
  const [date, setDate] = useState(null)

  useEffect(() => reaction(
    ({ activeDevice }) => activeDevice,
    () => {
      if (state.selectedDate) {
        actions.fetchDeviceData(moment(state.selectedDate))
      }
    } 
  ))

  let selectedDate = null;
    
  if (state.selectedDate) {
    selectedDate = moment(state.selectedDate)
  }

  return <>
    {
      state.selectedDate ?
        <>
          <Vertical>
            <Horizontal style={{ margin: 8 }}>
              <Horizontal center><Button label="BACK" onClick={() => {
                setDate(null)
                actions.selectDate(null)
              }} /></Horizontal>
              <Horizontal center flex="1">
                <div>
                  <LeftDiv use="headline3">
                    {selectedDate.format('DD')}
                  </LeftDiv>
                  <RightDiv use="headline5">
                    {selectedDate.format('MMMM')}
                    <br />
                    <span>{selectedDate.format('dddd')} {selectedDate.format('YYYY')}</span>
                  </RightDiv>
                </div>
              </Horizontal>
            </Horizontal>
          </Vertical>
          {
            state.deviceData[selectedDate.format('DD_MM_YY')] ? (
              <Chart forDate={selectedDate.toISOString()} data={state.deviceData[selectedDate.format('DD_MM_YY')]} height={height - 88} width={width} />
            ) : (
              <Horizontal center style={{ height: 108 }}>
                <CircularProgress size="large" />
              </Horizontal>
            )
          }
        </>
        :
        <>
          <Info><Typography use="body1">Select a day from the Calendar</Typography></Info>
          <DatePickerCalendar
            date={date}
            onDateChange={setDate}
            minimumDate={new Date(state.activeDevice.startDate)}
            maximumDate={state.activeDevice.endDate ? new Date(state.activeDevice.endDate) :new Date()}
            locale={enGB}
            weekdayFormat='EEEEEE'
          />
          <Horizontal style={{ margin: 16 }} justifyEnd>
            <CancelButton disabled={!date} label="Cancel" dense onClick={() => setDate(null)} />
            <Button disabled={!date} label="OK" dense onClick={() =>{
              actions.selectDate(date)
              actions.fetchDeviceData(moment(date))
            }} />
          </Horizontal>
        </>
    }
  </>
}

export default Day
