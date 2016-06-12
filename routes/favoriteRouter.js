var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

var Favorites = require('../models/favorites');
var Verify = require('./verify');

var favoriteRouter = express.Router();

favoriteRouter.use(bodyParser.json());

favoriteRouter.route('/')
.all(Verify.verifyOrdinaryUser)
.get(function(req,res,next){
    Favorites.findOne({"postedBy":req.decoded._id}).populate('postedBy').populate('dishes').exec(function(err, favorites) {
        if (err) next(err);

        res.json(favorites);
    });
})
.post(function(req, res, next){
    Favorites.findOne({"postedBy":req.decoded._id}, function(err, favorites) {
        if (err) next(err);
        
        if (favorites) {
            favorites.dishes.addToSet(req.body);

            favorites.save(function(err, favorites) {
                if (err) next(err);
                console.log('Updated favorites!');
                res.json(favorites);
            });
        } else {
            Favorites.create({"postedBy":req.decoded._id, "dishes":[req.body]}, function(err, favorites) {
                if (err) next(err);
                console.log('Favorites created!');
                res.json(favorites);
            });
        }
    });
})
.delete(function(req, res, next){
    Favorites.findOneAndRemove({"postedBy":req.decoded._id}, function(err, resp) {
        if (err) next(err);
        console.log('Favorites removed!');
        res.json(resp);
    });
});


favoriteRouter.route('/:dishId')
.delete(Verify.verifyOrdinaryUser, function(req, res, next) {
    Favorites.findOne({"postedBy":req.decoded._doc._id}, function(err, favorites) {
        if (err) next(err);
        
        var dishId = mongoose.Types.ObjectId(req.params.dishId);

        favorites.dishes.remove(dishId);
        
        favorites.save(function(err, favorites) {
            if (err) next(err);
            console.log('Favorite removed!');

            res.json(favorites);
        });
    });
});

module.exports = favoriteRouter;