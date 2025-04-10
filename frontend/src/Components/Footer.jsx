import { Box, Button, Container, Typography } from '@mui/material'
import React from 'react'
import { NavLink } from 'react-router-dom'

function Footer({ url_function, password_function, checkPasswordAddOrNot, remove_password_function, room_name }) {

    const handleUrlChange = () => {
        url_function(true);
    }
    const handlePasswordChange = () => {
        password_function(true);
    }

    const handleRemovePasswordChange = () => {
        remove_password_function(true);
    }

    return (
        <Box component='div' sx={{
            width: '100%',
            height: 'max-content',
            backgroundColor: '#0000ff85',
            position: 'fixed',
            bottom: '0',

        }}>
            <Box component='div' sx={{ padding: '7px 40px' }}>
                <Typography variant='h5' sx={{ fontWeight: '550', fontSize: '16px', cursor: 'pointer', color: 'white', marginRight: '20px', display: 'inline-block' }}>Keepnote</Typography>
                {
                    !checkPasswordAddOrNot ?
                        <Button onClick={handlePasswordChange} sx={{ fontWeight: '550', fontSize: '16px', cursor: 'pointer', color: 'white', marginRight: '20px', display: 'inline-block' }}>Add password</Button> :
                        <Button onClick={handleRemovePasswordChange} sx={{ fontWeight: '550', fontSize: '16px', cursor: 'pointer', color: 'white', marginRight: '20px', display: 'inline-block' }}>Remove password</Button>
                }
                <Button onClick={handleUrlChange} sx={{ fontWeight: '550', fontSize: '16px', cursor: 'pointer', color: 'white', marginRight: '20px', display: 'inline-block' }}>Change url</Button>
                <NavLink to={`/${room_name}/deleted-notes`} target='_blank'><Button sx={{ fontWeight: '550', fontSize: '16px', cursor: 'pointer', color: 'white', marginRight: '20px', display: 'inline-block' }}>Deleted Notes</Button></NavLink>
            </Box>

        </Box>
    )
}

export default Footer