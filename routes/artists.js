const express = require('express')
const mongoose = require('mongoose')
const artistModel = require('../models/artistModel')
const nodeMailer = require('nodemailer');
const proPic = require('../middlewares/uploadProPic')

const artist = express.Router();

const DistanceBetween = (lat1, lon1, lat2, lon2) => {
    var R = 6371; // raggio medio della Terra in km
    var dLat = (lat2 - lat1) * Math.PI / 180;
    var dLon = (lon2 - lon1) * Math.PI / 180;
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c;
    return d;
}

//!POST DELL'ARTISTA
artist.post('/artist/register', proPic.single('proPic'), async (req, res) => {

    //* nodemailer transporter
    const transporter = nodeMailer.createTransport({
        host: 'smtp.zoho.eu',
        port: 465,
        secure: true, //ssl
        auth: {
            user: "gigmeservice@zohomail.eu",
            pass: "solimano91aB!"
        },
        tls: {
            rejectUnauthorized: false
        }
    })

    const newArtist = new artistModel({
        email: req.body.email,
        password: req.body.password,
        members: req.body.members,
        name: req.body.name,
        genre: req.body.genre,
        region: req.body.region,
        city: req.body.city,
        address: req.body.address,
        instruments: req.body.instruments,
        lat: req.body.lat,
        lon: req.body.lon,
        description: req.body.description,
        pictures: req.file.path,
        proPic: req.file.path,
        instagram: req.body.instagram,
        facebook: req.body.facebook,
    })

    try {
        const artist = await newArtist.save();

        //*nodemailer send mail
        const info = await transporter.sendMail({
            from: 'gigmeservice@zohomail.eu',
            to: req.body.email,
            subject: "Verify your mail",
            html: `<a href='${process.env.CLIENT}/artistValidator/${artist._id}'>Verify</a>`
        })

        res.status(201).send({
            statusCode: 201,
            message: 'Artist saved successfully',
            payload: artist
        })
    } catch (error) {
        res.status(500).send({
            statusCode: 500,
            message: "Internal server error",
            error,
        })
    }
})

//!GET ALL ARTISTS
artist.get('/artist/all', async (req, res) => {
    try {
        const artists = await artistModel.find()
        res.status(200).send(artists)
    } catch (error) {
        res.status(500).send({
            statusCode: 500,
            message: 'Internal server Error',
            error,
        })
    }
})

//!GET ALL GENRES
artist.get('/artist/allGenres', async (req, res) => {
    try {
        const uniqueGenres = await artistModel.aggregate([
            {$unwind: '$genre'},
            {$group: {_id: '$genre'}}
        ])
        const genresList = uniqueGenres.map(g => g._id)
        res.status(200).send(genresList)
    } catch (error) {
        res.status(500).send({
            statusCode: 500,
            message: 'Internal server Error',
            error,
        })
    }
})
//!GET ALL INSTUMENTS
artist.get('/artist/allInstruments', async (req, res) => {
    try {
        const uniqueInstruments = await artistModel.aggregate([
            {$unwind: '$instruments'},
            {$group: {_id: '$instruments'}}
        ])
        const instrumentsList = uniqueInstruments.map(i => i._id)
        res.status(200).send(instrumentsList)
    } catch (error) {
        res.status(500).send({
            statusCode: 500,
            message: 'Internal server Error',
            error,
        })
    }
})

//! VALIDA MAIL
artist.patch('/artist/:id/validate', async (req, res) => {
    const { id } = req.params;

    try {
        const options = { new: true };
        const result = await artistModel.findByIdAndUpdate(id, { isValid: true }, options)

        res.status(200).send({
            statusCode: 200,
            message: "mail verificata con successo"
        })
    } catch (error) {
        res.status(500).send({
            statusCode: 500,
            message: "Internal server error",
            error
        })
    }
})

//! GET ARTIST BY ID
artist.get('/artist/byId/:id', async (req, res) => {
    const {id} = req.params;
    try {
        const artist = await artistModel.findById(id).populate({
            path: 'reviews',
            populate: {
                path: 'authorLocal'
            }
        })
        res.status(200).send(artist)
    } catch (error) {
        res.status(500).send({
            statusCode: 500,
            message: "Internal server error",
            error
        })
    }
})

//! GET CON QUERY

artist.get('/artist/filter', async (req, res) => {
    let query = {};
    let finalMatch = [];

    console.log(req.query)

    if(req.query.genre) {
        const genres = req.query.genre.split(',')
        query.genre = {$all: genres.map(g=>new RegExp(g, 'i'))}
    }
    if(req.query.instruments) {
        const instruments = req.query.instruments.split(',')
        query.instruments = {$all: instruments.map(i=>new RegExp(i, 'i'))}
    }
    if (req.query.name) {
        query.name = {$regex: new RegExp(req.query.name, 'i')}
    }
    if (req.query.members) {
        query.members = {$regex: `^${req.query.members}$`, $options: 'i'}
    }
    if (req.query.region) {
        query.region = {$regex: `^${req.query.region}$`, $options: 'i'}
    }
    if (req.query.city) {
        query.city = {$regex: `^${req.query.city}$`, $options: 'i'}
    }
    
    try {
        const match = await artistModel.find(query)

        if (req.query.lat && req.query.lon && req.query.distance)
            match.forEach(artist => {
                const dist = DistanceBetween(req.query.lat, req.query.lon, artist.lat, artist.lon)
                if (dist <= req.query.distance) {
                    finalMatch.push(artist)
                }
            });
        res.status(200).send(finalMatch)
    } catch (error) {
        res.status(500).send(error)
    }
})

module.exports = artist;
