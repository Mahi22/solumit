import React, { useState } from "react"
import { Switch, Route, useLocation, useHistory } from "react-router-dom"
import styled from "styled-components"
import { ThemeProvider } from '@rmwc/theme'
import { TopAppBar, TopAppBarRow, TopAppBarSection, TopAppBarNavigationIcon, TopAppBarTitle } from "@rmwc/top-app-bar"
import { TabBar, Tab } from '@rmwc/tabs'
import { Drawer, DrawerHeader, DrawerTitle, DrawerSubtitle, DrawerContent } from '@rmwc/drawer'
import { List, ListItem } from '@rmwc/list'
import GlobalStyle from "./GlobalStyle"
import Today from './pages/Today'
import Day from './pages/Day'
import Month from './pages/Month'
import Overall from './pages/Overall'

import useDimensions from './hooks/useDimensions'
import useWindowSize from "./hooks/useWindowSize"

const StyledNav = styled.nav`
  padding: 1.5rem;
  li {
    display: block;
    margin-bottom: 1.5rem;
    font-size: 1.1rem;
  }
  h1 {
    font-family: "Source Sans Pro", -apple-system, BlinkMacSystemFont,
      "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans",
      "Helvetica Neue", sans-serif;
    font-weight: bold;
    margin-bottom: 1.5rem;
    font-size: 1.5rem;
  }
`

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


const MobileWarning = () => {
  return (
    <MessageWrapper>
      These app is meant to be used for mobile device only.
    </MessageWrapper>
  )
}

const routes = [
  { path: "/month", component: Month, title: "Month" },
  { path: "/day", component: Day, title: "Day" },
  { path: "/", component: Today, title: "Today" },
  { path: "/overall", component: Overall, title: "Overall" },
]

function App() {
  const { height } = useWindowSize()
  const [ref, { topBarHeight }] = useDimensions({ selector: 'topBar' })
  const location = useLocation()
  const history = useHistory()
  const [open, setOpen] = useState(false)

  const selectedIndex = routes.map(r => r.path).indexOf(location.pathname)
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
        <Drawer modal open={open} onClose={() => setOpen(false)}>
              <DrawerHeader>
                <DrawerHeader>
                  <DrawerTitle>Username</DrawerTitle>
                </DrawerHeader>
                <DrawerContent>
                  <List>
                    <ListItem>Device 1</ListItem>
                    <ListItem>Device 2</ListItem>
                    <ListItem>Logout</ListItem>
                  </List>
                </DrawerContent>
              </DrawerHeader>
            </Drawer>
        <GlobalStyle />
            <TopAppBar onNav={() => setOpen(true)} ref={ref}>
                  <TopAppBarRow>
                    <TopAppBarSection alignStart>
                      <TopAppBarNavigationIcon icon="menu" />
                      <TopAppBarTitle>Solace</TopAppBarTitle>
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
                      <StyledTab>Day</StyledTab>
                      <StyledTab>Today</StyledTab>
                      <StyledTab>Overall</StyledTab>
                    </TabBar>
                  </StyledTopAppBarRow>
            </TopAppBar>
            <div style={{ height: topBarHeight }} />
            {
              topBarHeight ?
              (
                <div style={{ height: height - topBarHeight }}>
                  <Switch>
                    {routes.map(r => {
                      const Component = r.component
                      return (
                        <Route exact path={r.path} key={r.path}>
                          <Component height={height - topBarHeight} />
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
