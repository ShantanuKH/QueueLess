import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { registerUser } from '../../services/api'
import './Auth.css'

function Register() {
  const navigate = useNavigate()

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()

    setError('')
    setSuccess('')
    setLoading(true)

    try {
      await registerUser(
        firstName,
        lastName,
        email,
        password,
        phone
      )

      setSuccess('Registration successful. Redirecting to home...')

      setTimeout(() => {
        navigate('/')
      }, 1000)
    } catch (err) {
      setError(err.message || 'Registration failed')
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
          Your time matters.
          <br />
          <span>Don't waste it waiting.</span>
        </h1>

        <p>
          Create your QueueLess account and manage
          your queue experience from anywhere.
        </p>

        <div className="auth-benefits">
          <div className="auth-benefit">
            <span className="auth-benefit-icon">✓</span>
            Find nearby service centers
          </div>

          <div className="auth-benefit">
            <span className="auth-benefit-icon">✓</span>
            Join queues before you arrive
          </div>

          <div className="auth-benefit">
            <span className="auth-benefit-icon">✓</span>
            Track your queue without standing in line
          </div>
        </div>
      </div>

      <div className="auth-card">
        <h2>Create account</h2>

        <p className="auth-subtitle">
          Create your QueueLess account to get started.
        </p>

        <form
          className="register-form"
          onSubmit={handleSubmit}
        >
          <label htmlFor="register-first-name">First Name</label>

          <input
            id="register-first-name"
            type="text"
            placeholder="Enter your first name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />

          <label htmlFor="register-last-name">Last Name</label>

          <input
            id="register-last-name"
            type="text"
            placeholder="Enter your last name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />

          <label htmlFor="register-email">Email</label>

          <input
            id="register-email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label htmlFor="register-password">Password</label>

          <input
            id="register-password"
            type="password"
            placeholder="Minimum 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={8}
            required
          />

          <label htmlFor="register-phone">Phone</label>

          <input
            id="register-phone"
            type="tel"
            placeholder="Enter your phone number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          {error && (
            <p className="auth-error">
              {error}
            </p>
          )}

          {success && (
            <p className="auth-success">
              {success}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
          >
            {loading
              ? 'Creating account...'
              : 'Create Account'}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account?{' '}
          <button
            type="button"
            onClick={() => navigate('/login')}
          >
            Login
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

export default Register