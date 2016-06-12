var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

var Promotions = require('../models/promotions');
var Verify = require('./verify');

var promoRouter = express.Router();

promoRouter.use(bodyParser.json());

promoRouter.route('/')
.all(Verify.verifyOrdinaryUser)
.get(function(req,res,next){
    Promotions.find({}, function(err, promotion) {
        if (err) next(err);
        res.json(promotion);
    });
})
.post(Verify.verifyOrdinaryUser, Verify.verifyAdmin, function(req, res, next){
    Promotions.create(req.body, function(err, promotion) {
        if (err) next(err);
        console.log('Promotion created!');
        var id = promotion._id;
        res.writeHead(200, {'Content-Type': 'text/plain'});
        res.end('Added a promotion with id : ' + id);
    });
})
.delete(Verify.verifyOrdinaryUser, Verify.verifyAdmin, function(req, res, next){
    Promotions.remove({}, function(err, resp) {
        if (err) next(err);
        res.json(resp);
    });
});


promoRouter.route('/:id')
.get(function(req,res,next){
    Promotions.findById(req.params.id, function(err, promotion) {
        if (err) next(err);
        res.json(promotion);
    });
})
.put(Verify.verifyOrdinaryUser, Verify.verifyAdmin, function(req, res, next){
    Promotions.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true }, function(err, promotion) {
        if (err) next(err);
        res.json(promotion);
    });
})
.delete(Verify.verifyOrdinaryUser, Verify.verifyAdmin, function(req, res, next){
    Promotions.remove(req.params.id, function(err, resp) {
        if (err) next(err);
        res.json(resp);
    });
});

module.exports = promoRouter;