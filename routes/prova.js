const express = require('express')
const mongoose = require('mongoose')
const ProvaModel = require('../models/provaModel')

const prova = express.Router();

prova.post('/prova', async(req, res) => {
    const newProva = new ProvaModel({
        name: req.body.name
    })

    try {
        const prova = await newProva.save()

        res.status(201).send({
            message: 'Prova salvata',
            payload: prova,
        })
    } catch (error) {
        res.status(500).send({
            statusCode: 500
        })
    }
})


module.exports = prova;