import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getServicesByCenter } from '../../services/api'
import Navbar from '../../components/Navbar'
import './ServiceCenter.css'

function ServiceCenter() {
  const { centerId } = useParams()
  const navigate = useNavigate()

  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadServices() {
      try {
        const data = await getServicesByCenter(centerId)
        setServices(data)
      } catch {
        setError('Unable to load services')
      } finally {
        setLoading(false)
      }
    }

    loadServices()
  }, [centerId])

  /*
   * Keep service status synchronized with changes
   * made from the Admin dashboard.
   */
  useEffect(() => {
    if (!centerId) return

    const interval = setInterval(async () => {
      try {
        const updatedServices =
          await getServicesByCenter(centerId)

        setServices(updatedServices)
      } catch {
        // Ignore background refresh failures so that
        // a temporary network issue does not disrupt
        // the customer page.
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [centerId])

  return (
    <div className="service-center-page">
      <Navbar />

      <main className="services-section">
        <button
          className="back-button"
          onClick={() => navigate('/')}
        >
          ← Back to Service Centers
        </button>

        <div className="services-header">
          <h1>Available Services</h1>

          <p>
            Select a service below to join its queue.
          </p>
        </div>

        {loading && (
          <p className="services-message">
            Loading services...
          </p>
        )}

        {error && (
          <p className="services-error">
            {error}
          </p>
        )}

        {!loading &&
          !error &&
          services.length === 0 && (
            <p className="no-results">
              No services available.
            </p>
          )}

        {!loading &&
          !error &&
          services.length > 0 && (
            <div className="services-grid">
              {services.map((service) => {
                const isActive =
                  service.status === 'ACTIVE'

                return (
                  <div
                    className="service-card"
                    key={service.id}
                  >
                    <div className="service-card-content">
                      <div className="service-card-header">
                        <h3>{service.name}</h3>

                        <span
                          className={`service-status ${
                            isActive
                              ? 'active'
                              : 'inactive'
                          }`}
                        >
                          {isActive
                            ? 'AVAILABLE'
                            : 'UNAVAILABLE'}
                        </span>
                      </div>

                      {service.description && (
                        <p className="service-description">
                          {service.description}
                        </p>
                      )}
                    </div>

                    <button
                      className="join-button"
                      onClick={() =>
                        navigate(
                          `/queue/join/${service.id}`
                        )
                      }
                      disabled={!isActive}
                    >
                      {isActive
                        ? 'Join Queue'
                        : 'Unavailable'}
                    </button>
                  </div>
                )
              })}
            </div>
          )}
      </main>
    </div>
  )
}

export default ServiceCenter