import fetch from 'node-fetch'
const port = 3001
const fetchHost = 'http://localhost:' + port + '/api/'

import { MongoClient, ObjectId } from 'mongodb'

const connection = async () => {
    const client = await MongoClient.connect('mongodb://localhost:27017')
    return client.db('60011111')
}

import express from 'express'
import bodyParser from 'body-parser'

const app = express()

app.use(bodyParser.json())
app.set('port', port)

import { Server } from 'http'
import SocketIO from 'socket.io'

const server = Server(app)
const io = SocketIO(server)

server.listen(app.get('port'), () => {
    console.log("Listening on http://localhost:" + app.get('port'))
})

io.on('connection', socket => {
    socket.on('disconnect', () => console.log('disconnected'))
    socket.on('token', token => fetchOptions.headers.authorization = 'Bearer ' + token)
    socket.on('findAll', collection => collection !== 'token' && emitFindAll(collection))
})

let fetchOptions = { method: 'GET', headers: { 'Content-Type': 'application/json' } }
const emitFindAll = async (collection) => {
    console.log('url = ', collection)
    const response = await fetch(fetchHost + collection, fetchOptions)
    const json = await response.json()
    console.log('emitFindAll result:', json)
    io.emit(collection, json)
}

// auth

import jwt from 'express-jwt'
import { sign } from 'jsonwebtoken'
const secret = 'abc'

const setAuth = async () => {

    const db = await connection()

    // register = add username and password to db
    app.post('/auth/register', async (req, res) => {
        const user = await db.collection('users').insertOne(req.body)
        res.json(user)
    })

    // login = check username and password in db and return token containing user data and token string
    app.post('/auth/login', async (req, res) => {
        let result = null
        const user = await db.collection('users').findOne({ _id: req.body._id, password: req.body.password })
        if (user) {
            result = { user, token: sign(user, secret) }
        }
        console.log('login result', result)
        res.json(result)
        io.emit('token', result)
    })

    app.get('/auth/logout', async (req, res) => {
        console.log('logout')
        res.json(null)
        io.emit('token', null)
    })
}
setAuth()

// check token on all routes except for: auth and GET's
app.use(jwt({ secret }).unless({ method: ['GET'], path: ['/auth/register', '/auth/login'] }))

