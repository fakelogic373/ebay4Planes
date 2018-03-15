import React, { Component } from 'react'
import db from './db'
import Button from 'material-ui/Button';

export default class Reset extends Component {

    async handleReset(item) {

        const collections = ['items', 'users', 'expired']

        await Promise.all(
            collections.map(
                async collection => await db.collection(collection).deleteAll()
            )
        )

        const users = [
            { _id: 'Joe', likes: [] },
            { _id: 'Fred', likes: [] },
            { _id: 'Ann', likes: [] }
        ]
        await Promise.all(
            users.map(
                async user => await db.collection('users').createOne(user)
            )
        )

        const items = [
            { description: 'Doll', seller: 'Joe', buyer: '', expiry: '2018-02-28', highbid: '', bids: [] },
            { description: 'Toy truck', seller: 'Joe', buyer: '', expiry: '2018-03-29', highbid: 10, bids: [{ username: 'Fred', amount: 10 }] },
            { description: 'Skateboard', seller: 'Ann', buyer: '', expiry: '2018-04-13', highbid: 20, bids: [{ username: 'Fred', amount: 10 }, { username: 'Ann', amount: 20 }] },
        ]
        await Promise.all(
            items.map(
                async item => await db.collection('items').createOne(item)
            )
        )
    }
    state = {
        age: ''
    };

    render() {
        return (
            <Button color="inherit" onClick={() => this.handleReset()}>Reset</Button>
        )
    }
}
