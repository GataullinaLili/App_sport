import React, { useState, useEffect } from 'react';

const App = () => {
  const [user, setUser] = useState(null);
  const [currentPage, setCurrentPage] = useState('login');
  const [users, setUsers] = useState([
    { id: 1, email: 'student@demo.com', password: 'password', role: 'student', name: 'Алексей Иванов', age: 22, phone: '+7 (912) 345-67-89' },
    { id: 2, email: 'trainer@demo.com', password: 'password', role: 'trainer', name: 'Мария Петрова', specialization: 'Фитнес', phone: '+7 (921) 456-78-90' }
  ]);
  const [registrations, setRegistrations] = useState([
    { id: 1, studentId: 1, date: '2024-01-15', time: '18:00', activity: 'Тренировка с тренером', status: 'confirmed', attended: true },
    { id: 2, studentId: 1, date: '2024-01-17', time: '19:00', activity: 'Групповая тренировка', status: 'confirmed', attended: true },
    { id: 3, studentId: 1, date: '2024-01-20', time: '18:30', activity: 'Йога', status: 'confirmed', attended: false }
  ]);
  const [formData, setFormData] = useState({ email: '', password: '', name: '', age: '', phone: '', specialization: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingAttendance, setPendingAttendance] = useState(null);
  const [pendingRegistrationId, setPendingRegistrationId] = useState(null);
  const [searchStudent, setSearchStudent] = useState('');
  const [activeTab, setActiveTab] = useState('home');
  const [activeStudentTab, setActiveStudentTab] = useState('registrations');
  const [activeTrainerTab, setActiveTrainerTab] = useState('students');
  const [sortOrder, setSortOrder] = useState('date-desc');
  const [filterDate, setFilterDate] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(null);

  const activities = [
    { id: 1, name: 'Тренировка с тренером', duration: '60 мин', time: '18:00', maxStudents: 1, current: 0 },
    { id: 2, name: 'Групповая тренировка', duration: '45 мин', time: '19:00', maxStudents: 15, current: 8 },
    { id: 3, name: 'Йога', duration: '75 мин', time: '18:30', maxStudents: 20, current: 12 },
    { id: 4, name: 'Кардио', duration: '50 мин', time: '20:00', maxStudents: 10, current: 5 }
  ];

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');
    const user = users.find(u => u.email === formData.email && u.password === formData.password);
    if (user) {
      setUser(user);
      localStorage.setItem('user', JSON.stringify(user));
      setCurrentPage(user.role);
      setFormData({ email: '', password: '', name: '', age: '', phone: '', specialization: '' });
      setActiveTab('home');
      setActiveStudentTab('registrations');
      setActiveTrainerTab('students');
    } else {
      setError('Неверный email или пароль');
    }
  };

  const handleRegister = (e) => {
    e.preventDefault();
    setError('');
    if (users.some(u => u.email === formData.email)) {
      setError('Пользователь с таким email уже существует');
      return;
    }

    const newUser = {
      id: users.length + 1,
      ...formData,
      role: currentPage === 'register-student' ? 'student' : 'trainer',
      password: formData.password
    };

    setUsers([...users, newUser]);
    setUser(newUser);
    localStorage.setItem('user', JSON.stringify(newUser));
    setCurrentPage(newUser.role);
    setFormData({ email: '', password: '', name: '', age: '', phone: '', specialization: '' });
    setActiveTab('home');
    setActiveStudentTab('registrations');
    setActiveTrainerTab('students');
    setSuccess('Регистрация прошла успешно!');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    setCurrentPage('login');
    setShowProfileMenu(false);
    setSelectedStudent(null);
    setActiveTab('home');
    setActiveStudentTab('registrations');
    setActiveTrainerTab('students');
  };

  const registerForActivity = (activity) => {
    const today = new Date().toISOString().split('T')[0];
    const newRegistration = {
      id: registrations.length + 1,
      studentId: user.id,
      date: today,
      time: activity.time,
      activity: activity.name,
      status: 'confirmed',
      attended: false
    };
    setRegistrations([...registrations, newRegistration]);
    setSuccess(`Вы успешно записались на ${activity.name}!`);
  };

  const cancelRegistration = (regId) => {
    setRegistrations(registrations.filter(reg => reg.id !== regId));
    setSuccess('Запись отменена');
  };

  const confirmAttendance = () => {
    setRegistrations(registrations.map(reg => 
      reg.id === pendingRegistrationId ? { ...reg, attended: pendingAttendance } : reg
    ));
    setSuccess(pendingAttendance ? 'Посещение подтверждено' : 'Посещение отменено');
    setShowConfirmation(false);
    setPendingRegistrationId(null);
    setPendingAttendance(null);
  };

  const cancelConfirmation = () => {
    setShowConfirmation(false);
    setPendingRegistrationId(null);
    setPendingAttendance(null);
  };

  const markAttendance = (regId, attended) => {
    setPendingRegistrationId(regId);
    setPendingAttendance(attended);
    setShowConfirmation(true);
  };

  const markAllAttendanceForDay = (date, attended) => {
    const dayRegistrations = registrations.filter(reg => reg.date === date);
    const updatedRegistrations = registrations.map(reg => 
      reg.date === date ? { ...reg, attended } : reg
    );
    setRegistrations(updatedRegistrations);
    setSuccess(`Все записи за ${date} отмечены как ${attended ? 'присутствовал' : 'отсутствовал'}`);
  };

  const getStudentAttendance = (studentId) => {
    const studentRegs = registrations.filter(reg => reg.studentId === studentId);
    if (studentRegs.length === 0) return 0;
    const attended = studentRegs.filter(reg => reg.attended).length;
    return Math.round((attended / studentRegs.length) * 100);
  };

  const getStudentRegistrations = (studentId) => {
    return registrations
      .filter(reg => reg.studentId === studentId)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  // Calendar functions
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };

  const formatRussianDate = (date) => {
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return date.toLocaleDateString('ru-RU', options);
  };

  const getDayRegistrations = (date) => {
    const dateString = formatDate(date);
    return registrations.filter(reg => reg.date === dateString);
  };

  const StudentDashboard = () => {
    const myRegistrations = registrations.filter(reg => reg.studentId === user.id);
    const upcomingActivities = activities.filter(activity => 
      activity.current < activity.maxStudents && 
      !myRegistrations.some(reg => reg.activity === activity.name)
    );
    const pastRegistrations = myRegistrations.filter(reg => new Date(reg.date) < new Date());
    const futureRegistrations = myRegistrations.filter(reg => new Date(reg.date) >= new Date());

    // Сортировка записей
    const sortedRegistrations = [...myRegistrations].sort((a, b) => {
      switch (sortOrder) {
        case 'date-asc':
          return new Date(a.date) - new Date(b.date);
        case 'date-desc':
          return new Date(b.date) - new Date(a.date);
        case 'activity-asc':
          return a.activity.localeCompare(b.activity);
        case 'activity-desc':
          return b.activity.localeCompare(a.activity);
        default:
          return new Date(b.date) - new Date(a.date);
      }
    });

    // Фильтрация по дате
    const filteredRegistrations = filterDate 
      ? sortedRegistrations.filter(reg => reg.date === filterDate)
      : sortedRegistrations;

    const renderHome = () => (
      <div className="space-y-6">
        {/* Профиль студента */}
        <div className="bg-white rounded-xl shadow-sm p-4">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">Мой профиль</h2>
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
              {user.name.charAt(0)}
            </div>
            <div>
              <h3 className="font-semibold">{user.name}</h3>
              <p className="text-sm text-gray-600">Студент</p>
              <p className="text-sm text-gray-500">{user.age} лет</p>
            </div>
          </div>
        </div>

        {/* Мои записи */}
        <div className="bg-white rounded-xl shadow-sm p-4">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">Ближайшие записи</h2>
          {futureRegistrations.length === 0 ? (
            <p className="text-gray-500 text-center py-6">У вас пока нет предстоящих записей</p>
          ) : (
            <div className="space-y-3">
              {futureRegistrations.slice(0, 3).map(reg => (
                <div key={reg.id} className="border rounded-lg p-3 bg-gray-50">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-medium text-gray-800">{reg.activity}</h4>
                      <p className="text-sm text-gray-600">{reg.date} в {reg.time}</p>
                    </div>
                    <button
                      onClick={() => cancelRegistration(reg.id)}
                      className="text-red-500 hover:text-red-700 text-sm font-medium"
                    >
                      Отменить
                    </button>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      reg.status === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {reg.status === 'confirmed' ? 'Подтверждено' : 'Ожидание'}
                    </span>
                    <span className={`text-xs font-medium ${
                      reg.attended ? 'text-green-600' : 'text-gray-500'
                    }`}>
                      {reg.attended ? 'Присутствовал' : 'Отсутствовал'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Доступные тренировки */}
        <div className="bg-white rounded-xl shadow-sm p-4">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">Доступные тренировки</h2>
          <div className="space-y-3">
            {upcomingActivities.slice(0, 3).map(activity => (
              <div key={activity.id} className="border rounded-lg p-3">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-medium text-gray-800">{activity.name}</h3>
                    <p className="text-sm text-gray-600">{activity.duration} • {activity.time}</p>
                  </div>
                  <button
                    onClick={() => registerForActivity(activity)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
                  >
                    Записаться
                  </button>
                </div>
                <div className="text-xs text-gray-500">
                  {activity.current}/{activity.maxStudents} мест занято
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );

    const renderRegistrations = () => (
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Все записи</h2>
            <div className="flex space-x-2">
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="border border-gray-300 rounded px-2 py-1 text-sm"
              >
                <option value="date-desc">Дата ↓</option>
                <option value="date-asc">Дата ↑</option>
                <option value="activity-asc">Активность ↑</option>
                <option value="activity-desc">Активность ↓</option>
              </select>
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="border border-gray-300 rounded px-2 py-1 text-sm"
              />
            </div>
          </div>
          <div className="space-y-3">
            {filteredRegistrations.length === 0 ? (
              <p className="text-gray-500 text-center py-6">Записи не найдены</p>
            ) : (
              filteredRegistrations.map(reg => (
                <div key={reg.id} className="border rounded-lg p-3 bg-gray-50">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-medium text-gray-800">{reg.activity}</h4>
                      <p className="text-sm text-gray-600">{reg.date} в {reg.time}</p>
                    </div>
                    {new Date(reg.date) >= new Date() && (
                      <button
                        onClick={() => cancelRegistration(reg.id)}
                        className="text-red-500 hover:text-red-700 text-sm font-medium"
                      >
                        Отменить
                      </button>
                    )}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      reg.status === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {reg.status === 'confirmed' ? 'Подтверждено' : 'Ожидание'}
                    </span>
                    <span className={`text-xs font-medium ${
                      reg.attended ? 'text-green-600' : 'text-gray-500'
                    }`}>
                      {reg.attended ? 'Присутствовал' : 'Отсутствовал'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );

    const renderCalendar = () => {
      const days = getDaysInMonth(currentDate);
      const monthNames = [
        'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
        'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
      ];
      const dayNames = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];

      return (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Календарь</h2>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
                  className="p-2 bg-gray-100 rounded"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <h3 className="font-semibold">
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h3>
                <button
                  onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
                  className="p-2 bg-gray-100 rounded"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-7 gap-1 mb-2">
              {dayNames.map(day => (
                <div key={day} className="p-2 text-center text-sm font-medium text-gray-600">
                  {day}
                </div>
              ))}
            </div>
            
            <div className="grid grid-cols-7 gap-1">
              {days.map((day, index) => {
                if (!day) {
                  return <div key={index} className="p-2"></div>;
                }
                
                const dateString = formatDate(day);
                const hasRegistrations = registrations.some(reg => reg.date === dateString);
                const isToday = formatDate(new Date()) === dateString;
                
                return (
                  <div
                    key={index}
                    className={`p-2 text-center text-sm rounded cursor-pointer ${
                      isToday ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'
                    } ${hasRegistrations ? 'bg-green-100' : ''}`}
                    onClick={() => setSelectedCalendarDate(dateString)}
                  >
                    {day.getDate()}
                    {hasRegistrations && (
                      <div className="w-1 h-1 bg-green-500 rounded-full mx-auto mt-1"></div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {selectedCalendarDate && (
            <div className="bg-white rounded-xl shadow-sm p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  {formatRussianDate(new Date(selectedCalendarDate))}
                </h3>
                <button
                  onClick={() => setSelectedCalendarDate(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {getDayRegistrations(new Date(selectedCalendarDate)).length === 0 ? (
                <p className="text-gray-500 text-center py-6">Нет записей на этот день</p>
              ) : (
                <div className="space-y-3">
                  {getDayRegistrations(new Date(selectedCalendarDate)).map(reg => (
                    <div key={reg.id} className="border rounded-lg p-3 bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-gray-800">{reg.activity}</h4>
                          <p className="text-sm text-gray-600">{reg.time}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          reg.attended ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {reg.attended ? 'Присутствовал' : 'Отсутствовал'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      );
    };

    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b px-4 py-3 fixed top-0 left-0 right-0 z-10">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-semibold text-gray-800">FitTracker</h1>
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center space-x-2 bg-gray-100 rounded-full px-3 py-1"
              >
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  {user.name.charAt(0)}
                </div>
                <span className="text-sm font-medium">{user.name.split(' ')[0]}</span>
              </button>
              
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border py-2 z-20">
                  <div className="p-4 border-b">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white text-lg font-bold">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-semibold">{user.name}</h3>
                        <p className="text-sm text-gray-600">Студент</p>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>Возраст: {user.age}</p>
                      <p>Телефон: {user.phone}</p>
                      <p>Email: {user.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-3 text-red-600 hover:bg-gray-50 border-t"
                  >
                    Выйти
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="pt-16 pb-20 px-4">
          {activeTab === 'home' && renderHome()}
          {activeTab === 'registrations' && renderRegistrations()}
          {activeTab === 'calendar' && renderCalendar()}
        </div>

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t px-4 py-2">
          <div className="flex justify-around">
            <button
              onClick={() => setActiveTab('home')}
              className={`flex flex-col items-center py-2 px-1 ${
                activeTab === 'home' ? 'text-blue-600' : 'text-gray-600'
              }`}
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
              <span className="text-xs mt-1">Главная</span>
            </button>
            <button
              onClick={() => setActiveTab('registrations')}
              className={`flex flex-col items-center py-2 px-1 ${
                activeTab === 'registrations' ? 'text-blue-600' : 'text-gray-600'
              }`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="text-xs mt-1">Записи</span>
            </button>
            <button
              onClick={() => setActiveTab('calendar')}
              className={`flex flex-col items-center py-2 px-1 ${
                activeTab === 'calendar' ? 'text-blue-600' : 'text-gray-600'
              }`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-xs mt-1">Календарь</span>
            </button>
          </div>
        </div>

        {/* Confirmation Modal */}
        {showConfirmation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-30">
            <div className="bg-white rounded-lg p-6 w-80 mx-4">
              <h3 className="text-lg font-semibold mb-4">Подтвердить действие</h3>
              <p className="text-gray-600 mb-6">
                Вы уверены, что хотите {pendingAttendance ? 'подтвердить присутствие' : 'отметить отсутствие'}?
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={cancelConfirmation}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded"
                >
                  Отмена
                </button>
                <button
                  onClick={confirmAttendance}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
                >
                  Подтвердить
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const TrainerDashboard = () => {
    const students = users.filter(u => u.role === 'student');
    const filteredStudents = students.filter(student => 
      student.name.toLowerCase().includes(searchStudent.toLowerCase())
    );
    const studentStats = filteredStudents.map(student => ({
      ...student,
      attendance: getStudentAttendance(student.id),
      registrations: registrations.filter(reg => reg.studentId === student.id).length
    }));

    const todayRegistrations = registrations.filter(reg => 
      reg.date === new Date().toISOString().split('T')[0]
    );

    // Сортировка и фильтрация записей
    const allRegistrations = [...registrations].sort((a, b) => {
      switch (sortOrder) {
        case 'date-asc':
          return new Date(a.date) - new Date(b.date);
        case 'date-desc':
          return new Date(b.date) - new Date(a.date);
        case 'activity-asc':
          return a.activity.localeCompare(b.activity);
        case 'activity-desc':
          return b.activity.localeCompare(a.activity);
        default:
          return new Date(b.date) - new Date(a.date);
      }
    });

    const filteredRegistrations = filterDate 
      ? allRegistrations.filter(reg => reg.date === filterDate)
      : allRegistrations;

    const renderStudents = () => (
      <div className="space-y-6">
        {/* Поиск студента */}
        <div className="bg-white rounded-xl shadow-sm p-4">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">Поиск студента</h2>
          <div className="relative">
            <input
              type="text"
              value={searchStudent}
              onChange={(e) => setSearchStudent(e.target.value)}
              placeholder="Введите ФИО студента..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <svg className="w-5 h-5 text-gray-400 absolute right-3 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Студенты */}
        <div className="bg-white rounded-xl shadow-sm p-4">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">Студенты</h2>
          {studentStats.length === 0 ? (
            <p className="text-gray-500 text-center py-6">Студенты не найдены</p>
          ) : (
            <div className="space-y-3">
              {studentStats.map(student => (
                <div key={student.id} className="border rounded-lg p-3">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-400 rounded-full flex items-center justify-center text-white text-sm font-medium">
                        {student.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-800">{student.name}</h4>
                        <p className="text-sm text-gray-600">{student.age} лет</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{student.registrations}</p>
                      <p className="text-xs text-gray-500">записей</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            student.attendance >= 80 ? 'bg-green-500' : 
                            student.attendance >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${student.attendance}%` }}
                        ></div>
                      </div>
                    </div>
                    <span className="ml-2 text-sm font-medium w-12">{student.attendance}%</span>
                  </div>
                  <button
                    onClick={() => setSelectedStudent(student)}
                    className="w-full mt-3 bg-gray-100 hover:bg-gray-200 text-gray-700 py-1 px-3 rounded text-sm"
                  >
                    Посмотреть посещения
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );

    const renderStudentDetails = () => {
      if (!selectedStudent) return null;
      
      const studentRegs = getStudentRegistrations(selectedStudent.id);
      const attendance = getStudentAttendance(selectedStudent.id);

      return (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Посещения {selectedStudent.name}</h2>
              <button
                onClick={() => setSelectedStudent(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
            </div>
            
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-16 h-16 bg-gray-400 rounded-full flex items-center justify-center text-white text-xl font-bold">
                {selectedStudent.name.charAt(0)}
              </div>
              <div>
                <h3 className="font-semibold text-lg">{selectedStudent.name}</h3>
                <p className="text-sm text-gray-600">Возраст: {selectedStudent.age}</p>
                <div className="flex items-center mt-1">
                  <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                    <div 
                      className={`h-2 rounded-full ${
                        attendance >= 80 ? 'bg-green-500' : 
                        attendance >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${attendance}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">{attendance}%</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {studentRegs.length === 0 ? (
                <p className="text-gray-500 text-center py-6">Нет записей</p>
              ) : (
                studentRegs.map(reg => (
                  <div key={reg.id} className="border rounded-lg p-3 bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-gray-800">{reg.activity}</h4>
                        <p className="text-sm text-gray-600">{reg.date} в {reg.time}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        reg.attended ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {reg.attended ? 'Присутствовал' : 'Отсутствовал'}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      );
    };

    const renderRegistrations = () => (
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Все записи</h2>
            <div className="flex space-x-2">
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="border border-gray-300 rounded px-2 py-1 text-sm"
              >
                <option value="date-desc">Дата ↓</option>
                <option value="date-asc">Дата ↑</option>
                <option value="activity-asc">Активность ↑</option>
                <option value="activity-desc">Активность ↓</option>
              </select>
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="border border-gray-300 rounded px-2 py-1 text-sm"
              />
            </div>
          </div>
          
          {filterDate && (
            <div className="bg-blue-50 p-3 rounded-lg mb-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Записи за {formatRussianDate(new Date(filterDate))}</span>
                <div className="flex space-x-2">
                  <button
                    onClick={() => markAllAttendanceForDay(filterDate, true)}
                    className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm"
                  >
                    Все присутствовали
                  </button>
                  <button
                    onClick={() => markAllAttendanceForDay(filterDate, false)}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                  >
                    Все отсутствовали
                  </button>
                </div>
              </div>
            </div>
          )}

          {filteredRegistrations.length === 0 ? (
            <p className="text-gray-500 text-center py-6">Записи не найдены</p>
          ) : (
            <div className="space-y-3">
              {filteredRegistrations.map(reg => {
                const student = users.find(u => u.id === reg.studentId);
                return (
                  <div key={reg.id} className="border rounded-lg p-3 bg-gray-50">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-medium text-gray-800">{student?.name}</h4>
                        <p className="text-sm text-gray-600">{reg.activity} • {reg.date} в {reg.time}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        reg.status === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {reg.status === 'confirmed' ? 'Подтверждено' : 'Ожидание'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">{reg.date}</span>
                      <div className="flex space-x-1">
                        <button
                          onClick={() => markAttendance(reg.id, true)}
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            reg.attended 
                              ? 'bg-green-500 text-white' 
                              : 'bg-gray-200 text-gray-700 hover:bg-green-500 hover:text-white'
                          }`}
                        >
                          Присутствовал
                        </button>
                        <button
                          onClick={() => markAttendance(reg.id, false)}
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            !reg.attended 
                              ? 'bg-red-500 text-white' 
                              : 'bg-gray-200 text-gray-700 hover:bg-red-500 hover:text-white'
                          }`}
                        >
                          Отсутствовал
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );

    const renderCalendar = () => {
      const days = getDaysInMonth(currentDate);
      const monthNames = [
        'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
        'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
      ];
      const dayNames = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];

      return (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Календарь</h2>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
                  className="p-2 bg-gray-100 rounded"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <h3 className="font-semibold">
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h3>
                <button
                  onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
                  className="p-2 bg-gray-100 rounded"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-7 gap-1 mb-2">
              {dayNames.map(day => (
                <div key={day} className="p-2 text-center text-sm font-medium text-gray-600">
                  {day}
                </div>
              ))}
            </div>
            
            <div className="grid grid-cols-7 gap-1">
              {days.map((day, index) => {
                if (!day) {
                  return <div key={index} className="p-2"></div>;
                }
                
                const dateString = formatDate(day);
                const dayRegs = getDayRegistrations(day);
                const hasRegistrations = dayRegs.length > 0;
                const isToday = formatDate(new Date()) === dateString;
                
                return (
                  <div
                    key={index}
                    className={`p-2 text-center text-sm rounded cursor-pointer relative ${
                      isToday ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'
                    } ${hasRegistrations ? 'bg-green-100' : ''}`}
                    onClick={() => setSelectedCalendarDate(dateString)}
                  >
                    {day.getDate()}
                    {hasRegistrations && (
                      <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2">
                        <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center text-white text-xs">
                          {dayRegs.length}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {selectedCalendarDate && (
            <div className="bg-white rounded-xl shadow-sm p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  {formatRussianDate(new Date(selectedCalendarDate))}
                </h3>
                <button
                  onClick={() => setSelectedCalendarDate(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {getDayRegistrations(new Date(selectedCalendarDate)).length === 0 ? (
                <p className="text-gray-500 text-center py-6">Нет записей на этот день</p>
              ) : (
                <div className="space-y-3">
                  <div className="bg-blue-50 p-3 rounded-lg mb-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Всего записей: {getDayRegistrations(new Date(selectedCalendarDate)).length}</span>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => markAllAttendanceForDay(selectedCalendarDate, true)}
                          className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm"
                        >
                          Все присутствовали
                        </button>
                        <button
                          onClick={() => markAllAttendanceForDay(selectedCalendarDate, false)}
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                        >
                          Все отсутствовали
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {getDayRegistrations(new Date(selectedCalendarDate)).map(reg => {
                    const student = users.find(u => u.id === reg.studentId);
                    return (
                      <div key={reg.id} className="border rounded-lg p-3 bg-gray-50">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-medium text-gray-800">{student?.name}</h4>
                            <p className="text-sm text-gray-600">{reg.activity} в {reg.time}</p>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            reg.status === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {reg.status === 'confirmed' ? 'Подтверждено' : 'Ожидание'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">{reg.date}</span>
                          <div className="flex space-x-1">
                            <button
                              onClick={() => markAttendance(reg.id, true)}
                              className={`px-2 py-1 rounded text-xs font-medium ${
                                reg.attended 
                                  ? 'bg-green-500 text-white' 
                                  : 'bg-gray-200 text-gray-700 hover:bg-green-500 hover:text-white'
                              }`}
                            >
                              Присутствовал
                            </button>
                            <button
                              onClick={() => markAttendance(reg.id, false)}
                              className={`px-2 py-1 rounded text-xs font-medium ${
                                !reg.attended 
                                  ? 'bg-red-500 text-white' 
                                  : 'bg-gray-200 text-gray-700 hover:bg-red-500 hover:text-white'
                              }`}
                            >
                              Отсутствовал
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      );
    };

    const renderHome = () => (
      <div className="space-y-6">
        {/* Статистика */}
        <div className="bg-white rounded-xl shadow-sm p-4">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">Статистика</h2>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-blue-50 p-3 rounded-lg text-center">
              <p className="text-xs text-blue-600">Студенты</p>
              <p className="text-2xl font-bold text-blue-800">{students.length}</p>
            </div>
            <div className="bg-green-50 p-3 rounded-lg text-center">
              <p className="text-xs text-green-600">Записи</p>
              <p className="text-2xl font-bold text-green-800">{registrations.length}</p>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg text-center">
              <p className="text-xs text-purple-600">Сегодня</p>
              <p className="text-2xl font-bold text-purple-800">{todayRegistrations.length}</p>
            </div>
          </div>
        </div>

        {/* Сегодняшние записи */}
        <div className="bg-white rounded-xl shadow-sm p-4">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">Сегодняшние записи</h2>
          {todayRegistrations.length === 0 ? (
            <p className="text-gray-500 text-center py-4">На сегодня нет записей</p>
          ) : (
            <div className="space-y-3">
              <div className="bg-blue-50 p-3 rounded-lg mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Всего записей: {todayRegistrations.length}</span>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => markAllAttendanceForDay(new Date().toISOString().split('T')[0], true)}
                      className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm"
                    >
                      Все присутствовали
                    </button>
                    <button
                      onClick={() => markAllAttendanceForDay(new Date().toISOString().split('T')[0], false)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                    >
                      Все отсутствовали
                    </button>
                  </div>
                </div>
              </div>
              
              {todayRegistrations.map(reg => {
                const student = users.find(u => u.id === reg.studentId);
                return (
                  <div key={reg.id} className="border rounded-lg p-3 bg-gray-50">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-medium text-gray-800">{student?.name}</h4>
                        <p className="text-sm text-gray-600">{reg.activity}</p>
                      </div>
                      <div className="flex space-x-1">
                        <button
                          onClick={() => markAttendance(reg.id, true)}
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            reg.attended 
                              ? 'bg-green-500 text-white' 
                              : 'bg-gray-200 text-gray-700 hover:bg-green-500 hover:text-white'
                          }`}
                        >
                          Присутствовал
                        </button>
                        <button
                          onClick={() => markAttendance(reg.id, false)}
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            !reg.attended 
                              ? 'bg-red-500 text-white' 
                              : 'bg-gray-200 text-gray-700 hover:bg-red-500 hover:text-white'
                          }`}
                        >
                          Отсутствовал
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Последние активности */}
        <div className="bg-white rounded-xl shadow-sm p-4">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">Последние активности</h2>
          <div className="space-y-3">
            {registrations.slice(-3).reverse().map(reg => {
              const student = users.find(u => u.id === reg.studentId);
              return (
                <div key={reg.id} className="flex items-center space-x-3 p-2 bg-gray-50 rounded">
                  <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    {student?.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{student?.name}</p>
                    <p className="text-xs text-gray-600">{reg.activity} • {reg.date}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    reg.attended ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {reg.attended ? 'Присутствовал' : 'Отсутствовал'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );

    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b px-4 py-3 fixed top-0 left-0 right-0 z-10">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-semibold text-gray-800">FitTracker</h1>
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center space-x-2 bg-gray-100 rounded-full px-3 py-1"
              >
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  {user.name.charAt(0)}
                </div>
                <span className="text-sm font-medium">{user.name.split(' ')[0]}</span>
              </button>
              
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border py-2 z-20">
                  <div className="p-4 border-b">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white text-lg font-bold">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-semibold">{user.name}</h3>
                        <p className="text-sm text-gray-600">Тренер</p>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>Специализация: {user.specialization}</p>
                      <p>Телефон: {user.phone}</p>
                      <p>Email: {user.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-3 text-red-600 hover:bg-gray-50 border-t"
                  >
                    Выйти
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="pt-16 pb-20 px-4">
          {selectedStudent ? renderStudentDetails() : (
            <>
              {activeTab === 'home' && renderHome()}
              {activeTab === 'students' && renderStudents()}
              {activeTab === 'registrations' && renderRegistrations()}
              {activeTab === 'calendar' && renderCalendar()}
            </>
          )}
        </div>

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t px-4 py-2">
          <div className="flex justify-around">
            <button
              onClick={() => setActiveTab('home')}
              className={`flex flex-col items-center py-2 px-1 ${
                activeTab === 'home' ? 'text-green-600' : 'text-gray-600'
              }`}
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
              <span className="text-xs mt-1">Главная</span>
            </button>
            <button
              onClick={() => setActiveTab('students')}
              className={`flex flex-col items-center py-2 px-1 ${
                activeTab === 'students' ? 'text-green-600' : 'text-gray-600'
              }`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <span className="text-xs mt-1">Студенты</span>
            </button>
            <button
              onClick={() => setActiveTab('registrations')}
              className={`flex flex-col items-center py-2 px-1 ${
                activeTab === 'registrations' ? 'text-green-600' : 'text-gray-600'
              }`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="text-xs mt-1">Записи</span>
            </button>
            <button
              onClick={() => setActiveTab('calendar')}
              className={`flex flex-col items-center py-2 px-1 ${
                activeTab === 'calendar' ? 'text-green-600' : 'text-gray-600'
              }`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-xs mt-1">Календарь</span>
            </button>
          </div>
        </div>

        {/* Confirmation Modal */}
        {showConfirmation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-30">
            <div className="bg-white rounded-lg p-6 w-80 mx-4">
              <h3 className="text-lg font-semibold mb-4">Подтвердить действие</h3>
              <p className="text-gray-600 mb-6">
                Вы уверены, что хотите {pendingAttendance ? 'подтвердить присутствие' : 'отметить отсутствие'}?
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={cancelConfirmation}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded"
                >
                  Отмена
                </button>
                <button
                  onClick={confirmAttendance}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded"
                >
                  Подтвердить
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const LoginForm = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">FitTracker</h1>
          <p className="text-gray-600">Система записи на тренировки</p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {success}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Введите ваш email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Пароль</label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Введите ваш пароль"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
          >
            Войти
          </button>
        </form>

        <div className="mt-6 text-center space-y-4">
          <p className="text-gray-600">Демо аккаунты:</p>
          <div className="space-y-2 text-sm">
            <p className="text-blue-600">Студент: student@demo.com / password</p>
            <p className="text-green-600">Тренер: trainer@demo.com / password</p>
          </div>
          
          <div className="pt-4 border-t">
            <p className="text-gray-600">Нет аккаунта?</p>
            <div className="flex justify-center space-x-4 mt-2">
              <button
                onClick={() => setCurrentPage('register-student')}
                className="text-blue-500 hover:text-blue-700 font-medium"
              >
                Зарегистрироваться как студент
              </button>
              <button
                onClick={() => setCurrentPage('register-trainer')}
                className="text-green-500 hover:text-green-700 font-medium"
              >
                Зарегистрироваться как тренер
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const RegisterForm = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {currentPage === 'register-student' ? 'Регистрация студента' : 'Регистрация тренера'}
          </h1>
          <p className="text-gray-600">Создайте свой аккаунт</p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {success}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Имя и фамилия</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Введите ваше имя"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Введите ваш email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Пароль</label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Введите пароль"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Телефон</label>
            <input
              type="tel"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="+7 (999) 999-99-99"
            />
          </div>

          {currentPage === 'register-student' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Возраст</label>
              <input
                type="number"
                required
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Введите ваш возраст"
                min="16"
                max="100"
              />
            </div>
          )}

          {currentPage === 'register-trainer' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Специализация</label>
              <input
                type="text"
                required
                value={formData.specialization}
                onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Например: Фитнес, Йога, Кардио"
              />
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
          >
            Зарегистрироваться
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setCurrentPage('login')}
            className="text-gray-600 hover:text-gray-800"
          >
            Уже есть аккаунт? Войти
          </button>
        </div>
      </div>
    </div>
  );

  if (user) {
    return user.role === 'student' ? <StudentDashboard /> : <TrainerDashboard />;
  }

  if (currentPage === 'login') {
    return <LoginForm />;
  }

  return <RegisterForm />;
};

export default App;
