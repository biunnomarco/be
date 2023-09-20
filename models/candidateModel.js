const mongoose = require('mongoose')

const candidatesSchemaModel = new mongoose.Schema({
    artist: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Artist',
    },
    local: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Local',
    },
    cachet: {
        type: String,
        required: true,
    },
    note: {
        type: String,
    },
    event: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
    }
}, { timestamps: true, strict: true })

module.exports = mongoose.model('Candidate', candidatesSchemaModel, 'candidates')
