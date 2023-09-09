const express = require('express')
const mongoose = require('mongoose')
const localModel = require('../models/localModel')
const nodeMailer = require('nodemailer')

const local = express.Router()

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

module.exports = local;