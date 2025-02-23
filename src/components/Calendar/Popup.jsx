import React from 'react';
import './Popup.css';

const Popup = ({ appointment, onClose, onUpdate }) => {
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

  const handleProcess = async () => {
    try {
      const response = await fetch(`https://skytr-yazilim-skytr-yazilim-busiparis-re3a.onrender.com/service/product/rezervation/status/${appointment._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          "status": "onProgress"
        })
      });

      if (response.ok) {
        onUpdate(); // Takvimi yenile
        onClose(); // Popup'ı kapat
      } else {
        console.error('İşlem başarısız oldu');
      }
    } catch (error) {
      console.error('İstek gönderilirken hata oluştu:', error);
    }
  };

  const handleCancel = async () => {
    try {
      const response = await fetch(`https://skytr-yazilim-skytr-yazilim-busiparis-re3a.onrender.com/service/product/rezervation/status/${appointment._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          "status": "Canceled"
        })
      });

      if (response.ok) {
        onUpdate(); // Takvimi yenile
        onClose(); // Popup'ı kapat
      } else {
        console.error('İptal işlemi başarısız oldu');
      }
    } catch (error) {
      console.error('İstek gönderilirken hata oluştu:', error);
    }
  };

  const handleComplete = async () => {
    try {
      const response = await fetch(`https://skytr-yazilim-skytr-yazilim-busiparis-re3a.onrender.com/service/product/rezervation/status/${appointment._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          "status": "Completed"
        })
      });

      if (response.ok) {
        onUpdate();
        onClose();
      } else {
        console.error('İşlem tamamlama başarısız oldu');
      }
    } catch (error) {
      console.error('İstek gönderilirken hata oluştu:', error);
    }
  };

  return (
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

        <div className="popup-actions">
          {appointment.status === 'Pending' && (
            <>
              <button 
                className="action-button cancel"
                onClick={handleCancel}
              >
                İptal Et
              </button>
              <button 
                className="action-button process status-pending"
                onClick={handleProcess}
              >
                İşleme Al
              </button>
            </>
          )}
          {appointment.status === 'onProgress' && (
            <>
              <button 
                className="action-button cancel"
                onClick={handleCancel}
              >
                İptal Et
              </button>
              <button 
                className="action-button process status-progress"
                onClick={handleComplete}
              >
                İşlemi Tamamla
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Popup; 