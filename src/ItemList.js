import React, { Component } from 'react'
import DataList from './DataList'
import db from './db'
import Button from 'material-ui/Button';
import List, { ListItem, ListItemSecondaryAction } from 'material-ui/List';
import TextField from 'material-ui/TextField';
import { Link } from "react-router-dom";

export default class ItemList extends Component {

    state = {
        search: '',
        _id: '',
        description: '',
        buyer: '',
        expiry: '',
        highbid: '',
        users: [],
        query: 'items'
    }

    formatListItem(item, i) {
        return (
            <ListItem key={i}>
                {item.description} ({item.seller}, {item.expiry})
                , Bids:
                <span className='Comma'>
                    {(item.bids && item.bids.length !== 0) ? item.bids.map((bid, i) => <span key={i}>{bid.amount} ({bid.username})</span>) : <span>None</span>}
                </span>
                <ListItemSecondaryAction>
                    {
                        db.user
                        &&
                        db.user._id === item.seller
                        &&
                        <Button variant="raised" color="primary" size="small" onClick={() => this.handleDelete(item)}>Delete</Button>
                    }
                    {
                        db.user
                        &&
                        <Button variant="raised" color="primary" size="small" onClick={() => this.handleSelect(item)}>Select</Button>
                    }
                    <Button variant="raised" color="primary" size="small" component={Link} to={`/items/${item._id}`}>Details</Button>
                </ListItemSecondaryAction>
            </ListItem>
        )
    }

    handleSearchItems() {
        this.setState({ _id: '', name: '', email: '', query: 'items/description/' + this.state.search })
    }

    async handleDelete(item) {
        await db.collection('items').deleteOne(item._id)
        this.setState({ _id: '', name: '', email: '' })
    }

    async handleCreate() {
        await db.collection('items').createOne({ description: this.state.description, seller: db.user._id, expiry: this.state.expiry, bids: [] })
        this.setState({ _id: '', description: '', seller: '', expiry: '' })
    }

    async handleUpdate() {
        await db.collection('items').replaceOne(this.state.select._id, { _id: this.state.select._id, description: this.state.description, seller: db.user._id, expiry: this.state.expiry, bids: this.state.bids })
        this.setState({ _id: '', description: '', seller: '', expiry: '' })
    }

    handleSelect(item) {
        this.setState({ select: item, _id: item._id, description: item.description, seller: item.seller, expiry: item.expiry, bids: item.bids })
    }

    render() {
        return (
            <div style={{ padding: 10, backgroundColor: 'pink' }}>
                <h2>Items</h2>
                <List className='DataList'>
                    <DataList collection={this.props.my ? 'users/' + db.user._id + '/items' : this.state.query} formatListItem={(item, i) => this.formatListItem(item, i)} />
                </List>
                <p>Queries:</p>
                <TextField label='Description' value={this.state.search} onChange={e => this.setState({ search: e.target.value })} />
                <Button variant="raised" color="primary" size="small" style={{ float: 'right' }} onClick={() => this.handleSearchItems()}>Search Items</Button>
                {
                    db.user
                    &&
                    <div>
                        <p>Operations:</p>
                        <TextField label='Description' value={this.state.description} onChange={e => this.setState({ description: e.target.value })} />
                        <TextField type='date' label='Expiry' value={this.state.expiry} onChange={e => this.setState({ expiry: e.target.value })} />
                        <Button variant="raised" color="primary" size="small" style={{ margin: 3, float: 'right' }} onClick={() => this.handleUpdate()}>Update</Button>
                        <Button variant="raised" color="primary" size="small" style={{ margin: 3, float: 'right' }} onClick={() => this.handleCreate()}>Create</Button>
                    </div>
                }
            </div>
        )
    }
}