const express = require('express')
const artistModel = require('../models/artistModel')
const localModel = require('../models/localModel')
const reviewsModel = require('../models/reviewsModel')

const review = express.Router()

review.post('/review/:id', async (req, res) => {
    const { id } = req.params
    let target = null
    target = await localModel.findById(id)
    if (!target) {
        target = await artistModel.findById(id)
    }
    
    const newReview = new reviewsModel({
        rate: req.body.rate,
        comment: req.body.comment,
        authorArtist: req.body.authorArtist,
        authorLocal: req.body.authorLocal,
    })
    try {
        const review = await newReview.save()
        await target.updateOne({ $push: { reviews: newReview } })

        res.status(201).send(review)
    } catch (error) {
        res.status(500).send({
            statusCode: 500,
            message: "Internal server error",
            error,
        })
    }
})


module.exports = review;