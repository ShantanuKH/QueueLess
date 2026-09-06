import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { loginUser } from '../../services/api'
import './Auth.css'

function Login() {
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()

    setError('')
    setLoading(true)

    try {
      const data = await loginUser(email, password)

      sessionStorage.setItem('accessToken', data.accessToken)
      sessionStorage.setItem('refreshToken', data.refreshToken)
      sessionStorage.setItem('user', JSON.stringify({
          userId: data.userId,
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          role: data.role,
        })
      )

      if (data.role === 'STAFF') {
        navigate('/staff')
      } else if (data.role === 'ADMIN') {
        navigate('/admin')
      } else {
        navigate('/')
      }
    } catch (err) {
      setError(err.message || 'Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

 return (
  <div className="auth-page">
    <div className="auth-layout">
      <div className="auth-intro">
        <div className="auth-brand">
          <img src="/QueueLessLogo.png" alt="QueueLess" />
        </div>

        <h1>
          Skip the queue.
          <br />
          <span>Get your time back.</span>
        </h1>

        <p>
          Join queues remotely, track your position,
          and know when it's your turn.
        </p>

        <div className="auth-benefits">
          <div className="auth-benefit">
            <span className="auth-benefit-icon">✓</span>
            Join a queue without waiting in line
          </div>

          <div className="auth-benefit">
            <span className="auth-benefit-icon">✓</span>
            Track your position in real time
          </div>

          <div className="auth-benefit">
            <span className="auth-benefit-icon">✓</span>
            Know your estimated waiting time
          </div>
        </div>
      </div>

      <div className="auth-card">
        <h2>Welcome back</h2>

        <p className="auth-subtitle">
          Login to continue using QueueLess.
        </p>

        <form onSubmit={handleSubmit}>
          <label htmlFor="login-email">Email</label>

          <input
            id="login-email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label htmlFor="login-password">Password</label>

          <input
            id="login-password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && (
            <p className="auth-error">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="auth-switch">
          Don't have an account?{' '}
          <button
            type="button"
            onClick={() => navigate('/register')}
          >
            Register
          </button>
        </p>

        <button
          type="button"
          className="back-home"
          onClick={() => navigate('/')}
        >
          ← Back to Home
        </button>
      </div>
    </div>
  </div>
)
}

export default Login