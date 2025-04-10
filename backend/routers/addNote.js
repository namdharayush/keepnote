import express from 'express'
const addNoteRouter = new express.Router();
import Notes from '../models/Notes.js';

addNoteRouter.post('/add-note', async (req, res) => {
    console.log("REQ BODY : ", req.body);
    const { room_name, ...other_data } = req.body
    try {
        const updateDataWithRoomName = await Notes.findOneAndUpdate(
            { room_name: room_name },
            { $push: { data: other_data } },
            { new: true }
        );
        if (!updateDataWithRoomName) {
            return res.status(404).json({ message: "Room not found!" });
        }
        console.log("Updated document:", updateDataWithRoomName);
        return res.status(200).json({
            message: "Note Added!",
            updatedNote: updateDataWithRoomName
        });
    }
    catch (err) {
        console.log("Some Problem Occure when Updating Data , ", err);
        return res.status(500).json({ message: "Internal Server Error" });
    }
})

export default addNoteRouter