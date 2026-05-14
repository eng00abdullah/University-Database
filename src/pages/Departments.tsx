import { useState, useEffect } from 'react';
import { 
  Building2, 
  Plus, 
  MoreVertical, 
  Users, 
  GraduationCap,
  Briefcase,
  Loader2,
  Edit,
  Trash,
  Search,
  Filter,
  Check,
  FileText
} from 'lucide-react';
import { motion } from 'motion/react';
import axios from 'axios';
import Modal from '../components/Modal';

export default function Departments() {
  const [departments, setDepartments] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    deanId: ''
  });

  // Column visibility state
  const [visibleColumns, setVisibleColumns] = useState({
    name: true,
    dean: true,
    studentsCount: true,
    facultyCount: true,
  });
  const [showColumnSelector, setShowColumnSelector] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [deptsRes, empRes] = await Promise.all([
        axios.get('/api/departments'),
        axios.get('/api/employees')
      ]);
      setDepartments(Array.isArray(deptsRes.data) ? deptsRes.data : []);
      setEmployees(Array.isArray(empRes.data) ? empRes.data : []);
    } catch (err) {
      console.error(err);
      setDepartments([]);
      setEmployees([]);
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
        await axios.put(`/api/departments/${editingId}`, formData);
      } else {
        await axios.post('/api/departments', formData);
      }
      await fetchData();
      closeModal();
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || 'Error saving department');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`/api/departments/${id}`);
      await fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const openEditModal = (dept: any) => {
    setEditingId(dept.id);
    setFormData({
      name: dept.name,
      deanId: dept.deanId ? dept.deanId.toString() : ''
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({
      name: '',
      deanId: ''
    });
  };

  const filteredDepartments = departments.filter(d => {
    const searchStr = searchTerm.toLowerCase();
    const name = d.name.toLowerCase();
    const deanName = d.dean ? `${d.dean.firstName} ${d.dean.lastName}`.toLowerCase() : '';
    return name.includes(searchStr) || deanName.includes(searchStr);
  });

  const exportToCSV = () => {
    const headers = ["Department Name", "Dean", "Students Count", "Faculty Count"];
    const rows = filteredDepartments.map(d => [
      d.name,
      d.dean ? `Dr. ${d.dean.firstName} ${d.dean.lastName}` : 'N/A',
      d._count?.students || 0,
      d._count?.employees || 0
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n"
      + rows.map(r => r.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `departments_export_${new Date().toISOString().split('T')[0]}.csv`);
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
             <Building2 size={14} /> University Structure
          </div>
          <h1 className="text-2xl font-bold text-ui-text tracking-tight">Academic Departments</h1>
          <p className="text-ui-muted text-sm">Configure academic units, assign deans, and view performance.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-brand-pink text-white rounded-xl text-sm font-bold hover:bg-brand-pink/90 shadow-lg shadow-brand-pink/20 transition-all active:scale-[0.98]"
        >
          <Plus size={18} />
          Create Department
        </button>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={closeModal} 
        title={editingId ? "Edit Department" : "Create New Department"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-ui-muted uppercase tracking-wider">Department Name</label>
            <input 
              required
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="e.g. Faculty of Artificial Intelligence"
              className="w-full px-4 py-2 bg-ui-bg border border-ui-border rounded-xl text-sm focus:ring-2 focus:ring-brand-pink/10 outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-ui-muted uppercase tracking-wider">Assigned Dean (Optional)</label>
            <select 
              name="deanId"
              value={formData.deanId}
              onChange={handleInputChange}
              className="w-full px-4 py-2 bg-ui-bg border border-ui-border rounded-xl text-sm focus:ring-2 focus:ring-brand-pink/10 outline-none"
            >
              <option value="">Select Dean</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>Dr. {emp.firstName} {emp.lastName}</option>
              ))}
            </select>
          </div>
          <button 
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-brand-pink text-white rounded-xl font-bold hover:bg-brand-pink/90 transition-all flex items-center justify-center gap-2"
          >
            {submitting ? <Loader2 className="animate-spin" size={20} /> : (editingId ? 'Update Department' : 'Create Department')}
          </button>
        </form>
      </Modal>

      <div className="bg-white rounded-2xl border border-ui-border overflow-hidden">
        <div className="p-5 flex flex-col md:flex-row gap-4 items-center justify-between border-b border-ui-border">
          <div className="relative w-full md:max-w-md group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-ui-muted group-focus-within:text-brand-pink transition-colors" size={16} />
            <input 
              type="text" 
              placeholder="Search departments or deans..."
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
              className="flex-1 md:flex-none flex items-center justify-center gap-1 px-4 py-2 bg-white text-ui-text border border-ui-border rounded-xl text-xs font-bold hover:bg-ui-bg transition-all"
            >
              <FileText size={16} className="text-brand-pink" />
              Export CSV
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-ui-bg">
                {visibleColumns.name && <th className="px-6 py-3 text-[11px] font-bold text-ui-muted uppercase tracking-wider border-b border-ui-border">Department Name</th>}
                {visibleColumns.dean && <th className="px-6 py-3 text-[11px] font-bold text-ui-muted uppercase tracking-wider border-b border-ui-border">Assigned Dean</th>}
                {visibleColumns.studentsCount && <th className="px-6 py-3 text-[11px] font-bold text-ui-muted uppercase tracking-wider border-b border-ui-border text-center">Students</th>}
                {visibleColumns.facultyCount && <th className="px-6 py-3 text-[11px] font-bold text-ui-muted uppercase tracking-wider border-b border-ui-border text-center">Faculty</th>}
                <th className="px-6 py-3 text-[11px] font-bold text-ui-muted uppercase tracking-wider border-b border-ui-border text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-[13px]">
              {loading ? (
                <tr>
                   <td colSpan={5} className="py-12 text-center text-ui-muted font-medium">Loading departments...</td>
                </tr>
              ) : filteredDepartments.length === 0 ? (
                <tr>
                   <td colSpan={5} className="py-12 text-center text-ui-muted font-medium">No departments found</td>
                </tr>
              ) : filteredDepartments.map((dept, idx) => (
                <tr 
                  key={dept.id}
                  className="border-b border-[#F1F5F9] last:border-0 hover:bg-ui-bg/50 group transition-colors"
                >
                  {visibleColumns.name && (
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-brand-pink/5 text-brand-pink rounded-xl flex items-center justify-center">
                          <Building2 size={20} />
                        </div>
                        <span className="font-bold text-ui-text group-hover:text-brand-pink transition-colors">{dept.name}</span>
                      </div>
                    </td>
                  )}
                  {visibleColumns.dean && (
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-ui-bg flex items-center justify-center">
                          <Briefcase size={12} className="text-ui-muted" />
                        </div>
                        <span className="font-medium text-ui-text">
                          {dept.dean ? `Dr. ${dept.dean.firstName} ${dept.dean.lastName}` : 'Not Assigned'}
                        </span>
                      </div>
                    </td>
                  )}
                  {visibleColumns.studentsCount && (
                    <td className="px-6 py-4 text-center">
                      <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-bold">
                        {dept._count?.students || 0}
                      </span>
                    </td>
                  )}
                  {visibleColumns.facultyCount && (
                    <td className="px-6 py-4 text-center">
                      <span className="px-2 py-1 bg-brand-pink/5 text-brand-pink rounded-lg text-[10px] font-bold">
                        {dept._count?.employees || 0}
                      </span>
                    </td>
                  )}
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button 
                        onClick={() => openEditModal(dept)}
                        className="p-1.5 text-ui-muted hover:text-brand-pink hover:bg-brand-pink/5 rounded-lg transition-all"
                      >
                         <Edit size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(dept.id)}
                        className="p-1.5 text-ui-muted hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <Trash size={16} />
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
