var users = require('../models/user');
    express = require('express'),
    router = express.Router(),
    mongoose = require('mongoose'),
    querymen = require('querymen');

// direct router export method
router.get('/', function (req, res) {
    const queries = req.query;

    // Handle queries
    const select = queries.select ? JSON.parse(queries.select) :
                   queries.filter ? JSON.parse(queries.filter) : {};
                   
    const conditions = queries.where ? JSON.parse(queries.where) : {};

    const options = {};
    options.skip = queries.skip || 0;
    options.limit = queries.limit || 0;
    options.sort = queries.sort ? JSON.parse(queries.sort) : {};

    users.find(conditions, select, options, function (err, docs) {
        if (err) {
            console.log(err.message);

            if (err.name === 'CastError' && err.path === '_id') {
                res.status(500).send({
                    message: '_id entered could not be casted to Mongoose ObjectID',
                    data: {}
                })
            } else if (err.name === 'CastError') {
                res.status(500).send({
                    message: 'One of the fields entered could not be cast correctly',
                    data: {}
                })
            
            } else {
                res.status(500).send({
                    message: 'Server error',
                    data: {}
                })
            }
            
        } else {
            if (queries.count && queries.count === true) {
                res.status(200).send({
                    message: 'OK',
                    data: docs.length
                })
            } else {
                res.status(200).send({
                    message: 'OK',
                    data: docs
                })
            }
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

router.put('/:id', function (req, res) {

    if (req.body.name && req.body.email) {

        /* PUT calls should not be trying to change the ID, so if it is present,
         * the _id field will just be ignored.
         */ 
        if (req.body._id) {
            delete req.body._id;
        }

        users.findOneAndReplace({_id: req.params.id}, req.body, function (err, doc) {
            if (err) {
                res.status(404).send({
                    message: 'User with id not found',
                    data: {}
                })
                console.log(err);
            } else {
                res.status(200).send({
                    message: 'PUT successful',
                    data: doc
                })
            }
        })

    } else {
        res.status(404).send({
            message: 'User replacement requires name and email fields',
            data: {}
        })
    }
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