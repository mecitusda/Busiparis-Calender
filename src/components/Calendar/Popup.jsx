import React, { useState } from 'react';
import './Popup.css';

const ConfirmationPopup = ({ message, onConfirm, onCancel }) => {
  return (
    <div className="confirmation-popup-overlay">
      <div className="confirmation-popup">
        <h4>Emin misiniz?</h4>
        <p>{message}</p>
        <div className="confirmation-buttons">
          <button className="confirm-button" onClick={onConfirm}>Evet</button>
          <button className="cancel-button" onClick={onCancel}>Hayır</button>
        </div>
      </div>
    </div>
  );
};

const Popup = ({ appointment, onClose, onStart, onComplete, onCancel }) => {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState('');
  const [pendingAction, setPendingAction] = useState(null);

  const startTime = new Date(appointment.start);
  const endTime = new Date(appointment.end);

  // Status sınıfını belirleyen yardımcı fonksiyon
  const getStatusClass = () => {
    switch (appointment.status) {
      case 'Completed':
        return 'status-completed';
      case 'onProgress':
        return 'status-progress';
      case 'Canceled':
        return 'status-canceled';
      case 'No-Show':
        return 'status-noshow';
      case 'Pending':
      default:
        return 'status-pending';
    }
  };

  const handleAction = (type) => {
    let message = '';
    switch(type) {
      case 'start':
        message = 'Bu randevuyu işleme almak istediğinize emin misiniz?';
        break;
      case 'complete':
        message = 'Bu işlemi tamamlamak istediğinize emin misiniz?';
        break;
      case 'cancel':
        message = 'Bu randevuyu iptal etmek istediğinize emin misiniz?';
        break;
    }
    setConfirmationMessage(message);
    setPendingAction(type);
    setShowConfirmation(true);
  };

  const handleConfirm = () => {
    switch(pendingAction) {
      case 'start':
        onStart(appointment);
        break;
      case 'complete':
        onComplete(appointment);
        break;
      case 'cancel':
        onCancel(appointment);
        break;
    }
    setShowConfirmation(false);
    onClose();
  };

  // Randevunun başlangıç zamanını kontrol eden fonksiyon
  const isAppointmentActionable = () => {
    const now = new Date();
    const startTime = new Date(appointment.start);
    const fiveMinutesAfterStart = new Date(startTime.getTime() + 5 * 60000); // 5 dakika ekleme

    // Şu an randevu başlangıç zamanından önce mi?
    if (now < startTime) {
      return false;
    }

    // Şu an randevu başlangıcından 5 dakika sonrasını geçti mi?
    if (now > fiveMinutesAfterStart) {
      return false;
    }

    return true;
  };

  // İşleme Al butonunun durumunu ve mesajını belirleyen fonksiyon
  const getPendingButtonState = () => {
    const now = new Date();
    const startTime = new Date(appointment.start);
    const fiveMinutesAfterStart = new Date(startTime.getTime() + 5 * 60000);

    if (now < startTime) {
      return {
        disabled: true,
        message: "Randevu zamanı henüz gelmedi"
      };
    }

    if (now > fiveMinutesAfterStart) {
      return {
        disabled: true,
        message: "Randevu zamanı geçti (5 dakika tolerans)"
      };
    }

    return {
      disabled: false,
      message: null
    };
  };

  // İşlemi Tamamla butonu için kontrol fonksiyonu
  const isCompletionActionable = () => {
    const now = new Date();
    const startTime = new Date(appointment.start);
    const tenMinutesAfterStart = new Date(startTime.getTime() + 10 * 60000); // 10 dakika ekleme

    return now >= tenMinutesAfterStart; // 10 dakika geçtiyse true, geçmediyse false
  };

  // İşlemi Tamamla butonunun durumunu ve mesajını belirleyen fonksiyon
  const getCompletionButtonState = () => {
    const now = new Date();
    const startTime = new Date(appointment.start);
    const tenMinutesAfterStart = new Date(startTime.getTime() + 10 * 60000);

    if (now < tenMinutesAfterStart) {
      const remainingMinutes = Math.ceil((tenMinutesAfterStart - now) / 60000);
      return {
        disabled: true,
        message: `İşlem tamamlama için ${remainingMinutes} dakika daha bekleyin`
      };
    }

    return {
      disabled: false,
      message: null
    };
  };

  return (
    <>
      <div className="popup-overlay" onClick={onClose}>
        <div className="popup-content" onClick={e => e.stopPropagation()}>
          <button className="popup-close" onClick={onClose}>&times;</button>
          
          <div className="popup-header">
            <h3>{appointment.title}</h3>
            <div className="popup-time">
              {startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
              {endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>

          <div className="popup-details">
            <div className="detail-item">
              <span className="detail-label">Tarih:</span>
              <span className="detail-value">
                {startTime.toLocaleDateString('tr-TR', { 
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Fiyat:</span>
              <span className="detail-value price">{appointment.price} TL</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Durum:</span>
              <span className={`detail-value ${getStatusClass()}`}>
                {appointment.status}
              </span>
            </div>
          </div>

          {/* Pending durumu için butonlar */}
          {appointment.status === 'Pending' && (
            <div className="popup-buttons">
              <button 
                className="action-button cancel"
                onClick={() => handleAction('cancel')}
              >
                İptal Et
              </button>
              <button 
                className={`action-button process ${!isAppointmentActionable() ? 'disabled' : ''}`}
                onClick={() => handleAction('start')}
                disabled={!isAppointmentActionable()}
                title={!isAppointmentActionable() ? getPendingButtonState().message : ''}
              >
                İşleme Al
              </button>
            </div>
          )}

          {/* onProgress durumu için butonlar */}
          {appointment.status === 'onProgress' && (
            <div className="popup-buttons">
              <button 
                className="action-button cancel"
                onClick={() => handleAction('cancel')}
              >
                İptal Et
              </button>
              <button 
                className={`action-button complete ${!isCompletionActionable() ? 'disabled' : ''}`}
                onClick={() => handleAction('complete')}
                disabled={!isCompletionActionable()}
                title={!isCompletionActionable() ? getCompletionButtonState().message : ''}
              >
                İşlemi Tamamla
              </button>
            </div>
          )}

          {/* Tamamlanmış veya iptal edilmiş randevular için mesaj */}
          {(appointment.status === 'Completed' || 
            appointment.status === 'Canceled' || 
            appointment.status === 'No-Show') && (
            <div className="status-message">
              {appointment.status === 'Completed' && "Bu randevu tamamlanmıştır."}
              {appointment.status === 'Canceled' && "Bu randevu iptal edilmiştir."}
              {appointment.status === 'No-Show' && "Müşteri randevuya gelmemiştir."}
            </div>
          )}
        </div>
      </div>

      {showConfirmation && (
        <ConfirmationPopup
          message={confirmationMessage}
          onConfirm={handleConfirm}
          onCancel={() => setShowConfirmation(false)}
        />
      )}
    </>
  );
};

export default Popup; 