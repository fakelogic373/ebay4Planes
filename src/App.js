import React, { Component } from 'react';
import UserList from './UserList'
import ItemList from './ItemList'
import Item from './Item'
import Reset from './Reset'
import Register from './Register'
import Login from './Login'
import Logout from './Logout'
import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import Typography from 'material-ui/Typography';
import Button from 'material-ui/Button';
import IconButton from 'material-ui/IconButton';
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import db from './db'

import * as Planes from './planes'

import MyBids from './MyBids'
export default class App extends Component {

  state = {
    user: null
  }

  componentDidMount() {
    this.authSubscription = db.onAuthStateChanged(user => this.setState({ user }))
  }

  componentWillUnmount() {
    this.authSubscription()
  }

  // router page

  render() {
    return (
      <Router>
        <div>
          <AppBar position="static">
            <Toolbar>
              <IconButton color="inherit" aria-label="Menu">
                L
              </IconButton>
              <Typography variant="title" color="inherit" style={{ flex: 1 }}>
              Luxury Plans audition
              </Typography>
              <Button color="inherit" component={Link} to='/items'>Items</Button>
              <Button color="inherit" component={Link} to='/planes'>planes</Button>
              {
                this.state.user
                  ?
                  <div>
                    <Button color="inherit" component={Link} to='/myitems'>{db.user._id}'s Items</Button>
                    <Button color="inherit" component={Link} to='/mybids'>{db.user._id}'s Bids</Button>
                    <Button color="inherit" component={Link} to='/users'>Users</Button>
                    <Reset />
                    <Button color="inherit" component={Link} to='/logout'>Logout</Button>
                  </div>
                  :
                  <div>
                    <Button color="inherit" component={Link} to='/register'>Register</Button>
                    <Button color="inherit" component={Link} to='/login'>Login</Button>
                  </div>
              }
            </Toolbar>
          </AppBar>
          <Route exact path="/" component={ItemList} />
          <Route path="/items" component={ItemList} />

          <Route path="/planes" component={Planes.all} />
          <Route path="/plane_details/:_id" component={Planes.details} />


          <Route path="/myitems" render={props => <ItemList my={true} {...props} />} />
          <Route path="/users" component={UserList} />
          <Route path="/register" component={Register} />
          <Route path="/login" component={Login} />
          <Route path="/logout" component={Logout} />
          <Route path="/items/:_id" component={Item} />

          <Route path="/mybids" component={MyBids} />
        </div>
      </Router>
    )
  }
}