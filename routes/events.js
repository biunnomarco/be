const express = require('express')
const mongoose = require('mongoose')
const eventModel = require('../models/eventModel');
const localModel = require('../models/localModel');
const candidateModel = require('../models/candidateModel');

const event = express.Router();

//!POST DELL'EVENTO
event.post('/event/newEvent', async(req, res) => {
    
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
        const events = await eventModel.find().populate('location').populate('candidates');
        res.status(200).send(events)
    } catch (error) {
        res.status(500).send({
            statusCode: 500,
            message: 'Internal server Error',
            error,
        })
    } 
})

//! CANDIDATURA
event.post('/event/candidate', async (req, res) => {
    
    const eventId = req.query.eventId
    const artistId = req.query.artistId
    const event = await eventModel.findById(eventId)
    console.log(event.location)
    const newCandidate = new candidateModel({
        artist: artistId,
        event: eventId,
        cachet: req.body.cachet,
        note: req.body.note,
        local: event.location
    })
    
    try {
        const candidate = await newCandidate.save()
        await event.updateOne({$push: {candidates: newCandidate}})
    
        res.status(200).send(candidate)
    } catch (error) {
        res.status(500).send({
            statusCode: 500,
            message: 'Internal server Error',
            error,
        })
    }
})

//!GET EVENT BY ID
event.get('/event/eventById/:id', async (req, res) => {
    const {id} = req.params
    try {
        const event = await eventModel.findById(id).populate('location').populate({
            path: 'candidates',
            populate: {
                path: 'artist'
            }
        });
        res.status(200).send(event)
    } catch (error) {
        res.status(500).send({
            statusCode: 500,
            message: 'Internal server Error',
            error,
        })
    } 
})

//!GET CANDIDATURE BY ARTISTID
event.get('/event/artistCandidature/:artistId', async (req, res) => {
    const {artistId} = req.params
    try {
        const candidatures = await candidateModel.find({artist: artistId}).populate('local').populate('event')
        res.status(200).send(candidatures)
    } catch (error) {
        res.status(500).send({
            statusCode: 500,
            message: 'Internal server Error',
            error,
        })
    }
})

//!ANNULLA LA CANDIDATURA
event.delete('/event/removeCandidature/:eventId/:candidatureId', async (req, res) => {
    const {eventId, candidatureId} = req.params
    
    const event = await eventModel.findById(eventId)
    try {
        const candidature = await candidateModel.findByIdAndDelete(candidatureId)
        await event.updateOne({$pull: {candidates: candidatureId}})
        res.status(200).send(event)
    } catch (error) {
        res.status(500).send({
            statusCode: 500,
            message: 'Internal server Error',
            error,
        })
    }
})
module.exports = event