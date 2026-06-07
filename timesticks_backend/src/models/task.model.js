import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', required: true
    },
    list: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'List', required: true
    },
    title: {
        type: String,
        required: true
    },
    description: { type: String },
    done: {
        type: Boolean,
        default: false
    },
    priority: {
        type: String,
        enum: ['High', 'Low', 'Medium'],
        default: 'Medium'
    },
    dueDate: {
        type: Date,
        required: true
    }
}, { timestamps: true });

const Task = mongoose.model("Task", taskSchema);
export default Task;