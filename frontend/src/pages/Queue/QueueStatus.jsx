import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  getTokenStatus,
  leaveQueue,
} from '../../services/queueApi'
import Navbar from '../../components/Navbar'
import './QueueStatus.css'

function QueueStatus() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const tokenId = searchParams.get('tokenId')

  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)
  const [leaving, setLeaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!tokenId) {
      setError('Token information is missing')
      setLoading(false)
      return
    }

    let intervalId

    async function loadTokenStatus() {
      try {
        const data = await getTokenStatus(tokenId)

        setToken(data)
        setError('')
      } catch (err) {
        setError(
          err.message || 'Unable to load queue status'
        )
      } finally {
        setLoading(false)
      }
    }

    loadTokenStatus()

    intervalId = setInterval(loadTokenStatus, 5000)

    return () => {
      clearInterval(intervalId)
    }
  }, [tokenId])

  async function handleLeaveQueue() {
    try {
      setLeaving(true)

      await leaveQueue()

      toast.success('You have left the queue')

      navigate('/')
    } catch (err) {
      toast.error(
        err.message || 'Unable to leave queue'
      )
    } finally {
      setLeaving(false)
    }
  }

  function getStatusClass(status) {
    switch (status) {
      case 'WAITING':
        return 'status-waiting'
      case 'CALLED':
        return 'status-called'
      case 'SERVED':
        return 'status-served'
      case 'CANCELLED':
        return 'status-cancelled'
      default:
        return ''
    }
  }

  return (
    <div className="queue-status-page">
      <Navbar />

      <main className="queue-status-content">
        <button
          className="back-button"
          onClick={() => navigate('/')}
          disabled={leaving}
        >
          ← Back to Home
        </button>

        <div className="queue-status-card">
          <div className="queue-status-header">
            <span className="queue-status-label">
              LIVE QUEUE STATUS
            </span>

            <h1>Your Queue Status</h1>

            <p>
              Your queue position is updated automatically.
            </p>
          </div>

          {loading && (
            <div className="status-message">
              Loading your queue status...
            </div>
          )}

          {error && (
            <p className="queue-error">
              {error}
            </p>
          )}

          {!loading && !error && token && (
            <>
              <div className="token-number">
                <span>Your Token</span>

                <strong>{token.tokenNumber}</strong>
              </div>

              <div
                className={`current-status ${getStatusClass(
                  token.status
                )}`}
              >
                <span className="status-dot" />

                <strong>{token.status}</strong>
              </div>

              <div className="queue-info">
                <div className="queue-info-item">
                  <span>People Ahead</span>

                  <strong>
                    {token.peopleAhead}
                  </strong>
                </div>

                <div className="queue-info-item">
                  <span>Estimated Wait</span>

                  <strong>
                    {token.estimatedWaitMinutes} min
                  </strong>
                </div>
              </div>

              {token.status === 'WAITING' && (
                <div className="queue-message waiting-message">
                  <strong>Please wait for your turn.</strong>

                  <span>
                    We'll keep your queue status updated
                    automatically.
                  </span>
                </div>
              )}

              {token.status === 'CALLED' && (
                <div className="queue-message called-message">
                  <strong>
                    It's your turn!
                  </strong>

                  <span>
                    Please proceed to the counter.
                  </span>
                </div>
              )}

              {token.status === 'SERVED' && (
                <div className="queue-message served-message">
                  <strong>
                    Service completed
                  </strong>

                  <span>
                    Your queue visit has been completed.
                  </span>
                </div>
              )}

              {token.status === 'CANCELLED' && (
                <div className="queue-message cancelled-message">
                  <strong>
                    Queue cancelled
                  </strong>

                  <span>
                    Your queue token has been cancelled.
                  </span>
                </div>
              )}

              {token.status === 'WAITING' && (
                <button
                  className="leave-button"
                  onClick={handleLeaveQueue}
                  disabled={leaving}
                >
                  {leaving
                    ? 'Leaving Queue...'
                    : 'Leave Queue'}
                </button>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  )
}

export default QueueStatus