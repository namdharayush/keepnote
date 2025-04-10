import { Box, Button, Container, Grid2, Typography } from '@mui/material';
import React, { useEffect, useRef, useState } from 'react'
import DeleteIcon from '@mui/icons-material/Delete';
import RestorePageIcon from '@mui/icons-material/RestorePage';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { restoreDataAction } from '../store/restoreDataSlice';
import { io } from 'socket.io-client';
import { NavLink } from 'react-router-dom';
import { useSnackbar } from 'notistack';


const room = window.location.pathname.split("/")[1]

function DeletedNotes() {

    // const { deletedNotes } = useSelector(state => state.deletedNotes);
    const [data, setData] = useState([])
    const socketRef = useRef(null);
    const { enqueueSnackbar } = useSnackbar();
    // const dispatch = useDispatch();

    const deleteNoteIdInDB = async (note_id, room_name) => {
        await axios.post('http://localhost:5000/api/delete-note', { room_name, note_id })
            .then((res) => {
                if (res.data.isDeleted) {
                    localStorage.setItem('deleted-notes', JSON.stringify(data.filter(each_note => each_note.note_id != note_id)));
                    enqueueSnackbar('Note deleted permanently!', { variant: 'success' });
                }
            })
    }


    const restoreNoteId = async (note_id, room_name) => {
        await axios.post('http://localhost:5000/api/restore-note', { room_name, note_id })
            .then((res) => {
                if (res.data.isRestore) {
                    localStorage.setItem('deleted-notes', JSON.stringify(data.filter(each_note => each_note.note_id != note_id)));
                    setData(data.filter(each_note => each_note.note_id != note_id))
                    enqueueSnackbar('Note restore successfully!', { variant: 'success' });
                }
            })
    }

    const handleDeleteNote = (note_id) => {
        console.log(note_id);
        const currentUrl = window.location.pathname.split('/')[1] + '_deleted_data'
        setData((prev) => prev.filter(each_note => each_note.note_id != note_id));
        deleteNoteIdInDB(note_id, currentUrl);
    }

    const handleRestoreDeletedNote = (note_id) => {
        console.log(note_id);
        const currentUrl = window.location.pathname.split('/')[1]
        socketRef.current.emit('restore_note', { restore_note: data.filter(each_note => each_note.note_id == note_id), room_name: currentUrl });
        restoreNoteId(note_id, currentUrl)
    }

    const handleDeleteAllNotes = async ( room_name) => {
        console.log(":Room aname  : ",room_name)
        await axios.post('http://localhost:5000/api/delete-all-notes',{room_name})
        .then((res) => {
            if(res.data.isDeleted){
                localStorage.setItem('deleted-notes', JSON.stringify([]));
                setData([]);
                enqueueSnackbar('All Note delete successfully!', { variant: 'success' });
            }
        })
    }

    useEffect(() => {
        const deleted_data_from_storage = JSON.parse(localStorage.getItem('deleted-notes')) || null;
        console.log("Deletred data ferom stor", deleted_data_from_storage)
        setData(deleted_data_from_storage);
    }, [localStorage])

    useEffect(() => {
        if (!socketRef.current) {

            socketRef.current = io('http://localhost:5000', {
                transports: ['websocket', 'polling'],
                path: "/socket.io/"
            });

            socketRef.current.emit('join_room', room);

            socketRef.current.on('connect', () => {
                console.log(`🟢 Connected to WebSocket with ID: ${socketRef.current.id}`);
            });

            socketRef.current.on('delete_note', (new_data) => {
                console.log('deleted_note', new_data, data);
                const deleted_data_from_storage = JSON.parse(localStorage.getItem('deleted-notes')) || null;
                localStorage.setItem('deleted-notes', JSON.stringify([...deleted_data_from_storage]));
                setData(pre => [new_data, ...pre]);
            })
        }

        return () => {
            if (socketRef.current && socketRef.current.connected) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }
        }
    }, [])


    return (
        <Container disableGutters component='div' maxWidth={false} sx={{
            height: 'max-content', position: 'relative', overflow: 'hidden'
        }}>
            <Box component='div' sx={{
                height: 'max-content',
                padding: '30px',
                width: {
                    sm: '80%'
                },
                margin: 'auto',
            }}>
                {/* Each Single Container */}

                <Typography variant='h4' sx={{ textAlign: 'center', marginBottom: '20px', fontWeight: '650' }}>
                    Deleted Notes
                </Typography>

                <Box component='div' sx={{
                    position: 'fixed',
                    bottom: '0',
                    left: '0',
                    width: '100%',
                    height: 'max-content',
                    backgroundColor: '#0000ff85',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                }}>
                    {/* <NavLink to={`/${window.location.pathname.split('/')[1]}`} style={{ textDecoration: 'none',height:'max-content' }}> */}
                    <Button variant='text' type='button' sx={{ color: 'white', fontWeight: '650', fontSize: '24px' }} onClick={() => window.location.href = '/' + window.location.pathname.split('/')[1]}>Home</Button>
                    <Button variant='text' type='button' sx={{ color: 'white', fontWeight: '650', fontSize: '24px', marginLeft:'100px' }} onClick={()=>handleDeleteAllNotes(room)}>DELETE ALL NOTES</Button>
                    {/* </NavLink> */}
                </Box>


                <Grid2 container spacing={{ xs: 3, sm: 3, md: 3 }} sx={{ width: '100%' }}>
                    {
                        data.map((e) => (
                            <Grid2 key={e.note_id} size={{ xs: 12, md: 6, lg: 6 }}>
                                <Box component='div' sx={{ boxShadow: '0px 0px 30px 2px rgba(0,0,0,0.3)', borderRadius: '7px' }}>
                                    <Box component='div' className='container-footer' sx={{
                                        color: 'black', maxWidth: '550px',
                                        minWidth: "300px", padding: '10px'
                                    }}>
                                        <DeleteIcon onClick={() => handleDeleteNote(e.note_id)} sx={{
                                            fontSize: '25px',
                                            cursor: 'pointer',
                                            marginRight: "20px"
                                        }} />
                                        <RestorePageIcon onClick={() => handleRestoreDeletedNote(e.note_id)} sx={{
                                            fontSize: '25px',
                                            cursor: 'pointer'
                                        }} />
                                    </Box>
                                    <Box component='div' sx={{
                                        backgroundColor: 'white',
                                        width: "100%",
                                        textAlign: 'justify',
                                        minHeight: '350px',
                                        height: 'max-content',
                                        padding: '10px 20px',
                                        border: 'none',
                                        outline: 'none',
                                        borderRadius: '7px',
                                        fontSize: '17px',
                                        boxSizing: 'border-box'
                                    }}>
                                        {
                                            e.value?.split('?')[0].match(/\.(jpeg|jpg|png|gif)$/i) ? (
                                                <img src={e.value} alt="Preview" style={{ width: "100%", maxHeight: "500px", objectFit: "contain", borderRadius: '10px' }} />
                                            ) :

                                            ((e.value.includes('.pdf') || e.value.includes('www')) ? (
                                                    <iframe src={e.value} width="100%" height="500px" title="PDF Preview" style={{ overflow: 'hidden', boxSizing: 'border-box' }}></iframe>
                                                ) : e.value)
                                        }
                                    </Box>

                                </Box>
                            </Grid2>
                        ))
                    }
                </Grid2>
            </Box>
        </Container>
    )
}

export default DeletedNotes