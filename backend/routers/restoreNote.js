import express from 'express'
const restoreNoteRouter = new express.Router();
import Notes from '../models/Notes.js';

restoreNoteRouter.post('/restore-note', async (req, res) => {
    console.log("REQ BODY RESTORE : ", req.body);
    const { room_name, note_id } = req.body
    try {
        const custom_room = room_name.replace('_deleted_data','');
        const find_room = await Notes.findOne({ room_name:custom_room });
        const find_deleted_note = find_room.deleted_data.find(note => note.note_id == note_id);
        console.log(find_deleted_note)

        const deleteNote = await Notes.findOneAndUpdate(
            { room_name },
            {
                $pull: { deleted_data: { note_id } },
                $push: { data: find_deleted_note }
            },
            { new: true }
        );

        console.log("Restored Notes:", deleteNote);
        return res.status(200).json({
            message: "Note restore successfully!",isRestore : true
        });

    }
    catch (err) {
        console.log("Some Problem Occure when Fetching Data in checking Note , ", err);
        return res.status(500).json({ message: "Internal Server Error" });
    }
})

export default restoreNoteRouter