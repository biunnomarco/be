const express = require('express')
const mongoose = require('mongoose')
const localModel = require('../models/localModel')
const nodeMailer = require('nodemailer')

const local = express.Router()

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

//!GET DI TUTTI I LOCALI
local.get('/local/all', async (req, res) => {
    try {
        const locals = await localModel.find()
        res.status(200).send(locals)
    } catch (error) {
        res.status(500).send({
            statusCode: 500,
            message: 'Internal server Error',
            error,
        })
    }
})


//! POST DEL LOCALE
local.post('/local/register', async (req, res) => {
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

    const newLocal = new localModel({
        email: req.body.email,
        password: req.body.password,
        name: req.body.name,
        region: req.body.region,
        city: req.body.city,
        address: req.body.address,
        lat: req.body.lat,
        lon: req.body.lon,
        pictures: req.body.pictures,
        description: req.body.description,
        localType: req.body.localType,
        favouriteGenre: req.body.favouriteGenre,
        backline: req.body.backline
    })

    try {
        const local = await newLocal.save()

        //*nodemailer send mail
        const info = await transporter.sendMail({
            from: 'gigmeservice@zohomail.eu',
            to: req.body.email,
            subject: "Verify your mail",
            html: `<a href='${process.env.CLIENT}/validator/${local._id}'>Verify</a>`
        })

        res.status(201).send({
            statusCode: 201,
            message: 'Local saved successfully',
            payload: local
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
local.patch('/local/:id/validate', async (req, res) => {
    const { id } = req.params;

    try {
        const options = { new: true };
        const result = await localModel.findByIdAndUpdate(id, { isValid: true }, options)

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
local.get('/local/filter', async (req, res) => {
    try {
        console.log(req.query)
        let query = {}
        let finalMatch = []

        if (req.query.favouriteGenre) {
            const genres = req.query.favouriteGenre.split(',')
            query.favouriteGenre = { $all: genres.map(g=>new RegExp(g, "i")) }
        }
        if (req.query.name) {
            query.name = {$regex: `^${req.query.name}$`, $options: 'i'}
        }
        if (req.query.backline) {
            const backline = req.query.backline.split(',')
            query.backline = { $all: backline.map(b=>new RegExp(b, "i")) }
        }
        if (req.query.localType) {
            query.localType = {$regex: `^${req.query.localType}$`, $options: 'i'}
        }
        if (req.query.region) {
            query.region = {$regex: `^${req.query.region}$`, $options: 'i'}
        }
        if (req.query.city) {
            query.city = {$regex: `^${req.query.city}$`, $options: 'i'}
        }
        
        console.log(query)
        const match = await localModel.find(query)
        
        if (req.query.lat && req.query.lon && req.query.distance)
            match.forEach(local => {
                const dist = DistanceBetween(req.query.lat, req.query.lon, local.lat, local.lon)
                if (dist <= req.query.distance) {
                    finalMatch.push(local)
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

module.exports = local;