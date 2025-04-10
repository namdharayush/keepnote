import express from 'express'
const checkNoteRouter = new express.Router();
import Notes from '../models/Notes.js';

checkNoteRouter.post('/check-note', async (req, res) => {
    console.log("REQ BODY : ", req.body);
    const { room_name } = req.body
    try {
        const findDataWithRoomName = await Notes.findOne({ room_name: room_name }).select('-_id').lean()
        if (findDataWithRoomName) {
            try {
                if(findDataWithRoomName.data.length == 0){
                    return res.status(200).json({ message: 'Data Fetch Successfully!', all_note_data: [], isAvailable: true, password:findDataWithRoomName.password, deleted_notes : findDataWithRoomName.deleted_data })
                }
                const sortDataWithRoomName = await Notes.aggregate([
                    { $match: { room_name } },
                    { $unwind: "$data" },
                    { $sort: { "data.createdAt": -1 } },
                    {
                        $group: {
                            _id: "$_id",
                            data: { $push: {note_id : "$data.note_id",value : "$data.value"}}
                        }
                    }
                ])
                console.log("findDataWithRoomName : ", sortDataWithRoomName[0].data);
                return res.status(200).json({ message: 'Data Fetch Successfully!', all_note_data: sortDataWithRoomName[0].data, isAvailable: true,password:findDataWithRoomName.password, deleted_notes : findDataWithRoomName.deleted_data })
            }
            catch (err) {
                console.log("Some Problem Occure when Aggregating Data in checking Note , ", err);
                return res.status(500).json({ message: "Internal Server Error" });
            }
        }
        const createNote = await Notes.create({ room_name, data: [], deleted_data: [],password:'' });
        const saveNote = await createNote.save();
        console.log("saveNote", saveNote);
        return res.status(201).json({ message: 'This Room id is not found!', isAvailable: false });
    }
    catch (err) {
        console.log("Some Problem Occure when Fetching Data in checking Note , ", err);
        return res.status(500).json({ message: "Internal Server Error" });
    }
})

export default checkNoteRouter