import React, { Component } from 'react'
import db from './db'
import Button from 'material-ui/Button';

export default class Login extends Component {

    state = {
        email: '',
        password: ''
    }

    async handleLogin() {
        const result = await db.login(this.state.email, this.state.password )
        if (result) {
            console.log('in login: ', result)
            this.props.history.push('/')
        }
    }

    render() {
        return (
            <div>
                <input value={this.state.email} placeholder='Email' onChange={e => this.setState({ email: e.target.value })} />
                <input value={this.state.password} placeholder='Password' onChange={e => this.setState({ password: e.target.value })} />
                <Button color="inherit" onClick={() => this.handleLogin()}>Login</Button>
            </div >
        )
    }
}