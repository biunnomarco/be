const express = require('express')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const artistModel = require('../models/artistModel')
const localModel = require('../models/localModel')

const login = express.Router()

login.post('/login', async (req, res) => {

    console.log(req.body)
    let user = null;

    user = await artistModel.findOne({ email: req.body.email });

    if (!user) {
        user = await localModel.findOne({ email: req.body.email })
    }

    if (!user) {
        return res.status(404).send({
            statusCode: 404,
            message: "User with this mail not found"
        });
    }
    console.log(user)
    const validPassword = await bcrypt.compare(req.body.password, user.password);
    if (!validPassword) {
        return res.status(400).send({
            statusCode: 400,
            message: "Password non valida"
        });
    }

    //generare un token
    const token = jwt.sign(
        {
            name: user.name,
            email: user.email,
            id: user._id,
            role: user.role,
            lat: user.lat,
            lon: user.lon,
            proPic: user.proPic,
            isValid: user.isValid,

        }, process.env.JWT_SECRET,
        { expiresIn: '24h' }
    );

    res.header('Authorization', token).status(200).send({
        statusCode:200,
        token,
    })
})

module.exports = login;