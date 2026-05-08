import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, Search, Trash2, Edit3, Award, Calendar, 
  DollarSign, User, FileText, ChevronRight, CheckCircle2
} from 'lucide-react';
import { format } from 'date-fns';

interface Student {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
}

interface Scholarship {
  id: number;
  name: string;
  amount: number;
  startDate: string;
  endDate: string;
  studentId: number;
  student: Student;
}

export default function Scholarships() {
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingScholarship, setEditingScholarship] = useState<Scholarship | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    studentId: '',
    name: '',
    amount: '',
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [scholarshipsRes, studentsRes] = await Promise.all([
        axios.get('/api/scholarships'),
        axios.get('/api/students')
      ]);
      setScholarships(Array.isArray(scholarshipsRes.data) ? scholarshipsRes.data : []);
      setStudents(Array.isArray(studentsRes.data) ? studentsRes.data : []);
    } catch (err) {
      console.error('Error fetching data', err);
      setScholarships([]);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (scholarship?: Scholarship) => {
    if (scholarship) {
      setEditingScholarship(scholarship);
      setFormData({
        studentId: scholarship.studentId.toString(),
        name: scholarship.name,
        amount: scholarship.amount.toString(),
        startDate: scholarship.startDate.split('T')[0],
        endDate: scholarship.endDate.split('T')[0]
      });
    } else {
      setEditingScholarship(null);
      setFormData({
        studentId: '',
        name: '',
        amount: '',
        startDate: '',
        endDate: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingScholarship) {
        await axios.put(`/api/scholarships/${editingScholarship.id}`, formData);
      } else {
        await axios.post('/api/scholarships', formData);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      console.error('Error saving scholarship', err);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`/api/scholarships/${id}`);
      fetchData();
    } catch (err) {
      console.error('Error deleting scholarship', err);
    }
  };

  const filteredScholarships = scholarships.filter(s => 
    `${s.student.firstName} ${s.student.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Academic Scholarships</h1>
          <p className="text-slate-500 font-medium">Manage and award excellence through financial support</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-5 py-2.5 bg-brand-blue text-white rounded-xl text-sm font-bold hover:bg-brand-blue/90 shadow-lg shadow-brand-blue/10 transition-all font-sans"
        >
          <Plus className="w-4 h-4" />
          Grant New Award
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden shadow-slate-200/50">
        <div className="p-6 border-b border-slate-100">
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by student or scholarship name..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-11 bg-slate-50 border-none rounded-xl pl-11 pr-4 text-sm font-semibold focus:ring-2 focus:ring-brand-blue/20 transition-all outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-slate-100">
          {filteredScholarships.map((s, i) => (
            <motion.div
              key={s.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white p-6 hover:bg-slate-50 transition-colors relative group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-500">
                  <Award className="w-5 h-5" />
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => handleOpenModal(s)}
                    className="p-1.5 text-slate-400 hover:text-brand-blue hover:bg-brand-blue/5 rounded-md"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button 
                    onClick={() => handleDelete(s.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-md"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <h3 className="text-lg font-black text-slate-900 mb-1 leading-tight">{s.name}</h3>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-5 h-5 bg-ui-bg rounded-lg flex items-center justify-center text-ui-text font-black text-[8px]">
                  {s.student.firstName[0]}{s.student.lastName[0]}
                </div>
                <span className="text-xs font-bold text-slate-500">{s.student.firstName} {s.student.lastName}</span>
              </div>

              <div className="space-y-2 mb-6">
                <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-widest text-slate-400">
                  <span>Award Amount</span>
                  <span className="text-emerald-500">${s.amount.toLocaleString()}</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500" style={{ width: '100%' }} />
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase">
                  <Calendar className="w-3 h-3" />
                  {format(new Date(s.startDate), 'MMM yy')} - {format(new Date(s.endDate), 'MMM yy')}
                </div>
                <div className="flex items-center gap-1 text-[10px] font-black text-brand-blue uppercase tracking-widest">
                  Active
                  <CheckCircle2 className="w-3 h-3" />
                </div>
              </div>
            </motion.div>
          ))}

          {filteredScholarships.length === 0 && (
            <div className="col-span-full bg-white py-20 text-center">
              <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-4 text-slate-300">
                <Award className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">No Scholarships Found</h3>
              <p className="text-slate-400 text-sm max-w-xs mx-auto mt-1">Try adjusting your search or granting a new award to excellence students.</p>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl p-8 overflow-hidden font-sans"
            >
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900">{editingScholarship ? 'Update Award' : 'Grant New Award'}</h3>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Academic Distinction Program</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <User className="w-3 h-3" />
                    Recipient Student
                  </label>
                  <select 
                    required
                    value={formData.studentId}
                    onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                    className="w-full h-11 bg-slate-50 border-none rounded-xl px-4 text-xs font-bold' outline-none focus:ring-2 focus:ring-brand-blue/20 transition-all"
                  >
                    <option value="">Select student...</option>
                    {students.map(s => <option key={s.id} value={s.id}>{s.firstName} {s.lastName}</option>)}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Award className="w-3 h-3" />
                    Scholarship Title
                  </label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Presidential Merit Award"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full h-11 bg-slate-50 border-none rounded-xl px-4 text-xs font-bold outline-none focus:ring-2 focus:ring-brand-blue/20 transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <DollarSign className="w-3 h-3" />
                    Grant Amount
                  </label>
                  <input 
                    type="number" 
                    required
                    placeholder="Annual amount"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full h-11 bg-slate-50 border-none rounded-xl px-4 text-xs font-bold outline-none focus:ring-2 focus:ring-brand-blue/20 transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Start Date</label>
                    <input 
                      type="date" 
                      required
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className="w-full h-11 bg-slate-50 border-none rounded-xl px-4 text-xs font-bold outline-none focus:ring-2 focus:ring-brand-blue/20 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">End Date</label>
                    <input 
                      type="date" 
                      required
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      className="w-full h-11 bg-slate-50 border-none rounded-xl px-4 text-xs font-bold outline-none focus:ring-2 focus:ring-brand-blue/20 transition-all"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-6">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-5 py-3 bg-slate-100 text-slate-600 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-[2] px-5 py-3 bg-brand-blue text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-brand-blue/90 shadow-lg shadow-brand-blue/20 transition-all active:scale-[0.98]"
                  >
                    {editingScholarship ? 'Update Grant' : 'Grant Award'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
