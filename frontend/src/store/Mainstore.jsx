import {configureStore} from '@reduxjs/toolkit'
import restoreDataSlice from './restoreDataSlice'

const MainStroe = configureStore({
    reducer : {
        restoreNote : restoreDataSlice.reducer
    }
})


export default MainStroe