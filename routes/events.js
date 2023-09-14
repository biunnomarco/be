const express = require('express')
const mongoose = require('mongoose')
const eventModel = require('../models/eventModel');
const localModel = require('../models/localModel');

const event = express.Router();

//!POST DELL'EVENTO
event.post('/event/newEvent', async(req, res) => {
    console.log(req.body)
    const local = await localModel.findById(req.body.location)
    const newEvent = new eventModel({
        location: req.body.location,
        name: req.body.name,
        description: req.body.description,
        genres: req.body.genres,
        requiredArtist: req.body.requiredArtist,
        refund: req.body.refund,
        benefits: req.body.benefits,
        duration: req.body.duration,
        candidates: [],
        date: req.body.date,
    })

    try {
        const event = await newEvent.save();
        await local.updateOne({$push: {events: newEvent}})

        res.status(201).send(event)
    } catch (error) {
        res.status(500).send({
            statusCode: 500,
            message: "Internal server error",
            error,
        })
    }
})

//!GET TUTTI EVENTI
event.get('/event/allEvents', async (req, res) => {
    try {
        const events = await eventModel.find().populate('location');
        res.status(200).send(events)
    } catch (error) {
        res.status(500).send({
            statusCode: 500,
            message: 'Internal server Error',
            error,
        })
    } 
})

module.exports = event