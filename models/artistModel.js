const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const artistSchemaModel = new mongoose.Schema({
    isValid: {
        type: Boolean,
        default: true,
    },
    role: {
        type: String,
        default: 'Artist'
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    proPic: {
        type: String,
        default: 'https://www.hrlact.org/wp-content/uploads/2020/12/generic-user-icon.jpg'
    },
    members: {
        type: String,
        default: '1',
    },

    region: {
        type: String,
        required: true,
    },
    city: {
        type: String,
        required: true,
    },
    address: {
        type: String,
        required: true,
    },
    lat: {
        type: String
    },
    lon: {
        type: String
    },

    genre: {
        type: Array,
        
    },
    instruments: {
        type: Array,
        
    },
    pictures: {
        type: Array,
    },
    reviews: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Reviews',
            default: [],
        }
    ],
    description: {
        type: String,
    },
    instagram: {
        type: String,
    },
    facebook: {
        type: String,
    },
    webSite: {
        type: String
    }
}, { timestamps: true, strict: true })

artistSchemaModel.pre('save', async function (next) {
    const user = this
    if (!user.isModified('password')) {
        return next()
    }
    try {
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(user.password, salt)
        user.password = hashedPassword
        next()
    } catch (error) {
        return next(error)
    }
})

module.exports = mongoose.model('Artist', artistSchemaModel, 'artists')