const mongoose = require('mongoose')

const reviewsSchemaModel = new mongoose.Schema({
    rate: {
        type: String,
        required: true,
        max: 5,
        min: 0,
    },
    comment: {
        type: String,
        required: true,
    },
    authorArtist: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Artist',
        default: [],
    },
    authorLocal: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Local',
        default: [],
    }
}, { timestamps: true, strict: true })

module.exports = mongoose.model('Reviews', reviewsSchemaModel, 'reviews')