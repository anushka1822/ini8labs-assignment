import { useState, useEffect } from 'react'
import axios from 'axios'
import { Toaster, toast } from 'react-hot-toast'
import { 
  FileText, UploadCloud, Trash2, Eye, Download, Search, 
  LayoutDashboard, FolderOpen
} from 'lucide-react'
import { motion } from 'framer-motion'

function App() {
  const [files, setFiles] = useState([])
  const [filteredFiles, setFilteredFiles] = useState([])
  const [uploading, setUploading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('dashboard')


  const API_BASE = 'http://localhost:8000'

  useEffect(() => {
    fetchDocuments()
  }, [])

  useEffect(() => {
    const results = files.filter(file => 
      file.filename.toLowerCase().includes(searchQuery.toLowerCase())
    )
    setFilteredFiles(results)
  }, [searchQuery, files])

  const fetchDocuments = async () => {
    try {
      const response = await axios.get(`${API_BASE}/documents`)
      setFiles(response.data)
      setFilteredFiles(response.data)
    } catch (error) {
      console.error('Failed to fetch docs')
    }
  }

  const handleFileUpload = async (e) => {
    const selectedFile = e.target.files[0]
    if (!selectedFile) return
    if (selectedFile.type !== 'application/pdf') {
      toast.error('Only PDF files are allowed!')
      return
    }

    const formData = new FormData()
    formData.append('file', selectedFile)

    setUploading(true)
    const loadingToast = toast.loading('Uploading document...')

    try {
      await axios.post(`${API_BASE}/documents/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      toast.success('Document uploaded!', { id: loadingToast })
      fetchDocuments()
    } catch (error) {
      toast.error('Upload failed', { id: loadingToast })
    } finally {
      setUploading(false)
    }
  }

  const handleOpen = (id) => {
    window.open(`${API_BASE}/documents/${id}`, '_blank')
  }

  const handleDownload = (id) => {
    window.location.href = `${API_BASE}/documents/${id}?download=true`
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this document permanently?')) return
    try {
      await axios.delete(`${API_BASE}/documents/${id}`)
      toast.success('Document deleted')
      fetchDocuments()
    } catch (error) {
      toast.error('Could not delete file')
    }
  }

  const formatSize = (bytes) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  const getInitials = (name) => {
    return name ? name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2) : 'MV'
  }

  return (
    <div className="flex h-screen bg-slate-50 text-slate-800 font-sans">
      <Toaster position="top-right" />

      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col">
        <div className="p-6 border-b border-slate-100">
          <h1 className="text-2xl font-bold text-brand-600 flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-500 text-white rounded-lg flex items-center justify-center">
              <FileText size={18} />
            </div>
            MediVault
          </h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
           <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'dashboard' ? 'bg-brand-50 text-brand-600' : 'text-slate-500 hover:bg-slate-50'}`}>
             <LayoutDashboard size={18} /> Dashboard
           </button>
           <button onClick={() => setActiveTab('files')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'files' ? 'bg-brand-50 text-brand-600' : 'text-slate-500 hover:bg-slate-50'}`}>
             <FolderOpen size={18} /> All Documents
           </button>
        </nav>

        <div className="p-4 border-t border-slate-100">
          <div className="bg-gradient-to-br from-brand-500 to-brand-600 rounded-xl p-4 text-white">
            <p className="text-xs font-medium opacity-80">Storage Used</p>
            <p className="text-lg font-bold mt-1">{files.length} Files</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between sticky top-0 z-10">
          <h2 className="text-xl font-semibold text-slate-800 capitalize">{activeTab}</h2>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search files..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 rounded-full border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 w-64"
              />
            </div>
            
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto">
          
          {/* VIEW: DASHBOARD */}
          {activeTab === 'dashboard' && (
            <>
              {/* Upload Area */}
              <div className="mb-10">
                <div className="relative group cursor-pointer">
                  <input 
                    type="file" 
                    accept="application/pdf" 
                    onChange={handleFileUpload} 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                    disabled={uploading}
                  />
                  <div className="bg-white border-2 border-dashed border-slate-300 rounded-2xl p-10 flex flex-col items-center justify-center transition-all group-hover:border-brand-500 group-hover:bg-brand-50">
                    <div className="w-16 h-16 bg-brand-50 text-brand-500 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      {uploading ? <span className="loading-spinner">...</span> : <UploadCloud size={32} />}
                    </div>
                    <h3 className="text-lg font-medium text-slate-700">
                      {uploading ? 'Uploading...' : 'Click or Drag PDF to Upload'}
                    </h3>
                    <p className="text-slate-400 text-sm mt-1">Maximum file size 10MB</p>
                  </div>
                </div>
              </div>

              <h3 className="text-lg font-bold text-slate-700 mb-4">Recent Uploads</h3>
              {filteredFiles.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                    <p>No documents found.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {filteredFiles.map((file) => (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        key={file.id} 
                        className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-start justify-between mb-4">
                        <div className="p-3 bg-red-50 text-red-500 rounded-lg"><FileText size={24} /></div>
                        <span className="text-xs font-medium text-slate-400 bg-slate-50 px-2 py-1 rounded">PDF</span>
                        </div>
                        <h4 className="font-semibold text-slate-700 truncate mb-1">{file.filename}</h4>
                        <div className="flex items-center gap-2 text-xs text-slate-400 mb-6">
                        <span>{new Date(file.created_at).toLocaleDateString()}</span>
                        <span>•</span>
                        <span>{formatSize(file.filesize)}</span>
                        </div>
                        <div className="flex gap-2">
                        <button onClick={() => handleOpen(file.id)} className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-slate-50 text-slate-600 text-sm font-medium hover:bg-slate-100 transition-colors">
                            <Eye size={16} /> Open
                        </button>
                        <button onClick={() => handleDownload(file.id)} className="p-2 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition-colors" title="Download">
                            <Download size={18} />
                        </button>
                        <button onClick={() => handleDelete(file.id)} className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors" title="Delete">
                            <Trash2 size={18} />
                        </button>
                        </div>
                    </motion.div>
                    ))}
                </div>
              )}
            </>
          )}

          {/* VIEW: ALL DOCUMENTS (LIST) */}
          {activeTab === 'files' && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500">
                  <tr>
                    <th className="px-6 py-4">Document Name</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Size</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredFiles.map((file) => (
                    <tr key={file.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-700 flex items-center gap-3">
                        <FileText size={18} className="text-red-500" />
                        {file.filename}
                      </td>
                      <td className="px-6 py-4">{new Date(file.created_at).toLocaleDateString()}</td>
                      <td className="px-6 py-4">{formatSize(file.filesize)}</td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button onClick={() => handleOpen(file.id)} className="text-slate-400 hover:text-brand-600" title="View"><Eye size={18} /></button>
                        <button onClick={() => handleDownload(file.id)} className="text-slate-400 hover:text-brand-600" title="Download"><Download size={18} /></button>
                        <button onClick={() => handleDelete(file.id)} className="text-slate-400 hover:text-red-600" title="Delete"><Trash2 size={18} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredFiles.length === 0 && <div className="p-8 text-center text-slate-400">No documents found.</div>}
            </div>
          )}

        </div>
      </main>
    </div>
  )
}

export default App