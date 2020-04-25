import React, { useState, useEffect } from 'react'
import { createHook } from 'overmind-react'
import moment from 'moment'
import { isSameDay, differenceInDays } from 'date-fns'
import { enGB } from 'date-fns/locale'
import { Calendar } from 'react-nice-dates'
import styled from 'styled-components'
import { Button } from '@rmwc/button'
import { Typography } from '@rmwc/typography'
import { CircularProgress } from '@rmwc/circular-progress'

import Chart from './RangeChart'
import { Horizontal, Vertical } from '../styles'
import { isSelectable } from '../dateUtils'

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

const Week = (props) => {
  const { height, width } = props
  const { state, reaction, actions } = useOvermind()
  const [date, setDate] = useState(null)

  const minimumDate = state.activeDevice.startDate ? new Date(state.activeDevice.startDate) : new Date()
  const maximumDate = state.activeDevice.endDate ? new Date(state.activeDevice.endDate) : new Date()

  useEffect(() => reaction(
    ({ activeDevice }) => activeDevice,
    () => {
      if (state.selectedDateWeek) {
        actions.fetchDeviceWeekData(moment(state.selectedDateWeek))
      }
    } 
  ))

  const handleSelectDate = dt => {
    // console.log(date)
    setDate(dt)
  }

  const modifiers = {
    selected: dt => {
      if (isSelectable(dt, { minimumDate, maximumDate })) {
        const selectDiffernce = differenceInDays(maximumDate, date);
        if (selectDiffernce >= 6) {
          return differenceInDays(dt, date) < 7 && differenceInDays(dt, date) >= 0
        } else if (selectDiffernce < 7 && selectDiffernce >= 0) {
          return differenceInDays(dt, date) >= 0
        }
      }
      return false
    },
    disabled: dt => {
      return isSelectable(dt, { minimumDate, maximumDate }) && differenceInDays(maximumDate, dt) < 6 &&  differenceInDays(maximumDate, dt) >= 0
    }
  };

  let selectedDate = null;
  let data = null
    
  if (state.selectedDateWeek) {
    selectedDate = moment(state.selectedDateWeek)
    data = state.deviceData[`${selectedDate.format('DD_MM_YY')}_week`]
  }

  return <>
    {
      selectedDate ?
        <>
          <Vertical>
            <Horizontal flex style={{ margin: 8 }}>
                <Horizontal center><Button label="BACK" onClick={() => {
                  setDate(null)
                  actions.selectDateWeek(null)
                }} /></Horizontal>
                <Horizontal flex="1">
                    <LeftDiv use="headline3">
                      {selectedDate.format('DD')}
                    </LeftDiv>
                    <RightDiv use="headline5">
                      {selectedDate.format('MMM')}
                      <br />
                      <span>{selectedDate.format('YYYY')}</span>
                    </RightDiv>
                </Horizontal>
                <Horizontal><Typography use="headline3">-</Typography></Horizontal>
                <Horizontal flex="1">
                    <LeftDiv use="headline3">
                      {selectedDate.add(7, 'days').format('DD')}
                    </LeftDiv>
                    <RightDiv use="headline5">
                      {selectedDate.add(7, 'days').format('MMM')}
                      <br />
                      <span>{selectedDate.add(7, 'days').format('YYYY')}</span>
                    </RightDiv>
                </Horizontal>
            </Horizontal>
          </Vertical>
          {
            data ? (
              <Chart forDate={selectedDate} data={data} height={height - 88} width={width} />
            ) : (
              <Horizontal center style={{ height: 108 }}>
                <CircularProgress size="large" />
              </Horizontal>
            )
          }
        </>
        :
        <>
          <Info><Typography use="body1">Select start date of the week</Typography></Info>
          <Calendar
            onDayClick={handleSelectDate}
            minimumDate={minimumDate}
            maximumDate={maximumDate}
            locale={enGB}
            modifiers={modifiers}
            weekdayFormat='EEEEEE'
          />
          <Horizontal style={{ margin: 16 }} justifyEnd>
            <CancelButton disabled={!date} label="Cancel" dense onClick={() => setDate(null)} />
            <Button disabled={!date} label="OK" dense onClick={() =>{
              actions.selectDateWeek(moment(date).toLocaleString())
              actions.fetchDeviceWeekData(moment(date))
            }} />
          </Horizontal>
        </>
    }
  </>
}

export default Week
