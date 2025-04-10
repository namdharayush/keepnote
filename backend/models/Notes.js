import mongoose, { trusted } from "mongoose";


const dataSchema = new mongoose.Schema(
    {
        note_id: {
            type: String,
            required: true
        },
        value: {
            type: String,
        }
    },
    {
        timestamps : true
    }

)


const noteSchema = new mongoose.Schema(
    {
        room_name: {
            type: String,
            required: true
        },
        data: [dataSchema],
        deleted_data: [dataSchema],
        password : String
    },
    {
        timestamps: true
    }
)


const Notes = mongoose.model("Notes", noteSchema);
export default Notes
