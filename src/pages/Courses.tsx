import { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Search, 
  Plus, 
  MoreVertical, 
  Clock, 
  Layers,
  GraduationCap,
  Loader2,
  Trash2,
  Edit,
  Filter,
  Check,
  FileText
} from 'lucide-react';
import { motion } from 'motion/react';
import axios from 'axios';
import Modal from '../components/Modal';

export default function Courses() {
  const [courses, setCourses] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    creditHours: '3',
    departmentId: ''
  });

  // Column visibility state
  const [visibleColumns, setVisibleColumns] = useState({
    courseName: true,
    creditHours: true,
    department: true,
    courseCode: true,
  });
  const [showColumnSelector, setShowColumnSelector] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [coursesRes, deptsRes] = await Promise.all([
        axios.get('/api/courses'),
        axios.get('/api/departments')
      ]);
      setCourses(Array.isArray(coursesRes.data) ? coursesRes.data : []);
      setDepartments(Array.isArray(deptsRes.data) ? deptsRes.data : []);
    } catch (err) {
      console.error(err);
      setCourses([]);
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
        await axios.put(`/api/courses/${editingId}`, formData);
      } else {
        await axios.post('/api/courses', formData);
      }
      await fetchData();
      closeModal();
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || 'Error saving course');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`/api/courses/${id}`);
      await fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const openEditModal = (course: any) => {
    setEditingId(course.id);
    setFormData({
      name: course.name,
      creditHours: course.creditHours.toString(),
      departmentId: course.departmentId?.toString() || ''
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({
      name: '',
      creditHours: '3',
      departmentId: ''
    });
  };

  const filteredCourses = courses.filter(c => {
    const searchStr = searchTerm.toLowerCase();
    const name = c.name.toLowerCase();
    const deptName = (c.department?.name || '').toLowerCase();
    return name.includes(searchStr) || deptName.includes(searchStr);
  });

  const exportToCSV = () => {
    const headers = ["Course Name", "Credit Hours", "Department", "Course Code"];
    const rows = filteredCourses.map(c => [
      c.name,
      c.creditHours,
      c.department?.name || 'N/A',
      `CS-${c.id + 100}`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n"
      + rows.map(r => r.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `courses_export_${new Date().toISOString().split('T')[0]}.csv`);
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
             <BookOpen size={14} /> Academics {'>'} Course Catalog
          </div>
          <h1 className="text-2xl font-bold text-ui-text tracking-tight">University Courses</h1>
          <p className="text-ui-muted text-sm">Browse and manage academic courses across all departments.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-brand-pink text-white rounded-xl text-sm font-bold hover:bg-brand-pink/90 shadow-lg shadow-brand-pink/20 transition-all active:scale-[0.98]"
        >
          <Plus size={18} />
          New Course
        </button>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Add New Course"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-ui-muted uppercase tracking-wider">Course Name</label>
            <input 
              required
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="e.g. Advanced Thermodynamics"
              className="w-full px-4 py-2 bg-ui-bg border border-ui-border rounded-xl text-sm focus:ring-2 focus:ring-brand-pink/10 outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-ui-muted uppercase tracking-wider">Credit Hours</label>
              <input 
                required
                type="number"
                name="creditHours"
                value={formData.creditHours}
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
            {submitting ? <Loader2 className="animate-spin" size={20} /> : 'Create Course'}
          </button>
        </form>
      </Modal>

      <div className="bg-white rounded-2xl border border-ui-border overflow-hidden">
        <div className="p-5 flex flex-col md:flex-row gap-4 items-center justify-between border-b border-ui-border">
          <div className="relative w-full md:max-w-md group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-ui-muted group-focus-within:text-brand-pink transition-colors" size={16} />
            <input 
              type="text" 
              placeholder="Search by course name or department..."
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
                {visibleColumns.courseName && <th className="px-6 py-3 text-[11px] font-bold text-ui-muted uppercase tracking-wider border-b border-ui-border">Course Name</th>}
                {visibleColumns.creditHours && <th className="px-6 py-3 text-[11px] font-bold text-ui-muted uppercase tracking-wider border-b border-ui-border text-center">Credits</th>}
                {visibleColumns.department && <th className="px-6 py-3 text-[11px] font-bold text-ui-muted uppercase tracking-wider border-b border-ui-border">Department</th>}
                {visibleColumns.courseCode && <th className="px-6 py-3 text-[11px] font-bold text-ui-muted uppercase tracking-wider border-b border-ui-border">Course Code</th>}
                <th className="px-6 py-3 text-[11px] font-bold text-ui-muted uppercase tracking-wider border-b border-ui-border text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-[13px]">
              {loading ? (
                <tr>
                   <td colSpan={5} className="py-12 text-center text-ui-muted font-medium">Loading courses...</td>
                </tr>
              ) : filteredCourses.length === 0 ? (
                <tr>
                   <td colSpan={5} className="py-12 text-center text-ui-muted font-medium">No courses found</td>
                </tr>
              ) : filteredCourses.map((course, idx) => (
                <tr 
                  key={course.id}
                  className="border-b border-[#F1F5F9] last:border-0 hover:bg-ui-bg/50 group transition-colors"
                >
                  {visibleColumns.courseName && (
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-brand-pink/5 text-brand-pink rounded-lg flex items-center justify-center font-bold text-xs capitalize">
                          {course.name.charAt(0)}
                        </div>
                        <span className="font-bold text-ui-text group-hover:text-brand-pink transition-colors">{course.name}</span>
                      </div>
                    </td>
                  )}
                  {visibleColumns.creditHours && (
                    <td className="px-6 py-4 text-center font-semibold text-ui-muted">
                      {course.creditHours} Hrs
                    </td>
                  )}
                  {visibleColumns.department && (
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-bold border border-indigo-100 uppercase">
                        {course.department?.name}
                      </span>
                    </td>
                  )}
                  {visibleColumns.courseCode && (
                    <td className="px-6 py-4 text-ui-muted font-medium">
                      CS-{course.id + 100}
                    </td>
                  )}
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button 
                        onClick={() => openEditModal(course)}
                        className="p-1.5 text-ui-muted hover:text-brand-pink hover:bg-brand-pink/5 rounded-lg transition-all"
                      >
                         <Edit size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(course.id)}
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
