import mongoose, {Schema} from "mongoose";

const subscriptionSchema = new Schema({
    subscriber: {
        type: Schema.Types.ObjectId,     // one who is subscribring
        ref: "User"
    },
    channel: {
        type: Schema.Types.ObjectId,     // one whom subscriber is subscribring
        ref: "User"
    }
}, { timestamps : true})



export const Subscription = mongoose.model("Subscription", subscriptionSchema)