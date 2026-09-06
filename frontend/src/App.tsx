import AppRoutes from './routes/AppRoutes.jsx'
import { Toaster } from 'react-hot-toast'

function App() {
  return (
    <>
      <AppRoutes />

      <Toaster
        position="top-center"
        toastOptions={{
          duration: 4000,
        }}
      />
    </>
  )
}

export default App