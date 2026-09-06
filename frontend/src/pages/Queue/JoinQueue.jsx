import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { getQueues, joinQueue } from '../../services/queueApi'
import Navbar from '../../components/Navbar'
import './JoinQueue.css'

function JoinQueue() {
  const { serviceId, queueId } = useParams()
  const navigate = useNavigate()

  const [queue, setQueue] = useState(null)
  const [loading, setLoading] = useState(true)
  const [joining, setJoining] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!sessionStorage.getItem('accessToken')) {
      toast.error('Please login to join a queue.', {
        id: 'login-required',
        duration: 2000,
      })

      const timer = setTimeout(() => {
        navigate('/login')
      }, 2000)

      return () => clearTimeout(timer)
    }

    async function loadQueue() {
      try {
        const queues = await getQueues()

        let matchingQueue

        if (queueId) {
          matchingQueue = queues.find(
            (queue) => queue.id === queueId
          )
        } else {
          matchingQueue = queues.find(
            (queue) => queue.serviceId === serviceId
          )
        }

        if (!matchingQueue) {
          setError('No queue is available for this service')
          return
        }

        setQueue(matchingQueue)
      } catch (err) {
        setError(err.message || 'Unable to load queue')
      } finally {
        setLoading(false)
      }
    }

    loadQueue()
  }, [serviceId, queueId, navigate])

  async function handleJoinQueue() {
    if (!sessionStorage.getItem('accessToken')) {
      toast.error('Please login to join a queue.', {
        id: 'login-required',
      })

      return
    }

    try {
      setError('')
      setJoining(true)

      const token = await joinQueue(queue.id)

      navigate(`/queue/status?tokenId=${token.tokenId}`)
    } catch (err) {
      toast.error(err.message || 'Unable to join queue')
    } finally {
      setJoining(false)
    }
  }

  return (
    <div className="queue-page">
      <Navbar />

      <main className="queue-content">
        <button
          className="back-button"
          onClick={() => navigate(-1)}
        >
          ← Back
        </button>

        <div className="queue-card">
          <div className="queue-header">
            <span className="queue-label">
              QUEUE INFORMATION
            </span>

            <h1>Join Queue</h1>

            <p>
              Check the current queue status before
              joining.
            </p>
          </div>

          {loading && (
            <div className="queue-message">
              Loading queue...
            </div>
          )}

          {error && (
            <p className="queue-error">
              {error}
            </p>
          )}

          {!loading && !error && queue && (
            <>
              <div className="queue-stats">
                <div className="queue-stat">
                  <span>People in Queue</span>

                  <strong>
                    {Math.max(
                      0,
                      queue.lastTokenNumber -
                        queue.currentTokenNumber
                    )}
                  </strong>
                </div>

                <div className="queue-stat">
                  <span>Current Token</span>

                  <strong>
                    {queue.currentTokenNumber || 0}
                  </strong>
                </div>
              </div>

              <div className="queue-info-box">
                <span className="info-icon">i</span>

                <p>
                  Your token number will be assigned
                  when you join the queue.
                </p>
              </div>

              <button
                className="join-queue-button"
                onClick={handleJoinQueue}
                disabled={
                  joining ||
                  queue.status !== 'ACTIVE'
                }
              >
                {joining
                  ? 'Joining...'
                  : 'Join Queue'}
              </button>

              {queue.status !== 'ACTIVE' && (
                <p className="queue-error">
                  This queue is currently closed.
                </p>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  )
}

export default JoinQueue