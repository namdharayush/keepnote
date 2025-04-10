import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import OuterContainers from './Components/OuterContainers.jsx'
import HomePage from './Components/HomePage.jsx'
import { Provider } from 'react-redux'
import MainStroe from './store/Mainstore.jsx'
import DeletedNotes from './Components/DeletedNotes.jsx'
import { SnackbarProvider } from 'notistack'


const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        path: '/',
        element: <HomePage />
      },
      {
        path: '/:room_name/deleted-notes',
        element: <DeletedNotes />
      },
      {
        path: '*',
        element: <OuterContainers />
      },

    ]
  }
])

createRoot(document.getElementById('root')).render(
  // <StrictMode>
  <SnackbarProvider autoHideDuration={3500} maxSnack={3} anchorOrigin={{ vertical: 'top', horizontal: 'right' }} style={{fontSize:'17px',fontWeight:'650'}}>
    <Provider store={MainStroe}>
      <RouterProvider router={router} />
    </Provider>
  </SnackbarProvider>
  // </StrictMode>,
)
