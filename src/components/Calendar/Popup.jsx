import React from 'react';
import './Popup.css';

const Popup = ({ appointment, onClose }) => {
  const startTime = new Date(appointment.start);
  const endTime = new Date(appointment.end);

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
            <span className="detail-value">{appointment.price} TL</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Popup; 