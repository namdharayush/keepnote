import express from 'express'
const   checkPasswordRouter = new express.Router();
import Notes from '../models/Notes.js';

checkPasswordRouter.post('/check-password', async (req, res) => {
    console.log("REQ BODY : ", req.body);
    const { room_name } = req.body
    try {

        const firstFindRoom = await Notes.findOne({room_name:room_name})

        if(firstFindRoom){
            const password = firstFindRoom.password
            if(password){
                return res.status(200).json({message : 'This room available.',isRoomAvailable : true,isPasswordAvailable : true})
            }
            return res.status(200).json({message : 'This room available.',isRoomAvailable : true,isPasswordAvailable : false})
            
        }
        else{
            return res.status(200).json({message : 'This room is not available',isRoomAvailable : false,isPasswordAvailable : false})
        }

    }
    catch (err) {
        console.log("Some Problem Occure when Fetching Data in checking Note , ", err);
        return res.status(500).json({ message: "Internal Server Error" });
    }
})

export default checkPasswordRouter