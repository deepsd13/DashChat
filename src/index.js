const path = require('path')
const express = require('express')
const bcrypt = require('bcryptjs')
const http = require('http')
const socketio = require('socket.io')
require('./db/mongoose')
const User = require('../src/models/user')
const Room = require('../src/models/room')
const moment = require('moment')
const jwt = require('jsonwebtoken')
const { sendWelcomeEmail, sendCancellationEmail, sendInvitationEmail } = require('../src/emails/account')
const { generateMessage, generateWelcomeMessage, generateLocationMessage } = require('../src/utils/messages')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT
const publicDirectoryPath = path.join(__dirname, '../public')


app.use(express.static(publicDirectoryPath))

io.on('connection', (socket) => {


    socket.on('signup', async({ username, email, password, }, callback) => {
        try {
            const user = await new User({ username, email, password })
            const token = await user.generateAuthToken()
            sendWelcomeEmail(email, username)
            callback()
        } catch (e) {
            console.log(e)
            callback(e.message)
        }
    })


    socket.on('signin', async({ email, password }, callback) => {
        try {
            const user = await User.findByCredentials(email, password)
            const token = await user.generateAuthToken()
            callback()

        } catch (e) {
            console.log(e)
            callback(e.message)
        }
    })



    function authenticate(user) {
        try {
            if (user.currentToken === '') {
                throw new Error('Your session has been expired or the account does not exist anymore. Please try again :) ')
            }
        } catch (e) {
            socket.emit('authenticationError', e.message)
        }

    }


    socket.on('createRoom', async({ email, roomName }, callback) => {

        try {
            const user = await User.findOne({ email })
            const room = await new Room({ name: roomName })
            room.addUser(user)
            await room.save()
        } catch (e) {
            console.log('here')
            callback(e.message)
        }

    })


    socket.on('invitation', async({ email, roomName }, callback) => {
        try {
            const user = await User.findOne({ email })
            const room = await Room.findOne({ name: roomName })
            user.addRoom(room)
            await user.save()

        } catch (e) {
            console.log(e)
            callback(e)
        }
    })
    socket.on('join', async({ email, roomName }, callback) => {
        try {
            const user = await User.findOne({ email })
            await authenticate(user)
            const room = await Room.findOne({ name: roomName })
            socket.join(room.name)
            user.addRoom(room)
            await user.save()
            const existingUser = room.users.find((r_user) => {
                return r_user.user.username === user.username
            })
            if (!existingUser) {
                console.log(room.name)
                room.addUser(user)
            }

            await room.save()


            io.to(room.name).emit('roomData', {
                room,
                user
            })
            if (room.users.length === 1 && room.messages.length === 0) {
                socket.emit('welcomeMessage', generateWelcomeMessage('Admin', `${room.name} has been created.Looks like there's only you in this room! Invite your friends to join the room to start chatting.`))
            }

        } catch (e) {
            console.log(e)
            callback(e.message)
        }

    })

    socket.on('sendMessage', async({ message, email, roomName }, callback) => {
        const user = await User.findOne({ email })
        authenticate(user)
        const room = await Room.findOne({ name: roomName })
        const msgData = generateMessage(user.username, message)
        const msg = {
            username: msgData.username,
            text: msgData.text,
            createdAt: moment(message.createdAt).format('MMM Do YY, h:mm a')
        }
        room.addMsg(msg)
        await room.save()
        io.to(room.name).emit('message', { msg, user })
        callback()
    })

    socket.on('sendLocation', async({ latitude, longitude, email, roomName }, callback) => {
        // const user = getUser(socket.id)
        const user = await User.findOne({ email })
        authenticate(user)
        io.to(roomName).emit('locationMessage', generateLocationMessage(user.username, `../map.html?latitude=${latitude}&&longitude=${longitude}`))
        callback()
    })

    socket.on('getRooms', async({ email }, callback) => {
        try {
            const user = await User.findOne({ email })
            const rooms = user.rooms
                // const rooms = await Room.find()
            io.emit('availableRooms', rooms)
        } catch (e) {
            console.log(e)
            callback(e)
        }
    })

    socket.on('leaveRoom', async({ email, roomName }, callback) => {
        const user = await User.findOne({ email })
        authenticate(user)
        const room = await Room.findOne({ name: roomName })
        user.removeRoom(room)
        await user.save()
        room.removeUser(user)
        await room.save()
    })

    socket.on('logout', async({ email }, callback) => {
        try {
            const user = await User.findOne({ email })
            authenticate(user)

            user.tokens = user.tokens.filter((token) => {
                return token.token !== user.currentToken
            })
            user.currentToken = ''
            await user.save()
        } catch (e) {
            callback(e)
        }
    })

    socket.on('deleteAccount', async({ email }, callback) => {
        try {
            const user = await User.findOne({ email })
            authenticate(user)
            console.log(user.username)
            sendCancellationEmail(email, user.username)
            await User.deleteOne({ email })
        } catch (e) {
            callback(e)
        }
    })

    socket.on('user', async({ username }, callback) => {
        try {
            const user = await User.findOne({ username })
            if (user) {
                throw new Error()
            } else {
                callback()
            }
        } catch (e) {
            callback(e)
        }
    })

    socket.on('email', async({ email }, callback) => {
        try {
            const user = await User.findOne({ email })
            if (user) {
                throw new Error()
            } else {
                callback()
            }
        } catch (e) {
            callback(e)
        }
    })

    socket.on('resetPassword', async({ email, password }, callback) => {
        console.log('here')
        try {
            const user = await User.updateOne({ email: email }, { $set: { password: await bcrypt.hash(password, 8) } })
            callback()
        } catch (e) {
            callback(e)
        }
    })

    socket.on('findEmail', async({ email }, callback) => {
        try {
            const user = await User.findOne({ email })
            if (!user) {
                throw new Error()
            }
        } catch (e) {
            console.log(e)
            callback(e)
        }
    })

    socket.on('sendInvitationEmail', async({ email, roomName }, callback) => {
        try {
            const user = await User.findOne({ email })
            if (!user) {
                throw new Error()
            }

            sendInvitationEmail(email, user.username, roomName)
            callback()
        } catch (e) {

            callback(e)
        }
    })

    socket.on('validateRoom', async({ roomName }, callback) => {

        try {
            const room = await Room.findOne({ name: roomName })
            if (room) {
                throw new Error()
            }
            callback()
        } catch (e) {
            callback(e)
        }


    })


})







server.listen(port, () => {
    console.log('Server is up on ' + port)
})