// routes
const setRoutes = async (collection) => {

    const db = await connection()
    const url = '/api/' + collection

    // custom queries first

    if (collection === 'users') {

        // find items by item name
        app.get(url + '/username/:_id', async (req, res) => {
            const results = await db.collection(collection).find({ _id: req.params._id }).toArray()
            res.json(results)
        })

        // find items for auction by seller username
        app.get(url + '/:seller/items', async (req, res) => {
            const results = await db.collection('items').find({ seller: req.params.seller }).toArray()
            res.json(results)
        })

        // find expired items for auction by seller username
        app.get(url + '/:seller/expired', async (req, res) => {
            const results = await db.collection('expired').find({ seller: req.params.seller }).toArray()
            res.json(results)
        })

        // find likes by user id
        app.get(url + '/:_id/likes', async (req, res) => {
            const results = await db.collection(collection).findOne({ _id: req.params._id })
            console.log('likes: ', req.params._id, results)
            const items = await Promise.all(results.likes.map(async like => await db.collection('items').findOne({ _id: new ObjectId(like._id) })))
            res.json(items)
        })

        // find unlikes by user id
        app.get(url + '/:_id/unlikes', async (req, res) => {
            const results = await db.collection(collection).findOne({ _id: req.params._id })
            console.log('likes', results)
            const items = await db.collection('items').find({ _id: { $nin: results.likes.map(item => new ObjectId(item._id)) } }).toArray()
            console.log('unlikes', items)
            res.json(items)
        })

        // create a new like for a particular user by id
        // url = POST items/:_id/likes
        app.post(url + '/:_id/likes', async (req, res) => {
            const results = await db
                .collection(collection)
                .updateOne({ _id: req.params._id }, { $push: { likes: req.body } })
            res.json(results)
            emitFindAll('users')
            emitFindAll('users/' + req.params._id)
            emitFindAll('users/' + req.params._id + '/likes')
            emitFindAll('users/' + req.params._id + '/unlikes')
        })

        app.delete(url + '/:_id/likes/:item_id', async (req, res) => {
            console.log('delete', url)
            const results = await db
                .collection(collection)
                .updateOne({ _id: req.params._id }, { $pull: { likes: { _id: req.params.item_id } } })
            res.json(results)
            emitFindAll('users')
            emitFindAll('users/' + req.params._id)
            emitFindAll('users/' + req.params._id + '/likes')
            emitFindAll('users/' + req.params._id + '/unlikes')
        })
    }

    if (collection === 'items') {

        // find items for user
        app.get(url + '/my', async (req, res) => {
            console.log('items for user', req.user._id)
            const results = await db.collection(collection).find({ seller: req.user._id }).toArray()
            res.json(results)
        })

        app.get(url + '/description/:description', async (req, res) => {
            console.log('searching description', req.params.description)
            const results = await db.collection(collection).find({ description: req.params.description }).toArray()
            res.json(results)
        })

        // find bids by item id
        app.get(url + '/:_id/bids', async (req, res) => {
            const _id = new ObjectId(req.params._id)
            const results = await db.collection(collection).findOne(_id)
            res.json(results.bids)
        })

        // create a new bid for a particular item by id
        // url = POST items/:_id/bids
        app.post(url + '/:_id/bids', async (req, res) => {
            const _id = new ObjectId(req.params._id)
            const results = await db
                .collection(collection)
                .updateOne({ _id }, { $push: { bids: req.body } })
            res.json(results)
            emitFindAll('items')
            emitFindAll('items/' + req.params._id)
            emitFindAll('items/' + req.params._id + '/bids')
            emitFindAll('users/' + req.body.seller + '/items')
        })

        app.put(url + '/:_id/bids/:username', async (req, res) => {
            const _id = new ObjectId(req.params._id)
            const results = await db
                .collection(collection)
                .updateOne({ _id, 'bids.username': req.params.username }, { $set: { 'bids.$': req.body } })
            res.json(results)
            emitFindAll('items')
            emitFindAll('items/' + req.params._id)
            emitFindAll('items/' + req.params._id + '/bids')
            emitFindAll('users/' + req.body.seller + '/items')
        })

        app.delete(url + '/:_id/bids/:username', async (req, res) => {
            console.log('delete', url)
            const _id = new ObjectId(req.params._id)
            const results = await db
                .collection(collection)
                .updateOne({ _id }, { $pull: { bids: { username: req.params.username } } })
            res.json(results)
            emitFindAll('items')
            emitFindAll('items/' + req.params._id)
            emitFindAll('items/' + req.params._id + '/bids')
            emitFindAll('users/' + req.body.seller + '/items')
        })
    }

    app.get(url, async (req, res) => {
        const results = await db.collection(collection).find().toArray()
        res.json(results)
    })

    app.post(url, async (req, res) => {
        console.log(req.body)
        if (req.body._id && collection !== 'users') {
            req.body._id = new ObjectId(req.body._id)
        }
        const results = await db.collection(collection).insertOne(req.body)
        emitFindAll(collection)
        if (collection === 'expired') {
            emitFindAll('users/' + req.body.seller + '/expired')
        }
        if (collection === 'items') {
            emitFindAll('users/' + req.body.seller + '/items')
        }
        res.json(results)
    })

    const url_id = url + '/:_id'

    app.get(url_id, async (req, res) => {
        const _id = collection == 'users' ? req.params._id : new ObjectId(req.params._id)
        const results = await db.collection(collection).findOne({ _id })
        res.json(results)
    })

    app.put(url_id, async (req, res) => {
        req.body._id = collection == 'users' ? req.params._id : new ObjectId(req.params._id)
        const results = await db.collection(collection).replaceOne({ _id: req.body._id }, req.body)
        emitFindAll(collection)
        emitFindAll(collection + '/' + req.params._id)
        if (collection === 'items') {
            emitFindAll('users/' + req.body.seller + '/items')
        }
        res.json(results)
    })

    app.delete(url_id, async (req, res) => {
        console.log('d delete', url_id)
        const _id = collection == 'users' ? req.params._id : new ObjectId(req.params._id)
        console.log('d _id', _id, collection)
        const r = await db.collection(collection).findOne({ _id })
        console.log('d findOne', r)
        const seller = r.seller
        const results = await db.collection(collection).deleteOne({ _id })
        emitFindAll(collection)
        emitFindAll(collection + '/' + req.params._id)
        if (collection === 'items') {
            emitFindAll('users/' + seller + '/items')
        }
        if (collection === 'expired') {
            emitFindAll('users/' + seller + '/expired')
        }
        res.json(results)
    })

    // drop collection
    app.delete(url, async (req, res) => {
        console.log('drop', url, collection)
        let results = await db.collection(collection).find().toArray()
        if (results && results.length !== 0) {
            results = await db.collection(collection).drop()
        }
        console.log('drop', results)
        res.json(results)
    })

}

setRoutes('items')
setRoutes('users')
setRoutes('expired')