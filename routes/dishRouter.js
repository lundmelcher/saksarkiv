var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

var Dishes = require('../models/dishes');
var Verify = require('./verify');

var dishRouter = express.Router();

dishRouter.use(bodyParser.json());

dishRouter.route('/')
.get(function (req, res, next) {
    Dishes.find(req.query).populate('comments.postedBy').exec(function (err, dish) {
        if (err) next(err);
        res.json(dish);
    });
})
.post(Verify.verifyOrdinaryUser, Verify.verifyAdmin, function(req, res, next){
    Dishes.create(req.body, function(err, dish) {
        if (err) next(err);
        console.log('Dish created!');
        var id = dish._id;
        res.writeHead(200, {'Content-Type': 'text/plain'});
        res.end('Added a dish with id : ' + id);
    });
})
.delete(Verify.verifyOrdinaryUser, Verify.verifyAdmin, function(req, res, next){
    Dishes.remove({}, function(err, resp) {
        if (err) throw err;
        res.json(resp);
    });
});


dishRouter.route('/:id')
.all(Verify.verifyOrdinaryUser)
.get(function(req,res,next){
    Dishes.findById(req.params.id).populate('comments.postedBy').exec(function(err, dish) {
        if (err) next(err);
        res.json(dish);
    });
})
.put(Verify.verifyAdmin, function(req, res, next){
    Dishes.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true }, function(err, dish) {
        if (err) next(err);
        res.json(dish);
    });
})
.delete(Verify.verifyAdmin, function (req, res, next) {
    Dishes.findByIdAndRemove(req.params.dishId, function(err, resp) {
        if (err) next(err);
        res.json(resp);
    });
});

dishRouter.route('/:id/comments')
.get(function(req,res,next){
    Dishes.findById(req.params.id).populate('comments.postedBy').exec(function(err, dish) {
        if (err) next(err);
        console.log('Getting comments!');
        res.json(dish.comments);
    });
})
.post(Verify.verifyOrdinaryUser, function(req, res, next){
    Dishes.findById(req.params.id, function(err, dish) {
        if (err) next(err);
        
        req.body.postedBy = req.decoded._id;
        dish.comments.push(req.body);
        
        dish.save(function(err, dish) {
            if (err) next(err);
            console.log('Updated comments!');
            res.json(dish);
        });
    });
})
.delete(Verify.verifyOrdinaryUser, Verify.verifyAdmin, function(req, res, next){
    Dishes.findById(req.params.id, function(err, dish) {
        if (err) next(err);
        
        for (var i = dish.comments.length - 1; i >= 0; i--) {
            dish.comments.id(dish.comments[i]._id).remove();
        }
        
        dish.save(function(err, dish) {
            if (err) next(err);
            res.writeHead(200, {'Content-Type': 'text/plain'});
            res.end('Deleted all comments!');
        });
    });
});

dishRouter.route('/:id/comments/:commentId')
.all(Verify.verifyOrdinaryUser)
.get(function(req,res,next){
    Dishes.findById(req.params.id).populate('comments.postedBy').exec(function(err, dish) {
        if (err) next(err);
        
        res.json(dish.comments.id(req.params.commentId));
    });
})
.put(function(req, res, next){
    // We delete the existing commment and insert the updated
    // comment as a new comment
    Dishes.findById(req.params.id, function(err, dish) {
        if (err) next(err);

        if (dish.comments.id(req.params.commentId).postedBy != req.decoded._id) {
            var err = new Error('You are not authorized to perform this operation!');
            err.status = 403;
            return next(err);
        }
        
        dish.comments.id(req.params.commentId).remove();

        req.body.postedBy = req.decoded._id;
        dish.comments.push(req.body);
        
        dish.save(function(err, dish) {
            if (err) next(err);
            console.log('Updated Comments!');
            console.log(dish);

            res.json(dish);
        });
    });
})
.delete(function(req, res, next){
    Dishes.findById(req.params.id, function(err, dish) {
        if (err) next(err);

        if (dish.comments.id(req.params.commentId).postedBy != req.decoded._id) {
            var err = new Error('You are not authorized to perform this operation!');
            err.status = 403;
            return next(err);
        }

        dish.comments.id(req.params.commentId).remove();

        dish.save(function(err, dish) {
            if (err) next(err);
            res.json(dish);
        });
    });
});


module.exports = dishRouter;