import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import Navbar from '../../components/Navbar'
import { getServiceCenters } from '../../services/serviceCenterApi'
import {
  getServicesByCenter,
  createService,
  updateService,
  changeServiceStatus,
} from '../../services/serviceApi'
import {
  getQueues,
  createQueue,
  openQueue,
  closeQueue,
} from '../../services/queueApi'
import './ServiceCenterManagement.css'

function ServiceCenterManagement() {
  const navigate = useNavigate()
  const { centerId } = useParams()

  const [serviceCenter, setServiceCenter] = useState(null)
  const [services, setServices] = useState([])
  const [queues, setQueues] = useState([])

  const [loading, setLoading] = useState(true)
  const [servicesLoading, setServicesLoading] = useState(true)
  const [queuesLoading, setQueuesLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [showServiceForm, setShowServiceForm] = useState(false)
  const [editingService, setEditingService] = useState(null)

  const [showQueueForm, setShowQueueForm] = useState(false)
  const [selectedServiceId, setSelectedServiceId] = useState('')

  const [serviceForm, setServiceForm] = useState({
    name: '',
    description: '',
    estimatedServiceTimeMinutes: '',
  })

  useEffect(() => {
    async function loadServiceCenter() {
      try {
        setLoading(true)
        setError('')

        const centers = await getServiceCenters()

        const center = centers.find(
          (item) => item.id === centerId
        )

        if (!center) {
          throw new Error('Service center not found')
        }

        setServiceCenter(center)
      } catch (err) {
        setError(
          err.message || 'Unable to load service center'
        )
      } finally {
        setLoading(false)
      }
    }

    loadServiceCenter()
  }, [centerId])

  useEffect(() => {
    async function loadServices() {
      try {
        setServicesLoading(true)

        const data = await getServicesByCenter(centerId)

        setServices(data)
      } catch (err) {
        toast.error(
          err.message || 'Unable to load services'
        )
      } finally {
        setServicesLoading(false)
      }
    }

    if (centerId) {
      loadServices()
    }
  }, [centerId])

  useEffect(() => {
    async function loadQueues() {
      try {
        setQueuesLoading(true)

        const data = await getQueues()

        setQueues(data)
      } catch (err) {
        toast.error(
          err.message || 'Unable to load queues'
        )
      } finally {
        setQueuesLoading(false)
      }
    }

    if (centerId) {
      loadQueues()
    }
  }, [centerId])

  function handleBack() {
    navigate('/admin')
  }

  // ------------------------------------------------------------
  // SERVICE MANAGEMENT
  // ------------------------------------------------------------

  function openCreateServiceForm() {
    setEditingService(null)

    setServiceForm({
      name: '',
      description: '',
      estimatedServiceTimeMinutes: '',
    })

    setShowServiceForm(true)
  }

  function openEditServiceForm(service) {
    setEditingService(service)

    setServiceForm({
      name: service.name,
      description: service.description || '',
      estimatedServiceTimeMinutes:
        service.estimatedServiceTimeMinutes,
    })

    setShowServiceForm(true)
  }

  function closeServiceForm() {
    if (saving) {
      return
    }

    setShowServiceForm(false)
    setEditingService(null)
  }

  function handleServiceInputChange(event) {
    const { name, value } = event.target

    setServiceForm((current) => ({
      ...current,
      [name]: value,
    }))
  }

  async function handleServiceSubmit(event) {
    event.preventDefault()

    try {
      setSaving(true)

      const data = {
        name: serviceForm.name.trim(),
        description: serviceForm.description.trim(),
        estimatedServiceTimeMinutes: Number(
          serviceForm.estimatedServiceTimeMinutes
        ),
      }

      if (editingService) {
        const updatedService = await updateService(
          editingService.id,
          data
        )

        setServices((current) =>
          current.map((service) =>
            service.id === updatedService.id
              ? updatedService
              : service
          )
        )

        toast.success('Service updated successfully')
      } else {
        const newService = await createService(
          centerId,
          data
        )

        setServices((current) => [
          ...current,
          newService,
        ])

        toast.success('Service created successfully')
      }

      setShowServiceForm(false)
      setEditingService(null)
    } catch (err) {
      toast.error(
        err.message || 'Unable to save service'
      )
    } finally {
      setSaving(false)
    }
  }

  async function handleServiceStatusChange(service) {
    const newStatus =
      service.status === 'ACTIVE'
        ? 'INACTIVE'
        : 'ACTIVE'

    try {
      setSaving(true)

      const updatedService =
        await changeServiceStatus(
          service.id,
          newStatus
        )

      setServices((current) =>
        current.map((item) =>
          item.id === updatedService.id
            ? updatedService
            : item
        )
      )

      toast.success(
        newStatus === 'ACTIVE'
          ? 'Service activated'
          : 'Service deactivated'
      )
    } catch (err) {
      toast.error(
        err.message ||
          'Unable to change service status'
      )
    } finally {
      setSaving(false)
    }
  }

  // ------------------------------------------------------------
  // QUEUE MANAGEMENT
  // ------------------------------------------------------------

  const centerQueues = queues.filter((queue) =>
    services.some(
      (service) => service.id === queue.serviceId
    )
  )

  const availableServices = services.filter(
    (service) =>
      !queues.some(
        (queue) => queue.serviceId === service.id
      )
  )

  function openCreateQueueForm() {
    setSelectedServiceId('')
    setShowQueueForm(true)
  }

  function closeQueueForm() {
    if (saving) {
      return
    }

    setShowQueueForm(false)
    setSelectedServiceId('')
  }

  async function handleCreateQueue(event) {
    event.preventDefault()

    if (!selectedServiceId) {
      toast.error('Please select a service')
      return
    }

    try {
      setSaving(true)

      const newQueue =
        await createQueue(selectedServiceId)

      setQueues((current) => [
        ...current,
        newQueue,
      ])

      toast.success('Queue created successfully')

      setShowQueueForm(false)
      setSelectedServiceId('')
    } catch (err) {
      toast.error(
        err.message || 'Unable to create queue'
      )
    } finally {
      setSaving(false)
    }
  }

  async function handleQueueStatusChange(queue) {
    try {
      setSaving(true)

      const updatedQueue =
        queue.status === 'ACTIVE'
          ? await closeQueue(queue.id)
          : await openQueue(queue.id)

      setQueues((current) =>
        current.map((item) =>
          item.id === updatedQueue.id
            ? updatedQueue
            : item
        )
      )

      toast.success(
        updatedQueue.status === 'ACTIVE'
          ? 'Queue opened successfully'
          : 'Queue closed successfully'
      )
    } catch (err) {
      toast.error(
        err.message || 'Unable to change queue status'
      )
    } finally {
      setSaving(false)
    }
  }

  function getServiceName(serviceId) {
    const service = services.find(
      (item) => item.id === serviceId
    )

    return service
      ? service.name
      : 'Unknown Service'
  }

  // ------------------------------------------------------------
  // LOADING / ERROR
  // ------------------------------------------------------------

  if (loading) {
    return (
      <div className="service-center-management">
        <Navbar />

        <main className="service-center-management-content">
          <p className="admin-message">
            Loading service center...
          </p>
        </main>
      </div>
    )
  }

  if (error || !serviceCenter) {
    return (
      <div className="service-center-management">
        <Navbar />

        <main className="service-center-management-content">
          <button
            className="back-link"
            onClick={handleBack}
          >
            ← Back to Service Centers
          </button>

          <div className="admin-error">
            {error || 'Service center not found'}
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="service-center-management">
      <Navbar />

      <main className="service-center-management-content">
        <button
          className="back-link"
          onClick={handleBack}
        >
          ← Back to Service Centers
        </button>

        <div className="management-header">
          <div>
            <div className="management-title">
              <h1>{serviceCenter.name}</h1>

              <span
                className={`status-badge ${
                  serviceCenter.status === 'ACTIVE'
                    ? 'status-active'
                    : 'status-inactive'
                }`}
              >
                {serviceCenter.status}
              </span>
            </div>

            {serviceCenter.description && (
              <p className="management-description">
                {serviceCenter.description}
              </p>
            )}

            <p className="management-location">
              {serviceCenter.addressLine},{' '}
              {serviceCenter.city},{' '}
              {serviceCenter.state}
              {serviceCenter.postalCode
                ? ` - ${serviceCenter.postalCode}`
                : ''}
            </p>

            {serviceCenter.phone && (
              <p className="management-phone">
                Phone: {serviceCenter.phone}
              </p>
            )}
          </div>
        </div>

        {/* SERVICES */}

        <section className="management-section">
          <div className="section-header">
            <div>
              <h2>Services</h2>
              <p>
                Manage services offered by this service
                center.
              </p>
            </div>

            <button
              className="primary-button"
              onClick={openCreateServiceForm}
            >
              + Add Service
            </button>
          </div>

          {servicesLoading ? (
            <p className="admin-message">
              Loading services...
            </p>
          ) : services.length === 0 ? (
            <div className="management-placeholder">
              <h3>No Services Yet</h3>

              <p>
                Add the first service offered by this
                service center.
              </p>
            </div>
          ) : (
            <div className="services-list">
              {services.map((service) => (
                <div
                  className="service-management-card"
                  key={service.id}
                >
                  <div className="service-management-info">
                    <div className="service-management-title">
                      <h3>{service.name}</h3>

                      <span
                        className={`status-badge ${
                          service.status === 'ACTIVE'
                            ? 'status-active'
                            : 'status-inactive'
                        }`}
                      >
                        {service.status}
                      </span>
                    </div>

                    {service.description && (
                      <p className="service-description">
                        {service.description}
                      </p>
                    )}

                    <p className="service-time">
                      Estimated service time:{' '}
                      <strong>
                        {service.estimatedServiceTimeMinutes}{' '}
                        min
                      </strong>
                    </p>
                  </div>

                  <div className="service-management-actions">
                    <button
                      className="secondary-button"
                      onClick={() =>
                        openEditServiceForm(service)
                      }
                      disabled={saving}
                    >
                      Edit
                    </button>

                    <button
                      className={
                        service.status === 'ACTIVE'
                          ? 'danger-button'
                          : 'activate-button'
                      }
                      onClick={() =>
                        handleServiceStatusChange(
                          service
                        )
                      }
                      disabled={saving}
                    >
                      {service.status === 'ACTIVE'
                        ? 'Deactivate'
                        : 'Activate'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* QUEUES */}

        <section className="management-section">
          <div className="section-header">
            <div>
              <h2>Queues</h2>
              <p>
                Manage queues for this service center.
              </p>
            </div>

            <button
              className="primary-button"
              onClick={openCreateQueueForm}
              disabled={
                queuesLoading ||
                availableServices.length === 0
              }
            >
              + Create Queue
            </button>
          </div>

          {queuesLoading ? (
            <p className="admin-message">
              Loading queues...
            </p>
          ) : centerQueues.length === 0 ? (
            <div className="management-placeholder">
              <h3>No Queues Yet</h3>

              <p>
                Create a queue for one of the services
                above.
              </p>
            </div>
          ) : (
            <div className="services-list">
              {centerQueues.map((queue) => (
                <div
                  className="service-management-card"
                  key={queue.id}
                >
                  <div className="service-management-info">
                    <div className="service-management-title">
                      <h3>
                        {getServiceName(
                          queue.serviceId
                        )}
                      </h3>

                      <span
                        className={`status-badge ${
                          queue.status === 'ACTIVE'
                            ? 'status-active'
                            : 'status-inactive'
                        }`}
                      >
                        {queue.status}
                      </span>
                    </div>

                    <p className="service-time">
                      Current Token:{' '}
                      <strong>
                        {queue.currentTokenNumber}
                      </strong>
                    </p>

                    <p className="service-time">
                      Last Token:{' '}
                      <strong>
                        {queue.lastTokenNumber}
                      </strong>
                    </p>
                  </div>

                  <div className="service-management-actions">
                    <button
                      className={
                        queue.status === 'ACTIVE'
                          ? 'danger-button'
                          : 'activate-button'
                      }
                      onClick={() =>
                        handleQueueStatusChange(
                          queue
                        )
                      }
                      disabled={saving}
                    >
                      {queue.status === 'ACTIVE'
                        ? 'Close Queue'
                        : 'Open Queue'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* SERVICE FORM MODAL */}

      {showServiceForm && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <div>
                <h2>
                  {editingService
                    ? 'Edit Service'
                    : 'Add Service'}
                </h2>

                <p>
                  {editingService
                    ? 'Update the service details.'
                    : 'Add a new service to this service center.'}
                </p>
              </div>

              <button
                className="modal-close"
                onClick={closeServiceForm}
                disabled={saving}
              >
                ×
              </button>
            </div>

            <form
              onSubmit={handleServiceSubmit}
              className="admin-form"
            >
              <label>
                Service Name
                <input
                  type="text"
                  name="name"
                  value={serviceForm.name}
                  onChange={handleServiceInputChange}
                  placeholder="e.g. Passport Renewal"
                  required
                />
              </label>

              <label>
                Description
                <textarea
                  name="description"
                  value={serviceForm.description}
                  onChange={handleServiceInputChange}
                  placeholder="Describe this service"
                  rows="4"
                />
              </label>

              <label>
                Estimated Service Time (minutes)
                <input
                  type="number"
                  name="estimatedServiceTimeMinutes"
                  value={
                    serviceForm.estimatedServiceTimeMinutes
                  }
                  onChange={handleServiceInputChange}
                  min="1"
                  placeholder="e.g. 10"
                  required
                />
              </label>

              <div className="modal-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={closeServiceForm}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-button"
                  disabled={saving}
                >
                  {saving
                    ? 'Saving...'
                    : editingService
                      ? 'Update Service'
                      : 'Create Service'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QUEUE FORM MODAL */}

      {showQueueForm && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <div>
                <h2>Create Queue</h2>

                <p>
                  Create a queue for one of this service
                  center's services.
                </p>
              </div>

              <button
                className="modal-close"
                onClick={closeQueueForm}
                disabled={saving}
              >
                ×
              </button>
            </div>

            <form
              onSubmit={handleCreateQueue}
              className="admin-form"
            >
              <label>
                Service
                <select
                  value={selectedServiceId}
                  onChange={(event) =>
                    setSelectedServiceId(
                      event.target.value
                    )
                  }
                  required
                >
                  <option value="">
                    Select a service
                  </option>

                  {availableServices.map((service) => (
                    <option
                      key={service.id}
                      value={service.id}
                    >
                      {service.name}
                    </option>
                  ))}
                </select>
              </label>

              <div className="modal-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={closeQueueForm}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-button"
                  disabled={saving}
                >
                  {saving
                    ? 'Creating...'
                    : 'Create Queue'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default ServiceCenterManagement