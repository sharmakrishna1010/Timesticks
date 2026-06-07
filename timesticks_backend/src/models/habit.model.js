import mongoose from "mongoose";

const habitSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId, ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true,
        maxlength: [50, 'Title cannot exceed 50 characters'],
        trim: true
    },
    description: {
        type: String,
        maxlength: [250, 'Description cannot exceed 250 characters'],
        trim: true
    },
    currentStreak: {
        type: Number,
        default: 0,
    },
    highestStreak: {
        type: Number,
        default: 0
    },
    todayStatus: {
        type: Boolean,
        default: false
    },
    history: [{
        date: {
            type: String,
            required: true
        }, // Format: 'YYYY-MM-DD'
        completed: {
            type: Boolean,
            required: true
        }
    }]
}, { timestamps: true });

const Habit = mongoose.model("Habit", habitSchema);
export default Habit;