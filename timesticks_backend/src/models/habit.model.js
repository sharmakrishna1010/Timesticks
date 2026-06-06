import mongoose from "mongoose";

const habitSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId, ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: { type: String },
    currentStreak: {
        type: Number,
        default: 0
    },
    highestStreak: {
        type: Number,
        default: 0
    },
    todayStatus: {
        type: Boolean,
        default: false
    },
    // Store the 90-day history as a simple array of objects
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