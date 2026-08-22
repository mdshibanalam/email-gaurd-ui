import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [theme, setTheme] = useState('light')
  const [activeTab, setActiveTab] = useState('single')
  
  const [singleEmail, setSingleEmail] = useState('')
  const [singleResult, setSingleResult] = useState(null)
  
  const [file, setFile] = useState(null)
  const [status, setStatus] = useState('Upload a file to begin')
  const [result, setResult] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light')

  const handleSingleCheck = async (e) => {
    e.preventDefault()
    if (!singleEmail) return
    try {
      const res = await fetch(`https://email-gaurd-api.onrender.com/api/validate-single?email=${encodeURIComponent(singleEmail)}`)
      const data = await res.json()
      setSingleResult(data)
    } catch (err) {
      setSingleResult({ status: 'Error connecting to server' })
    }
  }

  const handleBulkUpload = async (e) => {
    e.preventDefault()
    if (!file) return
    setIsProcessing(true)
    setStatus('Analyzing file...')
    
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('https://email-gaurd-api.onrender.com/api/upload', { method: 'POST', body: formData })
      const data = await response.json()
      setResult(data)
      setStatus('Analysis complete.')
    } catch (error) {
      setStatus('Error connecting to server.')
    } finally {
      setIsProcessing(false)
    }
  }

  const downloadCSV = (type) => {
    let content = "Email_Address,Status\n"
    let filename = "report.csv"
    
    if (type === 'valid') {
      content = "Valid_Email_Addresses\n" + result.valid.join("\n")
      filename = "valid_emails.csv"
    } else if (type === 'invalid') {
      content = "Invalid_Email_Addresses\n" + result.invalid.join("\n")
      filename = "invalid_emails.csv"
    } else {
      result.valid.forEach(e => content += `${e},Valid\n`)
      result.invalid.forEach(e => content += `${e},Invalid\n`)
      filename = "unified_report.csv"
    }

    const blob = new Blob([content], { type: 'text/csv' })
    const link = document.createElement('a')
    link.href = window.URL.createObjectURL(blob)
    link.download = filename
    link.click()
  }

  return (
    <div className="app-container">
      <header className="header">
        {/* Left Section: Logo */}
        <div className="header-section header-left">
          <div className="logo">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
            <h2>EmailGuard</h2>
          </div>
        </div>

        {/* Center Section: Navigation Tabs */}
        <div className="header-section header-center">
          <button className={`tab-btn ${activeTab === 'single' ? 'active' : ''}`} onClick={() => setActiveTab('single')}>Single Check</button>
          <button className={`tab-btn ${activeTab === 'bulk' ? 'active' : ''}`} onClick={() => setActiveTab('bulk')}>Bulk Upload</button>
        </div>

        {/* Right Section: Theme Controls */}
        <div className="header-section header-right">
          <button className="theme-toggle" onClick={toggleTheme}>
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
        </div>
      </header>

      <main className="main-content">
        {activeTab === 'single' ? (
          <div className="card">
            <h3>Verify Single Email</h3>
            <form onSubmit={handleSingleCheck} className="input-group">
              <input type="email" placeholder="john@example.com" value={singleEmail} onChange={(e) => setSingleEmail(e.target.value)} required />
              <button type="submit" className="primary-btn">Check</button>
            </form>
            {singleResult && (
              <div className={`result-badge ${singleResult.status.toLowerCase()}`}>
                {singleResult.email} is {singleResult.status}
              </div>
            )}
          </div>
        ) : (
          <div className="card">
            <h3>Bulk Validation</h3>
            <form onSubmit={handleBulkUpload} className="upload-form">
              <input type="file" onChange={(e) => setFile(e.target.files[0])} className="file-input" accept=".csv,.txt" />
              <button type="submit" className="primary-btn" disabled={!file || isProcessing}>
                {isProcessing ? 'Processing...' : 'Upload & Scan'}
              </button>
            </form>
            <p className="status">{status}</p>

            {result && (
              <div className="export-section">
                <div className="stat-grid">
                  <div className="stat"><span>Valid</span><strong>{result.valid.length}</strong></div>
                  <div className="stat"><span>Invalid</span><strong>{result.invalid.length}</strong></div>
                </div>
                <div className="download-options">
                  <button onClick={() => downloadCSV('unified')} className="secondary-btn">Download Unified CSV</button>
                  <button onClick={() => downloadCSV('valid')} className="secondary-btn outline">Only Valid</button>
                  <button onClick={() => downloadCSV('invalid')} className="secondary-btn outline danger">Only Invalid</button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

export default App