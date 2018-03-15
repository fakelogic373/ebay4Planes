import React, { Component } from 'react'
import DataList from './DataList'
import db from './db'
import Button from 'material-ui/Button';
import List, { ListItem, ListItemSecondaryAction } from 'material-ui/List';

export default class UserItemList extends Component {

    formatListItem(item, i) {
        return (
            <ListItem key={i}>
                {item.description}, Highbid: {item.highbid ? item.highbid : 'None'}
                <ListItemSecondaryAction>
                    <Button variant="raised" color="primary" size="small" onClick={() => this.handleExpireNow(item)}>Expire Now</Button>
                </ListItemSecondaryAction>
            </ListItem>
        )
    }

    formatListItemExpired(item, i) {
        return (
            <ListItem key={i}>
                {item.description}, Highbid: {item.highbid ? item.highbid : 'None'}
                <ListItemSecondaryAction>
                    <Button variant="raised" color="primary" size="small" onClick={() => this.handleDelete(item)}>Delete</Button>
                </ListItemSecondaryAction>
            </ListItem>
        )
    }

    async handleExpireNow(item) {
        await db.collection('expired').createOne(item)
        await db.collection('items').deleteOne(item._id)
    }

    async handleDelete(item) {
        await db.collection('expired').deleteOne(item._id)
    }

    render() {
        return (
            <div style={{ padding: 10, backgroundColor: 'lightgray' }}>
                <h2>{this.props.user._id}'s Current Auctions</h2>
                <List className='DataList'>
                    <DataList collection={'users/' + this.props.user._id + '/items'} formatListItem={(item, i) => this.formatListItem(item, i)} />
                </List>
                <h2>{this.props.user._id}'s Expired Auctions</h2>
                <List className='DataList'>
                    <DataList collection={'users/' + this.props.user._id + '/expired'} formatListItem={(item, i) => this.formatListItemExpired(item, i)} />
                </List>
            </div>
        )
    }
}