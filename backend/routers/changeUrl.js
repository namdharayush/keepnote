import express from 'express'
const changeUrlRouter = new express.Router();
import Notes from '../models/Notes.js';

changeUrlRouter.post('/change-url', async (req, res) => {
    console.log("REQ BODY : ", req.body);
    const { room_name, value } = req.body
    try {

        const check_room = await Notes.findOne({ room_name: value });

        if (check_room) {
            return res.status(200).json({
                message: "This Room Already Exists. Please choose different room!",
                available : true
            });
        }
        else {
            const find_room = await Notes.findOneAndUpdate(
                { room_name },
                { $set: { room_name: value } },
                { new: true }
            )
            console.log("Updated Custom URL : ", find_room);
            return res.status(200).json({
                message: "Valued added successfully!",
                available : false
            });
        }



    }
    catch (err) {
        console.log("Some Problem Occure when Fetching Data in checking Note , ", err);
        return res.status(500).json({ message: "Internal Server Error" });
    }
})

export default changeUrlRouter