import express from 'express'
const deleteAllNotesRouter = new express.Router();
import Notes from '../models/Notes.js';
import AWS from 'aws-sdk'

const s3 = new AWS.S3({
    accessKeyId: 'AKIAXUAQXMQ4NDOVVKM2',
    secretAccessKey: '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',
    region: 'eu-north-1',
});



deleteAllNotesRouter.post('/delete-all-notes', async (req, res) => {
    console.log("REQ BODY delete : ", req.body);
    const { room_name } = req.body
    try {
        const custom_room = room_name.replace('_deleted_data', '');
        try {

            const datas = await Notes.findOne({ room_name: custom_room })
            const all_deleted_datas = datas.deleted_data
            all_deleted_datas.forEach(async (data) => {
                const txtvalue = data.value;
                if (txtvalue.includes('amazonaws.com')) {
                    const customValue = txtvalue?.split('?')[0].split('/').slice(-1)[0];
                    console.log("Custom value of ", customValue)
                    const deleteParams = {
                        Bucket: 'keepingnote-private',
                        Key: `uploads/${customValue}`,
                    };

                    try {
                        await s3.deleteObject(deleteParams).promise();
                        console.log(`Deleted ${customValue} from S3`);
                    } catch (err) {
                        console.error('S3 Delete Error:', err);
                    }
                }
            })

            // const deleteNote = await Notes.findOneAndUpdate(
            //     { room_name: custom_room },
            //     {
            //         $set: { deleted_data: [] }
            //     },
            //     { new: true }
            // );

            return res.status(200).json({
                message: "All Note deleted successfully!", isDeleted: true
            });
        }
        catch (err) {
            return res.status(404).json({
                message: "Note not found!", isDeleted: false
            });
        }

    }
    catch (err) {
        console.log("Some Problem Occure when Fetching Data in checking Note , ", err);
        return res.status(500).json({ message: "Internal Server Error" });
    }
})

export default deleteAllNotesRouter