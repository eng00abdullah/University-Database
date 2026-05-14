import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, Search, Filter, Trash2, Edit3, DollarSign, 
  CreditCard, Calendar, CheckCircle2, AlertCircle, Clock,
  ArrowUpRight, ArrowDownRight, Printer, Download, User
} from 'lucide-react';
import { format } from 'date-fns';

interface Student {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
}

interface Semester {
  id: number;
  name: string;
}

interface Fee {
  id: number;
  amount: number;
  paidAmount: number;
  dueDate: string;
  status: 'PAID' | 'PARTIAL' | 'UNPAID';
  studentId: number;
  semesterId: number;
  student: Student;
  semester: Semester;
}

export default function Finance({ user }: { user: any }) {
  const [fees, setFees] = useState<Fee[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFee, setEditingFee] = useState<Fee | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const isStudent = user?.role === 'STUDENT';

  const [formData, setFormData] = useState({
    studentId: '',
    semesterId: '',
    amount: '',
    paidAmount: '0',
    dueDate: '',
    status: 'UNPAID'
  });

  useEffect(() => {
    fetchData();
  }, [isStudent]);

  const fetchData = async () => {
    try {
      const [feesRes, studentsRes, semestersRes] = await Promise.all([
        axios.get('/api/fees'),
        !isStudent ? axios.get('/api/students') : Promise.resolve({ data: [] }),
        axios.get('/api/semesters')
      ]);
      setFees(Array.isArray(feesRes.data) ? feesRes.data : []);
      setStudents(Array.isArray(studentsRes.data) ? studentsRes.data : []);
      setSemesters(Array.isArray(semestersRes.data) ? semestersRes.data : []);
    } catch (err) {
      console.error('Error fetching data', err);
      setFees([]);
      setStudents([]);
      setSemesters([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (fee?: Fee) => {
    if (fee) {
      setEditingFee(fee);
      setFormData({
        studentId: fee.studentId.toString(),
        semesterId: fee.semesterId.toString(),
        amount: fee.amount.toString(),
        paidAmount: fee.paidAmount.toString(),
        dueDate: fee.dueDate.split('T')[0],
        status: fee.status
      });
    } else {
      setEditingFee(null);
      setFormData({
        studentId: '',
        semesterId: '',
        amount: '',
        paidAmount: '0',
        dueDate: '',
        status: 'UNPAID'
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingFee) {
        await axios.put(`/api/fees/${editingFee.id}`, formData);
      } else {
        await axios.post('/api/fees', formData);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      console.error('Error saving fee', err);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`/api/fees/${id}`);
      fetchData();
    } catch (err) {
      console.error('Error deleting fee', err);
    }
  };

  const filteredFees = fees.filter(f => 
    `${f.student.firstName} ${f.student.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalBilled = fees.reduce((sum, f) => sum + f.amount, 0);
  const totalPaid = fees.reduce((sum, f) => sum + f.paidAmount, 0);
  const totalOutstanding = totalBilled - totalPaid;

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'PAID': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'PARTIAL': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'UNPAID': return 'bg-rose-50 text-rose-600 border-rose-100';
      default: return 'bg-slate-50 text-slate-600';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">University Finance</h1>
          <p className="text-slate-500 font-medium">Manage tuition fees, payments, and financial records</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
            <Download className="w-5 h-5" />
          </button>
          {!isStudent && (
            <button 
              onClick={() => handleOpenModal()}
              className="flex items-center gap-2 px-5 py-2.5 bg-brand-blue text-white rounded-xl text-sm font-bold hover:bg-brand-blue/90 shadow-lg shadow-brand-blue/10 transition-all"
            >
              <Plus className="w-4 h-4" />
              Issue New Invoice
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Total Billed', value: totalBilled, icon: CreditCard, color: 'brand-blue', suffix: 'Total revenue projection' },
          { label: 'Payments Received', value: totalPaid, icon: ArrowDownRight, color: 'emerald', suffix: 'Actual cash inflow' },
          { label: 'Outstanding Balance', value: totalOutstanding, icon: Clock, color: 'rose', suffix: 'Pending receivables' },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm shadow-slate-200/50 relative overflow-hidden"
          >
            <div className={`absolute top-0 right-0 w-32 h-32 bg-${stat.color}/5 rounded-full -mr-16 -mt-16`} />
            <div className="relative">
              <div className={`w-10 h-10 bg-${stat.color}/10 rounded-xl flex items-center justify-center text-${stat.color} mb-4`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <h3 className="text-slate-400 text-xs font-black uppercase tracking-widest mb-1">{stat.label}</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-slate-900">${stat.value.toLocaleString()}</span>
                <span className="text-slate-400 text-sm font-bold uppercase tracking-tighter">USD</span>
              </div>
              <p className="text-[10px] text-slate-400 font-bold mt-2 uppercase tracking-wider">{stat.suffix}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden shadow-slate-200/50">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by student name..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-11 bg-slate-50 border-none rounded-xl pl-11 pr-4 text-sm font-semibold focus:ring-2 focus:ring-brand-blue/20 transition-all outline-none"
            />
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 text-xs font-black text-slate-500 uppercase tracking-widest hover:bg-slate-50 rounded-lg transition-colors">
              <Filter className="w-3.5 h-3.5" />
              Filter
            </button>
            <div className="w-[1px] h-4 bg-slate-200 mx-1" />
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{filteredFees.length} Invoices</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-4 text-left text-[11px] font-black text-slate-400 uppercase tracking-widest">Student</th>
                <th className="px-6 py-4 text-left text-[11px] font-black text-slate-400 uppercase tracking-widest">Semester</th>
                <th className="px-6 py-4 text-left text-[11px] font-black text-slate-400 uppercase tracking-widest">Due Date</th>
                <th className="px-6 py-4 text-right text-[11px] font-black text-slate-400 uppercase tracking-widest">Billed / Paid</th>
                <th className="px-6 py-4 text-center text-[11px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-right text-[11px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredFees.map((fee) => (
                <tr key={fee.id} className="group hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-ui-bg rounded-xl flex items-center justify-center text-ui-text font-bold text-xs">
                        {fee.student.firstName[0]}{fee.student.lastName[0]}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-700">{fee.student.firstName} {fee.student.lastName}</div>
                        <div className="text-[10px] text-slate-400 font-bold tracking-tight">{fee.student.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded-md">{fee.semester.name}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
                      <Calendar className="w-3 h-3" />
                      {format(new Date(fee.dueDate), 'MMM dd, yyyy')}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="text-sm font-black text-slate-800">${fee.amount.toLocaleString()}</div>
                    <div className="text-[10px] font-black text-emerald-500 tracking-tight">Paid: ${fee.paidAmount.toLocaleString()}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusStyle(fee.status)}`}>
                        {fee.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {!isStudent && (
                        <>
                          <button 
                            onClick={() => handleOpenModal(fee)}
                            className="p-2 text-slate-400 hover:text-brand-blue hover:bg-brand-blue/5 rounded-lg transition-all"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(fee.id)}
                            className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      {isStudent && (
                        <button className="p-2 text-brand-blue hover:bg-brand-blue/5 rounded-lg transition-all flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest">
                          <Download className="w-3.5 h-3.5" />
                          Receipt
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
              className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl p-8 overflow-hidden"
            >
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-brand-blue/10 rounded-2xl flex items-center justify-center text-brand-blue">
                  <CreditCard className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900">{editingFee ? 'Edit Invoice' : 'Issue New Invoice'}</h3>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Financial Records Management</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                      <User className="w-3 h-3" />
                      Assign Student
                    </label>
                    <select 
                      required
                      value={formData.studentId}
                      onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                      className="w-full h-11 bg-slate-50 border-none rounded-xl px-4 text-xs font-bold focus:ring-2 focus:ring-brand-blue/20 transition-all outline-none"
                    >
                      <option value="">Select student...</option>
                      {students.map(s => <option key={s.id} value={s.id}>{s.firstName} {s.lastName}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                      <Calendar className="w-3 h-3" />
                      Academic Semester
                    </label>
                    <select 
                      required
                      value={formData.semesterId}
                      onChange={(e) => setFormData({ ...formData, semesterId: e.target.value })}
                      className="w-full h-11 bg-slate-50 border-none rounded-xl px-4 text-xs font-bold focus:ring-2 focus:ring-brand-blue/20 transition-all outline-none"
                    >
                      <option value="">Select term...</option>
                      {semesters.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Billed Amount ($)</label>
                    <input 
                      type="number" 
                      required
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      className="w-full h-11 bg-slate-50 border-none rounded-xl px-4 text-xs font-bold focus:ring-2 focus:ring-brand-blue/20 transition-all outline-none"
                      placeholder="e.g. 1500"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Paid Amount ($)</label>
                    <input 
                      type="number" 
                      required
                      value={formData.paidAmount}
                      onChange={(e) => setFormData({ ...formData, paidAmount: e.target.value })}
                      className="w-full h-11 bg-slate-50 border-none rounded-xl px-4 text-xs font-bold focus:ring-2 focus:ring-brand-blue/20 transition-all outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Due Date</label>
                    <input 
                      type="date" 
                      required
                      value={formData.dueDate}
                      onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                      className="w-full h-11 bg-slate-50 border-none rounded-xl px-4 text-xs font-bold focus:ring-2 focus:ring-brand-blue/20 transition-all outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Payment Status</label>
                    <select 
                      required
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full h-11 bg-slate-50 border-none rounded-xl px-4 text-xs font-bold focus:ring-2 focus:ring-brand-blue/20 transition-all outline-none"
                    >
                      <option value="UNPAID">UNPAID</option>
                      <option value="PARTIAL">PARTIAL</option>
                      <option value="PAID">PAID</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
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
                    {editingFee ? 'Update Record' : 'Create Invoice'}
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
