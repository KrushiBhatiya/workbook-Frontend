import { useState, useEffect } from 'react';
import api from '../utils/api';

import Modal from '../components/Modal';
import { Plus, ChevronDown, ChevronRight, FileText, Trash2, Edit2, Upload, X, ChevronLeft, Eye, Check } from 'lucide-react';

const Materials = () => {
    const [materials, setMaterials] = useState([]);
    const [courses, setCourses] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [expandedMaterials, setExpandedMaterials] = useState({});
    const [carouselIndices, setCarouselIndices] = useState({});

    const [formData, setFormData] = useState({
        name: '',
        courseIds: []
    });

    const [editingMaterialId, setEditingMaterialId] = useState(null);
    const [editName, setEditName] = useState('');
    const [editCourseIds, setEditCourseIds] = useState([]);
    const [showUploadForm, setShowUploadForm] = useState({});
    const [uploadData, setUploadData] = useState({
        name: '',
        pdfs: []
    });

    useEffect(() => {
        fetchMaterials();
        fetchCourses();
    }, []);

    const fetchMaterials = async () => {
        try {
            const { data } = await api.get('/materials');
            setMaterials(data);
        } catch (error) {
            console.error('Error fetching materials:', error);
        }
    };

    const fetchCourses = async () => {
        try {
            const { data } = await api.get('/courses');
            setCourses(data);
        } catch (error) {
            console.error('Error fetching courses:', error);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file && file.type !== 'application/pdf') {
            alert('Only PDF files are allowed');
            e.target.value = '';
            return;
        }
        if (file && file.size > 10 * 1024 * 1024) {
            alert('File size must be less than 10MB');
            e.target.value = '';
            return;
        }
        setFormData({ ...formData, pdf: file });
    };

    const handleCourseToggle = (courseId) => {
        const currentIds = formData.courseIds;
        if (currentIds.includes(courseId)) {
            setFormData({ ...formData, courseIds: currentIds.filter(id => id !== courseId) });
        } else {
            setFormData({ ...formData, courseIds: [...currentIds, courseId] });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.courseIds.length === 0) {
            alert('Please select at least one course');
            return;
        }

        setLoading(true);
        const data = new FormData();
        data.append('name', formData.name);
        data.append('courseIds', JSON.stringify(formData.courseIds));

        try {
            await api.post('/materials', data);
            fetchMaterials();
            closeModal();
            alert('Material added successfully');
        } catch (error) {
            console.error('Error saving material:', error);
            alert(error.response?.data?.message || 'Error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateMaterial = async (id) => {
        if (!editName.trim()) return;
        if (editCourseIds.length === 0) {
            alert('Please select at least one course');
            return;
        }

        setLoading(true);
        try {
            await api.put(`/materials/${id}`, {
                name: editName,
                courseIds: JSON.stringify(editCourseIds)
            });
            setEditingMaterialId(null);
            fetchMaterials();
            alert('Material updated successfully');
        } catch (error) {
            console.error('Error updating material:', error);
            alert('Error updating material');
        } finally {
            setLoading(false);
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setFormData({ name: '', courseIds: [] });
    };

    const toggleMaterial = (id) => {
        setExpandedMaterials(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const handleUpdateName = async (id) => {
        if (!editName.trim()) return;
        try {
            await api.put(`/materials/${id}/name`, { name: editName });
            setEditingMaterialId(null);
            fetchMaterials();
        } catch (error) {
            alert('Error updating name');
        }
    };

    const handleDeleteMaterial = async (id) => {
        if (window.confirm('Delete entire material? This will remove all associated PDFs.')) {
            try {
                await api.delete(`/materials/${id}`);
                fetchMaterials();
            } catch (error) {
                alert('Error deleting material');
            }
        }
    };

    const handleDeletePDF = async (materialId, publicId) => {
        if (window.confirm('Delete this PDF?')) {
            try {
                await api.delete(`/materials/${materialId}/pdf/${publicId}`);
                fetchMaterials();
                setCarouselIndices(prev => ({ ...prev, [materialId]: 0 }));
            } catch (error) {
                console.error('Error deleting PDF:', error);
                alert('Error deleting PDF');
            }
        }
    };


    const handleAppendPDF = async (materialId) => {
        if (uploadData.pdfs.length === 0) {
            alert('Please select at least one PDF file');
            return;
        }

        const data = new FormData();
        uploadData.pdfs.forEach(file => {
            data.append('pdf', file);
        });
        if (uploadData.name) data.append('name', uploadData.name);

        setLoading(true);
        try {
            await api.post(`/materials/${materialId}/append`, data);
            fetchMaterials();
            setUploadData({ name: '', pdfs: [] });
            setShowUploadForm(prev => ({ ...prev, [materialId]: false }));
            alert('PDF(s) uploaded successfully');
        } catch (error) {
            console.error('Error uploading PDF:', error);
            alert('Error uploading PDF');
        } finally {
            setLoading(false);
        }
    };

    const handleEditToggle = (material) => {
        setEditingMaterialId(material._id);
        setEditName(material.name);
        setEditCourseIds(material.courseIds.map(c => c._id));
    };

    const handleEditCourseToggle = (courseId) => {
        setEditCourseIds(prev =>
            prev.includes(courseId)
                ? prev.filter(id => id !== courseId)
                : [...prev, courseId]
        );
    };

    // Carousel Logic
    const nextSlide = (id, max) => {
        setCarouselIndices(prev => ({
            ...prev,
            [id]: ((prev[id] || 0) + 1) % max
        }));
    };

    const prevSlide = (id, max) => {
        setCarouselIndices(prev => ({
            ...prev,
            [id]: ((prev[id] || 0) - 1 + max) % max
        }));
    };

    return (
        <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Materials Management</h1>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-indigo-700 transition-colors"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    Add Material
                </button>
            </div>

            {loading && editingMaterialId === null && !isModalOpen && (
                <div className="text-center py-4 text-indigo-600 font-semibold">Updating...</div>
            )}

            <div className="space-y-4">
                {materials.length === 0 ? (
                    <div className="bg-white p-8 rounded-lg shadow text-center text-gray-500">
                        No materials found. Click "Add Material" to get started.
                    </div>
                ) : (
                    materials.map(material => (
                        <div key={material._id} className="bg-white rounded-lg shadow overflow-hidden border border-gray-100">
                            {/* Header */}
                            <div className="flex items-center justify-between p-4 hover:bg-gray-50 cursor-pointer" onClick={() => toggleMaterial(material._id)}>
                                <div className="flex items-center flex-1">
                                    {expandedMaterials[material._id] ? <ChevronDown className="w-5 h-5 mr-3 text-gray-400" /> : <ChevronRight className="w-5 h-5 mr-3 text-gray-400" />}

                                    {editingMaterialId === material._id ? (
                                        <div className="flex-1 bg-indigo-50 p-4 rounded-lg border border-indigo-100 space-y-3" onClick={e => e.stopPropagation()}>
                                            <div>
                                                <label className="block text-xs font-semibold text-indigo-900 mb-1">Material Name</label>
                                                <input
                                                    type="text"
                                                    className="w-full border border-indigo-200 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-indigo-500 outline-none"
                                                    value={editName}
                                                    onChange={e => setEditName(e.target.value)}
                                                    autoFocus
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-semibold text-indigo-900 mb-1">Assign to Courses</label>
                                                <div className="grid grid-cols-2 gap-2 bg-white/50 p-2 rounded border border-indigo-100 max-h-32 overflow-y-auto">
                                                    {courses.map(course => (
                                                        <label key={course._id} className="flex items-center space-x-2 p-1 hover:bg-white rounded cursor-pointer transition-colors">
                                                            <input
                                                                type="checkbox"
                                                                checked={editCourseIds.includes(course._id)}
                                                                onChange={() => handleEditCourseToggle(course._id)}
                                                                className="h-3 w-3 text-indigo-600 border-gray-300 rounded"
                                                            />
                                                            <span className="text-[11px] text-gray-700 truncate">{course.name}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="flex justify-end space-x-2 pt-1 border-t border-indigo-100">
                                                <button onClick={() => setEditingMaterialId(null)} className="px-3 py-1 text-xs text-gray-600 hover:bg-gray-200 rounded transition-colors">
                                                    Cancel
                                                </button>
                                                <button onClick={() => handleUpdateMaterial(material._id)} className="px-3 py-1 text-xs bg-green-600 text-white hover:bg-green-700 rounded transition-colors flex items-center">
                                                    <Check className="w-3 h-3 mr-1" /> Save Changes
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-gray-800">{material.name}</span>
                                            <div className="flex flex-wrap gap-1 mt-1">
                                                {material.courseIds.map(course => (
                                                    <span key={course._id} className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full border border-indigo-100">
                                                        {course.name}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center space-x-3" onClick={e => e.stopPropagation()}>
                                    <button
                                        onClick={() => handleEditToggle(material)}
                                        className="text-gray-400 hover:text-indigo-600 transition-colors"
                                        title="Edit Material"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => {
                                            setShowUploadForm(prev => ({ ...prev, [material._id]: !prev[material._id] }));
                                            if (!expandedMaterials[material._id]) {
                                                toggleMaterial(material._id);
                                            }
                                        }}
                                        className="text-gray-400 hover:text-green-600 transition-colors"
                                        title="Upload PDF"
                                    >
                                        <Upload className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteMaterial(material._id)}
                                        className="text-gray-400 hover:text-red-600 transition-colors"
                                        title="Delete Material"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Expanded Content - Accordion Body */}
                            {expandedMaterials[material._id] && (
                                <div className="p-4 bg-gray-50 border-t border-gray-50">
                                    {/* Sub-Material Upload Form */}
                                    {showUploadForm[material._id] && (
                                        <div className="mb-6 p-4 bg-white rounded-xl border border-green-100 shadow-sm animate-in slide-in-from-top-2 duration-300">
                                            <div className="flex items-center justify-between mb-4">
                                                <h4 className="text-sm font-bold text-gray-800 flex items-center">
                                                    <Upload className="w-4 h-4 mr-2 text-green-600" />
                                                    Upload New Sub-Material
                                                </h4>
                                                <button onClick={() => setShowUploadForm(prev => ({ ...prev, [material._id]: false }))} className="text-gray-400 hover:text-gray-600">
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-700 mb-1">Sub-Material Name</label>
                                                    <input
                                                        type="text"
                                                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-1 focus:ring-green-500 outline-none"
                                                        placeholder="e.g. Chapter 1 Introduction"
                                                        value={uploadData.name}
                                                        onChange={e => setUploadData({ ...uploadData, name: e.target.value })}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-700 mb-1">Select PDF</label>
                                                    <div className="relative">
                                                        <input
                                                            type="file"
                                                            accept="application/pdf"
                                                            multiple
                                                            onChange={e => {
                                                                const files = Array.from(e.target.files);
                                                                const invalidFiles = files.filter(f => f.type !== 'application/pdf');
                                                                if (invalidFiles.length > 0) {
                                                                    alert('Only PDF files are allowed');
                                                                    e.target.value = '';
                                                                    return;
                                                                }
                                                                setUploadData({ ...uploadData, pdfs: files });
                                                            }}
                                                            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                                                        />
                                                        {uploadData.pdfs.length > 0 && (
                                                            <div className="mt-2 text-[10px] text-green-600 font-medium italic">
                                                                {uploadData.pdfs.length} file(s) selected
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="mt-4 flex justify-end">
                                                <button
                                                    onClick={() => handleAppendPDF(material._id)}
                                                    disabled={loading || uploadData.pdfs.length === 0}
                                                    className={`px-4 py-2 text-xs font-bold text-white bg-green-600 hover:bg-green-700 rounded-lg transition-all shadow-md shadow-green-100 ${loading || uploadData.pdfs.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                >
                                                    {loading ? 'Uploading...' : 'Start Upload'}
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {material.pdfs.length === 0 ? (
                                        <p className="text-sm text-gray-500 italic text-center py-4">No PDFs in this material.</p>
                                    ) : (
                                        <div className="relative">
                                            {/* PDF Carousel - Multi Item (3 per slide) */}
                                            <div className="relative overflow-hidden px-10">
                                                <div className="flex transition-transform duration-500 ease-in-out">
                                                    {/* Group PDFs into chunks of 3 */}
                                                    {Array.from({ length: Math.ceil(material.pdfs.length / 3) }).map((_, slideIdx) => {
                                                        const currentSlide = carouselIndices[material._id] || 0;
                                                        if (slideIdx !== currentSlide) return null;

                                                        const chunk = material.pdfs.slice(slideIdx * 3, slideIdx * 3 + 3);
                                                        return (
                                                            <div key={slideIdx} className="w-full grid grid-cols-1 md:grid-cols-3 gap-4 py-2 animate-in fade-in slide-in-from-right-4 duration-300">
                                                                {chunk.map((pdf) => (
                                                                    <div key={pdf.public_id} className="relative group bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-all h-48 flex flex-col items-center justify-center overflow-hidden">
                                                                        <div className="mb-3 w-full h-32 bg-gray-50 rounded-lg overflow-hidden flex items-center justify-center border border-gray-100 group-hover:border-indigo-200 transition-colors">
                                                                            {/* PDF Thumbnail (First Page) */}
                                                                            <img
                                                                                src={pdf.url.replace('.pdf', '.jpg')}
                                                                                alt="thumbnail"
                                                                                className="w-full h-full object-cover object-top"
                                                                                onError={(e) => {
                                                                                    e.target.onerror = null;
                                                                                    e.target.style.display = 'none';
                                                                                    e.target.nextSibling.style.display = 'block';
                                                                                }}
                                                                            />
                                                                            <div style={{ display: 'none' }}>
                                                                                <FileText className="w-10 h-10 text-red-500" />
                                                                            </div>
                                                                        </div>
                                                                        <span className="text-[10px] font-medium text-gray-700 text-center line-clamp-1 px-1">
                                                                            {pdf.name || pdf.public_id.split('/').pop().split('_').slice(0, -1).join('_')}
                                                                        </span>

                                                                        {/* Hover Overlay - Restored View icon alongside Download and Delete */}
                                                                        <div className="absolute inset-0 bg-indigo-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-3 backdrop-blur-[2px]">
                                                                            <a
                                                                                href={pdf.url}
                                                                                target="_blank"
                                                                                rel="noopener noreferrer"
                                                                                className="p-2 bg-white text-indigo-600 rounded-full hover:bg-indigo-50 transition-colors shadow-lg active:scale-95"
                                                                                title="View PDF"
                                                                            >
                                                                                <Eye size={20} />
                                                                            </a>


                                                                            <button
                                                                                onClick={() => handleDeletePDF(material._id, pdf.public_id)}
                                                                                className="p-2 bg-white text-rose-600 rounded-full hover:bg-rose-50 transition-colors shadow-lg active:scale-95"
                                                                                title="Delete PDF"
                                                                            >
                                                                                <Trash2 size={20} />
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                                {/* Fallback empty cards to maintain grid if < 3 items */}
                                                                {chunk.length < 3 && Array.from({ length: 3 - chunk.length }).map((_, i) => (
                                                                    <div key={`empty-${i}`} className="hidden md:block opacity-0" />
                                                                ))}
                                                            </div>
                                                        );
                                                    })}
                                                </div>

                                                {/* Navigation Arrows */}
                                                {material.pdfs.length > 3 && (
                                                    <>
                                                        <button
                                                            onClick={() => prevSlide(material._id, Math.ceil(material.pdfs.length / 3))}
                                                            className="absolute left-0 top-1/2 -translate-y-1/2 p-1.5 bg-white border border-gray-200 rounded-full shadow hover:bg-gray-50 transition-all text-gray-600 z-10"
                                                        >
                                                            <ChevronLeft className="w-5 h-5" />
                                                        </button>
                                                        <button
                                                            onClick={() => nextSlide(material._id, Math.ceil(material.pdfs.length / 3))}
                                                            className="absolute right-0 top-1/2 -translate-y-1/2 p-1.5 bg-white border border-gray-200 rounded-full shadow hover:bg-gray-50 transition-all text-gray-600 z-10"
                                                        >
                                                            <ChevronRight className="w-5 h-5" />
                                                        </button>
                                                    </>
                                                )}
                                            </div>

                                            {material.pdfs.length > 3 && (
                                                <div className="flex justify-center space-x-1.5 mt-2">
                                                    {Array.from({ length: Math.ceil(material.pdfs.length / 3) }).map((_, idx) => (
                                                        <div
                                                            key={idx}
                                                            className={`w-1.5 h-1.5 rounded-full transition-all ${(carouselIndices[material._id] || 0) === idx ? 'bg-indigo-600 w-3' : 'bg-gray-300'
                                                                }`}
                                                        />
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>

            {/* Add Material Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={closeModal}
                title="Add New Material"
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Material Name</label>
                        <input
                            type="text"
                            required
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="e.g. Mathematics Basics"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Assign to Courses</label>
                        <div className="grid grid-cols-2 gap-2 border p-3 rounded-md max-h-40 overflow-y-auto bg-gray-50">
                            {courses.map(course => (
                                <label key={course._id} className="flex items-center space-x-2 p-1.5 hover:bg-white rounded cursor-pointer border border-transparent hover:border-indigo-100 transition-all">
                                    <input
                                        type="checkbox"
                                        checked={formData.courseIds.includes(course._id)}
                                        onChange={() => handleCourseToggle(course._id)}
                                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                    />
                                    <span className="text-sm text-gray-700 truncate">{course.name}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                        <button
                            type="button"
                            onClick={closeModal}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`px-6 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md shadow-lg shadow-indigo-100 transition-all ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {loading ? 'Processing...' : 'Create Material'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Materials;
