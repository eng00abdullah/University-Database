import { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  Plus, 
  MoreVertical, 
  Briefcase,
  Mail,
  DollarSign,
  Phone,
  Loader2,
  Trash2,
  Check,
  Edit,
  FileText
} from 'lucide-react';
import { motion } from 'motion/react';
import axios from 'axios';
import Modal from '../components/Modal';

export default function Employees() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    jobTitle: '',
    staffType: 'ACADEMIC',
    salary: '',
    departmentId: ''
  });

  // Column visibility state
  const [visibleColumns, setVisibleColumns] = useState({
    employee: true,
    titleType: true,
    department: true,
    contact: true,
    salary: true,
  });
  const [showColumnSelector, setShowColumnSelector] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [empRes, deptsRes] = await Promise.all([
        axios.get('/api/employees'),
        axios.get('/api/departments')
      ]);
      setEmployees(Array.isArray(empRes.data) ? empRes.data : []);
      setDepartments(Array.isArray(deptsRes.data) ? deptsRes.data : []);
    } catch (err) {
      console.error(err);
      setEmployees([]);
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
        await axios.put(`/api/employees/${editingId}`, formData);
      } else {
        await axios.post('/api/employees', formData);
      }
      await fetchData();
      closeModal();
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || 'Error saving employee');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`/api/employees/${id}`);
      await fetchData();
    } catch (err: any) {
      console.error(err);
    }
  };

  const openEditModal = (emp: any) => {
    setEditingId(emp.id);
    setFormData({
      firstName: emp.firstName,
      lastName: emp.lastName,
      email: emp.email,
      phone: emp.phone,
      jobTitle: emp.jobTitle,
      staffType: emp.staffType,
      salary: emp.salary.toString(),
      departmentId: emp.departmentId?.toString() || ''
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
      jobTitle: '',
      staffType: 'ACADEMIC',
      salary: '',
      departmentId: ''
    });
  };

  const filteredEmployees = employees.filter(e => {
    const searchStr = searchTerm.toLowerCase();
    const fullName = `${e.firstName} ${e.lastName}`.toLowerCase();
    const jobTitle = (e.jobTitle || '').toLowerCase();
    const email = (e.email || '').toLowerCase();
    const phone = (e.phone || '').toLowerCase();
    const deptName = (e.department?.name || '').toLowerCase();
    const staffType = (e.staffType || '').toLowerCase();

    return fullName.includes(searchStr) || 
           jobTitle.includes(searchStr) || 
           email.includes(searchStr) ||
           phone.includes(searchStr) ||
           deptName.includes(searchStr) ||
           staffType.includes(searchStr);
  });

  const exportToCSV = () => {
    const headers = ["First Name", "Last Name", "Email", "Phone", "Job Title", "Staff Type", "Salary", "Department"];
    const rows = filteredEmployees.map(e => [
      e.firstName,
      e.lastName,
      e.email,
      e.phone,
      e.jobTitle,
      e.staffType,
      e.salary,
      e.department?.name || 'N/A'
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n"
      + rows.map(r => r.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `employees_export_${new Date().toISOString().split('T')[0]}.csv`);
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
             <Briefcase size={14} /> Administration {'>'} Staff Directory
          </div>
          <h1 className="text-2xl font-bold text-ui-text tracking-tight">University Staff</h1>
          <p className="text-ui-muted text-sm">Manage employees, faculty members, and administrative staff.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-brand-pink text-white rounded-xl text-sm font-bold hover:bg-brand-pink/90 shadow-lg shadow-brand-pink/20 transition-all active:scale-[0.98]"
        >
          <Plus size={18} />
          Add Employee
        </button>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={closeModal} 
        title={editingId ? "Edit Employee" : "Add New Employee"}
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
          <div className="grid grid-cols-2 gap-4">
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
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-ui-muted uppercase tracking-wider">Job Title</label>
              <input 
                required
                name="jobTitle"
                value={formData.jobTitle}
                onChange={handleInputChange}
                placeholder="e.g. Senior Professor"
                className="w-full px-4 py-2 bg-ui-bg border border-ui-border rounded-xl text-sm focus:ring-2 focus:ring-brand-pink/10 outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-ui-muted uppercase tracking-wider">Staff Type</label>
              <select 
                required
                name="staffType"
                value={formData.staffType}
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-ui-bg border border-ui-border rounded-xl text-sm focus:ring-2 focus:ring-brand-pink/10 outline-none"
              >
                <option value="ACADEMIC">Academic</option>
                <option value="ADMINISTRATIVE">Administrative</option>
                <option value="SUPPORT">Support</option>
                <option value="TECHNICAL">Technical</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-ui-muted uppercase tracking-wider">Salary ($)</label>
              <input 
                required
                type="number"
                name="salary"
                value={formData.salary}
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-ui-bg border border-ui-border rounded-xl text-sm focus:ring-2 focus:ring-brand-pink/10 outline-none"
              />
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
          </div>
          <button 
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-brand-pink text-white rounded-xl font-bold hover:bg-brand-pink/90 transition-all flex items-center justify-center gap-2"
          >
            {submitting ? <Loader2 className="animate-spin" size={20} /> : (editingId ? 'Update Employee' : 'Add Employee')}
          </button>
        </form>
      </Modal>

      <div className="bg-white rounded-2xl border border-ui-border overflow-hidden">
        <div className="p-5 flex flex-col md:flex-row gap-4 items-center justify-between border-b border-ui-border">
          <div className="relative w-full md:max-w-md group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-ui-muted group-focus-within:text-brand-pink transition-colors" size={16} />
            <input 
              type="text" 
              placeholder="Search by name, role or email..."
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
                {visibleColumns.employee && <th className="px-6 py-3 text-[11px] font-bold text-ui-muted uppercase tracking-wider border-b border-ui-border">Employee</th>}
                {visibleColumns.titleType && <th className="px-6 py-3 text-[11px] font-bold text-ui-muted uppercase tracking-wider border-b border-ui-border">Title & Type</th>}
                {visibleColumns.department && <th className="px-6 py-3 text-[11px] font-bold text-ui-muted uppercase tracking-wider border-b border-ui-border">Department</th>}
                {visibleColumns.contact && <th className="px-6 py-3 text-[11px] font-bold text-ui-muted uppercase tracking-wider border-b border-ui-border">Contact</th>}
                {visibleColumns.salary && <th className="px-6 py-3 text-[11px] font-bold text-ui-muted uppercase tracking-wider border-b border-ui-border">Salary</th>}
                <th className="px-6 py-3 text-[11px] font-bold text-ui-muted uppercase tracking-wider border-b border-ui-border text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-[13px]">
              {loading ? (
                <tr>
                   <td colSpan={6} className="py-12 text-center text-ui-muted font-medium">Loading staff...</td>
                </tr>
              ) : filteredEmployees.length === 0 ? (
                <tr>
                   <td colSpan={6} className="py-12 text-center text-ui-muted font-medium">No employees found</td>
                </tr>
              ) : filteredEmployees.map((emp, idx) => (
                <tr 
                  key={emp.id}
                  className="border-b border-[#F1F5F9] last:border-0 hover:bg-ui-bg/50 group transition-colors"
                >
                  {visibleColumns.employee && (
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img src={`https://ui-avatars.com/api/?name=${emp.firstName}+${emp.lastName}&background=e0e7ff&color=4338ca`} className="w-10 h-10 rounded-xl" alt="avatar" />
                        <div>
                          <p className="font-bold text-ui-text group-hover:text-brand-pink transition-colors">{emp.firstName} {emp.lastName}</p>
                          <p className="text-[11px] text-ui-muted">{emp.email}</p>
                        </div>
                      </div>
                    </td>
                  )}
                  {visibleColumns.titleType && (
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-semibold text-ui-text">{emp.jobTitle}</p>
                        <p className="text-[10px] font-bold text-brand-blue uppercase tracking-wider">{emp.staffType}</p>
                      </div>
                    </td>
                  )}
                  {visibleColumns.department && (
                    <td className="px-6 py-4">
                      {emp.department ? (
                        <span className="px-2 py-0.5 bg-ui-bg text-ui-muted rounded-lg text-[10px] font-bold border border-ui-border uppercase">
                          {emp.department.name}
                        </span>
                      ) : (
                        <span className="text-[10px] text-ui-muted italic">No Department</span>
                      )}
                    </td>
                  )}
                  {visibleColumns.contact && (
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-1.5 text-ui-text font-medium text-xs">
                          <Mail size={12} className="text-brand-pink" />
                          {emp.email}
                        </div>
                        <div className="flex items-center gap-1.5 text-ui-muted text-[11px]">
                          <Phone size={11} />
                          {emp.phone}
                        </div>
                      </div>
                    </td>
                  )}
                  {visibleColumns.salary && (
                    <td className="px-6 py-4 font-bold text-ui-text">
                      ${emp.salary.toLocaleString()}
                    </td>
                  )}
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button 
                        onClick={() => openEditModal(emp)}
                        className="p-1.5 text-ui-muted hover:text-brand-pink hover:bg-brand-pink/5 rounded-lg transition-all"
                      >
                         <Edit size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(emp.id)}
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
      </div>
    </div>
  );
}
