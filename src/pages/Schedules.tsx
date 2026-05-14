import { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  BookOpen, 
  Plus,
  ChevronLeft,
  ChevronRight,
  Filter,
  Loader2,
  Trash2,
  Search,
  Check,
  List,
  LayoutGrid,
  FileText
} from 'lucide-react';
import { motion } from 'motion/react';
import axios from 'axios';
import Modal from '../components/Modal';

export default function Schedules({ user }: { user: any }) {
  const [schedules, setSchedules] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'timetable' | 'list'>('timetable');

  const isAdminOrDean = ["ADMIN", "DEAN", "ADMISSION"].includes(user?.role);
  const isStudent = user?.role === 'STUDENT';

  // Column visibility state
  const [visibleColumns, setVisibleColumns] = useState({
    course: true,
    professor: true,
    room: true,
    semester: true,
    dayTime: true,
  });
  const [showColumnSelector, setShowColumnSelector] = useState(false);

  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`/api/schedules/${id}`);
      await fetchData();
    } catch (err) {
      console.error(err);
    }
  };
  const [courses, setCourses] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [semesters, setSemesters] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedDeptId, setSelectedDeptId] = useState('');
  const [formData, setFormData] = useState({
    courseId: '',
    employeeId: '',
    roomId: '',
    semesterId: '',
    dayOfWeek: 'MONDAY',
    startTime: '09:00',
    endTime: '11:00'
  });

  useEffect(() => {
    fetchData();
  }, [user?.role]);

  const fetchData = async () => {
    try {
      const requests = [
        axios.get('/api/schedules'),
        axios.get('/api/courses'),
        // Conditional fetches based on role
        isAdminOrDean ? axios.get('/api/employees') : Promise.resolve({ data: [] }),
        (isAdminOrDean || user?.role === 'TEACHER') ? axios.get('/api/rooms') : Promise.resolve({ data: [] }),
        axios.get('/api/semesters'),
        axios.get('/api/departments')
      ];

      const [schRes, crsRes, empRes, rmsRes, semRes, deptRes] = await Promise.all(requests);
      setSchedules(Array.isArray(schRes.data) ? schRes.data : []);
      setCourses(Array.isArray(crsRes.data) ? crsRes.data : []);
      setEmployees(Array.isArray(empRes.data) ? empRes.data : []);
      setRooms(Array.isArray(rmsRes.data) ? rmsRes.data : []);
      setSemesters(Array.isArray(semRes.data) ? semRes.data : []);
      setDepartments(Array.isArray(deptRes.data) ? deptRes.data : []);
    } catch (err) {
      console.error(err);
      setSchedules([]);
      setCourses([]);
      setEmployees([]);
      setRooms([]);
      setSemesters([]);
      setDepartments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const next = { ...prev, [name]: value };
      
      // If course is changed, automatically set the list of recommended faculty?
      // We'll handle filtering in the render for now to be more reactive.
      
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await axios.post('/api/schedules', formData);
      await fetchData();
      setIsModalOpen(false);
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || 'Error adding schedule slot');
    } finally {
      setSubmitting(false);
    }
  };

  const days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

  const exportSchedulesCSV = () => {
    const headers = ["Course", "Professor", "Room", "Semester", "Day", "Start", "End"];
    const rows = schedules.filter(s => {
      const searchStr = searchTerm.toLowerCase();
      const courseName = (s.course?.name || '').toLowerCase();
      const profName = (s.teacher?.lastName || '').toLowerCase();
      const roomName = (s.room?.roomNumber || '').toLowerCase();
      return courseName.includes(searchStr) || profName.includes(searchStr) || roomName.includes(searchStr);
    }).map(s => [
      s.course?.name,
      `${s.teacher?.firstName} ${s.teacher?.lastName}`,
      s.room?.roomNumber,
      s.semester?.name,
      s.dayOfWeek,
      s.startTime,
      s.endTime
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n"
      + rows.map(r => r.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `schedules_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toggleColumn = (column: keyof typeof visibleColumns) => {
    setVisibleColumns(prev => ({ ...prev, [column]: !prev[column] }));
  };

  const filteredSchedules = schedules.filter(s => {
    if (!searchTerm) return true;
    const searchStr = searchTerm.toLowerCase();
    const courseName = (s.course?.name || '').toLowerCase();
    const profName = (s.teacher?.lastName || '').toLowerCase();
    const roomName = (s.room?.roomNumber || '').toLowerCase();
    const semesterName = (s.semester?.name || '').toLowerCase();
    const day = (s.dayOfWeek || '').toLowerCase();
    
    return courseName.includes(searchStr) || 
           profName.includes(searchStr) || 
           roomName.includes(searchStr) ||
           semesterName.includes(searchStr) ||
           day.includes(searchStr);
  });

  const filteredCourses = courses.filter(c => {
    if (!selectedDeptId) return true;
    return c.departmentId.toString() === selectedDeptId;
  });

  const filteredFaculty = employees.filter(e => {
    // If a department filter is selected in modal, filter faculty by it
    if (selectedDeptId) {
      return e.departmentId?.toString() === selectedDeptId;
    }
    
    // Otherwise, if a course is selected, prioritize that department
    if (formData.courseId) {
      const selectedCourse = courses.find(c => c.id.toString() === formData.courseId);
      if (selectedCourse && e.departmentId) {
        return e.departmentId === selectedCourse.departmentId;
      }
    }
    return true;
  });

  const finalFacultyList = filteredFaculty.length > 0 ? filteredFaculty : employees;

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-ui-muted text-xs font-bold uppercase tracking-wider mb-1">
             <Calendar size={14} /> Academics {'>'} Academic Schedule
          </div>
          <h1 className="text-2xl font-bold text-ui-text tracking-tight">Weekly Timetable</h1>
          <p className="text-ui-muted text-sm">Coordinate course timings, faculty availability, and room allocations.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-ui-bg p-1 rounded-xl border border-ui-border mr-2">
            <button 
              onClick={() => setViewMode('timetable')}
              className={`p-1.5 rounded-lg transition-all ${viewMode === 'timetable' ? 'bg-white shadow-sm text-brand-pink' : 'text-ui-muted'}`}
            >
              <LayoutGrid size={18} />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-brand-pink' : 'text-ui-muted'}`}
            >
              <List size={18} />
            </button>
          </div>
          
          <div className="relative w-full md:max-w-xs group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-ui-muted group-focus-within:text-brand-pink transition-colors" size={14} />
            <input 
              type="text" 
              placeholder="Search schedules..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 bg-white border border-ui-border rounded-xl text-xs focus:ring-2 focus:ring-brand-pink/10 outline-none transition-all"
            />
          </div>

          <div className="relative">
            <button 
              onClick={() => setShowColumnSelector(!showColumnSelector)}
              className="px-4 py-2.5 bg-white border border-ui-border text-ui-text rounded-xl text-xs font-bold hover:bg-ui-bg transition-all flex items-center gap-2"
            >
              <Filter size={14} />
              Columns
            </button>
            {showColumnSelector && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-ui-border rounded-xl shadow-xl z-50 p-2 space-y-1">
                  {Object.entries(visibleColumns).map(([key, value]) => (
                    <button
                      key={key}
                      onClick={() => toggleColumn(key as any)}
                      className="w-full flex items-center justify-between px-3 py-2 text-[10px] font-bold text-ui-text hover:bg-ui-bg rounded-lg transition-all"
                    >
                      <span className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                      {value && <Check size={12} className="text-brand-pink" />}
                    </button>
                  ))}
                </div>
              )}
          </div>

          <button 
            onClick={exportSchedulesCSV}
            className="flex items-center gap-2 px-5 py-2.5 bg-white border border-ui-border text-ui-text rounded-xl text-sm font-bold hover:bg-ui-bg transition-all"
          >
            <FileText size={16} className="text-brand-pink" />
            Export
          </button>
          {!isStudent && (
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-brand-pink text-white rounded-xl text-sm font-bold hover:bg-brand-pink/90 shadow-lg shadow-brand-pink/20 transition-all active:scale-[0.98]"
            >
              <Plus size={18} />
              Add Slot
            </button>
          )}
        </div>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Schedule New Class"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-ui-muted uppercase tracking-wider">Department Filter (Optional)</label>
            <select 
              value={selectedDeptId}
              onChange={(e) => setSelectedDeptId(e.target.value)}
              className="w-full px-4 py-2 bg-blue-50 border border-blue-100 rounded-xl text-sm focus:ring-2 focus:ring-brand-pink/10 outline-none"
            >
              <option value="">All Departments</option>
              {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-ui-muted uppercase tracking-wider">Course</label>
            <select 
              required
              name="courseId"
              value={formData.courseId}
              onChange={handleInputChange}
              className="w-full px-4 py-2 bg-ui-bg border border-ui-border rounded-xl text-sm focus:ring-2 focus:ring-brand-pink/10 outline-none"
            >
              <option value="">Select Course</option>
              {filteredCourses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-ui-muted uppercase tracking-wider">Professor / Teacher</label>
            <select 
              required
              name="employeeId"
              value={formData.employeeId}
              onChange={handleInputChange}
              className="w-full px-4 py-2 bg-ui-bg border border-ui-border rounded-xl text-sm focus:ring-2 focus:ring-brand-pink/10 outline-none"
            >
              <option value="">Select Faculty</option>
              {finalFacultyList.map(e => (
                <option key={e.id} value={e.id}>
                  {e.firstName} {e.lastName} ({e.department?.name || 'No Dept'}) - {e.staffType}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-ui-muted uppercase tracking-wider">Room</label>
              <select 
                required
                name="roomId"
                value={formData.roomId}
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-ui-bg border border-ui-border rounded-xl text-sm focus:ring-2 focus:ring-brand-pink/10 outline-none"
              >
                <option value="">Select Room</option>
                {rooms.map(r => <option key={r.id} value={r.id}>Room {r.roomNumber} ({r.type})</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-ui-muted uppercase tracking-wider">Semester</label>
              <select 
                required
                name="semesterId"
                value={formData.semesterId}
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-ui-bg border border-ui-border rounded-xl text-sm focus:ring-2 focus:ring-brand-pink/10 outline-none"
              >
                <option value="">Select Semester</option>
                {semesters.map(s => <option key={s.id} value={s.id}>{s.name} {s.year}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-ui-muted uppercase tracking-wider">Day</label>
              <select 
                required
                name="dayOfWeek"
                value={formData.dayOfWeek}
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-ui-bg border border-ui-border rounded-xl text-sm focus:ring-2 focus:ring-brand-pink/10 outline-none"
              >
                {days.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-ui-muted uppercase tracking-wider">Start Time</label>
              <input 
                required
                type="time"
                name="startTime"
                value={formData.startTime}
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-ui-bg border border-ui-border rounded-xl text-sm focus:ring-2 focus:ring-brand-pink/10 outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-ui-muted uppercase tracking-wider">End Time</label>
              <input 
                required
                type="time"
                name="endTime"
                value={formData.endTime}
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-ui-bg border border-ui-border rounded-xl text-sm focus:ring-2 focus:ring-brand-pink/10 outline-none"
              />
            </div>
          </div>
          <button 
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-brand-pink text-white rounded-xl font-bold hover:bg-brand-pink/90 transition-all flex items-center justify-center gap-2"
          >
            {submitting ? <Loader2 className="animate-spin" size={20} /> : 'Save Schedule Slot'}
          </button>
        </form>
      </Modal>

      {viewMode === 'timetable' ? (
        <div className="bg-white rounded-2xl border border-ui-border overflow-hidden">
          <div className="p-6 border-b border-ui-border flex items-center justify-between bg-ui-bg/30">
            <div className="flex items-center gap-4">
              <button className="p-1.5 hover:bg-white border border-transparent hover:border-ui-border rounded-lg transition-all"><ChevronLeft size={18}/></button>
              <span className="text-lg font-bold text-ui-text">October 2025</span>
              <button className="p-1.5 hover:bg-white border border-transparent hover:border-ui-border rounded-lg transition-all"><ChevronRight size={18}/></button>
            </div>
            <div className="flex bg-ui-bg p-1 rounded-xl border border-ui-border">
               <button className="px-4 py-1.5 bg-brand-pink text-white rounded-lg text-xs font-bold shadow-md shadow-brand-pink/10">Weekly</button>
               <button className="px-4 py-1.5 text-ui-muted hover:text-ui-text rounded-lg text-xs font-bold transition-all">Monthly</button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-7 divide-x divide-ui-border min-h-[500px]">
            {days.map((day) => (
              <div key={day} className="flex flex-col">
                <div className="p-4 text-center border-b border-ui-border bg-white">
                  <span className="text-[10px] font-bold text-ui-muted uppercase tracking-wider">{day.substring(0, 3)}</span>
                </div>
                <div className="flex-1 p-3 space-y-3 bg-ui-bg/20">
                  {loading ? null : schedules
                    .filter(s => {
                      if (s.dayOfWeek !== day) return false;
                      if (!searchTerm) return true;
                      
                      const searchStr = searchTerm.toLowerCase();
                      const courseName = (s.course?.name || '').toLowerCase();
                      const profName = (s.teacher?.lastName || '').toLowerCase();
                      const roomName = (s.room?.roomNumber || '').toLowerCase();
                      const semesterName = (s.semester?.name || '').toLowerCase();
                      
                      return courseName.includes(searchStr) || 
                             profName.includes(searchStr) || 
                             roomName.includes(searchStr) ||
                             semesterName.includes(searchStr);
                    })
                    .map((slot, idx) => (
                      <motion.div
                        key={slot.id}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="p-3 bg-white rounded-xl border-l-4 border-brand-pink shadow-sm hover:shadow-md transition-all group cursor-pointer"
                      >
                        <div className="flex justify-between items-start mb-2 group">
                          <h5 className="text-[11px] font-bold text-ui-text line-clamp-1 group-hover:text-brand-pink transition-colors shrink-0 max-w-[80%]">
                            {slot.course?.name}
                          </h5>
                          {isAdminOrDean && (
                            <button 
                              onClick={(e) => { e.stopPropagation(); handleDelete(slot.id); }}
                              className="p-1 opacity-0 group-hover:opacity-100 text-ui-muted hover:text-red-600 transition-all"
                            >
                              <Trash2 size={12} />
                            </button>
                          )}
                        </div>
                        <div className="space-y-1.5">
                           <div className="flex items-center gap-1.5 text-[9px] text-ui-muted font-bold uppercase tracking-wider">
                             <Clock size={11} className="text-brand-pink/60" />
                             {slot.startTime} - {slot.endTime}
                           </div>
                           <div className="flex items-center gap-1.5 text-[9px] text-ui-muted font-bold uppercase tracking-wider">
                             <MapPin size={11} className="text-brand-blue/60" />
                             Room {slot.room?.roomNumber}
                           </div>
                           <div className="flex items-center gap-1.5 text-[9px] text-ui-muted font-bold uppercase tracking-wider">
                             <User size={11} className="text-brand-blue/60" />
                             Prof. {slot.teacher?.lastName}
                           </div>
                        </div>
                      </motion.div>
                    ))
                  }
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-ui-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-ui-bg">
                  {visibleColumns.course && <th className="px-6 py-3 text-[11px] font-bold text-ui-muted uppercase tracking-wider border-b border-ui-border">Course</th>}
                  {visibleColumns.professor && <th className="px-6 py-3 text-[11px] font-bold text-ui-muted uppercase tracking-wider border-b border-ui-border">Professor</th>}
                  {visibleColumns.room && <th className="px-6 py-3 text-[11px] font-bold text-ui-muted uppercase tracking-wider border-b border-ui-border">Room</th>}
                  {visibleColumns.semester && <th className="px-6 py-3 text-[11px] font-bold text-ui-muted uppercase tracking-wider border-b border-ui-border">Semester</th>}
                  {visibleColumns.dayTime && <th className="px-6 py-3 text-[11px] font-bold text-ui-muted uppercase tracking-wider border-b border-ui-border">Schedule</th>}
                  <th className="px-6 py-3 text-[11px] font-bold text-ui-muted uppercase tracking-wider border-b border-ui-border text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-[13px]">
                {loading ? (
                  <tr><td colSpan={6} className="py-12 text-center text-ui-muted">Loading...</td></tr>
                ) : filteredSchedules.length === 0 ? (
                  <tr><td colSpan={6} className="py-12 text-center text-ui-muted">No records found</td></tr>
                ) : filteredSchedules.map((slot) => (
                  <tr key={slot.id} className="border-b border-[#F1F5F9] last:border-0 hover:bg-ui-bg/50 transition-all group">
                    {visibleColumns.course && (
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-ui-text">{slot.course?.name}</span>
                          <span className="text-[10px] text-brand-pink font-bold uppercase tracking-wider">{slot.course?.department?.name || 'No Dept'}</span>
                        </div>
                      </td>
                    )}
                    {visibleColumns.professor && (
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                           <div className="w-6 h-6 rounded-full bg-ui-bg flex items-center justify-center font-bold text-ui-muted text-[10px]">
                              {slot.teacher?.firstName?.[0]}{slot.teacher?.lastName?.[0]}
                           </div>
                           <div className="flex flex-col">
                             <span className="font-medium text-ui-text">Dr. {slot.teacher?.lastName}</span>
                             <span className="text-[9px] text-ui-muted font-bold uppercase">{slot.teacher?.department?.name}</span>
                           </div>
                        </div>
                      </td>
                    )}
                    {visibleColumns.room && (
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-bold uppercase tracking-wider">Room {slot.room?.roomNumber}</span>
                      </td>
                    )}
                    {visibleColumns.semester && (
                      <td className="px-6 py-4 text-ui-muted font-medium">
                        {slot.semester?.name} {slot.semester?.year}
                      </td>
                    )}
                    {visibleColumns.dayTime && (
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-brand-pink/80">{slot.dayOfWeek}</span>
                          <span className="text-[11px] text-ui-muted font-medium">{slot.startTime} - {slot.endTime}</span>
                        </div>
                      </td>
                    )}
                    <td className="px-6 py-4 text-right">
                      {isAdminOrDean && (
                        <button 
                          onClick={() => handleDelete(slot.id)}
                          className="p-1.5 text-ui-muted hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
