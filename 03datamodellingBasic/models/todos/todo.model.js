import mongoose from 'mongoose'

const todoSchema = new mongoose.Schema({
    content: {
        type: String,
        required: true,
    },
    complete: {
        type: Boolean,
        default: false
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"                                 // name given inside mongoose.model("User")
    },
    subTodos: [                                     // array of object
        {                                           // each object have features of sub_todo schema
            type: mongoose.Schema.Types.ObjectId,
            ref: "SubTodo"
        }
    ]   // Array of sub-Todos
}, { timestamps: true });


export const Todo = mongoose.model("Todo", todoSchema);