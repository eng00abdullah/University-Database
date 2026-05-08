import { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  Plus, 
  MoreVertical, 
  GraduationCap, 
  ChevronRight,
  TrendingUp,
  Mail,
  Phone,
  Trash2,
  Check,
  Edit,
  FileText,
  Loader2
} from 'lucide-react';
import { motion } from 'motion/react';
import axios from 'axios';
import Modal from '../components/Modal';

export default function Students() {
  const [students, setStudents] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    birthDate: '',
    address: '',
    departmentId: ''
  });

  // Column visibility state
  const [visibleColumns, setVisibleColumns] = useState({
    student: true,
    department: true,
    contact: true,
    birthDate: true,
    address: true,
  });
  const [showColumnSelector, setShowColumnSelector] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [studentsRes, deptsRes] = await Promise.all([
        axios.get('/api/students'),
        axios.get('/api/departments')
      ]);
      setStudents(Array.isArray(studentsRes.data) ? studentsRes.data : []);
      setDepartments(Array.isArray(deptsRes.data) ? deptsRes.data : []);
    } catch (err) {
      console.error(err);
      setStudents([]);
      setDepartments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingId) {
        await axios.put(`/api/students/${editingId}`, formData);
      } else {
        await axios.post('/api/students', formData);
      }
      await fetchData();
      closeModal();
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || 'Error saving student');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`/api/students/${id}`);
      await fetchData();
    } catch (err: any) {
      console.error(err);
    }
  };

  const openEditModal = (student: any) => {
    setEditingId(student.id);
    setFormData({
      firstName: student.firstName,
      lastName: student.lastName,
      email: student.email,
      phone: student.phone,
      birthDate: student.birthDate.split('T')[0],
      address: student.address,
      departmentId: student.departmentId?.toString() || ''
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      birthDate: '',
      address: '',
      departmentId: ''
    });
  };

  const filteredStudents = students.filter(s => {
    const searchStr = searchTerm.toLowerCase();
    const fullName = `${s.firstName} ${s.lastName}`.toLowerCase();
    const deptName = (s.department?.name || '').toLowerCase();
    const phone = (s.phone || '').toLowerCase();
    const address = (s.address || '').toLowerCase();
    const email = (s.email || '').toLowerCase();
    const studentId = `STU-${s.id.toString().padStart(4, '0')}`.toLowerCase();
    
    return fullName.includes(searchStr) || 
           email.includes(searchStr) || 
           deptName.includes(searchStr) ||
           phone.includes(searchStr) ||
           address.includes(searchStr) ||
           studentId.includes(searchStr);
  });

  const exportToCSV = () => {
    const headers = ["ID", "First Name", "Last Name", "Email", "Phone", "Birth Date", "Address", "Department"];
    const rows = filteredStudents.map(s => [
      `STU-${s.id.toString().padStart(4, '0')}`,
      s.firstName,
      s.lastName,
      s.email,
      s.phone,
      new Date(s.birthDate).toLocaleDateString(),
      s.address,
      s.department?.name || 'N/A'
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n"
      + rows.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `students_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toggleColumn = (column: keyof typeof visibleColumns) => {
    setVisibleColumns(prev => ({ ...prev, [column]: !prev[column] }));
  };

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-ui-muted text-xs font-bold uppercase tracking-wider mb-1">
             <GraduationCap size={14} /> Academics {'>'} Student Directory
          </div>
          <h1 className="text-2xl font-bold text-ui-text tracking-tight">Active Students</h1>
          <p className="text-ui-muted text-sm">Manage student profiles, records, and academic status.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-brand-pink text-white rounded-xl text-sm font-bold hover:bg-brand-pink/90 shadow-lg shadow-brand-pink/20 transition-all active:scale-[0.98]"
        >
          <Plus size={18} />
          Register Student
        </button>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Register New Student"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-ui-muted uppercase tracking-wider">First Name</label>
              <input 
                required
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-ui-bg border border-ui-border rounded-xl text-sm focus:ring-2 focus:ring-brand-pink/10 outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-ui-muted uppercase tracking-wider">Last Name</label>
              <input 
                required
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-ui-bg border border-ui-border rounded-xl text-sm focus:ring-2 focus:ring-brand-pink/10 outline-none"
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-ui-muted uppercase tracking-wider">Email Address</label>
            <input 
              required
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-4 py-2 bg-ui-bg border border-ui-border rounded-xl text-sm focus:ring-2 focus:ring-brand-pink/10 outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-ui-muted uppercase tracking-wider">Phone</label>
              <input 
                required
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-ui-bg border border-ui-border rounded-xl text-sm focus:ring-2 focus:ring-brand-pink/10 outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-ui-muted uppercase tracking-wider">Birth Date</label>
              <input 
                required
                type="date"
                name="birthDate"
                value={formData.birthDate}
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-ui-bg border border-ui-border rounded-xl text-sm focus:ring-2 focus:ring-brand-pink/10 outline-none"
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-ui-muted uppercase tracking-wider">Department (Optional)</label>
            <select 
              name="departmentId"
              value={formData.departmentId}
              onChange={handleInputChange}
              className="w-full px-4 py-2 bg-ui-bg border border-ui-border rounded-xl text-sm focus:ring-2 focus:ring-brand-pink/10 outline-none"
            >
              <option value="">Select Department</option>
              {departments.map(dept => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-ui-muted uppercase tracking-wider">Address</label>
            <input 
              required
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              className="w-full px-4 py-2 bg-ui-bg border border-ui-border rounded-xl text-sm focus:ring-2 focus:ring-brand-pink/10 outline-none"
            />
          </div>
          <button 
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-brand-pink text-white rounded-xl font-bold hover:bg-brand-pink/90 transition-all flex items-center justify-center gap-2"
          >
            {submitting ? <Loader2 className="animate-spin" size={20} /> : 'Register Student'}
          </button>
        </form>
      </Modal>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-ui-border flex items-center gap-4">
           <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
             <Users size={20} />
           </div>
           <div>
             <p className="text-[11px] font-bold text-ui-muted uppercase tracking-wider">Total Enrolled</p>
             <p className="text-xl font-bold text-ui-text">{students.length}</p>
           </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-ui-border flex items-center gap-4">
           <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
             <TrendingUp size={20} />
           </div>
           <div>
             <p className="text-[11px] font-bold text-ui-muted uppercase tracking-wider">Avg GPA</p>
             <p className="text-xl font-bold text-ui-text">3.82</p>
           </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-ui-border flex items-center gap-4">
           <div className="w-12 h-12 bg-pink-50 text-brand-pink rounded-xl flex items-center justify-center">
             <FileText size={20} />
           </div>
           <div>
             <p className="text-[11px] font-bold text-ui-muted uppercase tracking-wider">Scholarships</p>
             <p className="text-xl font-bold text-ui-text">12%</p>
           </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-ui-border overflow-hidden">
        <div className="p-5 flex flex-col md:flex-row gap-4 items-center justify-between border-b border-ui-border">
          <div className="relative w-full md:max-w-md group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-ui-muted group-focus-within:text-brand-pink transition-colors" size={16} />
            <input 
              type="text" 
              placeholder="Search by name, ID or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-ui-bg border border-ui-border rounded-xl text-sm focus:ring-2 focus:ring-brand-pink/10 focus:bg-white outline-none transition-all"
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto relative">
            <div className="relative">
              <button 
                onClick={() => setShowColumnSelector(!showColumnSelector)}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white text-ui-text border border-ui-border rounded-xl text-xs font-bold hover:bg-ui-bg transition-all"
              >
                <Filter size={16} />
                Columns
              </button>
              
              {showColumnSelector && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-ui-border rounded-xl shadow-xl z-50 p-2 space-y-1">
                  {Object.entries(visibleColumns).map(([key, value]) => (
                    <button
                      key={key}
                      onClick={() => toggleColumn(key as any)}
                      className="w-full flex items-center justify-between px-3 py-2 text-xs font-bold text-ui-text hover:bg-ui-bg rounded-lg transition-all"
                    >
                      <span className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                      {value && <Check size={14} className="text-brand-pink" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <button 
              onClick={exportToCSV}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white text-ui-text border border-ui-border rounded-xl text-xs font-bold hover:bg-ui-bg transition-all"
            >
              Export CSV
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-ui-bg">
                {visibleColumns.student && <th className="px-6 py-3 text-[11px] font-bold text-ui-muted uppercase tracking-wider border-b border-ui-border">Student</th>}
                {visibleColumns.department && <th className="px-6 py-3 text-[11px] font-bold text-ui-muted uppercase tracking-wider border-b border-ui-border">Department</th>}
                {visibleColumns.contact && <th className="px-6 py-3 text-[11px] font-bold text-ui-muted uppercase tracking-wider border-b border-ui-border">Contact</th>}
                {visibleColumns.birthDate && <th className="px-6 py-3 text-[11px] font-bold text-ui-muted uppercase tracking-wider border-b border-ui-border text-center">Birth Date</th>}
                {visibleColumns.address && <th className="px-6 py-3 text-[11px] font-bold text-ui-muted uppercase tracking-wider border-b border-ui-border overflow-hidden max-w-[150px]">Address</th>}
                <th className="px-6 py-3 text-[11px] font-bold text-ui-muted uppercase tracking-wider border-b border-ui-border text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-[13px]">
              {loading ? (
                <tr>
                   <td colSpan={6} className="py-12 text-center text-ui-muted font-medium">Loading students...</td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                   <td colSpan={6} className="py-12 text-center text-ui-muted font-medium">No students found</td>
                </tr>
              ) : filteredStudents.map((student, idx) => (
                <tr 
                  key={student.id}
                  className="border-b border-[#F1F5F9] last:border-0 hover:bg-ui-bg/50 group transition-colors"
                >
                  {visibleColumns.student && (
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <img src={`https://ui-avatars.com/api/?name=${student.firstName}+${student.lastName}&background=fce7f3&color=db2777`} className="w-10 h-10 rounded-xl object-cover" alt="avatar" />
                          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white"></div>
                        </div>
                        <div>
                          <p className="font-bold text-ui-text group-hover:text-brand-pink transition-colors">{student.firstName} {student.lastName}</p>
                          <p className="text-[11px] text-ui-muted">ID: #STU-{student.id.toString().padStart(4, '0')}</p>
                        </div>
                      </div>
                    </td>
                  )}
                  {visibleColumns.department && (
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-bold border border-indigo-100 uppercase">
                        {student.department?.name || 'Undeclared'}
                      </span>
                    </td>
                  )}
                  {visibleColumns.contact && (
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-1.5 text-ui-text font-medium text-xs">
                          <Mail size={12} className="text-brand-pink" />
                          {student.email}
                        </div>
                        <div className="flex items-center gap-1.5 text-ui-muted text-[11px]">
                          <Phone size={11} />
                          {student.phone}
                        </div>
                      </div>
                    </td>
                  )}
                  {visibleColumns.birthDate && (
                    <td className="px-6 py-4 text-center text-ui-muted font-medium">
                      {new Date(student.birthDate).toLocaleDateString()}
                    </td>
                  )}
                  {visibleColumns.address && (
                    <td className="px-6 py-4 text-ui-muted font-medium truncate max-w-[150px]">
                      {student.address}
                    </td>
                  )}
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                       <button 
                         onClick={() => openEditModal(student)}
                         className="p-1.5 text-ui-muted hover:text-brand-pink hover:bg-brand-pink/5 rounded-lg transition-all"
                       >
                         <Edit size={16} />
                       </button>
                       <button 
                         onClick={() => handleDelete(student.id)}
                         className="p-1.5 text-ui-muted hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                       >
                         <Trash2 size={16} />
                       </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="px-6 py-4 bg-ui-bg border-t border-ui-border flex items-center justify-between">
          <p className="text-[12px] text-ui-muted font-medium">Showing <span className="font-bold text-ui-text">{filteredStudents.length}</span> out of <span className="font-bold text-ui-text">{students.length}</span></p>
          <div className="flex gap-2">
            <button className="px-3 py-1.5 bg-white border border-ui-border rounded-lg text-[11px] font-bold text-ui-muted cursor-not-allowed">Previous</button>
            <button className="px-3 py-1.5 bg-white border border-ui-border rounded-lg text-[11px] font-bold text-ui-text hover:border-brand-pink transition-all hover:text-brand-pink">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
