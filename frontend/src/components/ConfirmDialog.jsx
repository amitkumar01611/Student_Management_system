import Modal from './Modal'
import { AlertTriangle } from 'lucide-react'

/**
 * ConfirmDialog - Reusable confirmation modal
 * Encapsulates the delete-confirmation interaction pattern
 */
export default function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, loading }) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Confirm Action"
      size="modal-sm"
      footer={
        <>
          <button className="btn btn-secondary" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button className="btn btn-danger" onClick={onConfirm} disabled={loading}>
            {loading ? 'Deleting...' : 'Delete'}
          </button>
        </>
      }
    >
      <div className="confirm-dialog">
        <div className="confirm-icon" style={{ color: 'var(--accent-rose)' }}>
          <AlertTriangle size={40} />
        </div>
        <h3>{title || 'Are you sure?'}</h3>
        <p>{message || 'This action cannot be undone.'}</p>
      </div>
    </Modal>
  )
}
