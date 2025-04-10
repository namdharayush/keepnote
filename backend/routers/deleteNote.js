import express from 'express'
const deleteNoteRouter = new express.Router();
import Notes from '../models/Notes.js';

deleteNoteRouter.post('/delete-note', async (req, res) => {
    console.log("REQ BODY : ", req.body);
    const { room_name, note_id } = req.body
    try {
        if (room_name.includes('_deleted_data')) {
            const custom_room = room_name.replace('_deleted_data','');
            console.log(custom_room);
            try{
                const deleteNote = await Notes.findOneAndUpdate(
                    { room_name :  custom_room },
                    {
                        $pull: { deleted_data: { note_id } },
                    },
                    { new: true }
                );

                console.log("Deleted Notes:", deleteNote);
                return res.status(200).json({
                    message: "Note deleted successfully!", isDeleted : true
                });
            }
            catch(err){
                return res.status(200).json({
                    message: "Note not found!", isDeleted : false
                });
            }
            
        }
        else {

            const find_room = await Notes.findOne({ room_name });
            const find_deleted_note = find_room.data.find(note => note.note_id == note_id);


            const deleteNote = await Notes.findOneAndUpdate(
                { room_name },
                {
                    $pull: { data: { note_id } },
                    $push: { deleted_data: find_deleted_note }
                },
                { new: true }
            );

            console.log("Deleted Notes:", deleteNote);
            return res.status(200).json({
                message: "Note deleted successfully!",
                deletedNote: deleteNote.data
            });
        }

    }
    catch (err) {
        console.log("Some Problem Occure when Fetching Data in checking Note , ", err);
        return res.status(500).json({ message: "Internal Server Error" });
    }
})

export default deleteNoteRouter