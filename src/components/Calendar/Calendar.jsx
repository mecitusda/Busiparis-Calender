import React, { useState, useEffect } from 'react';
import './Calendar.css';
import WeekView from './WeekView';

const Calendar = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [appointments, setAppointments] = useState([]);
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
    // Görünen tüm günlerin tarihlerini hesapla
    const dates = [];
    const startDate = new Date(selectedDate);
    startDate.setDate(startDate.getDate() - Math.floor(daysToShow / 2));

    for (let i = 0; i < daysToShow; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      dates.push(date);
    }

    // Tüm görünen günler için paralel istek at
    const allAppointments = await Promise.all(
      dates.map(date => fetchAppointmentsForDate(date))
    );

    // Tüm randevuları işle ve birleştir
    const processedAppointments = [];
    allAppointments.forEach(dateProducts => {
      if (dateProducts && dateProducts.length > 0) {
        dateProducts.forEach(product => {
          product.time_range.forEach(timeSlot => {
            timeSlot.customers.forEach(customer => {
              // UTC tarihini yerel saat dilimine çevir
              const startUTC = new Date(timeSlot.start);
              const endUTC = new Date(timeSlot.end);
              
              // Yerel saat diliminde yeni tarih oluştur
              const start = new Date(startUTC.getTime() + startUTC.getTimezoneOffset() * 60000);
              const end = new Date(endUTC.getTime() + endUTC.getTimezoneOffset() * 60000);

              processedAppointments.push({
                start: start.toISOString(),
                end: end.toISOString(),
                title: `${product.product} - ${customer.name} ${customer.surname}`,
                price: product.price,
                color: '#5B3FD9'
              });
            });
          });
        });
      }
    });

    // Randevuları saat sırasına göre sırala
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
      />
    </div>
  );
};

export default Calendar; 