import React from "react"
import ReactDOM from "react-dom"
import { BrowserRouter as Router } from 'react-router-dom'
import { createOvermind } from 'overmind'
import { Provider } from 'overmind-react'
import { configWithStatechart } from './overmind'
import 'rmwc/dist/styles'
import App from "./App"

const overmind = createOvermind(configWithStatechart)

console.log('Loadinggg')

ReactDOM.render(
  <Provider value={overmind}>
    <Router>
      <App />
    </Router>
  </Provider>,
  document.getElementById("root")
)
