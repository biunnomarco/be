const express = require('express')
const mongoose = require('mongoose')
const artistModel = require('../models/artistModel')
const nodeMailer = require('nodemailer')

const artist = express.Router();

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

module.exports = artist;
