import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'motion/react';
import { CheckCircle2, XCircle, Clock, AlertCircle, Calendar, Users, Search, Save, ChevronRight, FileSpreadsheet } from 'lucide-react';
import { format } from 'date-fns';

interface Student {
  id: number;
  firstName: string;
  lastName: string;
}

interface Enrollment {
  id: number;
  student: Student;
  scheduleId: number;
}

interface Schedule {
  id: number;
  course: { name: string };
  teacher: { firstName: string; lastName: string };
  dayOfWeek: string;
  startTime: string;
  endTime: string;
}

interface AttendanceRecord {
  id?: number;
  enrollmentId: number;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
  studentName: string;
}

export default function Attendance({ user }: { user: any }) {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [selectedScheduleId, setSelectedScheduleId] = useState<number | ''>('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [studentRecords, setStudentRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const isStudent = user?.role === 'STUDENT';

  useEffect(() => {
    if (isStudent) {
      fetchStudentAttendance();
    } else {
      fetchSchedules();
    }
  }, [isStudent]);

  useEffect(() => {
    if (!isStudent && selectedScheduleId && date) {
      fetchAttendance();
    } else if (!isStudent) {
      setRecords([]);
    }
  }, [selectedScheduleId, date, isStudent]);

  const fetchStudentAttendance = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/attendance');
      setStudentRecords(res.data);
    } catch (err) {
      console.error('Error fetching student attendance', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSchedules = async () => {
    try {
      const res = await axios.get('/api/schedules');
      setSchedules(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Error fetching schedules', err);
      setSchedules([]);
    }
  };

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      // 1. Get existing attendance for this schedule and date
      const attendanceRes = await axios.get(`/api/attendance?scheduleId=${selectedScheduleId}&date=${date}`);
      
      // 2. Get all enrollments for this schedule
      const enrollmentsRes = await axios.get('/api/enrollments');
      const scheduleEnrollments = enrollmentsRes.data.filter((e: any) => e.scheduleId === selectedScheduleId);

      // 3. Map enrollments to records, use existing attendance if found
      const mappedRecords = scheduleEnrollments.map((enr: any) => {
        const existing = attendanceRes.data.find((a: any) => a.enrollmentId === enr.id);
        return {
          id: existing?.id,
          enrollmentId: enr.id,
          status: existing?.status || 'PRESENT',
          studentName: `${enr.student.firstName} ${enr.student.lastName}`,
        };
      });

      setRecords(mappedRecords);
    } catch (err) {
      console.error('Error fetching attendance', err);
    } finally {
      setLoading(false);
    }
  };

  if (isStudent) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">My Attendance History</h1>
          <p className="text-slate-500 font-medium">Tracking your presence across all registered courses</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm shadow-slate-200/50">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-4 text-left text-[11px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                <th className="px-6 py-4 text-left text-[11px] font-black text-slate-400 uppercase tracking-widest">Course</th>
                <th className="px-6 py-4 text-center text-[11px] font-black text-slate-400 uppercase tracking-widest">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {studentRecords.length > 0 ? (
                studentRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-bold text-slate-600">
                      {format(new Date(record.date), 'MMM dd, yyyy')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-slate-700">{record.enrollment.schedule.course.name}</div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{record.enrollment.schedule.dayOfWeek}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border 
                          ${record.status === 'PRESENT' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                            record.status === 'ABSENT' ? 'bg-rose-50 text-rose-600 border-rose-100' : 
                            'bg-amber-50 text-amber-600 border-amber-100'}`}>
                          {record.status}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="px-6 py-20 text-center text-slate-400 font-bold">No attendance records found yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  const updateStatus = (enrollmentId: number, status: AttendanceRecord['status']) => {
    setRecords(prev => prev.map(r => r.enrollmentId === enrollmentId ? { ...r, status } : r));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.post('/api/attendance', {
        records: records.map(r => ({
          id: r.id,
          enrollmentId: r.enrollmentId,
          status: r.status,
          date: date
        }))
      });
      // Refresh to get new IDs
      await fetchAttendance();
      alert('Attendance saved successfully');
    } catch (err) {
      console.error('Error saving attendance', err);
      alert('Error saving attendance');
    } finally {
      setSaving(false);
    }
  };

  const currentSchedule = Array.isArray(schedules) ? schedules.find(s => s.id === selectedScheduleId) : undefined;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Attendance Tracking</h1>
          <p className="text-slate-500 font-medium">Monitor student presence and academic punctuality</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
            <FileSpreadsheet className="w-5 h-5" />
          </button>
          <button 
            onClick={handleSave}
            disabled={saving || records.length === 0}
            className="flex items-center gap-2 px-5 py-2.5 bg-brand-blue text-white rounded-xl text-sm font-bold hover:bg-brand-blue/90 shadow-lg shadow-brand-blue/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? <Clock className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Attendance
          </button>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm shadow-slate-200/50"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5" />
              Session Date
            </label>
            <input 
              type="date" 
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full h-12 bg-slate-50 border-none rounded-xl px-4 text-sm font-semibold focus:ring-2 focus:ring-brand-blue/20 transition-all outline-none"
            />
          </div>

          <div className="space-y-2 lg:col-span-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Search className="w-3.5 h-3.5" />
              Course Schedule
            </label>
            <select 
              value={selectedScheduleId}
              onChange={(e) => setSelectedScheduleId(Number(e.target.value))}
              className="w-full h-12 bg-slate-50 border-none rounded-xl px-4 text-sm font-semibold focus:ring-2 focus:ring-brand-blue/20 transition-all outline-none appearance-none"
            >
              <option value="">Select a class session...</option>
              {schedules.map(s => (
                <option key={s.id} value={s.id}>
                  {s.course.name} - {s.dayOfWeek} ({s.startTime} - {s.endTime}) - Teacher: {s.teacher.firstName} {s.teacher.lastName}
                </option>
              ))}
            </select>
          </div>
        </div>
      </motion.div>

      {selectedScheduleId ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-brand-blue/10 rounded-xl flex items-center justify-center text-brand-blue">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800">{currentSchedule?.course.name}</h3>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Class Roster • {records.length} Students</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs font-bold">
              <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Present: {records.filter(r => r.status === 'PRESENT').length}
              </div>
              <div className="flex items-center gap-1.5 text-rose-600 bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-100">
                <XCircle className="w-3.5 h-3.5" />
                Absent: {records.filter(r => r.status === 'ABSENT').length}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm shadow-slate-200/50">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="px-6 py-4 text-left text-[11px] font-black text-slate-400 uppercase tracking-widest w-16">ID</th>
                  <th className="px-6 py-4 text-left text-[11px] font-black text-slate-400 uppercase tracking-widest">Student Information</th>
                  <th className="px-6 py-4 text-right text-[11px] font-black text-slate-400 uppercase tracking-widest">Status / Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {records.length > 0 ? (
                  records.map((record, idx) => (
                    <tr key={record.enrollmentId} className="group hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-2">
                        <span className="text-xs font-mono font-bold text-slate-400">#{(idx + 1).toString().padStart(3, '0')}</span>
                      </td>
                      <td className="px-6 py-2">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-[10px] font-bold text-slate-500 uppercase tracking-tighter">
                            {record.studentName.split(' ').map(n => n[0]).join('')}
                          </div>
                          <span className="text-sm font-bold text-slate-700">{record.studentName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-2">
                        <div className="flex items-center justify-end gap-2">
                          {[
                            { name: 'PRESENT', color: 'emerald', icon: CheckCircle2 },
                            { name: 'ABSENT', color: 'rose', icon: XCircle },
                            { name: 'LATE', color: 'amber', icon: Clock },
                            { name: 'EXCUSED', color: 'slate', icon: AlertCircle },
                          ].map((s) => (
                            <button
                              key={s.name}
                              onClick={() => updateStatus(record.enrollmentId, s.name as any)}
                              className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-all flex items-center gap-1.5
                                ${record.status === s.name 
                                  ? `bg-${s.color}-600 text-white border-${s.color}-600 shadow-md shadow-${s.color}-500/20` 
                                  : `bg-white text-slate-400 border-slate-200 hover:border-${s.color}-200 hover:text-${s.color}-500`}`}
                            >
                              <s.icon className={`w-3 h-3 ${record.status === s.name ? 'text-white' : ''}`} />
                              {s.name}
                            </button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="px-6 py-20 text-center">
                      {loading ? (
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-8 h-8 border-4 border-brand-blue/20 border-t-brand-blue rounded-full animate-spin" />
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Compiling Roster...</p>
                        </div>
                      ) : (
                        <div className="max-w-xs mx-auto space-y-3">
                          <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-300 mx-auto">
                            <Users className="w-6 h-6" />
                          </div>
                          <p className="text-sm font-bold text-slate-400">No students found in this section roster.</p>
                        </div>
                      )}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="h-64 border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center p-12 text-center">
          <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mb-4 text-slate-300">
            <Search className="w-6 h-6" />
          </div>
          <p className="text-sm font-bold text-slate-400">Please select a course session from the dropdown to start tracking</p>
        </div>
      )}
    </div>
  );
}
