import React, { Component } from 'react'
import {
  BrowserRouter,
  Route,
  Switch
} from 'react-router-dom'

import './App.css'
import logo from './logo.png'
import {
  Auth,
  AppMenu,
  Home,
  FacilityListing,
  FacilityDetails
} from './components'

import {
  ApolloClient,
  ApolloProvider,
  createNetworkInterface,
  toIdValue
} from 'react-apollo'

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import getMuiTheme from 'material-ui/styles/getMuiTheme'
import { createMuiTheme } from 'material-ui/styles'
import { indigo500, orange500 } from 'material-ui/styles/colors'

const networkInterface = createNetworkInterface({
  uri: process.env.REACT_APP_SERVER_URL
})
networkInterface.use([{
  applyMiddleware (req, next) {
    // setTimeout(next, 500);
    next()
  }
}, {
  applyMiddleware (req, next) {
    req.request.server = req.request.query.server

    if (!req.options.headers) {
      req.options.headers = {}
    }

    const token = localStorage.getItem('token')
    req.options.headers.authorization = token ? `Bearer ${token}` : null
    next()
  }
}])

function dataIdFromObject (result) {
  if (result.__typename) {
    if (result.id !== undefined) {
      return `${result.__typename}:${result.id}`
    }
  }
  return null
}

const client = new ApolloClient({
  networkInterface,
  customResolvers: {
    Query: {
      facility: (_, args) => {
        return toIdValue(dataIdFromObject({ __typename: 'Facility', id: args['id'] }))
      }
    }
  },
  dataIdFromObject
})

const muiTheme = getMuiTheme({
  palette: {
    primary: orange500,
    accent: indigo500,
    type: 'light'
  }
})

class App extends Component {
  render () {
    return (
      <MuiThemeProvider muiTheme={muiTheme}>
        <ApolloProvider client={client}>
          <BrowserRouter>
            <div className='App'>
              {
                (localStorage.token)
                ? (
                  <AppMenu>
                    <Switch>
                      <Route exact path='/' component={Home} />
                      <Route path='/facilities' component={FacilityListing} />
                      <Route path='/facilities/:facilityId' component={FacilityDetails} />
                    </Switch>
                  </AppMenu>
                )

                : <Auth />
              }
            </div>
          </BrowserRouter>
        </ApolloProvider>
      </MuiThemeProvider>
    )
  }
}

export default App
