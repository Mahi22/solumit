import { useState } from 'react'
import { isAfter, isBefore, startOfDay } from 'date-fns'

export const isSelectable = (date, { minimumDate, maximumDate }) =>
  !isBefore(date, startOfDay(minimumDate)) && !isAfter(date, maximumDate)

export const mergeModifiers = (baseModifiers, newModifiers) => {
  const modifiers = { ...baseModifiers }

  if (!newModifiers) {
    return baseModifiers
  }

  Object.keys(newModifiers).forEach(name => {
    modifiers[name] = baseModifiers[name]
      ? date => baseModifiers[name](date) || newModifiers[name](date)
      : newModifiers[name]
  })

  return modifiers
}

export const useControllableState = (value, onChange, intitialValue) => {
  const [state, setState] = useState(intitialValue)

  return onChange ? [value, onChange] : [state, setState]
}