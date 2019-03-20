var users = require('../models/user');
    express = require('express'),
    router = express.Router(),
    mongoose = require('mongoose');

// direct router export method

router.get('/', function (req, res) {
    users.find({}, (err, docs) => {
        if (err) {
            res.status(500).send({
                message: 'Server error',
                data: {}
            })
        } else {
            res.status(200).send({
                message: 'OK',
                data: docs
            })
        }
    })
})

router.post('/', function (req, res) {

    // A user must have a name and email
    if (req.body.name && req.body.email) {
        users.create({
            _id: new mongoose.Types.ObjectId(),
            name: req.body.name,
            email: req.body.email,
            pendingTasks: req.body.pendingTasks || []
        }, (err, newUser) => {
            res.status(201).send({
                message: 'POST /users successful',
                user: newUser
            })
        })
    } else {
        res.status(404).send({
            message: 'Name and email must both be defined',
            data: {}
        })
    }
})

module.exports = router;