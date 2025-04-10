import {createSlice} from '@reduxjs/toolkit'



const restoreDataSlice = createSlice({
    name : 'restore-notes',
    initialState : {
        restoreNotes : []
    },
    reducers : {
        fetchRestoreNotes : (state, action) => {
            state.restoreNotes = action.payload;
        }
    }
})

export const restoreDataAction = restoreDataSlice.actions;
export default restoreDataSlice