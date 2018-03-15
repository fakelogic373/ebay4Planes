// import socket.io things
import io from 'socket.io-client'

class DB {

    socket = null
    user = null
    token = null

    constructor() {
        this.socket = io('localhost:3001')
    }

    onAuthStateChanged(action) {
        const handleToken = token => {
            this.user = (token && token.user) || null
            this.token = (token && token.token) || null
            console.log('onAuthStateChanged: ', this.user, this.token)
            action(this.user)
        }
        this.socket.on('token', handleToken)
        return (() => this.socket.off('token', handleToken))
    }

    authFetch(url, options) {
        if (this.token) {
            options = options || {}
            options.headers = options.headers || {}
            options.headers.authorization = 'Bearer ' + this.token
        }
        return fetch(url, options)
    }

    setListener(collection, action) {
        this.socket.off(collection, action)
        this.socket.on(collection, action)
        this.socket.emit('findAll', collection)
    }

    removeListener(collection, action) {
        this.socket.off(collection, action)
    }

    _collection = null

    collection(collection) {
        this._collection = collection
        return this
    }

    async register(_id, password) {
        const response = await this.authFetch(
            'auth/register',
            {
                method: 'POST',
                body: JSON.stringify({ _id, password, likes: [] }),
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        )
        const json = await response.json()
        return json
    }

    async login(_id, password) {
        const response = await this.authFetch(
            'auth/login',
            {
                method: 'POST',
                body: JSON.stringify({ _id, password }),
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        )
        const json = await response.json()
        return json
    }

    async logout() {
        const response = await this.authFetch('auth/logout')
        const json = await response.json()
        return json
    }

    async findAll() {
        console.log('url = ', this._collection)
        const response = await this.authFetch('/api/' + this._collection)
        const json = await response.json()
        return json
    }

    async findOne(_id) {
        const response = await this.authFetch('/api/' + this._collection + '/' + _id)
        const json = await response.json()
        return json
    }

    async deleteOne(_id) {
        const response = await this.authFetch(
            '/api/' + this._collection + '/' + _id,
            {
                method: 'DELETE'
            }
        )
        const json = await response.json()
        return json
    }

    async deleteAll() {
        const response = await this.authFetch(
            '/api/' + this._collection,
            {
                method: 'DELETE'
            }
        )
        const json = await response.json()
        return json
    }

    async createOne(data) {
        const response = await this.authFetch(
            '/api/' + this._collection,
            {
                method: 'POST',
                body: JSON.stringify(data),
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        )
        const json = await response.json()
        return json
    }

    async replaceOne(_id, data) {
        const response = await this.authFetch(
            '/api/' + this._collection + '/' + _id,
            {
                method: 'PUT',
                body: JSON.stringify(data),
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        )
        const json = await response.json()
        return json
    }
}

const db = new DB()
export default db