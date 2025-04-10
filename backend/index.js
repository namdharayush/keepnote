import express from 'express';
import http from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import { log } from 'console';
import connectDB from './db/conn.js';
import Notes from './models/Notes.js';
import checkNoteRouter from './routers/checkNote.js';
import addNoteRouter from './routers/addNote.js';
import deleteNoteRouter from './routers/deleteNote.js';
import addValueRouter from './routers/addValue.js';
import changeUrlRouter from './routers/changeUrl.js';
import addPasswordRouter from './routers/addPassword.js';
import checkPasswordRouter from './routers/checkPassword.js';
import checkInitialPasswordRouter from './routers/checkInitialPassword.js';
import removePasswordRouter from './routers/removePassword.js';
import restoreNoteRouter from './routers/restoreNote.js';
import getPresignedurl from './routers/generatePreSigned.js'
import deleteAllNotesRouter from './routers/deleteAllNotes.js';

const app = express()

app.use(cors());
app.use(express.json());

connectDB();


// app.get('/check-note', async (req, res) => {
//     console.log(req.body);
//     const findDataWithRoomName = await await Notes.aggregate([
//         { $match: { room_name } },
//         { $unwind: "$data" },
//         { $sort: { "data.createdAt": -1 } },
//         {
//             $group: {
//                 _id: "$_id",
//                 // room_name : {$first : "$room_name"},
//                 data: { $push: {note_id : "$data.note_id",value : "$data.value"}}
//             }
//         }
//     ])
// })

app.use('/api', checkNoteRouter);
app.use('/api', addNoteRouter);
app.use('/api', deleteNoteRouter);
app.use('/api', addValueRouter);
app.use('/api', changeUrlRouter);
app.use('/api', addPasswordRouter);
app.use('/api', checkPasswordRouter);
app.use('/api', checkInitialPasswordRouter);
app.use('/api', removePasswordRouter);
app.use('/api', restoreNoteRouter);
app.use('/api', getPresignedurl);
app.use('/api', deleteAllNotesRouter);

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ['GET', 'POST']
    },
    path: "/socket.io/"
});

io.on('connection', (socket) => {
    console.log(`User Connected : ${socket.id}`);

    socket.on('join_room', (room) => {
        socket.join(room);
        console.log(`User ${socket.id} joined room: ${room}`);
    });

    socket.on('add_note_container', (total_container) => {
        console.log(`Message from ${socket.id} : total_container : `, total_container)
        const {room_name , ...other_container_data} = total_container
        io.to(room_name).emit('add_note_container', other_container_data)
    });

    socket.on('remove_note_container', (total_containers) => {
        console.log(`Message from ${socket.id} : total_container : `, total_containers)
        const {room_name , total_container} = total_containers
        io.to(room_name).emit('remove_note_container', total_container)
    })

    // listen message from Client
    socket.on('message', (data) => {
        console.log(`Message from ${socket.id}:`, data);
        io.to(data.room_name).emit("message", data.total_container)  // Broadcast the message all channels
    })

    socket.on('change_url',(data) => {
        console.log(`Message from ${socket.id} for changing URL:`, data);
        io.to(data.room_name).emit('change_url',data.change_room);
    })

    socket.on('delete_note',(data) => {
        console.log("EACH DELETED NOTE : ",data);
        io.to(data.room_name).emit('delete_note',data.deleted_note);
    })

    socket.on('restore_note',(data) => {
        console.log(data)
        const filteredData = {note_id : data.restore_note[0].note_id , value : data.restore_note[0].value}
        io.to(data.room_name).emit('restore_note' , filteredData)
    })

    socket.on('disconnect', () => {
        console.log(`User Disconnected : ${socket.id}`);
    })

})

const PORT = 5000;
server.listen(PORT, () => {
    log(`Server running on ${PORT}`);
})