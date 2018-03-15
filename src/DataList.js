import { Component } from 'react'
import db from './db'
import './DataList.css'

export default class DataList extends Component {

    state = {
        items: []
    }

    componentWillMount() {
        db.setListener(this.props.collection, this.handleItems)
    }

    componentWillReceiveProps(props) {
        if (props.collection !== this.props.collection) {
            console.log('List: new props = ', props.collection)
            db.setListener(props.collection, this.handleItems)
        }
    }

    componentWillUnmount() {
        db.removeListener(this.props.collection, this.handleItems)
    }

    handleItems = items => this.setState({ items })

    render() {
        return (
            this.state.items.map((item, i) => this.props.formatListItem(item, i))
        )
    }
}