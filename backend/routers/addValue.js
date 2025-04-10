import express from 'express'
const addValueRouter = new express.Router();
import Notes from '../models/Notes.js';

addValueRouter.post('/add-value', async (req, res) => {
    console.log("REQ BODY : ", req.body);
    const { room_name, note_id,message } = req.body
    try {

        const find_room = await Notes.findOneAndUpdate(
            {room_name,"data.note_id":note_id},
            {$set : {"data.$.value" : message}},
            {new : true}
        )

        console.log("Updated Text Value : ", find_room);

        return res.status(200).json({
            message: "Valued added successfully!",
            all_note_value : find_room.data
        });


    }
    catch (err) {
        console.log("Some Problem Occure when Fetching Data in checking Note , ", err);
        return res.status(500).json({ message: "Internal Server Error" });
    }
})

export default addValueRouter