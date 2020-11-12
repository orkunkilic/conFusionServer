const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const authenticate = require('../authenticate');
const cors = require('./cors');

const Favorites = require('../models/favorite')

const favoriteRouter = express.Router();

favoriteRouter.use(bodyParser.json());

favoriteRouter.route('/')
.options(cors.corsWithOptions, (req, res) => {res.sendStatus(200)})
.get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    console.log(req.user._id)
    Favorites.find({'user': req.user._id})
            .populate('user')
            .populate('dishes')
            .then((favorites) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json')
                res.json(favorites);
            })
            .catch((err) => next(err));
    })
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorites.find({'user': req.user._id})
            .populate('user')
            .populate('dishes')
            .then((favorites) => {
                req.body.postedBy = req.user._id;
                if (favorites.length) {
                    var favoriteAlreadyExist = false;
                    if (favorites[0].dishes.length) {
                        for (var i = (favorites[0].dishes.length - 1); i >= 0; i--) {
                            favoriteAlreadyExist = favorites[0].dishes[i] == req.body._id;
                            if (favoriteAlreadyExist) break;
                        }
                    }
                    if (!favoriteAlreadyExist) {
                        favorites[0].dishes.push(req.body._id);
                        favorites[0].save(function (err, favorite) {
                            if (err) throw err;
                            console.log('Um somethings up!');
                            res.json(err);
                        });
                    } else {
                        console.log('Setup!');
                        res.json(favorites);
                    }

                } else {

                    Favorites.create({user: req.body.postedBy}, function (err, favorite) {
                        if (err) throw err;
                        favorite.dishes.push(req.body._id);
                        favorite.save(function (err, favorite) {
                            if (err) throw err;
                            console.log('Something is up!');
                            res.json(favorite);
                        });
                    })
                }
                
            }, (err) => next(err))
            .catch((err) => next(err));
})

.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation is not supported on /favorites');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.remove({'user': req.user._id}, function (err, resp) {
        if (err) throw err;
        res.json(resp);
    })
});

favoriteRouter.route('/:dishId')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('GET operation is not supported on /favourites/:dishId');
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.find({'user': req.user._id})
    .populate('user')
    .populate('dishes')
    .then((favorites) => {
        req.body.postedBy = req.user._id;
        if (favorites.length) {
            var favoriteAlreadyExist = false;
            if (favorites[0].dishes.length) {
                for (var i = (favorites[0].dishes.length - 1); i >= 0; i--) {
                    favoriteAlreadyExist = favorites[0].dishes[i] == req.params.dishId;
                    if (favoriteAlreadyExist) break;
                }
            }
            if (!favoriteAlreadyExist) {
                favorites[0].dishes.push(req.params.dishId);
                favorites[0].save(function (err, favorite) {
                    if (err) throw err;
                    console.log('Um somethings up!');
                    res.json(favorite);
                });
            } else {
                console.log('Setup!');
                res.json(favorites);
            }

        } else {

            Favorites.create({user: req.body.postedBy}, function (err, favorite) {
                if (err) throw err;
                favorite.dishes.push(req.params.dishId);
                favorite.save(function (err, favorite) {
                    if (err) throw err;
                    console.log('Something is up!');
                    res.json(favorite);
                });
            })
        }
        
    })
    .catch((err) => next(err));
})

.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation is not supported on /favorites/:dishId');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.find({'user': req.user._id}, function (err, favorites) {
        if (err) return err;
        var favorite = favorites ? favorites[0] : null;

        if (favorite) {
            for (var i = (favorite.dishes.length - 1); i >= 0; i--) {
                if (favorite.dishes[i] == req.params.dishId) {
                    favorite.dishes.remove(req.params.dishId);
                }
            }
            favorite.save(function (err, favorite) {
                if (err) throw err;
                console.log('Here you go!');
                res.json(favorite);
            });
        } else {
            console.log('No favourites!');
            res.json(favorite);
        }

    });
});

module.exports = favoriteRouter;