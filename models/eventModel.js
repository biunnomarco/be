const mongoose = require('mongoose')

const eventSchemaModel = new mongoose.Schema({
    location: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Local',
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true
    },
    genres: {
        type: Array,
        default: []
    },
    requiredArtist: {
        type: String,
        required: true,
    },
    refund : {
        type: String,
    },
    benefits: {
        type: String,
    },
    duration: {
        type: String,
        required: true,
    },
    candidates: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Candidate',
    }],
    date: {
        type: String,
        required: true,
    }
}, { timestamps: true, strict: true })

module.exports = mongoose.model('Event', eventSchemaModel, 'events')