import React, { useState, useEffect } from 'react';
import './Calendar.css';
import WeekView from './WeekView';
import Popup from './Popup';

const Calendar = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [appointments, setAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const daysToShow = 5;

  const fetchAppointmentsForDate = async (date) => {
    try {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const formattedDate = `${year}-${month}-${day}T12:30:00.000+00:00`;

      const response = await fetch(`https://skytr-yazilim-skytr-yazilim-busiparis-re3a.onrender.com/service/product/rezervation/67a21a4108c59760c1df7d5e/selected-date`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          selected_date: formattedDate
        })
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      return data.matchingProducts || [];
    } catch (error) {
      console.error('Error fetching appointments:', error);
      return [];
    }
  };

  const fetchAllVisibleDates = async () => {
    const dates = [];
    const startDate = new Date(selectedDate);
    startDate.setDate(startDate.getDate() - Math.floor(daysToShow / 2));

    for (let i = 0; i < daysToShow; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      dates.push(date);
    }

    const allAppointments = await Promise.all(
      dates.map(date => fetchAppointmentsForDate(date))
    );

    const processedAppointments = [];
    allAppointments.forEach(dateProducts => {
      if (dateProducts && dateProducts.length > 0) {
        dateProducts.forEach(product => {
          product.time_range.forEach(timeSlot => {
            timeSlot.customers.forEach(customer => {
              const startUTC = new Date(timeSlot.start);
              const endUTC = new Date(timeSlot.end);
              
              const start = new Date(startUTC.getTime() + startUTC.getTimezoneOffset() * 60000);
              const end = new Date(endUTC.getTime() + endUTC.getTimezoneOffset() * 60000);

              processedAppointments.push({
                start: start.toISOString(),
                end: end.toISOString(),
                title: `${product.product} - ${customer.name} ${customer.surname}`,
                price: product.price,
                status: timeSlot.status || 'Pending',
                _id: timeSlot._id,
                color: getStatusColor(timeSlot.status)
              });
            });
          });
        });
      }
    });

    const sortedAppointments = processedAppointments.sort((a, b) => {
      return new Date(a.start) - new Date(b.start);
    });

    setAppointments(sortedAppointments);
  };

  const handleDateClick = (day) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(day);
    setSelectedDate(newDate);
  };

  const handleAppointmentClick = (appointment) => {
    setSelectedAppointment(appointment);
  };

  const handleUpdate = () => {
    fetchAllVisibleDates();
  };

  const handleAppointmentStart = async (appointment) => {
    try {
      const response = await fetch(`https://skytr-yazilim-skytr-yazilim-busiparis-re3a.onrender.com/service/product/rezervation/status/${appointment._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'onProgress'
        })
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const updatedAppointments = appointments.map(app => {
        if (app._id === appointment._id) {
          return { ...app, status: 'onProgress' };
        }
        return app;
      });
      setAppointments(updatedAppointments);
      
    } catch (error) {
      console.error('Error updating appointment status:', error);
    }
  };

  const handleAppointmentComplete = async (appointment) => {
    try {
      const response = await fetch(`https://skytr-yazilim-skytr-yazilim-busiparis-re3a.onrender.com/service/product/rezervation/status/${appointment._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'Completed'
        })
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const updatedAppointments = appointments.map(app => {
        if (app._id === appointment._id) {
          return { ...app, status: 'Completed' };
        }
        return app;
      });
      setAppointments(updatedAppointments);
      
    } catch (error) {
      console.error('Error updating appointment status:', error);
    }
  };

  const handleAppointmentCancel = async (appointment) => {
    try {
      const response = await fetch(`https://skytr-yazilim-skytr-yazilim-busiparis-re3a.onrender.com/service/product/rezervation/status/${appointment._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'Canceled'
        })
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const updatedAppointments = appointments.map(app => {
        if (app._id === appointment._id) {
          return { ...app, status: 'Canceled' };
        }
        return app;
      });
      setAppointments(updatedAppointments);
      
    } catch (error) {
      console.error('Error updating appointment status:', error);
    }
  };

  useEffect(() => {
    fetchAllVisibleDates();
  }, [selectedDate]);

  const daysInMonth = new Date(
    selectedDate.getFullYear(),
    selectedDate.getMonth() + 1,
    0
  ).getDate();

  const firstDayOfMonth = new Date(
    selectedDate.getFullYear(),
    selectedDate.getMonth(),
    1
  ).getDay();

  const getStatusClass = (appointment) => {
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

  const renderCalendarDays = () => {
    const days = [];
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // Render week days
    weekDays.forEach((day) => {
      days.push(
        <div key={`weekday-${day}`} className="calendar-weekday">
          {day}
        </div>
      );
    });

    // Add empty cells for days before the first day of month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }

    // Render month days
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(
        <div
          key={`day-${day}`}
          className={`calendar-day ${
            day === selectedDate.getDate() ? 'selected' : ''
          }`}
          onClick={() => handleDateClick(day)}
        >
          {day}
        </div>
      );
    }

    return days;
  };

  // Ay ve yıl değiştirme fonksiyonları
  const changeMonth = (delta) => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() + delta);
    setSelectedDate(newDate);
  };

  const changeYear = (delta) => {
    const newDate = new Date(selectedDate);
    newDate.setFullYear(newDate.getFullYear() + delta);
    setSelectedDate(newDate);
  };

  // Status'e göre renk döndüren yardımcı fonksiyon
  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed':
        return '#2e7d32';
      case 'onProgress':
        return '#1976d2';
      case 'Canceled':
        return '#d32f2f';
      case 'No-Show':
        return '#ed6c02';
      case 'Pending':
      default:
        return '#5B3FD9';
    }
  };

  const renderAppointmentBlock = (appointments, hour, dates) => {
    if (!appointments || appointments.length === 0) return null;

    const now = new Date();

    return (
      <div className="appointment-block">
        {appointments.map((appointment, index) => {
          const startTime = new Date(appointment.start);
          const isPast = startTime < now;
          
          return (
            <button
              key={index}
              className={`appointment ${getStatusClass(appointment.status)} ${isPast ? 'past' : ''}`}
              onClick={() => !isPast && handleAppointmentClick(appointment)}
            >
              <span className="appointment-time">
                {startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
              <span className="appointment-title">{appointment.title}</span>
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <div className="calendar-layout">
      <div className="calendar-sidebar">
        <div className="calendar-header">
          <div className="calendar-nav">
            <div className="calendar-nav-buttons">
              <button onClick={() => changeYear(-1)}>&lt;&lt;</button>
              <button onClick={() => changeMonth(-1)}>&lt;</button>
            </div>
            <h2>
              {selectedDate.toLocaleString('default', {
                month: 'long',
                year: 'numeric',
              })}
            </h2>
            <div className="calendar-nav-buttons">
              <button onClick={() => changeMonth(1)}>&gt;</button>
              <button onClick={() => changeYear(1)}>&gt;&gt;</button>
            </div>
          </div>
        </div>
        <div className="calendar-grid">{renderCalendarDays()}</div>
      </div>
      <WeekView 
        selectedDate={selectedDate} 
        appointments={appointments}
        onAppointmentClick={handleAppointmentClick}
      />
      {selectedAppointment && (
        <Popup
          appointment={selectedAppointment}
          onClose={() => setSelectedAppointment(null)}
          onStart={handleAppointmentStart}
          onComplete={handleAppointmentComplete}
          onCancel={handleAppointmentCancel}
        />
      )}
    </div>
  );
};

export default Calendar; 