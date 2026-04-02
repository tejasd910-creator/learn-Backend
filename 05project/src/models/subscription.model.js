import mongoose, {Schema} from "mongoose";

const subscriptionSchema = new Schema({
    subscriber: {
        type: Schema.Types.ObjectId,     // one who is subscribring(owner)
        ref: "User"
    },
    channel: {
        type: Schema.Types.ObjectId,     // one whom subscriber is subscribring(channel subscribed)
        ref: "User"
    }
}, { timestamps : true})



export const Subscription = mongoose.model("Subscription", subscriptionSchema)