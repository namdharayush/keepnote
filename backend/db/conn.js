import mongoose from 'mongoose'

const uri = 'mongodb://localhost:27017/keepnote';

const connectDB = async () => {
    try {
        await mongoose.connect(uri);
        console.log("MongoDB Conncted !");
    }
    catch (err) {
        console.error("MongoDB Connection Error:", err);
        process.exit(1);
    }
}

export default connectDB