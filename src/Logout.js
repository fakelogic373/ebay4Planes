import { Component } from 'react'
import db from './db'

export default class Logout extends Component {

    async componentWillMount() {
        await db.logout()
        this.props.history.push('/')
    }

    render() {
        return null
    }
}