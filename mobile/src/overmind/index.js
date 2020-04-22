import { statechart } from 'overmind/config'
import { state } from './state'
import { onInitialize } from './onInitialize'
import { gql } from './effects/gql'
import * as actions from './actions'
import { appChart } from './statechart'

export const config = {
  onInitialize,
  state,
  actions,
  effects: {
    gql
  }
}

export const configWithStatechart = statechart(config, appChart)
