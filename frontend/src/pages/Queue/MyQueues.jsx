import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  getCustomerTokenHistory,
  getTokenStatus,
  leaveQueue,
  deleteCustomerToken,
  deleteCustomerTokenHistory,
} from '../../services/queueApi'
import Navbar from '../../components/Navbar'
import './MyQueues.css'

function MyQueues() {
  const navigate = useNavigate()

  const [tokens, setTokens] = useState([])
  const [currentToken, setCurrentToken] = useState(null)
  const [loading, setLoading] = useState(true)
  const [leaving, setLeaving] = useState(false)
  const [error, setError] = useState('')

  const currentTokenId = currentToken?.tokenId

  useEffect(() => {
    loadHistory()
  }, [])

  useEffect(() => {
    if (!currentTokenId) {
      return
    }

    let intervalId
    let cancelled = false

    async function updateCurrentToken() {
      try {
        const data = await getTokenStatus(
          currentTokenId
        )

        if (cancelled) {
          return
        }

        /*
         * Keep the current queue information
         * synchronized with the backend.
         */
        if (
          data.status === 'SERVED' ||
          data.status === 'CANCELLED'
        ) {
          setCurrentToken(null)

          /*
           * Refresh history so the completed token
           * appears with its final status.
           *
           * Loading state is not shown here to avoid
           * flickering the entire page.
           */
          await loadHistory(false)

          return
        }

        setCurrentToken(data)

        /*
         * Keep Queue History synchronized with the
         * latest live token status.
         */
        setTokens((previousTokens) =>
          previousTokens.map((token) =>
            token.tokenId === data.tokenId
              ? {
                  ...token,
                  status: data.status,
                  updatedAt:
                    data.updatedAt ||
                    token.updatedAt,
                }
              : token
          )
        )
      } catch (err) {
        if (!cancelled) {
          console.error(
            'Unable to update current queue:',
            err
          )
        }
      }
    }

    intervalId = setInterval(
      updateCurrentToken,
      5000
    )

    return () => {
      cancelled = true
      clearInterval(intervalId)
    }
  }, [currentTokenId])

  async function loadHistory(showLoading = true) {
    try {
      if (showLoading) {
        setLoading(true)
      }

      setError('')

      const data =
        await getCustomerTokenHistory()

      setTokens(data)

      const activeToken = data.find(
        (token) =>
          token.status === 'WAITING' ||
          token.status === 'CALLED'
      )

      if (activeToken) {
        try {
          const status = await getTokenStatus(
            activeToken.tokenId
          )

          setCurrentToken(status)
        } catch {
          setCurrentToken(null)
        }
      } else {
        setCurrentToken(null)
      }
    } catch (err) {
      setError(
        err.message ||
          'Unable to load your queue history'
      )
    } finally {
      if (showLoading) {
        setLoading(false)
      }
    }
  }

  async function handleLeaveQueue() {
    try {
      setLeaving(true)

      await leaveQueue()

      toast.success(
        'You have left the queue'
      )

      await loadHistory()
    } catch (err) {
      toast.error(
        err.message ||
          'Unable to leave queue'
      )
    } finally {
      setLeaving(false)
    }
  }

  async function handleDeleteToken(tokenId) {
    const confirmed = window.confirm(
      'Are you sure you want to delete this queue history?'
    )

    if (!confirmed) {
      return
    }

    try {
      await deleteCustomerToken(tokenId)

      toast.success(
        'Queue history deleted'
      )

      await loadHistory()
    } catch (err) {
      toast.error(
        err.message ||
          'Unable to delete queue history'
      )
    }
  }

  async function handleClearHistory() {
    const confirmed = window.confirm(
      'Are you sure you want to clear your entire queue history?'
    )

    if (!confirmed) {
      return
    }

    try {
      await deleteCustomerTokenHistory()

      toast.success(
        'Queue history cleared'
      )

      await loadHistory()
    } catch (err) {
      toast.error(
        err.message ||
          'Unable to clear queue history'
      )
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

  function formatDate(dateString) {
    if (!dateString) {
      return '-'
    }

    return new Date(dateString).toLocaleString(
      'en-IN',
      {
        dateStyle: 'medium',
        timeStyle: 'short',
      }
    )
  }

  return (
    <div className="my-queues-page">
      <Navbar />

      <main className="my-queues-content">
        <button
          className="back-button"
          onClick={() => navigate('/')}
          disabled={leaving}
        >
          ← Back to Home
        </button>

        <div className="page-header">
          <span className="page-label">
            MY QUEUES
          </span>

          <h1>Your Queue Activity</h1>

          <p>
            View your current queue and previous
            queue visits.
          </p>
        </div>

        {loading && (
          <div className="status-message">
            Loading your queues...
          </div>
        )}

        {error && (
          <p className="queue-error">
            {error}
          </p>
        )}

        {!loading && !error && (
          <>
            {currentToken && (
              <section className="current-queue-section">
                <div className="section-heading">
                  <h2>Current Queue</h2>

                  <span className="live-badge">
                    ● LIVE
                  </span>
                </div>

                <div className="current-queue-card">
                  <div className="current-queue-main">
                    <div className="token-number">
                      <span>Your Token</span>

                      <strong>
                        {currentToken.tokenNumber}
                      </strong>
                    </div>

                    <div
                      className={`current-status ${getStatusClass(
                        currentToken.status
                      )}`}
                    >
                      <span className="status-dot" />

                      <strong>
                        {currentToken.status}
                      </strong>
                    </div>
                  </div>

                  <div className="queue-info">
                    <div className="queue-info-item">
                      <span>People Ahead</span>

                      <strong>
                        {currentToken.peopleAhead}
                      </strong>
                    </div>

                    <div className="queue-info-item">
                      <span>
                        Estimated Wait
                      </span>

                      <strong>
                        {
                          currentToken.estimatedWaitMinutes
                        }{' '}
                        min
                      </strong>
                    </div>
                  </div>

                  {currentToken.status ===
                    'WAITING' && (
                    <div className="queue-message waiting-message">
                      <strong>
                        Please wait for your turn.
                      </strong>

                      <span>
                        Your queue position is
                        updated automatically.
                      </span>
                    </div>
                  )}

                  {currentToken.status ===
                    'CALLED' && (
                    <div className="queue-message called-message">
                      <strong>
                        It's your turn!
                      </strong>

                      <span>
                        Please proceed to the
                        counter.
                      </span>
                    </div>
                  )}

                  {currentToken.status ===
                    'WAITING' && (
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
                </div>
              </section>
            )}

            {!currentToken && (
              <section className="empty-current-queue">
                <h2>No Active Queue</h2>

                <p>
                  You are not currently waiting in
                  any queue.
                </p>

                <button
                  className="browse-button"
                  onClick={() => navigate('/')}
                >
                  Find a Service
                </button>
              </section>
            )}

            <section className="history-section">
              <div className="section-heading">
                <h2>Queue History</h2>

                {tokens.some(
                  (token) =>
                    token.status === 'SERVED' ||
                    token.status === 'CANCELLED'
                ) && (
                  <button
                    className="clear-history-button"
                    onClick={handleClearHistory}
                  >
                    Clear History
                  </button>
                )}
              </div>

              {tokens.length === 0 ? (
                <div className="empty-history">
                  <p>
                    You haven't joined any queues
                    yet.
                  </p>
                </div>
              ) : (
                <div className="history-list">
                  {tokens.map((token) => (
                    <div
                      className="history-card"
                      key={token.tokenId}
                    >
                      <div className="history-token">
                        <span>Token</span>

                        <strong>
                          {token.tokenNumber}
                        </strong>
                      </div>

                      <div className="history-details">
                        <h3>
                          {token.serviceName}
                        </h3>

                        <p>
                          {token.serviceCenterName}
                        </p>

                        <span>
                          {formatDate(
                            token.createdAt
                          )}
                        </span>
                      </div>

                      <div className="history-actions">
                        <div
                          className={`history-status ${getStatusClass(
                            token.status
                          )}`}
                        >
                          <span className="status-dot" />

                          {token.status}
                        </div>

                        {(token.status ===
                          'SERVED' ||
                          token.status ===
                            'CANCELLED') && (
                          <button
                            className="delete-history-button"
                            onClick={() =>
                              handleDeleteToken(
                                token.tokenId
                              )
                            }
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  )
}

export default MyQueues