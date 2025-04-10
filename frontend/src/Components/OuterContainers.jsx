import React, { Fragment, useEffect, useRef, useState } from 'react'
import { Box, Button, Container, Fab, Fade, Grid2, Slide, Snackbar, Typography } from '@mui/material'
import AddCircleIcon from '@mui/icons-material/AddCircle';
import SingleContainer from './SingleContainer';
import axios from 'axios'
import { v4 as uuidv4 } from 'uuid'

import { io } from 'socket.io-client'
import Footer from './Footer';
import { useDispatch } from 'react-redux';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import { useSnackbar } from 'notistack';

const room = window.location.pathname.replace("/", "");

function OuterContainers() {

    const [keep_notes, setKeepNotes] = useState([])
    const socketRef = useRef(null);
    const [urlModel, setUrlModel] = useState(false)
    const urlRef = useRef(null);
    const [passwordModel, setPasswordModel] = useState(false)
    const passwordRef = useRef(null);
    const [addPassword, setAddPassword] = useState(false)
    const [isPassword, setIsPassword] = useState(null)
    const [message, setMessage] = useState('')
    const [state, setState] = useState({
        open: false,
        Transition: Fade,
        vertical: 'top',
        horizontal: 'right',
    });

    const { vertical, horizontal, open, Transition } = state;

    const [file, setFile] = useState(null);

    const dispatcher = useDispatch()

    const { enqueueSnackbar } = useSnackbar()

    const handleFileChange = async (e) => {
        let fileName = e.target.files[0]
        setFile(e.target.files[0])
        if (!fileName) return

        const res = await axios.post('http://localhost:5000/api/generate-presigned-url', {
            fileName: fileName.name,
            fileType: fileName.type,
        })

        const { uploadUrl, key } = res.data;

        await axios.put(uploadUrl, fileName, {
            headers: {
                'Content-Type': fileName.type,
            },
        });

        const get_obj_url = await axios.post('http://localhost:5000/api/generate-object-url', {
            key: key
        })

        const { object_url } = get_obj_url.data;
        handleAddNote(room, object_url);

    }


    const fetchAddNote = async (room, randomNoteId, value = '') => {
        try {
            await axios.post('http://localhost:5000/api/add-note', { room_name: room, note_id: randomNoteId, value: value || '' })
                .then((res) => {
                    setMessage(prev => res.data.message);
                    enqueueSnackbar(res.data.message, { variant: 'success' });
                })
        }
        catch (err) {
            console.log("Error while fetching Add Note. ", err);
        }
    }

    const handleAddNote = (room, object_url = '') => {
        const randomNoteId = uuidv4();
        fetchAddNote(room, randomNoteId, object_url || '')
        if (socketRef.current && socketRef.current.connected) {
            socketRef.current.emit('add_note_container', { room_name: room, note_id: randomNoteId, value: object_url || '' })
        }
    }


    const fetchCheckNote = async (room) => {
        try {
            await axios.post('http://localhost:5000/api/check-note', { room_name: room })
                .then((res) => {
                    const availabelOfCheck = res.data.isAvailable;

                    if (availabelOfCheck) {
                        const all_notes = res.data.all_note_data;
                        const deleted_data = res.data.deleted_notes;
                        setKeepNotes(all_notes);
                        localStorage.setItem('deleted-notes', JSON.stringify(deleted_data));
                    }
                    else {
                        setKeepNotes([]);
                        // setDeletedData([])
                    }
                    setIsPassword(false);
                })
        }
        catch (err) {
            console.log(err);
        }
    }

    const fetchCheckPassword = async (room) => {
        try {
            const res = await axios.post('http://localhost:5000/api/check-password', { room_name: room })
            return { isRoomAvailable: res.data.isRoomAvailable, isPasswordAvailable: res.data.isPasswordAvailable }
        }
        catch (err) {
            console.log(err);
        }
    }

    useEffect(() => {

        const fetchData = async () => {
            const { isRoomAvailable, isPasswordAvailable } = await fetchCheckPassword(room);
            if (isRoomAvailable && isPasswordAvailable) {
                setIsPassword(true);
                setAddPassword(true);
            }
            else {
                fetchCheckNote(room);
            }
        };

        fetchData();
    }, [])

    useEffect(() => {

        if (!socketRef.current) {
            socketRef.current = io('http://localhost:5000', {
                transports: ['websocket', 'polling'],
                path: "/socket.io/"
            });

            socketRef.current.emit('join_room', room);

            socketRef.current.on('message', (data) => {
                console.log("Mskbcbbsdkbckbkb",data)
                setKeepNotes(data);
            });

            socketRef.current.on('add_note_container', (total_container) => {
                setKeepNotes((prev) => [total_container, ...prev]);
            })

            socketRef.current.on('remove_note_container', (total_container) => {
                setKeepNotes(total_container);
            })

            socketRef.current.on('change_url', (change_url) => {
                enqueueSnackbar("Url changing...", { variant: 'success' });
                setTimeout(() => {
                    window.location.href = `/${change_url}`;
                }, 1500)
            })

            socketRef.current.on('restore_note', (data) => {
                setKeepNotes(pre => [data, ...pre]);
            })

            socketRef.current.on('connect', () => {
                console.log(`Connected with ID: ${socketRef.current.id}`);
            });

            socketRef.current.on('disconnect', () => {
                console.log(`Disconnected: ${socketRef.current.id}`);
            });

        }

        return () => {
            if (socketRef.current && socketRef.current.connected) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }
        }
    }, [])


    const addValueNoteIdInDB = async (data) => {
        await axios.post('http://localhost:5000/api/add-value', data)
            .then((res) => {
                console.log(res.data.all_note_value);
                // setKeepNotes(res.data.all_note_value.reverse())
            })
    }

    const getData = (full_text) => {
        const { note_id, message } = full_text
        addValueNoteIdInDB({ room_name: room, note_id, message })
        const filteredText = keep_notes.map((note) => {
            if (note.note_id == note_id) {
                note.value = message;
            }
            return note
        });
        console.log("Filtered Text : ", filteredText);

        if (socketRef.current && socketRef.current.connected) {
            socketRef.current.emit('message', { room_name: room, total_container: filteredText });
        }
    }

    const deleteNoteIdInDB = async (note_id, room_name) => {
        await axios.post('http://localhost:5000/api/delete-note', { room_name, note_id })
            .then((res) => {
                enqueueSnackbar(res.data.message, { variant: 'success' });
            })
    }

    const handleDelete = (note_id) => {

        deleteNoteIdInDB(note_id, room)
        const all_keep_notes = keep_notes.filter(note => note.note_id != note_id);
        const deleted_notes = keep_notes.filter(note => note.note_id == note_id);
        const getDataFromLocalStorage = JSON.parse(localStorage.getItem('deleted-notes')) || []
        localStorage.setItem('deleted-notes', JSON.stringify([...deleted_notes, ...getDataFromLocalStorage]));

        // setKeepNotes(all_keep_notes)
        if (socketRef.current && socketRef.current.connected) {
            socketRef.current.emit('remove_note_container', { room_name: room, total_container: all_keep_notes })
            socketRef.current.emit('delete_note', { room_name: room, deleted_note: deleted_notes[0] })

        }
    }


    const handleUrlChangePopup = (e) => {
        setUrlModel(e)
    }


    const fetchChangeUrl = async (data) => {
        await axios.post('http://localhost:5000/api/change-url', data)
            .then((res) => {
                const checkAvailabelRoom = res.data.available;
                if (checkAvailabelRoom) {
                    enqueueSnackbar("Please choose different url name!", { variant: 'error' });
                }
                else {
                    if (socketRef.current && socketRef.current.connected) {
                        socketRef.current.emit('change_url', { room_name: data.room_name, change_room: data.value })
                    }
                }

            })
    }

    const fetchAddPassword = async (data) => {
        await axios.post('http://localhost:5000/api/add-passowrd', data)
            .then((res) => {
                setAddPassword(true);
                setPasswordModel(false);
                passwordRef.current.value = '';
                enqueueSnackbar(res.data.message, { variant: 'success' });
                // const checkAvailabelRoom = res.data.available;
                // if (checkAvailabelRoom) {
                //     alert('Please choose different url name!')
                // }
                // else {
                //     if (socketRef.current && socketRef.current.connected) {
                //         socketRef.current.emit('change_url', { room_name: data.room_name, change_room: data.value })
                //     }
                // }

            })
    }




    const handleChangeUrl = () => {

        let value = urlRef.current.value.trim();
        if (value == room) {
            enqueueSnackbar("Please change the url!", { variant: 'warning' });
        }
        else if (value == '') {
            enqueueSnackbar("This field is required!", { variant: 'warning' });
        }
        else {
            fetchChangeUrl({ room_name: room, value })
        }
    }

    const handleUrlChangeKeyDown = (e) => {
        if (e.key == 'Enter') {
            let value = urlRef.current.value.trim();
            if (value == room) {
                enqueueSnackbar("Please change the url!", { variant: 'warning' });
            }
            else if (value == '') {
                enqueueSnackbar("This field is required!", { variant: 'warning' });
            }
            else {
                fetchChangeUrl({ room_name: room, value })
            }
        }
    }

    const handlePasswordPopup = () => {
        let value = passwordRef.current.value;
        if (value == '') {
            enqueueSnackbar("Please type correct password!", { variant: 'warning' });
            passwordRef.current.value = '';
        }
        else {
            fetchAddPassword({ room_name: room, value });
        }
    }

    const handlePasswordKeyDown = (e) => {
        let value = passwordRef.current.value;
        if (e.key == 'Enter')
            if (value == '') {
                enqueueSnackbar("Please type correct password!", { variant: 'warning' });
                passwordRef.current.value = '';
            }
            else {
                fetchAddPassword({ room_name: room, value });
            }
    }

    const fetchInitialCheckPassword = async (data) => {
        try {
            const res = await axios.post('http://localhost:5000/api/check-initial-password', data)
            return res.data.isMatch
        }
        catch (err) {
            return false;
        }
    }

    const handleCheckInitialPassword = async () => {
        const password = passwordRef.current.value;
        if (password) {
            const checkPasswordStatus = await fetchInitialCheckPassword({ room_name: room, password });
            if (checkPasswordStatus) {
                fetchCheckNote(room)
            }
            else {
                enqueueSnackbar("Invalid password!", { variant: 'error' });
            }
        }
        else {
            enqueueSnackbar("Please type password correctly!", { variant: 'error' });
        }
    }

    const handleCheckPasswordKeyDown = async (e) => {
        if (e.key == 'Enter') {
            const password = passwordRef.current.value;
            if (password) {
                const checkPasswordStatus = await fetchInitialCheckPassword({ room_name: room, password });
                if (checkPasswordStatus) {
                    fetchCheckNote(room)
                }
                else {
                    enqueueSnackbar("Invalid password!", { variant: 'error' });
                }
            }
            else {
                enqueueSnackbar("Please type password correctly!", { variant: 'error' });
            }
        }
    }


    const fetchRemovePassword = async (data) => {
        const res = await axios.post('http://localhost:5000/api/remove-password', data)
        return res.data.isRemovePassword
    }


    const removePassword = async (e) => {
        const check_remove_password = await fetchRemovePassword({ room_name: room })
        if (check_remove_password) {
            setAddPassword(false)
            setIsPassword(false)
            enqueueSnackbar("Password removed successfully!", { variant: 'success' });
        }
    }

    // const handleClose = () => {
    //     setState({
    //         ...state,
    //         open: false,
    //     });
    // };

    // const action = (
    //     <Fragment>
    //         <IconButton
    //             size="small"
    //             aria-label="close"
    //             color="inherit"
    //             onClick={handleClose}
    //         >
    //             <CloseIcon fontSize="small" />
    //         </IconButton>
    //     </Fragment>
    // );

    // function SlideTransition(props) {
    //     return <Slide {...props} direction="down" />;
    // }


    return (
        <Fragment>
            {
                isPassword ?
                    <Box component='div' sx={{ width: '40%', margin: 'auto', height: '300px', padding: '20px', textAlign: 'center' }}>
                        <Typography variant='h5' sx={{ fontSize: '24px', fontWeight: '550', marginBottom: '20px' }}>Keepnote</Typography>
                        <Typography variant='h5' sx={{ fontSize: '24px', fontWeight: '550', marginBottom: '20px' }}>Private note</Typography>
                        <Box component='input' onKeyDown={handleCheckPasswordKeyDown} ref={passwordRef} type='password' placeholder='Enter your password' sx={{ outline: 'none', border: 'none', borderBottom: '1px solid rgba(0,0,0,0.2)', padding: '15px', width: '100%', boxSizing: 'border-box', marginBottom: '30px', fontSize: '20px' }} />
                        <Button onClick={handleCheckInitialPassword} sx={{ backgroundColor: 'black', color: 'white', width: '100%', padding: '10px 0', fontWeight: '550', fontSize: '16px', borderRadius: '10px' }}>Open note</Button>
                    </Box>

                    :

                    <Container disableGutters component='div' maxWidth={false} sx={{
                        height: (urlModel || passwordModel) ? '100vh' : 'max-content', position: 'relative', overflow: 'hidden'
                    }}>
                        <Box component='div' sx={{
                            height: 'max-content',
                            padding: '30px',
                            width: {
                                sm: '80%'
                            },
                            margin: 'auto',
                        }}>
                            <Box component='div' sx={{
                                maxWidth: 'max-content',
                                margin: 'auto',
                                color: 'black',
                                marginBottom: '50px'
                            }} className='add-icons'>
                                <Fab color="primary" aria-label="add-note" sx={{ marginRight: '30px' }}>
                                    <AddCircleIcon onClick={() => handleAddNote(room)} sx={{
                                        fontSize: '60px',
                                        cursor: 'pointer'
                                    }} />
                                </Fab>
                                {/* <Fab color="primary" aria-label="add-note">
                                    <AddCircleIcon sx={{
                                        fontSize: '60px',
                                        cursor: 'pointer'
                                    }} />
                                </Fab>
                                <Box component='input' type='file' onChange={handleFileChange} /> */}
                                <label htmlFor="upload-input">
                                    <input
                                        type="file"
                                        id="upload-input"
                                        onChange={handleFileChange}
                                        style={{ display: 'none' }}
                                    />
                                    <Fab color="primary" aria-label="upload-file" component="span">
                                        <AttachFileIcon sx={{ fontSize: '30px', cursor: 'pointer' }} />
                                    </Fab>
                                </label>

                            </Box>

                            {/* Each Single Container */}


                            <Grid2 container spacing={{ xs: 3, sm: 3, md: 3 }} sx={{ width: '100%', padding: '40px 0' }}>
                                {
                                    keep_notes.map((e) => (
                                        <Grid2 key={e.note_id} size={{ xs: 12, md: 6, lg: 6 }}>
                                            <SingleContainer note_id={e.note_id} txtValue={e.value} dataFunction={getData} deleteFunction={handleDelete} />
                                        </Grid2>
                                    ))
                                }
                            </Grid2>
                        </Box>
                        {
                            urlModel && <Box component='div' sx={{
                                backgroundColor: 'rgba(0,0,0,0.3)',
                                width: '100%',
                                height: '100vh',
                                position: 'absolute',
                                top: '0'
                            }}>
                                <Box component='div' sx={{
                                    backgroundColor: 'white',
                                    width: { xs: "90%", sm: "450px", md: "500px" },
                                    maxWidth: "500px",
                                    height: 'max-content',
                                    position: 'relative',
                                    top: '50%',
                                    left: '50%',
                                    transform: 'translate(-50%,-50%)',
                                    padding: '40px 30px',
                                    overflow: 'hidden',
                                    borderRadius: '10px'
                                }}>
                                    <Typography variant='h5' sx={{ fontSize: '30px', fontWeight: '650', textAlign: 'center', opacity: '0.6' }}>Enter your custom url</Typography>
                                    <Box component='input' onKeyDown={handleUrlChangeKeyDown} ref={urlRef} type='text' placeholder='Enter your url' sx={{ width: '100%', marginTop: '40px', padding: '20px', fontSize: '20px', outline: 'none', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '7px', boxSizing: 'border-box', }} />
                                    <Box component='div' sx={{ width: 'max-content', margin: 'auto', marginTop: '40px' }}>
                                        <Button onClick={() => setUrlModel(false)} sx={{ padding: '10px 20px', backgroundColor: 'grey', color: 'white', fontWeight: '550', marginRight: '20px' }}>Cancel</Button>
                                        <Button onClick={handleChangeUrl} sx={{ padding: '10px 20px', backgroundColor: 'blue', color: 'white', fontWeight: '550', transition: 'all 0.3s linear', border: '1px solid white', ':hover': { backgroundColor: 'transparent', border: '1px solid rgba(0,0,0,0.3)', color: 'black' } }}>Change url</Button>
                                    </Box>
                                </Box>
                            </Box>
                        }
                        {
                            passwordModel && <Box component='div' sx={{
                                backgroundColor: 'rgba(0,0,0,0.3)',
                                width: '100%',
                                height: '100vh',
                                position: 'absolute',
                                top: '0'
                            }}>
                                <Box component='div' sx={{
                                    backgroundColor: 'white',
                                    width: { xs: "90%", sm: "450px", md: "500px" },
                                    maxWidth: "500px",
                                    height: 'max-content',
                                    position: 'relative',
                                    top: '50%',
                                    left: '50%',
                                    transform: 'translate(-50%,-50%)',
                                    padding: '40px 30px',
                                    overflow: 'hidden',
                                    borderRadius: '10px'
                                }}>
                                    <Typography variant='h5' sx={{ fontSize: '30px', fontWeight: '650', textAlign: 'center', opacity: '0.6' }}>Add password</Typography>
                                    <Box component='input' onKeyDown={handlePasswordKeyDown} ref={passwordRef} type='password' placeholder='Password' sx={{ width: '100%', marginTop: '40px', padding: '20px', fontSize: '20px', outline: 'none', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '7px', boxSizing: 'border-box', }} />
                                    <Box component='div' sx={{ width: 'max-content', margin: 'auto', marginTop: '40px' }}>
                                        <Button onClick={() => setPasswordModel(false)} sx={{ padding: '10px 20px', backgroundColor: 'grey', color: 'white', fontWeight: '550', marginRight: '20px' }}>Cancel</Button>
                                        <Button onClick={handlePasswordPopup} sx={{ padding: '10px 20px', backgroundColor: 'blue', color: 'white', fontWeight: '550', transition: 'all 0.3s linear', border: '1px solid white', ':hover': { backgroundColor: 'transparent', border: '1px solid rgba(0,0,0,0.3)', color: 'black' } }}>Save</Button>
                                    </Box>
                                </Box>
                            </Box>
                        }

                        {/* <Snackbar
                            open={state.open}
                            onClose={handleClose}
                            slots={{ transition: state.Transition }}
                            message={message}
                            key={Transition.name + vertical + horizontal}
                            action={action}
                            anchorOrigin={{ vertical, horizontal }}
                        // autoHideDuration={3000}
                        /> */}

                        <Footer url_function={handleUrlChangePopup} password_function={(e) => setPasswordModel(e)} checkPasswordAddOrNot={addPassword} remove_password_function={removePassword} room_name={room} />
                    </Container>
            }
        </Fragment >

    )
}

export default OuterContainers