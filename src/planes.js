import React, { Component } from 'react'
import DataList from './DataList'
import db from './db'
import Button from 'material-ui/Button';
import List, { ListItem, ListItemSecondaryAction } from 'material-ui/List';
import TextField from 'material-ui/TextField';
import { Link } from "react-router-dom";

export class all extends Component {

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
                    <Button variant="raised" color="primary" size="small" component={Link} to={`/plane_details/${item._id}`}>View Bids/Details</Button>
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

                {
                    db.user
                    &&
                    <Button variant="raised" color="primary" size="small" component={Link} to={`/plane_create`}>Create a new bid </Button>

                }

                

                <List className='DataList'>
                    <DataList collection={this.props.my ? 'users/' + db.user._id + '/items' : this.state.query} formatListItem={(item, i) => this.formatListItem(item, i)} />
                </List>



            </div>
        )
    }
}


export class details extends Component {

    state = {
        amount: '',
        item: null
    }

    componentWillMount() {
        db.setListener('items/' + this.props.match.params._id, this.handleItem)
    }

    componentWillUnmount() {
        db.removeListener(`items/${this.props.match.params._id}`, this.handleItem)
    }

    handleItem = item => this.setState({ item })

    formatListItem(bid, i) {
        return (
            <ListItem key={i}>
                Username: {bid.username}, Amount: {bid.amount}
            </ListItem>
        )
    }

    async handleCreate() {
        if (!this.state.item.highbid || (1 * this.state.amount >= this.state.item.highbid)) {
            let item = this.state.item
            item.highbid = this.state.amount
            await db.collection('items').replaceOne(item._id, item)
            await db.collection('items/' + this.state.item._id + '/bids').createOne({ username: db.user._id, amount: this.state.amount })
        }
        this.setState({ amount: '' })
    }

    render() {
        return (
            this.state.item
            &&
            <div style={{ padding: 10, backgroundColor: 'lightblue' }}>
                <h2>{this.state.item.description}'s Bids</h2>
                <List className='DataList'>
                    <DataList collection={'items/' + this.state.item._id + '/bids'} formatListItem={(bid, i) => this.formatListItem(bid, i)} />
                </List>
                <p>Operations:</p>
                {
                    db.user
                        ?
                        <TextField type='number' placeholder='Your Bid' value={this.state.amount} onChange={e => this.setState({ amount: e.target.value })} />
                        :
                        <p></p>
                }



                {
                    db.user
                    &&
                    <Button variant="raised" color="primary" size="small" style={{ margin: 3, float: 'right' }} onClick={() => this.handleCreate()}>Create</Button>
                }

            </div>
        )
    }
}


export class create extends Component {

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
                {
                    db.user
                    &&
                    <div>
                        <p>Operations:</p>
                        <TextField label='Description' value={this.state.description} onChange={e => this.setState({ description: e.target.value })} />
                        <TextField type='date' label='Expiry' value={this.state.expiry} onChange={e => this.setState({ expiry: e.target.value })} />
                        <Button variant="raised" color="primary" size="small" style={{ margin: 3, float: 'right' }} onClick={() => this.handleUpdate()}>Update</Button>
                        <Button variant="raised" color="primary" size="small" style={{ margin: 3, float: 'right' }} onClick={() => this.handleCreate()} component={Link} to='/planes'>Create</Button>
                    </div>
                }
            </div>
        )
    }
}