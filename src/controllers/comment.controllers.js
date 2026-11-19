import mongoose from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Invalid video ID")
    }

    const pageNumber = Math.max(1, parseInt(page))
    const limitNumber = Math.max(1, parseInt(limit))
    const skip = (pageNumber - 1) * limitNumber

    const [comments, totalComments] = await Promise.all([
        Comment.find({ video: videoId })
            .populate("owner", "username fullName avatar")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNumber),

        Comment.countDocuments({ video: videoId })
    ])

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                comments,
                totalComments,
                currentPage: pageNumber,
                totalPages: Math.ceil(totalComments / limitNumber)
            },
            "Comments fetched successfully"
        )
    )

})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const { videoId } = req.params
    const { content } = req.body

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Invalid video ID")
    }

    if (!content?.trim()) {
        throw new ApiError(400, "Comment content is required")
    }

    const comment = await Comment.create({
        content: content.trim(),
        video: videoId,
        owner: req.user._id
    })

    const createdComment = await Comment.findById(comment._id)
        .populate("owner", "username fullName avatar")

    return res.status(201).json(
        new ApiResponse(
            201,
            createdComment,
            "Comment added successfully"
        )
    )
})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment

    const { commentId } = req.params
    const { content } = req.body

    if (!mongoose.Types.ObjectId.isValid(commentId)) {
        throw new ApiError(400, "Invalid comment ID")
    }

    if (!content?.trim()) {
        throw new ApiError(400, "Comment content is required")
    }

    const comment = await Comment.findOneAndUpdate(
        {
            _id: commentId,
            owner: req.user._id
        },
        {
            $set: {
                content: content.trim()
            }
        },
        {
            new: true,
            runValidators: true
        }
    ).populate("owner", "username fullName avatar")

    if (!comment) {
        throw new ApiError(404, "Comment not found or unauthorized")
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            comment,
            "Comment updated successfully"
        )
    )
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const { commentId } = req.params

    if (!mongoose.Types.ObjectId.isValid(commentId)) {
        throw new ApiError(400, "Invalid comment ID")
    }

    const comment = await Comment.findOneAndDelete({
        _id: commentId,
        owner: req.user._id
    })

    if (!comment) {
        throw new ApiError(404, "Comment not found or unauthorized")
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            {},
            "Comment deleted successfully"
        )
    )
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }