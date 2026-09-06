import { useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import {
  getQueues,
  getQueueTokens,
  callNextToken,
  serveToken,
  cancelToken,
} from '../../services/queueApi'
import { getServiceById } from '../../services/serviceApi'
import Navbar from '../../components/Navbar'
import './StaffDashboard.css'

function StaffDashboard() {
  const [queues, setQueues] = useState([])
  const [selectedQueue, setSelectedQueue] = useState(null)
  const [tokens, setTokens] = useState([])
  const [serviceNames, setServiceNames] = useState({})
  const [loading, setLoading] = useState(true)
  const [tokensLoading, setTokensLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState('')

  const [searchQuery, setSearchQuery] = useState('')
  const [showSuggestions, setShowSuggestions] =
    useState(false)

  const searchRef = useRef(null)

  useEffect(() => {
    async function loadQueues() {
      try {
        const data = await getQueues()

        setQueues(data)

        const uniqueServiceIds = [
          ...new Set(
            data
              .map((queue) => queue.serviceId)
              .filter(Boolean)
          ),
        ]

        const serviceResults = await Promise.all(
          uniqueServiceIds.map(async (serviceId) => {
            try {
              const service =
                await getServiceById(serviceId)

              return {
                serviceId,
                serviceName: service.name,
              }
            } catch {
              return {
                serviceId,
                serviceName: null,
              }
            }
          })
        )

        const serviceNameMap = {}

        serviceResults.forEach(
          ({ serviceId, serviceName }) => {
            if (serviceName) {
              serviceNameMap[serviceId] = serviceName
            }
          }
        )

        setServiceNames(serviceNameMap)

        if (data.length > 0) {
          const activeQueueWithTokens = data.find(
            (queue) =>
              queue.status === 'ACTIVE' &&
              queue.lastTokenNumber > 0
          )

          const initialQueue =
            activeQueueWithTokens || data[0]

          setSelectedQueue(initialQueue)
          setSearchQuery(
            serviceNameMap[initialQueue.serviceId] || ''
          )
        }
      } catch (err) {
        setError(
          err.message || 'Unable to load queues'
        )
      } finally {
        setLoading(false)
      }
    }

    loadQueues()
  }, [])

  useEffect(() => {
    if (!selectedQueue) return

    async function loadTokens() {
      try {
        setTokensLoading(true)

        const data = await getQueueTokens(
          selectedQueue.id
        )

        setTokens(data)
      } catch (err) {
        setTokens([])

        toast.error(
          err.message ||
            'Unable to load queue tokens'
        )
      } finally {
        setTokensLoading(false)
      }
    }

    loadTokens()
 }, [selectedQueue?.id])
 
  /*
   * Keep queue and token information synchronized
   * with changes made from other tabs, such as the
   * Admin dashboard.
   */
  useEffect(() => {
    if (!selectedQueue) return

    const interval = setInterval(async () => {
      try {
        const updatedQueues = await getQueues()

        setQueues(updatedQueues)

        const updatedQueue = updatedQueues.find(
          (queue) =>
            queue.id === selectedQueue.id
        )

        if (updatedQueue) {
          setSelectedQueue((currentQueue) => {
            if (!currentQueue) {
              return updatedQueue
            }

            return {
              ...currentQueue,
              ...updatedQueue,
            }
          })

          try {
            const updatedTokens =
              await getQueueTokens(
                updatedQueue.id
              )

            setTokens(updatedTokens)
          } catch {
            // Keep the existing token list if a
            // background refresh temporarily fails.
          }
        } else {
          setSelectedQueue(null)
          setTokens([])
        }
      } catch {
        // Ignore background refresh failures so that
        // a temporary network issue does not disrupt
        // the staff dashboard.
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [selectedQueue?.id])

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target)
      ) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener(
      'mousedown',
      handleClickOutside
    )

    return () => {
      document.removeEventListener(
        'mousedown',
        handleClickOutside
      )
    }
  }, [])

  async function refreshQueueData() {
    const updatedQueues = await getQueues()

    setQueues(updatedQueues)

    const updatedQueue = updatedQueues.find(
      (queue) =>
        queue.id === selectedQueue.id
    )

    if (updatedQueue) {
      setSelectedQueue(updatedQueue)
    }

    const updatedTokens = await getQueueTokens(
      selectedQueue.id
    )

    setTokens(updatedTokens)
  }

  async function handleCallNext() {
    if (!selectedQueue) return

    try {
      setActionLoading(true)

      const token = await callNextToken(
        selectedQueue.id
      )

      toast.success(
        `Token #${token.tokenNumber} is now being served.`
      )

      await refreshQueueData()
    } catch (err) {
      toast.error(
        err.message ||
          'Unable to call next token'
      )
    } finally {
      setActionLoading(false)
    }
  }

  async function handleServe(tokenId) {
    if (!selectedQueue) return

    try {
      setActionLoading(true)

      await serveToken(tokenId)

      toast.success(
        'Token served successfully.'
      )

      await refreshQueueData()
    } catch (err) {
      toast.error(
        err.message ||
          'Unable to serve token'
      )
    } finally {
      setActionLoading(false)
    }
  }

  async function handleCancel(tokenId) {
    if (!selectedQueue) return

    try {
      setActionLoading(true)

      await cancelToken(tokenId)

      toast.success(
        'Token cancelled successfully.'
      )

      await refreshQueueData()
    } catch (err) {
      toast.error(
        err.message ||
          'Unable to cancel token'
      )
    } finally {
      setActionLoading(false)
    }
  }

  function getServiceName(queue) {
    return (
      serviceNames[queue.serviceId] ||
      `Queue ${queue.id.slice(0, 8)}...`
    )
  }

  function handleSearchChange(event) {
    setSearchQuery(event.target.value)
    setShowSuggestions(true)
  }

  function handleSearchFocus() {
    setShowSuggestions(true)
  }

  function handleSelectQueue(queue) {
    setSelectedQueue(queue)
    setSearchQuery(getServiceName(queue))
    setShowSuggestions(false)
  }

  function handleClearSearch() {
    setSearchQuery('')
    setShowSuggestions(true)
  }

  const filteredQueues = queues.filter((queue) =>
    getServiceName(queue)
      .toLowerCase()
      .includes(searchQuery.trim().toLowerCase())
  )

  return (
    <div className="staff-dashboard">
      <Navbar />

      <main className="staff-content">
        <div className="dashboard-heading">
          <div>
            <h1>Queue Management</h1>

            <p>
              Manage customers waiting in your queue.
            </p>
          </div>
        </div>

        {loading && <p>Loading queues...</p>}

        {error && (
          <p className="dashboard-error">
            {error}
          </p>
        )}

        {!loading &&
          !error &&
          queues.length === 0 && (
            <div className="empty-state">
              <h2>No queues available</h2>

              <p>
                There are currently no queues to manage.
              </p>
            </div>
          )}

        {!loading &&
          !error &&
          queues.length > 0 &&
          selectedQueue && (
            <>
              <div className="queue-selector">
                <label htmlFor="queue-search">
                  Search Queue
                </label>

                <div
                  className="queue-search-wrapper"
                  ref={searchRef}
                >
                  <div className="queue-search">
                    <input
                      id="queue-search"
                      type="text"
                      value={searchQuery}
                      placeholder="Search service..."
                      onChange={handleSearchChange}
                      onFocus={handleSearchFocus}
                      autoComplete="off"
                    />

                    {searchQuery && (
                      <button
                        type="button"
                        className="clear-search"
                        onClick={handleClearSearch}
                        aria-label="Clear search"
                      >
                        ×
                      </button>
                    )}
                  </div>

                  {showSuggestions && (
                    <div className="queue-suggestions">
                      {filteredQueues.length > 0 ? (
                        filteredQueues.map((queue) => (
                          <button
                            type="button"
                            className={`queue-suggestion ${
                              selectedQueue.id ===
                              queue.id
                                ? 'selected'
                                : ''
                            }`}
                            key={queue.id}
                            onClick={() =>
                              handleSelectQueue(queue)
                            }
                          >
                            <span>
                              {getServiceName(queue)}
                            </span>

                            {selectedQueue.id ===
                              queue.id && (
                              <span className="suggestion-check">
                                ✓
                              </span>
                            )}
                          </button>
                        ))
                      ) : (
                        <div className="no-suggestions">
                          No queues found
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="queue-summary">
                <div className="summary-card">
                  <span>Status</span>

                  <strong>
                    {selectedQueue.status}
                  </strong>
                </div>

                <div className="summary-card">
                  <span>Current Token</span>

                  <strong>
                    {selectedQueue.currentTokenNumber ||
                      0}
                  </strong>
                </div>

                <div className="summary-card">
                  <span>Last Token</span>

                  <strong>
                    {selectedQueue.lastTokenNumber ||
                      0}
                  </strong>
                </div>

                <div className="summary-card">
                  <span>Waiting</span>

                  <strong>
                    {
                      tokens.filter(
                        (token) =>
                          token.status ===
                          'WAITING'
                      ).length
                    }
                  </strong>
                </div>
              </div>

              <div className="queue-actions">
                <button
                  className="call-next-button"
                  onClick={handleCallNext}
                  disabled={
                    actionLoading ||
                    selectedQueue.status !==
                      'ACTIVE'
                  }
                >
                  {actionLoading
                    ? 'Processing...'
                    : 'Call Next Token'}
                </button>
              </div>

              <section className="tokens-section">
                <h2>
                  {getServiceName(selectedQueue)} Queue
                </h2>

                {tokensLoading && (
                  <p>Loading tokens...</p>
                )}

                {!tokensLoading &&
                  tokens.length === 0 && (
                    <div className="empty-state">
                      <p>
                        No customers have joined this
                        queue yet.
                      </p>
                    </div>
                  )}

                {!tokensLoading &&
                  tokens.length > 0 && (
                    <div className="tokens-list">
                      {tokens.map((token) => (
                        <div
                          className="token-card"
                          key={token.id}
                        >
                          <div className="token-number">
                            <span>Token</span>

                            <strong>
                              #{token.tokenNumber}
                            </strong>
                          </div>

                          <div className="token-status">
                            <span>Status</span>

                            <strong>
                              {token.status}
                            </strong>
                          </div>

                          <div className="token-actions">
                            {token.status ===
                              'CALLED' && (
                              <button
                                className="serve-button"
                                onClick={() =>
                                  handleServe(
                                    token.id
                                  )
                                }
                                disabled={
                                  actionLoading
                                }
                              >
                                Serve
                              </button>
                            )}

                            {token.status ===
                              'WAITING' && (
                              <button
                                className="cancel-button"
                                onClick={() =>
                                  handleCancel(
                                    token.id
                                  )
                                }
                                disabled={
                                  actionLoading
                                }
                              >
                                Cancel
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

export default StaffDashboard