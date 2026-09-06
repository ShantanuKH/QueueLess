import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { getServiceCenters } from '../../services/api'
import { askAiAssistant } from '../../services/aiApi'
import './Home.css'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'

function Home() {
  const navigate = useNavigate()

  const [search, setSearch] = useState('')
  const [serviceCenters, setServiceCenters] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [aiMessage, setAiMessage] = useState('')
  const [aiResponse, setAiResponse] = useState(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState('')

  // Initial service center load
  useEffect(() => {
    async function loadServiceCenters() {
      try {
        const data = await getServiceCenters()
        setServiceCenters(data)
      } catch {
        setError('Unable to load service centers')
      } finally {
        setLoading(false)
      }
    }

    loadServiceCenters()
  }, [])

  /*
   * Keep service center status synchronized with changes
   * made from the Admin dashboard.
   *
   * This runs every 5 seconds without showing the
   * "Loading service centers..." message again.
   */
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const updatedCenters = await getServiceCenters()
        setServiceCenters(updatedCenters)
      } catch {
        // Ignore background refresh failures
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const filteredCenters = serviceCenters.filter((center) =>
    `${center.name} ${center.location || ''}`
      .toLowerCase()
      .includes(search.toLowerCase())
  )

  function handleRecommendedQueue() {
    if (!aiResponse?.recommendedQueueId) {
      return
    }

    const user = JSON.parse(sessionStorage.getItem('user'))

    if (user) {
      navigate(
        `/queue/join-by-queue/${aiResponse.recommendedQueueId}`
      )
      return
    }

    toast.error('Please login to join a queue.', {
      id: 'login-required',
      duration: 2000,
    })

    setTimeout(() => {
      navigate('/login')
    }, 2000)
  }

  async function handleAiAsk(e) {
    e.preventDefault()

    if (!aiMessage.trim()) {
      return
    }

    try {
      setAiLoading(true)
      setAiError('')
      setAiResponse(null)

      const data = await askAiAssistant(aiMessage.trim())

      setAiResponse(data)
    } catch (err) {
      setAiError(
        err.message || 'Unable to connect to QueueLess AI'
      )
    } finally {
      setAiLoading(false)
    }
  }

  function handleSuggestion(suggestion) {
    setAiMessage(suggestion)
    setAiResponse(null)
    setAiError('')
  }

  /*
   * Convert the current AI response into clean text.
   * This removes Markdown **bold** markers from the LLM response.
   */
  function cleanAiMessage(message) {
    if (!message) {
      return ''
    }

    return message
      .replace(/\*\*/g, '')
      .replace(/\n+/g, ' ')
      .trim()
  }

  /*
   * Extract useful information from the current backend AI response.
   *
   * Example:
   * "I'd recommend joining the Passport Renewal queue at the
   * City Passport & Visa Center (Kothrud Main Road, Pune).
   * Its queue is ACTIVE with no people waiting, so the estimated
   * wait is currently 0 minutes..."
   */
  function getRecommendationDetails(message) {
    const cleanMessage = cleanAiMessage(message)

    let centerName = 'Recommended Service Center'
    let address = ''
    let peopleWaiting = null
    let estimatedWait = null
    let serviceName = ''

    const queueMatch = cleanMessage.match(
      /(?:recommend joining|recommend the)\s+(?:the\s+)?(.+?)\s+queue\s+at\s+the\s+(.+?)\s+\((.+?)\)/i
    )

    if (queueMatch) {
      serviceName = queueMatch[1].trim()
      centerName = queueMatch[2].trim()
      address = queueMatch[3].trim()
    }

    const peopleMatch = cleanMessage.match(
      /(?:with|has)\s+(?:no\s+)?(\d+)\s+people\s+waiting/i
    )

    if (peopleMatch) {
      peopleWaiting = Number(peopleMatch[1])
    } else if (/no people waiting/i.test(cleanMessage)) {
      peopleWaiting = 0
    }

    const waitMatch = cleanMessage.match(
      /(?:estimated wait|wait)\s+(?:is\s+currently\s+)?(?:around\s+)?(\d+)\s*minutes/i
    )

    if (waitMatch) {
      estimatedWait = Number(waitMatch[1])
    }

    const active =
      /queue is ACTIVE|currently active|is active/i.test(
        cleanMessage
      )

    return {
      message: cleanMessage,
      centerName,
      address,
      serviceName,
      peopleWaiting,
      estimatedWait,
      active,
    }
  }

  const recommendation = aiResponse
    ? getRecommendationDetails(aiResponse.message)
    : null

  return (
    <div className="home">
      <Navbar />

      <main>
        <section className="hero">
          <h1>
            Skip the queue.
            <br />
            Save your time.
          </h1>

          <p>
            Find a service center, check the queue,
            and join when you're ready.
          </p>

          {/* ================================
              QUEUELESS AI
          ================================= */}

          <div className="ai-card">
            <div className="ai-header">
              <div className="ai-title-row">
                <div
                  className="ai-icon"
                  aria-label="QueueLess AI"
                >
                  <span className="ai-brand-icon">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M12 2L13.8 9.2L21 11L13.8 12.8L12 20L10.2 12.8L3 11L10.2 9.2L12 2Z"
                        fill="currentColor"
                      />
                      <path
                        d="M19 16L19.7 18.3L22 19L19.7 19.7L19 22L18.3 19.7L16 19L18.3 18.3L19 16Z"
                        fill="currentColor"
                      />
                    </svg>
                  </span>
                </div>

                <div>
                  <span className="ai-label">
                    QUEUELESS AI
                  </span>

                  <h2>
                    What can we help you with today?
                  </h2>
                </div>
              </div>

              <span className="ai-subtitle">
                Your smart service assistant
              </span>
            </div>

            <form
              className="ai-form"
              onSubmit={handleAiAsk}
            >
              <div className="ai-input-wrapper">
                <span className="ai-input-icon">
                  ⌕
                </span>

                <input
                  type="text"
                  placeholder="Tell us what you need... e.g. renew my passport, update Aadhaar"
                  value={aiMessage}
                  onChange={(e) =>
                    setAiMessage(e.target.value)
                  }
                  disabled={aiLoading}
                />

                <button
                  type="submit"
                  className="ai-submit-button"
                  disabled={
                    aiLoading || !aiMessage.trim()
                  }
                  aria-label="Ask QueueLess AI"
                >
                  {aiLoading ? '...' : '→'}
                </button>
              </div>
            </form>

            <div className="ai-suggestions">
              <span>Try asking:</span>

              <button
                type="button"
                onClick={() =>
                  handleSuggestion(
                    'I need to renew my passport'
                  )
                }
              >
                Renew my passport
              </button>

              <button
                type="button"
                onClick={() =>
                  handleSuggestion(
                    'I need to update my Aadhaar'
                  )
                }
              >
                Update my Aadhaar
              </button>

              <button
                type="button"
                onClick={() =>
                  handleSuggestion(
                    'Find a nearby service'
                  )
                }
              >
                Find a nearby service
              </button>

              <button
                type="button"
                onClick={() =>
                  handleSuggestion(
                    'Check driving license queue'
                  )
                }
              >
                Check driving license queue
              </button>
            </div>

            {aiError && (
              <div className="ai-error">
                {aiError}
              </div>
            )}

            {/* ================================
                AI RECOMMENDATION
            ================================= */}

            {aiResponse && recommendation && (
              <div className="ai-recommendation">
                <div className="recommendation-main">
                  <div className="recommendation-icon">
                    <span className="ai-brand-icon">
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M12 2L13.8 9.2L21 11L13.8 12.8L12 20L10.2 12.8L3 11L10.2 9.2L12 2Z"
                          fill="currentColor"
                        />
                        <path
                          d="M19 16L19.7 18.3L22 19L19.7 19.7L19 22L18.3 19.7L16 19L18.3 18.3L19 16Z"
                          fill="currentColor"
                        />
                      </svg>
                    </span>
                  </div>

                  <div className="recommendation-details">
                    <span className="recommendation-label">
                      RECOMMENDED FOR YOU
                    </span>

                    <h3>
                      {recommendation.centerName}
                    </h3>

                    {recommendation.address && (
                      <p className="recommendation-address">
                        <span>📍</span>
                        {recommendation.address}
                      </p>
                    )}

                    {recommendation.serviceName && (
                      <p className="recommendation-service">
                        Best option for{' '}
                        <strong>
                          {recommendation.serviceName}
                        </strong>
                      </p>
                    )}
                  </div>

                  <div
                    className={
                      recommendation.active
                        ? 'recommendation-status active'
                        : 'recommendation-status'
                    }
                  >
                    <span className="status-dot"></span>

                    {recommendation.active
                      ? 'Currently Active'
                      : 'Currently Unavailable'}
                  </div>
                </div>

                <div className="recommendation-stats">
                  <div className="recommendation-stat">
                    <span className="stat-icon">
                      👥
                    </span>

                    <div>
                      <span className="stat-label">
                        People waiting
                      </span>

                      <strong>
                        {recommendation.peopleWaiting !== null
                          ? recommendation.peopleWaiting
                          : '—'}
                      </strong>
                    </div>
                  </div>

                  <div className="stat-divider"></div>

                  <div className="recommendation-stat">
                    <span className="stat-icon">
                      ◷
                    </span>

                    <div>
                      <span className="stat-label">
                        Estimated wait time
                      </span>

                      <strong>
                        {recommendation.estimatedWait !== null
                          ? `${recommendation.estimatedWait} minutes`
                          : '—'}
                      </strong>
                    </div>
                  </div>
                </div>

                <p className="recommendation-message">
                  {recommendation.message}
                </p>

                {aiResponse.recommendedQueueId && (
                  <button
                    className="ai-recommendation-button"
                    onClick={handleRecommendedQueue}
                  >
                    View Recommended Queue →
                  </button>
                )}
              </div>
            )}
          </div>

          {/* ================================
              OR DIVIDER
          ================================= */}

          <div className="search-divider">
            <span>or</span>
          </div>

          {/* ================================
              SERVICE CENTER SEARCH
          ================================= */}

          <div className="search-container">
            <span className="search-icon">
              ⌕
            </span>

            <input
              type="text"
              placeholder="Search service centers..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />
          </div>
        </section>

        {/* ================================
            SERVICE CENTERS
        ================================= */}

        <section className="centers-section">
          <h2>Service Centers</h2>

          {loading && (
            <p>Loading service centers...</p>
          )}

          {error && <p>{error}</p>}

          {!loading && !error && (
            <>
              <div className="centers-grid">
                {filteredCenters.map((center) => (
                  <div
                    className="center-card"
                    key={center.id}
                  >
                    <div className="card-header">
                      <h3>{center.name}</h3>

                      <span
                        className={
                          center.status === 'ACTIVE'
                            ? 'status open'
                            : 'status closed'
                        }
                      >
                        {center.status}
                      </span>
                    </div>

                    <p className="location">
                      📍 {center.addressLine},{' '}
                      {center.city},{' '}
                      {center.state}
                      {center.postalCode
                        ? ` - ${center.postalCode}`
                        : ''}
                    </p>

                    <button
                      className="view-button"
                      onClick={() => {
                        if (center.status !== 'ACTIVE') {
                          return
                        }

                        navigate(`/service-centers/${center.id}`)
                      }}
                      disabled={center.status !== 'ACTIVE'}
                    >
                      {center.status === 'ACTIVE'
                        ? 'View Services'
                        : 'Unavailable'}
                    </button>
                  </div>
                ))}
              </div>

              {filteredCenters.length === 0 && (
                <p className="no-results">
                  No service centers found.
                </p>
              )}
            </>
          )}
        </section>
      </main>

      <Footer />
    </div>
  )
}

export default Home