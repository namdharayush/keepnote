import { Box, Typography } from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete';
import React, { useCallback, useEffect, useRef, useState } from 'react'
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { NavLink } from 'react-router-dom';

function SingleContainer({ note_id, dataFunction, deleteFunction, txtValue }) {

    const textareaRef = useRef(null);
    const timerRef = useRef(null);
    const [previewText, setPreviewText] = useState('');

    const handleDeleteNote = (note_id) => {
        deleteFunction(note_id)
    }

    // useEffect(() => {
    //     if (textareaRef.current && txtValue) {
    //         const selection = window.getSelection();
    //         const range = document.createRange();
    //         const textNode = textareaRef.current.childNodes[0] || textareaRef.current;

    //         // Get previous cursor position
    //         let focusNode = selection.focusNode;
    //         let focusOffset = selection.focusOffset;

    //         // Preserve cursor position based on previous state
    //         textareaRef.current.innerText = txtValue || '';

    //         if (focusNode && textareaRef.current.contains(focusNode)) {

    //             let newOffset = Math.min(focusOffset, textareaRef.current.innerText.length);
    //             range.setStart(focusNode, newOffset);
    //             range.collapse(true);
    //             selection.removeAllRanges();
    //             selection.addRange(range);
    //         } else {
    //             // If the cursor is lost, set it to the end of the text
    //             range.setStart(textNode, textareaRef.current.innerText.length);
    //             range.collapse(true);
    //             selection.removeAllRanges();
    //             selection.addRange(range);
    //         }
    //     }

    // }, [txtValue])

    useEffect(() => {
        console.log('TEXTAREA CURRENT OF THIS : ', txtValue)
        
        if (txtValue.startsWith('https://')) {
            setPreviewText(prev => txtValue)
        }
        else{
            textareaRef.current.value = txtValue;
        }
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto"; // Reset height
            textareaRef.current.style.height = textareaRef.current.scrollHeight + "px"; // Adjust height
        }
    }, [txtValue]);

    const getData = () => {
        dataFunction({ note_id: note_id, message: textareaRef.current.value })
    }

    const debounce = useCallback((fn, delay) => {
        return function (...args) {
            clearTimeout(timerRef.current);
            timerRef.current = setTimeout(() => {
                fn(...args);
            }, delay);
        }
    }, [])

    const debounceEventHandler = debounce(getData, 500);

    useEffect(() => {
        const handleInput = () => {
            debounceEventHandler();
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
        }
        const textArea = textareaRef.current;
        if (textArea) {
            textArea.addEventListener('input', handleInput);
        }
        return () => {
            if (textArea) {
                textArea.removeEventListener("input", handleInput);
            }
            clearTimeout(timerRef.current);
        }
    }, [debounceEventHandler])

    return (

        <Box component='div' sx={{ boxShadow: '0px 0px 30px 2px rgba(0,0,0,0.3)', borderRadius: '7px', overflow: 'hidden' }}>
            <Box component='div' className='container-footer' sx={{
                color: 'black', width: '100%',
                minWidth: "300px", padding: '10px'
            }}>
                <DeleteIcon onClick={() => handleDeleteNote(note_id)} sx={{
                    fontSize: '25px',
                    cursor: 'pointer'
                }} />
            </Box>
            {/* <Box component='div' ref={textareaRef} contentEditable={true} sx={{
                backgroundColor: 'white',
                maxWidth: '550px',
                minWidth: "300px",
                minHeight: '350px',
                height: 'max-content',
                padding: '10px 20px',
                border: 'none',
                outline: 'none',
                borderRadius: '7px',
                fontSize: '17px',
            }} /> */}


            {
                previewText ? (
                    <Box component='div' sx={{
                        marginTop: "10px", borderRadius: "5px", overflow: "hidden", width: "100%",
                        textAlign: 'justify',
                        padding: "10px 20px",
                        height: "100%",
                        boxSizing: 'border-box'
                    }}>
                        {
                            previewText?.split('?')[0].match(/\.(jpeg|jpg|png|gif)$/i) ? (
                                <img src={previewText} alt="Preview" style={{ width: "100%", maxHeight: "500px", objectFit: "contain", borderRadius: '10px' }} />
                            ) :

                                (previewText.includes('.pdf') || previewText.includes('www')) && (
                                    <iframe src={previewText} width="100%" height="500px" title="PDF Preview" style={{ overflow: 'hidden', boxSizing: 'border-box' }}></iframe>
                                )
                        }

                        <NavLink to={previewText} target='_blank'>
                            <OpenInNewIcon sx={{
                                fontSize: '25px',
                                cursor: 'pointer'
                            }} />
                        </NavLink>

                    </Box>
                )

                    :

                    <Box component='textarea' ref={textareaRef}
                        defaultValue={txtValue.startsWith('https://') ? "" : txtValue}
                        rows='20'
                        cols='58'
                        onInput={debounceEventHandler}
                        sx={{
                            backgroundColor: "white",
                            width: "100%",
                            textAlign: 'justify',
                            minHeight: "100px",
                            height: "auto",
                            padding: "10px 20px",
                            border: "none",
                            outline: "none",
                            borderRadius: "7px",
                            fontSize: "17px",
                            resize: "none", // Prevent manual resize
                            overflow: "hidden",
                            boxSizing: 'border-box'
                        }} />
            }

        </Box>

    )
}

export default SingleContainer