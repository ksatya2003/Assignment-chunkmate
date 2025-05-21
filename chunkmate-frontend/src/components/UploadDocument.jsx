import React, { useState } from 'react';

function FileUpload() {
  const [uploadedDocs, setUploadedDocs] = useState([]); // Track all uploaded docs (name + id)
  const [documentId, setDocumentId] = useState(null);
  const [chunks, setChunks] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleUploadToServer = async (file) => {
    setMessage('');
    setError('');
    setUploading(true);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const data = await res.json();
      setDocumentId(data.documentId);
      
      // Add new doc to uploadedDocs list
      setUploadedDocs(prev => [...prev, { id: data.documentId, name: file.name }]);

      setMessage(`✅ Uploaded successfully. Document ID: ${data.documentId}`);

      // Fetch chunks from backend
      const chunkRes = await fetch(`/api/documents/${data.documentId}/chunks`);
      if (!chunkRes.ok) throw new Error('Failed to fetch chunks');
      const chunkData = await chunkRes.json();
      setChunks(chunkData.chunks || []);
    } catch (err) {
      setError(err.message);
      setChunks([]);
      setDocumentId(null);
    } finally {
      setUploading(false);
      setTimeout(() => setMessage(''), 5000);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file || !file.name.endsWith('.md')) {
      setError('❌ Only .md files are supported.');
      setMessage('');
      return;
    }
    handleUploadToServer(file);
  };

  return (
    <div style={styles.container}>
      <div style={styles.sidebar}>
        <h3 style={{ color: '#fff' }}>Upload Document</h3>

        <input
          type="file"
          accept=".md"
          onChange={handleFileChange}
          style={{ display: 'none' }}
          id="file-upload"
        />
        <label htmlFor="file-upload" style={styles.uploadBtn}>
          {uploading ? 'Uploading...' : 'Upload .md'}
        </label>

        {message && <p style={styles.success}>{message}</p>}
        {error && <p style={styles.error}>{error}</p>}

        {documentId && (
          <p style={{ color: '#fff', fontSize: '12px', marginTop: '10px' }}>
            Active Document ID: <strong>{documentId}</strong>
          </p>
        )}

        {/* Uploaded Documents List */}
        <div style={{ marginTop: '20px', color: '#fff' }}>
          <h4>Uploaded Documents</h4>
          <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
            {uploadedDocs.map(doc => (
              <li key={doc.id} style={{ marginBottom: '5px' }}>
                {doc.name}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div style={styles.main}>
        <h2 style={{ color: 'black' }}>Chunks</h2>
        <div style={styles.chunkContainer}>
          {chunks.length > 0 ? (
            chunks.map((chunk, i) => (
              <div key={i} style={styles.chunkBox}>
                <p>{chunk}</p>
              </div>
            ))
          ) : (
            <p style={{ color: '#444' }}>📂 Upload a document to view its chunks.</p>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    height: '100vh',
    fontFamily: 'sans-serif',
    backgroundColor: '#e6f7ff',
  },
  sidebar: {
    width: '260px',
    background: 'rgba(0, 0, 80, 0.85)',
    padding: '20px',
    borderRight: '1px solid #334155',
    color: '#fff',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
  },
  uploadBtn: {
    display: 'inline-block',
    padding: '10px 20px',
    backgroundColor: '#2563eb',
    color: '#fff',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '14px',
    textAlign: 'center',
    marginTop: '10px',
  },
  success: {
    color: 'lightgreen',
    marginTop: '10px',
    fontSize: '13px',
  },
  error: {
    color: '#f87171',
    marginTop: '10px',
    fontSize: '13px',
  },
  main: {
    flex: 1,
    padding: '20px 30px',
    overflowY: 'auto',
    boxSizing: 'border-box',
    backgroundColor: '#e6f7ff',
  },
  chunkContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    maxHeight: 'calc(100vh - 100px)',
    overflowY: 'auto',
    paddingRight: '10px',
  },
  chunkBox: {
    padding: '15px',
    background: '#ffffff',
    borderRadius: '8px',
    border: '1px solid #d0d7de',
    color: '#111',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    whiteSpace: 'pre-wrap',
    lineHeight: '1.5',
    fontSize: '14px',
  },
};

export default FileUpload;
