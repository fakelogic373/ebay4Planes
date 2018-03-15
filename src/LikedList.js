import React, { Component } from 'react'
import DataList from './DataList'
import db from './db'
import { FormControl } from 'material-ui/Form';
import Select from 'material-ui/Select';
import { InputLabel } from 'material-ui/Input';
import Button from 'material-ui/Button';
import List, { ListItem, ListItemSecondaryAction } from 'material-ui/List';

export default class LikedList extends Component {

    state = {
        _id: ''
    }

    formatListItem(item, i) {
        return (
            <ListItem key={i}>
                {item.description} ({item.seller})
                <ListItemSecondaryAction>
                    <Button variant="raised" color="primary" size="small" onClick={() => this.handleDelete(item)}>Delete</Button>
                </ListItemSecondaryAction>
            </ListItem>
        )
    }

    async handleDelete(item) {
        await db.collection('users/' + this.props.user._id + '/likes').deleteOne(item._id)
        this.setState({ _id: '' })
    }

    async handleCreate() {
        await db.collection('users/' + this.props.user._id + '/likes').createOne({ _id: this.state._id })
        this.setState({ _id: '' })
    }

    render() {
        return (
            <div style={{ padding: 10, backgroundColor: 'gold' }}>
                <h2>{this.props.user._id}'s Likes</h2>
                <List className='DataList'>
                    <DataList collection={'users/' + this.props.user._id + '/likes'} formatListItem={(item, i) => this.formatListItem(item, i)} />
                </List>
                <p>Operations:</p>
                <FormControl>
                    <InputLabel>Select Item</InputLabel>
                    <Select native value={this.state._id} onChange={e => this.setState({ _id: e.target.value })} style={{ width: 200 }}>
                        <option></option>
                        <DataList collection={'users/' + this.props.user._id + '/unlikes'} formatListItem={(item, i) => <option key={i} value={item._id}>{item.description} ({item.seller})</option>} />
                    </Select>
                </FormControl>
                <Button variant="raised" color="primary" size="small" style={{ margin: 3, float: 'right' }} onClick={() => this.handleCreate()}>Create</Button>
            </div>
        )
    }
}