const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
    // const User = require('./user')

const roomSchema = new mongoose.Schema({
    name: {
        type: String,
        unique: true,
        required: true,
        trim: true
    },
    users: [{
        user: {
            type: mongoose.Schema.Types,
            ref: 'User',
        }
    }],
    messages: [{
        message: ({
            username: {
                type: String,
                required: true,
                trim: true
            },
            text: {
                type: String,
                required: true,
            },
            createdAt: {
                type: String,
                required: true
            }
        })
    }]
}, {
    timestamps: true
})

roomSchema.methods.addUser = async function(user) {
    const room = this
        // room.users[2] = user
        // console.log(room.users)
    room.users = room.users.concat({ user: user })
        // room.markModified('users')
        // await room.save()


    return user
}
roomSchema.methods.addMsg = async function(msg) {
    const room = this
        // room.users[2] = user
        // console.log(room.users)
    room.messages = room.messages.concat({ message: msg })
    room.markModified('messages')
        // await room.save()
    return msg
}

roomSchema.statics.findByCredentials = async(name) => {

    const room = await Room.findOne({ name })

    if (!room) {
        throw new Error('Unable to find the room!')
    }

    return room
}

roomSchema.method.getAllRooms = async() => {
    const rooms = await Room.find()
    return rooms
}

roomSchema.methods.removeUser = async function(this_user) {
    const room = this
    const index = room.users.findIndex((user) => (this_user.username === user.user.username))

    if (index !== 1) {
        console.log(index)

        return room.users.splice(index, 1)[0]
    }
}


const Room = mongoose.model('Room', roomSchema)

module.exports = Room