import React, { Component } from 'react'
import db from './db'
import Button from 'material-ui/Button';

export default class Register extends Component {

    state = {
        email: '',
        password: '',
        password2: ''
    }

    async handleRegister() {
        if (this.state.password === this.state.password2) {
            await db.register(this.state.email, this.state.password )
            this.props.history.push('/login')
        }
    }

    render() {
        return (
            <div>
                <input value={this.state.email} placeholder='Email' onChange={e => this.setState({ email: e.target.value })} />
                <input value={this.state.password} placeholder='Password' onChange={e => this.setState({ password: e.target.value })} />
                <input value={this.state.password2} placeholder='Confirm Password' onChange={e => this.setState({ password2: e.target.value })} />
                <Button color="inherit" onClick={() => this.handleRegister()}>Register</Button>
            </div >
        )
    }
}
