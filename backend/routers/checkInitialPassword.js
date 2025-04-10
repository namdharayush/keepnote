import express from 'express'
const   checkInitialPasswordRouter = new express.Router();
import Notes from '../models/Notes.js';

checkInitialPasswordRouter.post('/check-initial-password', async (req, res) => {
    console.log("REQ BODY : ", req.body);
    const { room_name, password } = req.body
    try {

        const firstFindRoom = await Notes.findOne({room_name:room_name})

        if(firstFindRoom.password == password){
            return res.status(200).json({message : 'Password match successfully!',isMatch:true})
        }
        else{
            return res.status(200).json({message : 'Password does not match!',isMatch:false})
        }

        return res.status(200).json({
            message: 'password added successfully',
        })


        // if (check_room) {
        //     return res.status(200).json({
        //         message: "This Room Already Exists. Please choose different room!",
        //         available : true
        //     });
        // }
        // else {
        //     const find_room = await Notes.findOneAndUpdate(
        //         { room_name },
        //         { $set: { room_name: value } },
        //         { new: true }
        //     )
        //     console.log("Updated Custom URL : ", find_room);
        //     return res.status(200).json({
        //         message: "Valued added successfully!",
        //         available : false
        //     });
        // }



    }
    catch (err) {
        console.log("Some Problem Occure when Fetching Data in checking Note , ", err);
        return res.status(500).json({ message: "Internal Server Error" });
    }
})

export default checkInitialPasswordRouter