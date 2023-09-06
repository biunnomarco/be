const mongoose = require('mongoose')

const ProvaModelSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    }
}, { timestamps: true, strict: true })

module.exports = mongoose.model('Prova', ProvaModelSchema, 'prova')