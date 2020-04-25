import React, { useState } from 'react'
import { CalendarNavigation } from 'react-nice-dates'
import { startOfMonth } from 'date-fns'
import { enGB } from 'date-fns/locale'
import { useControllableState } from '../dateUtils'

const Month = () => {
  const [month, setMonth] = useControllableState(null, null, startOfMonth(new Date()))
  return <>
    <CalendarNavigation
        locale={enGB}
        minimumDate={new Date('2020-02-15')}
        maximumDate={new Date()}
        month={month}
        onMonthChange={setMonth}
      />
  </>
}

export default Month
