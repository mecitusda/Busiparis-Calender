import React from 'react';
import './Popup.css';

const Popup = ({ appointment, onClose }) => {
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
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          "status": "onProgress"
        })
      });

      if (!response.ok) {
        throw new Error('İşlem başarısız oldu');
      }

      const data = await response.json();
      console.log('Randevu işleme alındı:', data);
      
      // Başarılı işlem sonrası popup'ı kapat
      onClose();
      
      // İsteğe bağlı: Başarılı işlem bildirimi göster
      // showNotification('Randevu başarıyla işleme alındı');
      
      // İsteğe bağlı: Takvimi yenile
      // refreshCalendar();

    } catch (error) {
      console.error('İşlem sırasında hata oluştu:', error);
      // İsteğe bağlı: Hata bildirimi göster
      // showError('İşlem sırasında bir hata oluştu');
    }
  };

  const handleCancel = () => {
    // İptal etme fonksiyonu buraya gelecek
    console.log('Randevu iptal edildi:', appointment);
    onClose();
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
          <button className={`action-button cancel ${getStatusClass()}`} onClick={handleCancel}>
            İptal Et
          </button>
          <button className={`action-button process ${getStatusClass()}`} onClick={handleProcess}>
            {appointment.status === 'onProgress' ? 'İşlemi Tamamla' : 'İşleme Al'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Popup; 