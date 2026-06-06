import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    fullname: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    havePremium: {
        type: Boolean,
        default: false,
        required: true
    },
    isEmailVerified: {
        type: Boolean,
        default: false,
        required: true
    }
    // lists: [
    //     {
    //         type: mongoose.Schema.Types.ObjectId,
    //         ref: 'List',
    //         validate: [validateListLength, 'List exceeds the limit of 10']
    //     }
    // ],
    // habits: [
    //     {
    //         type: mongoose.Schema.Types.ObjectId,
    //         ref: 'Habit',
    //         validate: [validateHabbitLength, 'List exceeds the limit of 20']
    //     }
    // ]
}, { timestamps: true });

// const validateListLength = (list) => {
//     return list.length < 10;
// }

// const validateHabbitLength = (list) => {
//     return list.length < 20;
// }

const User = mongoose.model("User", userSchema);
export default User;