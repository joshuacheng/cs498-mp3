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

router.get('/:id', function (req, res) {
    users.findOne({ _id: req.params.id }, function (err, foundTask) {
        if (err) {
            res.status(404).send({
                message: '404 User Not Found',
                data: {}
            })
        } else {
            res.status(200).send({
                message: 'OK',
                data: foundTask
            })
        }
    })
})

//TODO: no two same emails can exist
router.post('/', function (req, res) {

    // A user must have a name and email
    if (req.body.name && req.body.email) {

        // Check if that email already exists
        users.find({email: req.body.email}, function (err, doc) {
            if (doc.length) {
                console.log('found dupe email');
                res.status(409).send({
                    message: 'User with email already exists',
                    data: {}
                })
            } else {
                // If not, create new user
                users.create({
                    _id: new mongoose.Types.ObjectId(),
                    name: req.body.name,
                    email: req.body.email,
                    pendingTasks: req.body.pendingTasks || []
                }, (err, newUser) => {
                    res.status(201).send({
                        message: 'POST /users successful',
                        data: newUser
                    })
                })
            }
        })
    } else {
        res.status(404).send({
            message: 'Name and email must both be defined',
            data: {}
        })
    }
})

router.post('/:id', function (req, res) {

})

router.delete('/:id', function (req, res) {
    users.findByIdAndDelete(req.params.id, function (err) {
        if (err) {
            console.log(err.errors);
            res.status(404).send({
                message: 'User to DELETE not found',
                data: {}
            })
        } else {
            res.status(200).send({
                message: 'DELETE user successful'
            })
        }
    })
})

module.exports = router;