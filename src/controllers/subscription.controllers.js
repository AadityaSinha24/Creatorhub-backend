import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    // TODO: toggle subscription
    // Check whether channelId is a valid MongoDB ObjectId
    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel ID")
    }

    // Prevent users from subscribing to themselves
    if (subscriberId.toString() === channelId) {
        throw new ApiError(400, "You cannot subscribe to yourself")
    }

    // Check whether the channel exists
    const channel = await User.findById(channelId)

    if (!channel) {
        throw new ApiError(404, "Channel does not exist")
    }

    // Check whether subscription already exists
    const existingSubscription = await Subscription.findOne({
        subscriber: subscriberId,
        channel: channelId
    })

    if (existingSubscription) {
        // Unsubscribe
        await Subscription.findByIdAndDelete(existingSubscription._id)

        return res.status(200).json(
            new ApiResponse(200, {}, "Unsubscribed successfully")
        )
    }

    // Subscribe
    await Subscription.create({
        subscriber: subscriberId,
        channel: channelId
    })

    return res.status(200).json(
        new ApiResponse(200, {}, "Subscribed successfully")
    )
})

// controller to return subscriber list of a channel

const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params

    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel ID")
    }

    const channel = await User.findById(channelId)

    if (!channel) {
        throw new ApiError(404, "Channel does not exist")
    }

    const subscribers = await Subscription.find({
        channel: channelId
    }).populate("subscriber", "username fullName avatar")

    return res.status(200).json(
        new ApiResponse(
            200,
            subscribers,
            "Channel subscribers fetched successfully"
        )
    )
})


// controller to return channel list to which user has subscribed

const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params

    if (!isValidObjectId(subscriberId)) {
        throw new ApiError(400, "Invalid subscriber ID")
    }

    const subscriber = await User.findById(subscriberId)

    if (!subscriber) {
        throw new ApiError(404, "User does not exist")
    }

    const subscribedChannels = await Subscription.find({
        subscriber: subscriberId
    }).populate("channel", "username fullName avatar")

    return res.status(200).json(
        new ApiResponse(
            200,
            subscribedChannels,
            "Subscribed channels fetched successfully"
        )
    )
})


export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}