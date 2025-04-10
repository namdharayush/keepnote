import express from 'express'
import AWS from 'aws-sdk'
const getPresignedurl = new express.Router();

const s3 = new AWS.S3({
    accessKeyId: 'AKIAXUAQXMQ4NDOVVKM2',
    secretAccessKey: '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',
    region: 'eu-north-1',
});

getPresignedurl.post('/generate-presigned-url', (req, res) => {
    const { fileName, fileType } = req.body;

    const params = {
        Bucket: 'keepingnote-private',
        Key: `uploads/${Date.now()}_${fileName}`,
        Expires: 60, // seconds
        ContentType: fileType,
    };

    s3.getSignedUrl('putObject', params, (err, url) => {
        if (err) return res.status(500).json({ error: 'Error generating pre-signed URL' });
        res.json({ uploadUrl: url,key : params.Key });
    })

})


getPresignedurl.post('/generate-object-url',(req,res)=>{
    const {key} = req.body

    const getUrlParams = {
        Bucket: 'keepingnote-private',
        Key: key,
        Expires: 60*60*24*7, // seconds
    }
    const url = s3.getSignedUrl('getObject', getUrlParams);


    console.log("Get Object URl,",url)
    return res.json({ object_url:url });


})



export default getPresignedurl
