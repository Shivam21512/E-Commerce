import mongoose from "mongoose";

export const connectDB = async() => {
    try{
        const conn = await mongoose.connect(process.env.MONGODB_URL);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    }
    catch(error){
        console.log("Error connecting to MONGODB", error.message);
        process.exit(1);
    }
}