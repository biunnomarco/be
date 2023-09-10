const express = require('express')
const mongoose = require('mongoose')
const artistModel = require('../models/artistModel')
const nodeMailer = require('nodemailer');

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
artist.post('/artist/register', async (req, res) => {
    console.log(req.body)

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
        name: req.body.name,
        members: req.body.members,
        region: req.body.region,
        city: req.body.city,
        address: req.body.address,
        lat: req.body.lat,
        lon: req.body.lon,
        genre: req.body.genre,
        instruments: req.body.instruments,
        pictures: req.body.pictures,
        description: req.body.description
    })

    try {
        const artist = await newArtist.save();

        //*nodemailer send mail
        const info = await transporter.sendMail({
            from: 'gigmeservice@zohomail.eu',
            to: req.body.email,
            subject: "Verify your mail",
            html: `<a href='${process.env.CLIENT}/validator/${artist._id}'>Verify</a>`
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


//! GET CON QUERY
artist.get('/artist/filter', async (req, res) => {
    try {
        console.log(req.query)
        let match = {}
        let finalMatch = []

        if (req.query.genre) {
            match.genre = { $all: [new RegExp(req.query.genre, "i")] }
        }
        if (req.query.name) {
            match.name = new RegExp(req.query.name, "i")
        }
        if (req.query.instruments) {
            match.instruments = { $all: [new RegExp(req.query.instruments, "i")] }
        }
        if (req.query.members) {
            match.members = new RegExp(req.query.members, "i")
        }
        if (req.query.region) {
            match.region = new RegExp(req.query.region, "i")
        }
        if (req.query.city) {
            match.city = new RegExp(req.query.city, "i")
        }

        console.log(match)
        const artists = await artistModel.aggregate([{ $match: match }])

        if (req.query.lat && req.query.lon && req.query.distance)
            artists.forEach(artist => {
                const dist = DistanceBetween(req.query.lat, req.query.lon, artist.lat, artist.lon)
                if (dist <= req.query.distance) {
                    finalMatch.push(artist)
                }
                console.log(dist)
            });

        res.status(200).send(finalMatch)
    } catch (error) {
        res.status(500).send({
            statusCode: 500,
            message: 'Internal server Error',
            error,
        })
    }
})



module.exports = artist;
