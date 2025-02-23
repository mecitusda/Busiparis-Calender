import React, { useState } from 'react';
import './WeekView.css';
import Popup from './Popup';

const WeekView = ({ selectedDate, appointments, onAppointmentClick }) => {
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  const daysToShow = 5;
  const hours = Array.from({ length: 13 }, (_, i) => i + 8); // 8 AM to 8 PM

  const getDayDates = () => {
    const dates = [];
    const startDate = new Date(selectedDate);
    startDate.setDate(startDate.getDate() - Math.floor(daysToShow / 2));

    for (let i = 0; i < daysToShow; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const getAppointmentsForDate = (date) => {
    const appointmentsByHour = {};
    
    appointments.filter(appointment => {
      const appointmentDate = new Date(appointment.start);
      return appointmentDate.getDate() === date.getDate();
    }).forEach(appointment => {
      const startTime = new Date(appointment.start);
      const hour = startTime.getHours();
      if (!appointmentsByHour[hour]) {
        appointmentsByHour[hour] = [];
      }
      appointmentsByHour[hour].push(appointment);
    });

    return appointmentsByHour;
  };

  const formatDate = (date) => {
    const day = date.getDate();
    const weekday = date.toLocaleDateString('en-US', { weekday: 'short' });
    return `${day} ${weekday}`;
  };

  const renderAppointmentBlock = (appointments, hour, date) => {
    if (!appointments || appointments.length === 0) return null;

    const now = new Date();
    const currentHour = now.getHours();
    const currentDate = new Date().setHours(0,0,0,0); // Bugünün tarihini saat olmadan al

    // Kontrol edilecek tarihi doğrudan parametre olarak gelen date'i kullan
    const checkDate = new Date(date);
    const dayDate = checkDate.setHours(0,0,0,0); // Saat olmadan tarih

    // Geçmiş kontrolü: Ya tarih geçmişte ya da aynı gün ve saat geçmişte
    const isPast = dayDate < currentDate || (dayDate === currentDate && hour < currentHour);

    // Önceki saatlerin toplam yüksekliğini hesapla
    let topPosition = 0;
    for (let h = 8; h < hour; h++) {
      topPosition += getMaxHeightForHour(h, getDayDates(), getAppointmentsForDate);
    }

    return (
      <div 
        className={`appointment-block ${isPast ? 'past' : ''}`}
        style={{ 
          top: `${topPosition}px`
        }}
      >
        <div className={`time-block ${isPast ? 'past' : ''}`}>
          {`${hour.toString().padStart(2, '0')}:00`}
        </div>
        <div className="appointment-list">
          {appointments.map((appointment, index) => {
            const startTime = new Date(appointment.start);
            const formattedTime = `${startTime.getHours().toString().padStart(2, '0')}:${startTime.getMinutes().toString().padStart(2, '0')}`;
            
            return (
              <button
                key={index}
                className={`appointment ${getStatusClass(appointment.status)}`}
                onClick={() => handleAppointmentClick(appointment)}
              >
                <span className="appointment-time">{formattedTime}</span>
                <span className="appointment-title">{appointment.title}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  // Tüm günlerdeki en yüksek container'ı bulmak için yardımcı fonksiyon
  const getMaxHeightForHour = (hour, dates, getAppointmentsForDate) => {
    let maxAppointments = 0;
    
    dates.forEach(date => {
      const appointments = getAppointmentsForDate(date)[hour];
      if (appointments?.length > maxAppointments) {
        maxAppointments = appointments.length;
      }
    });

    // Her randevu 40px + üst ve alt 4px gap = 48px
    // Container için üst ve alt 4px padding = 8px
    const height = (maxAppointments * 48) + 8;

    return Math.max(height, 60);
  };

  // time-slot render fonksiyonu
  const renderTimeSlot = (hour, dates, getAppointmentsForDate) => {
    const maxHeight = getMaxHeightForHour(hour, dates, getAppointmentsForDate);
    
    return (
      <div 
        className="time-slot" 
        style={{ height: `${maxHeight}px` }}
      />
    );
  };

  const handleAppointmentClick = (appointment) => {
    onAppointmentClick(appointment);
  };

  const getStatusClass = (status) => {
    switch (status) {
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

  return (
    <div className="week-view">
      <div className="week-header">
        <div className="time-gutter-header" />
        {getDayDates().map((date, index) => (
          <div 
            key={index} 
            className={`day-column-header ${
              date.getDate() === selectedDate.getDate() ? 'selected' : ''
            }`}
          >
            {formatDate(date)}
          </div>
        ))}
      </div>
      <div className="time-grid">
        <div className="time-gutter">
          {hours.map(hour => (
            <div 
              key={hour} 
              className="time-slot-label"
              style={{ height: `${getMaxHeightForHour(hour, getDayDates(), getAppointmentsForDate)}px` }}
            >
              {`${hour}:00`}
            </div>
          ))}
        </div>
        <div className="day-columns">
          {getDayDates().map((date, dateIndex) => (
            <div key={dateIndex} className="day-column">
              {hours.map(hour => (
                <React.Fragment key={hour}>
                  {renderTimeSlot(hour, getDayDates(), getAppointmentsForDate)}
                  {renderAppointmentBlock(getAppointmentsForDate(date)[hour], hour, date)}
                </React.Fragment>
              ))}
            </div>
          ))}
        </div>
      </div>

      {selectedAppointment && (
        <Popup 
          appointment={selectedAppointment} 
          onClose={() => setSelectedAppointment(null)}
        />
      )}
    </div>
  );
};

export default WeekView; 