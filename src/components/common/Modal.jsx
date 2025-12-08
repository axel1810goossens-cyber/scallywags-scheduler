import {
  FiX,
  FiCheck,
  FiAlertTriangle,
  FiInfo,
  FiAlertCircle,
} from 'react-icons/fi';
import './Modal.scss';

const Modal = ({
  isOpen,
  onClose,
  title,
  message,
  type = 'info', // 'info', 'success', 'warning', 'error', 'confirm'
  onConfirm,
  onCancel,
  confirmText = 'OK',
  cancelText = 'Cancel',
  showCancel = false,
}) => {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <FiCheck className="modal-icon success" />;
      case 'warning':
        return <FiAlertTriangle className="modal-icon warning" />;
      case 'error':
        return <FiAlertCircle className="modal-icon error" />;
      case 'confirm':
        return <FiAlertTriangle className="modal-icon confirm" />;
      default:
        return <FiInfo className="modal-icon info" />;
    }
  };

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    } else {
      onClose();
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          {title && <h3 className="modal-title">{title}</h3>}
          <button onClick={onClose} className="modal-close-button">
            <FiX />
          </button>
        </div>

        <div className="modal-body">
          <div className="modal-content-wrapper">
            {getIcon()}
            <div className="modal-message">{message}</div>
          </div>
        </div>

        <div className="modal-footer">
          {showCancel && (
            <button onClick={handleCancel} className="modal-button cancel">
              {cancelText}
            </button>
          )}
          <button
            onClick={handleConfirm}
            className={`modal-button confirm ${type}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
