import { useState } from 'react'
import {
  loginUser,
  registerUser,
} from '../services/api'

function Auth({ onLoginSuccess, onBack }) {
  const [isRegister, setIsRegister] = useState(false)

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function switchMode() {
    setIsRegister(!isRegister)
    setError('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (isRegister) {
        await registerUser(
          firstName,
          lastName,
          email,
          password,
          phone
        )

        // Registration does not return tokens,
        // so the user needs to log in after registering.
        setIsRegister(false)
        setPassword('')
        setError('Registration successful. Please log in.')
      } else {
        const data = await loginUser(
          email,
          password
        )

        sessionStorage.setItem(
          'accessToken',
          data.accessToken
        )

        sessionStorage.setItem(
          'refreshToken',
          data.refreshToken
        )

        sessionStorage.setItem(
          'user',
          JSON.stringify({
            userId: data.userId,
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
          })
        )

        onLoginSuccess(data)
      }
    } catch (err) {
      setError(
        err.message || 'Something went wrong'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="auth-section">
      <div className="auth-card">
        <button
          className="back-button"
          onClick={onBack}
        >
          ← Back
        </button>

        <h1>
          {isRegister
            ? 'Create your account'
            : 'Welcome back'}
        </h1>

        <p className="auth-subtitle">
          {isRegister
            ? 'Register to join queues.'
            : 'Login to continue.'}
        </p>

        <form onSubmit={handleSubmit}>
          {isRegister && (
            <>
              <input
                type="text"
                placeholder="First name"
                value={firstName}
                onChange={(e) =>
                  setFirstName(e.target.value)
                }
                required
              />

              <input
                type="text"
                placeholder="Last name"
                value={lastName}
                onChange={(e) =>
                  setLastName(e.target.value)
                }
                required
              />
            </>
          )}

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            required
          />

          {isRegister && (
            <input
              type="text"
              placeholder="Phone (optional)"
              value={phone}
              onChange={(e) =>
                setPhone(e.target.value)
              }
            />
          )}

          {error && (
            <p className="auth-message">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="auth-submit"
            disabled={loading}
          >
            {loading
              ? 'Please wait...'
              : isRegister
                ? 'Register'
                : 'Login'}
          </button>
        </form>

        <p className="auth-switch">
          {isRegister
            ? 'Already have an account?'
            : "Don't have an account?"}

          <button
            type="button"
            onClick={switchMode}
          >
            {isRegister ? 'Login' : 'Register'}
          </button>
        </p>
      </div>
    </section>
  )
}

export default Auth