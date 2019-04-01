var tasks = require('../models/task'),
    users = require('../models/user')
    express = require('express'),
    router = express.Router();

router.get('/', function (req, res) {
    const queries = req.query;

    // Handle queries

    // First find() param
    const select = queries.select ? JSON.parse(queries.select) :
                   queries.filter ? JSON.parse(queries.filter) : {};

    // Second find() param
    const conditions = queries.where ? JSON.parse(queries.where) : {};

    // Third find() param
    const options = {};
    options.skip = queries.skip || 0;
    options.limit = queries.limit || 0;
    options.sort = queries.sort ? JSON.parse(queries.sort) : {};

    tasks.find(conditions, select, options, function (err, docs) {
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
    tasks.findOne({_id: req.params.id}, function (err, foundTask) {
        if (err) {
            res.status(404).send({
                message: '404 Task Not Found',
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

router.post('/', function (req, res) {
    if (req.body.name && req.body.deadline) {

        /*REVIEW:
        *  figure out best way to handle writing
        *  all the properties into the new task object
        *  https://developer.mozilla.org/en-US/docs/Learn/Server-side/Express_Nodejs/forms 
        *
        * REVIEW2: 
        * if assignedUser exists, we need to add the task to the user as well 
        */
        tasks.create({
            name: req.body.name,
            deadline: req.body.deadline,
            description: req.body.description || "",
            completed: req.body.completed || false,
            assignedUser: req.body.assignedUser || "",
            assignedUserName: req.body.assignedUserName || "unassigned"
        }, function (err, createdTask) {
            if (err) {
                /* Check for cast errors */
                if (Object.keys(err.errors).some(error => {
                    return err.errors[error].name === 'CastError'
                })) {
                    res.status(404).send({
                        message: 'A task field is of the wrong type',
                        data: {}
                    })
                } else {
                    res.status(404).send({
                        message: 'There is an error creating the task',
                        data: {}
                    })
                }
            } else {

                /* Note: Right now the database assumes that when a task is entered
                 *       with assignedUser and assignedUserName, they are both correct.
                 *       This only checks that the assignedUser exists, not the name.
                 */
                if (createdTask.assignedUser) {
                    users.findById(createdTask.assignedUser, function (err, user) {
                        if (err) {
                            console.log(err.message);
                            res.status(404).send({
                                message: 'Error in finding user',
                                data: {}
                            })
                        }

                        /* user with that ID exists */
                        if (user) {
                            user.pendingTasks.push(createdTask._id);

                            user.save(function (err, product) {
                                res.status(200).send({
                                    message: 'Task created and assigned to user',
                                    data: createdTask
                                })
                            })
                        } else {
                            console.log('Specified assignedUser does not exist');
                            res.status(200).send({
                                message: 'User does not exist but task successfully created',
                                data: createdTask 
                            })
                        }
                    })
                } else {
                    res.status(200).send({
                        message: 'POST /tasks successful',
                        data: createdTask
                    })
                }
            }
        })
        
    } else {
        res.status(404).send({
            message: 'Task requires name and deadline',
            data: {}
        })
    }
})

router.put('/:id', function (req, res) {

    if (req.body.name && req.body.deadline) {

        tasks.findOneAndUpdate({ _id: req.params.id }, req.body, {new: true}, function (err, doc) {
            if (err) {
                res.status(404).send({
                    message: 'Task with id not found',
                    data: {}
                })
            } else {
                res.status(200).send({
                    message: 'PUT successful',
                    data: doc
                })
            }
        })

    } else {
        res.status(404).send({
            message: 'User replacement requires name and deadline fields',
            data: {}
        })
    }
})

router.delete('/:id', function (req, res) {
    tasks.findByIdAndDelete(req.params.id, function (err) {
        if (err) {
            console.log(err.errors);
            res.status(404).send({
                message: 'Task to DELETE not found',
                data: {}
            })
        } else {
            /* When a task is deleted, the user with said task should also
             * no longer have it in their pendingTasks array
             */
            users.updateOne({ pendingTasks: { $elemMatch: { $eq: req.params.id} }},
                         { $pullAll: { pendingTasks: [req.params.id] } },
                            function (err, result) {
                                if (err) {
                                    res.status(404).send({
                                        message: 'delete went wrong',
                                        data: {}
                                    })
                                } else {
                                    res.status(200).send({
                                        message: 'DELETE task successful'
                                    })
                                }                                 
                             })
        }
    })
})


module.exports = router;