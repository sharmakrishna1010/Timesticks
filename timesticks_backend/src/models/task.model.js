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
    status: {
        type: String,
        enum: ['todo', 'done', 'postpone'],
        default: 'todo'
    },
    priority: {
        type: String,
        enum: ['High', 'Low']
    },
    category: {
        type: String,
        default: 'general'
    },
    dueDate: {
        type: Date,
        required: true
    }
}, { timestamps: true });

const Task = mongoose.model("Task", taskSchema);
export default Task;