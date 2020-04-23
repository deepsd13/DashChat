const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        trim: true,
        unique: true,
    },
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        lowercase: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Email is not valid')
            }
        }
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minlength: 7,
        validate(value) {
            if (value.toLowerCase().includes('password')) {
                throw new Error('Password cannot contain "password" ')
            }

        }
    },
    currentToken: {
        type: String,
    },
    rooms: [{
        room: {
            type: mongoose.Schema.Types,
            ref: 'Room',
            required: true
        }
    }],
    tokens: [{
        token: {
            type: String,
            required: true,
        }

    }],
}, {
    timestamps: true
})

userSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'owner'
})


userSchema.methods.generateAuthToken = async function() {
    const user = this
    const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET)
    user.tokens = user.tokens.concat({ token: token })
    user.currentToken = token
    await user.save()

    return token
}

userSchema.methods.addRoom = async function(room) {
    const user = this

    const existingRoom = user.rooms.find((this_room) => this_room.room.name === room.name)
    if (!existingRoom) {
        user.rooms = user.rooms.concat({ room: room })
    }

}

userSchema.methods.removeRoom = async function(room) {

    const user = this
    const index = user.rooms.findIndex((this_room) => this_room.room.name === room.name)
    if (index !== 1) {
        console.log(index)

        return user.rooms.splice(index, 1)[0]
    }
}
userSchema.statics.findByCredentials = async(email, password) => {

    const user = await User.findOne({ email })

    if (!user) {
        throw new Error('Unable to login!Please try again')
    }
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
        throw new Error('Unable to login!Please try again')
    }

    return user
}

//hash the plain text password before saving
userSchema.pre('save', async function(next) {
    const user = this

    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8)
    }

    next()
})


const User = mongoose.model('User', userSchema)

module.exports = User