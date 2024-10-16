const express = require('express');
const { userAuth } = require('../middlewares/auth');
const User = require('../models/user');
const requestRouter = express.Router();
const ConnectionRequest = require('../models/connectionRequest');
const ConnectionRequestModel = require('../models/connectionRequest');

requestRouter.post('/send/:status/:toUserId', userAuth, async (req, res) => {
    try {
        const allowedRequestTypes = ["ignored", "interested"]
        if (!allowedRequestTypes.includes(req.params.status)) {
            throw new Error('Connection request type not allowed');
            
        }
        const toUserData = await User.findById(req.params.toUserId);
        if(!toUserData){
            throw new Error("Connect requested user doesn't exist");
        }
        const existingConnectionrequest = await ConnectionRequestModel.findOne(
            {$or : [
                {fromUserId : req.user._id,toUserId : req.params.toUserId},
                {fromUserId : req.params.toUserId,toUserId : req.user._id}
            ]}
        )
        
        if(existingConnectionrequest){
            throw new Error("Connection request already exist");
        }
        const connectionRequest = await new ConnectionRequest({
            fromUserId : req.user._id,
            toUserId : req.params.toUserId,
            status : req.params.status
        })
        const connectionRequestData = await connectionRequest.save()
        res.json({
          message:
            req.params.status === "interested"
              ? `${req.user.firstName} is interested in ${toUserData.firstName}`
              : `${req.user.firstName} ignored ${toUserData.firstName}`,
          data: connectionRequestData,
        });
    } catch (err) {
        res.status(400).send(err.message)
    }
})

module.exports = requestRouter