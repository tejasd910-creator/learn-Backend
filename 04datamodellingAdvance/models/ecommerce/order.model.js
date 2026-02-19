import mongoose from 'mongoose'

const orderItemSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product"
    },
    quantity: {
        type: Number,
        required: true
    }
})

const orderSchema = new mongoose.Schema({
    orderPrice: {
        type: Number,
        required: true
    },
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    orderItems: {
        type: [orderItemSchema]
    },
    address:{
        type: String,
        required: true
    },
    status:{
        type: String,
        enum: ["PENDING", "CANCELLED", "DELIVERED"],                 // wnnat data to be selected within the given option
        default: "PENDING"
    }
}, { timestams: true })

export const Order = mongoose.model("Order", orderSchema)