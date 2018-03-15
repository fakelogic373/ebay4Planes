import React, { Component } from 'react'
import DataList from './DataList'
import LikedList from './LikedList'
import UserItemList from './UserItemList'
import db from './db'
import Button from 'material-ui/Button';
import List, { ListItem, ListItemSecondaryAction } from 'material-ui/List';
import TextField from 'material-ui/TextField';

export default class UserList extends Component {

    state = {
        search: '',
        select: null,
        _id: '',
        query: 'users'
    }

    formatListUser(user, i) {
        return (
            <ListItem key={i}>
                {user._id}
                , Likes:
                <span className='Comma'>
                    <DataList collection={'users/' + user._id + '/likes'} formatListItem={(item, i) => <span key={i}>{item.description}</span>} />
                </span>
                , Auctions:
                <span className='Comma'>
                    <DataList collection={'users/' + user._id + '/items'} formatListItem={(item, i) => <span key={i}>{item.description}</span>} />
                </span>
                <ListItemSecondaryAction>
                    <Button variant="raised" color="primary" size="small" onClick={() => this.handleDelete(user)}>Delete</Button>
                    <Button variant="raised" color="primary"  size="small" onClick={() => this.handleSelect(user)}>Select</Button>
                </ListItemSecondaryAction>
            </ListItem>
        )
    }

    handleSearchUsers() {
        this.setState({ _id: '', query: 'users/username/' + this.state.search })
    }

    async handleDelete(user) {
        await db.collection('users').deleteOne(user._id)
        this.setState({ select: null, _id: '' })
    }

    handleSelect(user) {
        this.setState({ select: user, _id: user._id })
    }

    async handleCreate() {
        await db.collection('users').createOne({ _id: this.state._id, likes: [] })
        this.setState({ _id: '' })
    }

    async handleUpdate() {
        await db.collection('users').deleteOne(this.state.select._id)
        await db.collection('users').createOne({ _id: this.state._id })
        this.setState({ select: null, _id: '' })
    }

    render() {
        return (
            <div>
                <div style={{ padding: 10, backgroundColor: 'lightgreen' }}>
                    <h2>Users</h2>
                    <List className='DataList'>
                        <DataList collection={this.state.query} formatListItem={(user, i) => this.formatListUser(user, i)} />
                    </List>
                    <p>Queries:</p>
                    <TextField label='Username' value={this.state.search} onChange={e => this.setState({ search: e.target.value })} />
                    <Button variant="raised" color="primary" size="small" style={{ float: 'right' }} onClick={() => this.handleSearchUsers()}>Search Users</Button>
                    <p>Operations:</p>
                    <TextField label='Username' value={this.state._id} onChange={e => this.setState({ _id: e.target.value })} />
                    <Button size='small' variant="raised" color="primary" style={{ margin: 3, float: 'right' }} onClick={() => this.handleUpdate()}>Update</Button>
                    <Button size='small' variant="raised" color="primary" style={{ margin: 3, float: 'right' }} onClick={() => this.handleCreate()}>Create</Button>
                </div>
                {
                    this.state.select
                        ?
                        <div>
                            <UserItemList user={this.state.select} />
                            <LikedList user={this.state.select} />
                        </div>
                        :
                        <div></div>
                }
            </div>
        )
    }
}