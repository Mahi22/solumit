import React, { useState, useEffect } from "react"
import { Switch, Route, useLocation, useHistory } from "react-router-dom"
import { createHook } from 'overmind-react'
import styled from "styled-components"
import { ThemeProvider } from '@rmwc/theme'
import { TopAppBar, TopAppBarRow, TopAppBarSection, TopAppBarNavigationIcon, TopAppBarTitle } from "@rmwc/top-app-bar"
import { TabBar, Tab } from '@rmwc/tabs'
import { Drawer, DrawerHeader, DrawerTitle, DrawerContent } from '@rmwc/drawer'
import { List, ListItem } from '@rmwc/list'
import GlobalStyle from "./GlobalStyle"
import Today from './pages/Today'
import Yesterday from './pages/Yesterday'
import Day from './pages/Day'
import Week from './pages/Week'
import Month from './pages/Month'
import Overall from './pages/Overall'

import useDimensions from './hooks/useDimensions'
import useWindowSize from "./hooks/useWindowSize"

const MessageWrapper = styled.div`
  display: none;
  padding-bottom: 1rem;
  padding-left: 1rem;
  padding-top: 1rem;
  background: blue;
  color: white;

  @media (min-width: 768px) {
    display: block;
  }
`
const StyledTopAppBarRow = styled(TopAppBarRow)`
  height: 48px;
`

const StyledTab = styled(Tab)`
  .mdc-tab__text-label {
    text-transform: initial
  }
  .mdc-tab-indicator .mdc-tab-indicator__content--underline {
    border-color: #FFFF8C
  }
`

const useOvermind = createHook()


const MobileWarning = () => {
  return (
    <MessageWrapper>
      These app is meant to be used for mobile device only.
    </MessageWrapper>
  )
}

const routes = [
  { path: "/month", component: Month, title: "Month" },
  { path: "/week", component: Week, title: "Week" },
  { path: "/day", component: Day, title: "Day" },
  { path: "/yesterday", component: Yesterday, title: "Yesterday" },
  { path: "/", component: Today, title: "Today" },
  { path: "/overall", component: Overall, title: "Overall" },
]

function App() {
  const { state, actions } = useOvermind()
  const { height, width } = useWindowSize()
  const [ref, { topBarHeight }] = useDimensions({ selector: 'topBar' })
  const location = useLocation()
  const history = useHistory()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    actions.fetchInfo()
  }, [])

  const isReady = Boolean(state.matches({
    READY: true
  }) && topBarHeight)

  const selectedIndex = routes.map(r => r.path).indexOf(location.pathname)

  const devices = state.devices.devices ? state.devices.devices.map(d => d.location).concat('Logout') : ['Logout']
  return (
    <div style={{ height }}>
      <MobileWarning />
      <ThemeProvider
        options={{
          primary: '#F36F21',
          secondary: '#FFFF8C',
          onPrimary: "#FFFFFF",
          textPrimaryOnBackground: '#FFFFFF'
        }}
      >
        {isReady && (
          <Drawer modal open={open} onClose={() => setOpen(false)}>
            <DrawerHeader>
                  <DrawerHeader>
                    <DrawerTitle>Username</DrawerTitle>
                  </DrawerHeader>
                  <DrawerContent>
                    <List
                      onAction={evt => {
                        if (evt.detail.index === (devices.length - 1)) {
                          console.log('Logout')
                        } else {
                          // console.log(state.devices.devices[evt.detail.index])
                          actions.selectDevice(state.devices.devices[evt.detail.index])
                        }
                      }}
                    >
                      {devices.map(d => {
                        return <ListItem key={d} activated={state.activeDevice.location === d}>{d}</ListItem>
                      })}
                    </List>
                  </DrawerContent>
            </DrawerHeader>
          </Drawer>
        )}
        <GlobalStyle />
            <TopAppBar onNav={() => setOpen(true)} ref={ref}>
                  <TopAppBarRow>
                    <TopAppBarSection alignStart>
                      <TopAppBarNavigationIcon icon="menu" />
                      <TopAppBarTitle>{state.activeDevice && state.activeDevice.location || ''}</TopAppBarTitle>
                    </TopAppBarSection>
                  </TopAppBarRow>
                  <StyledTopAppBarRow>
                    <TabBar
                      activeTabIndex={selectedIndex}
                      onActivate={evt => {
                        history.push(routes[evt.detail.index].path)
                      }}
                    >
                      <StyledTab>Month</StyledTab>
                      <StyledTab>Week</StyledTab>
                      <StyledTab>Day</StyledTab>
                      <StyledTab>Yesterday</StyledTab>
                      <StyledTab>Today</StyledTab>
                      <StyledTab>Overall</StyledTab>
                    </TabBar>
                  </StyledTopAppBarRow>
            </TopAppBar>
            <div style={{ height: topBarHeight }} />
            {
              isReady ?
              (
                <div style={{ height: height - topBarHeight }}>
                  <Switch>
                    {routes.map(r => {
                      const Component = r.component
                      return (
                        <Route exact path={r.path} key={r.path}>
                          <Component height={height - topBarHeight} width={width} />
                        </Route>
                      )
                    })}
                  </Switch>
                </div>
              ) : <div>Loading</div>
            }
      </ThemeProvider>
    </div>
  )
}

export default App
