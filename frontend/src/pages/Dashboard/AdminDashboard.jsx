import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import Navbar from '../../components/Navbar'
import {
  getServiceCenters,
  createServiceCenter,
  updateServiceCenter,
  changeServiceCenterStatus,
} from '../../services/serviceCenterApi'
import './AdminDashboard.css'

const emptyForm = {
  name: '',
  description: '',
  addressLine: '',
  city: '',
  state: '',
  postalCode: '',
  phone: '',
}

function AdminDashboard() {
  const navigate = useNavigate()

  const [serviceCenters, setServiceCenters] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [showForm, setShowForm] = useState(false)
  const [editingCenter, setEditingCenter] = useState(null)
  const [form, setForm] = useState(emptyForm)

  async function loadServiceCenters() {
    try {
      setLoading(true)
      setError('')

      const data = await getServiceCenters()
      setServiceCenters(data)
    } catch (err) {
      setError(
        err.message || 'Unable to load service centers'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadServiceCenters()
  }, [])

  function handleInputChange(e) {
    const { name, value } = e.target

    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }))
  }

  function openCreateForm() {
    setEditingCenter(null)
    setForm(emptyForm)
    setShowForm(true)
  }

  function openEditForm(center) {
    setEditingCenter(center)

    setForm({
      name: center.name || '',
      description: center.description || '',
      addressLine: center.addressLine || '',
      city: center.city || '',
      state: center.state || '',
      postalCode: center.postalCode || '',
      phone: center.phone || '',
    })

    setShowForm(true)
  }

  function closeForm() {
    if (saving) return

    setShowForm(false)
    setEditingCenter(null)
    setForm(emptyForm)
  }

  async function handleSubmit(e) {
    e.preventDefault()

    try {
      setSaving(true)

      if (editingCenter) {
        const updatedCenter = await updateServiceCenter(
          editingCenter.id,
          form
        )

        setServiceCenters((currentCenters) =>
          currentCenters.map((center) =>
            center.id === updatedCenter.id
              ? updatedCenter
              : center
          )
        )

        toast.success(
          'Service center updated successfully.'
        )
      } else {
        const newCenter = await createServiceCenter(form)

        setServiceCenters((currentCenters) => [
          ...currentCenters,
          newCenter,
        ])

        toast.success(
          'Service center created successfully.'
        )
      }

      closeForm()
    } catch (err) {
      toast.error(
        err.message || 'Unable to save service center'
      )
    } finally {
      setSaving(false)
    }
  }

  async function handleStatusChange(center) {
    const newStatus =
      center.status === 'ACTIVE'
        ? 'INACTIVE'
        : 'ACTIVE'

    try {
      setSaving(true)

      const updatedCenter =
        await changeServiceCenterStatus(
          center.id,
          newStatus
        )

      setServiceCenters((currentCenters) =>
        currentCenters.map((item) =>
          item.id === updatedCenter.id
            ? updatedCenter
            : item
        )
      )

      toast.success(
        `Service center ${
          newStatus === 'ACTIVE'
            ? 'activated'
            : 'deactivated'
        } successfully.`
      )
    } catch (err) {
      toast.error(
        err.message ||
          'Unable to change service center status'
      )
    } finally {
      setSaving(false)
    }
  }

  function openServiceCenter(centerId) {
    navigate(`/admin/service-centers/${centerId}`)
  }

  return (
    <div className="admin-dashboard">
      <Navbar />

      <main className="admin-content">
        <div className="dashboard-heading">
          <div>
            <h1>Admin Dashboard</h1>
            <p>
              Manage your QueueLess service centers.
            </p>
          </div>
        </div>

        <section className="admin-section">
          <div className="section-header">
            <div>
              <h2>Service Centers</h2>
              <p>
                Select a service center to manage its
                services and queues.
              </p>
            </div>

            <button
              className="primary-button"
              onClick={openCreateForm}
            >
              + Add Service Center
            </button>
          </div>

          {loading && (
            <p className="admin-message">
              Loading service centers...
            </p>
          )}

          {error && (
            <p className="admin-error">
              {error}
            </p>
          )}

          {!loading &&
            !error &&
            serviceCenters.length === 0 && (
              <div className="empty-state">
                <h3>No Service Centers</h3>
                <p>
                  Create your first service center to get
                  started.
                </p>
              </div>
            )}

          {!loading &&
            !error &&
            serviceCenters.length > 0 && (
              <div className="service-centers-list">
                {serviceCenters.map((center) => (
                  <div
                    className="service-center-card"
                    key={center.id}
                    onClick={() =>
                      openServiceCenter(center.id)
                    }
                  >
                    <div className="service-center-info">
                      <div className="service-center-title">
                        <h3>{center.name}</h3>

                        <span
                          className={`status-badge ${
                            center.status === 'ACTIVE'
                              ? 'status-active'
                              : 'status-inactive'
                          }`}
                        >
                          {center.status}
                        </span>
                      </div>

                      {center.description && (
                        <p className="center-description">
                          {center.description}
                        </p>
                      )}

                      <p>
                        <strong>Address:</strong>{' '}
                        {center.addressLine},{' '}
                        {center.city},{' '}
                        {center.state}
                        {center.postalCode
                          ? ` - ${center.postalCode}`
                          : ''}
                      </p>

                      {center.phone && (
                        <p>
                          <strong>Phone:</strong>{' '}
                          {center.phone}
                        </p>
                      )}
                    </div>

                    <div className="service-center-actions">
                      <button
                        className="secondary-button"
                        onClick={(e) => {
                          e.stopPropagation()
                          openEditForm(center)
                        }}
                        disabled={saving}
                      >
                        Edit
                      </button>

                      <button
                        className={
                          center.status === 'ACTIVE'
                            ? 'danger-button'
                            : 'activate-button'
                        }
                        onClick={(e) => {
                          e.stopPropagation()
                          handleStatusChange(center)
                        }}
                        disabled={saving}
                      >
                        {center.status === 'ACTIVE'
                          ? 'Deactivate'
                          : 'Activate'}
                      </button>
                    </div>

                    <div className="service-center-manage">
                      Manage →
                    </div>
                  </div>
                ))}
              </div>
            )}
        </section>
      </main>

      {showForm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <div>
                <h2>
                  {editingCenter
                    ? 'Edit Service Center'
                    : 'Add Service Center'}
                </h2>

                <p>
                  Enter the service center details below.
                </p>
              </div>

              <button
                className="close-button"
                onClick={closeForm}
                disabled={saving}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group full-width">
                  <label htmlFor="name">
                    Name *
                  </label>

                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={form.name}
                    onChange={handleInputChange}
                    required
                    maxLength={150}
                    placeholder="e.g. QueueLess Service Center"
                  />
                </div>

                <div className="form-group full-width">
                  <label htmlFor="description">
                    Description
                  </label>

                  <textarea
                    id="description"
                    name="description"
                    value={form.description}
                    onChange={handleInputChange}
                    placeholder="Describe this service center"
                    rows="3"
                  />
                </div>

                <div className="form-group full-width">
                  <label htmlFor="addressLine">
                    Address *
                  </label>

                  <input
                    id="addressLine"
                    name="addressLine"
                    type="text"
                    value={form.addressLine}
                    onChange={handleInputChange}
                    required
                    maxLength={255}
                    placeholder="Street address"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="city">
                    City *
                  </label>

                  <input
                    id="city"
                    name="city"
                    type="text"
                    value={form.city}
                    onChange={handleInputChange}
                    required
                    maxLength={100}
                    placeholder="City"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="state">
                    State *
                  </label>

                  <input
                    id="state"
                    name="state"
                    type="text"
                    value={form.state}
                    onChange={handleInputChange}
                    required
                    maxLength={100}
                    placeholder="State"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="postalCode">
                    Postal Code
                  </label>

                  <input
                    id="postalCode"
                    name="postalCode"
                    type="text"
                    value={form.postalCode}
                    onChange={handleInputChange}
                    maxLength={20}
                    placeholder="Postal code"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="phone">
                    Phone
                  </label>

                  <input
                    id="phone"
                    name="phone"
                    type="text"
                    value={form.phone}
                    onChange={handleInputChange}
                    maxLength={20}
                    placeholder="Phone number"
                  />
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={closeForm}
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
                    : editingCenter
                      ? 'Update Service Center'
                      : 'Create Service Center'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminDashboard