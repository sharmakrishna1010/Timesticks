import mongoose, { mongo } from "mongoose";

const connectToDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_DB_URI);
        console.log("connectToDb: CONNECTED TO MONGO DB");
    } catch (error) {
        console.log("connectToDb: ERROR CONNECTING MONGO DB");
        throw error;
    }
}

export default connectToDB;