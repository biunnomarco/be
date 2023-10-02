const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const localSchemaModel = new mongoose.Schema({
    isValid: {
        type: Boolean,
        default: false,
    },
    role: {
        type: String,
        default: 'Local'
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
        default: 'https://www.bing.com/images/search?view=detailV2&ccid=fqSvfYQB&id=32841701E6389B9F933FE5BFE21366EEC61EDD58&thid=OIP.fqSvfYQB0rQ-6EG_oqvonQHaHa&mediaurl=https%3a%2f%2fassets.stickpng.com%2fimages%2f585e4bf3cb11b227491c339a.png&cdnurl=https%3a%2f%2fth.bing.com%2fth%2fid%2fR.7ea4af7d8401d2b43ee841bfa2abe89d%3frik%3dWN0exu5mE%252bK%252f5Q%26pid%3dImgRaw%26r%3d0&exph=2240&expw=2240&q=User+Icon+White&simid=607989755601907770&FORM=IRPRST&ck=6B37A49630CEAAF228148B75F199F697&selectedIndex=0&ajaxhist=0&ajaxserp=0'
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
    localType: {
        type: Array,
        required: true,
    },
    favouriteGenre: {
        type: Array,
        required: true,
    },
    backline: {
        type: Array,
    },
    events: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Event',
            default: [],
        }
    ],
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

localSchemaModel.pre('save', async function (next) {
    const local = this
    if (!local.isModified('password')) {
        return next()
    }
    try {
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(local.password, salt)
        local.password = hashedPassword
        next()
    } catch (error) {
        return next()
    }
})

module.exports = mongoose.model('Local', localSchemaModel, 'locals')