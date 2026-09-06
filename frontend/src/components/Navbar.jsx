import { useNavigate } from 'react-router-dom'
import './Navbar.css'

function Navbar() {
  const navigate = useNavigate()

  const user = JSON.parse(sessionStorage.getItem('user'))

  function handleLogout() {
    sessionStorage.removeItem('accessToken')
    sessionStorage.removeItem('refreshToken')
    sessionStorage.removeItem('user')

    navigate('/')
  }

  function handleDashboard() {
    if (user?.role === 'ADMIN') {
      navigate('/admin')
    } else if (user?.role === 'STAFF') {
      navigate('/staff')
    }
  }

  return (
    <header className="navbar">
      <button
        type="button"
        className="logo"
        onClick={() => navigate('/')}
        aria-label="Go to QueueLess home"
      >
        <img
          src="/QueueLessLogo.png"
          alt="QueueLess"
          className="logo-image"
        />
      </button>

      {user ? (
        <div className="nav-user">
          <span>
            Hi, {user.firstName}
          </span>

          {user.role === 'CUSTOMER' && (
            <button
              className="login-button"
              onClick={() => navigate('/my-queues')}
            >
              My Queues
            </button>
          )}

          {(user.role === 'ADMIN' ||
            user.role === 'STAFF') && (
            <button
              className="login-button"
              onClick={handleDashboard}
            >
              Dashboard
            </button>
          )}

          <button
            className="login-button"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      ) : (
        <button
          className="login-button"
          onClick={() => navigate('/login')}
        >
          Login
        </button>
      )}
    </header>
  )
}

export default Navbar