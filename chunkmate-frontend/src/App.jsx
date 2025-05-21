import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [documents, setDocuments] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [chunks, setChunks] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);

  // Fetch all documents from backend and return them
  const fetchDocuments = async () => {
    try {
      const res = await fetch('http://localhost:5000/documents');
      if (!res.ok) throw new Error('Failed to fetch documents');
      const docs = await res.json();
      console.log('Fetched documents:', docs);
      setDocuments(docs);
      return docs; // Return docs for further use
    } catch (err) {
      setError(err.message);
      return [];
    }
  };

  // Fetch chunks for a selected document by ID
  const fetchChunks = async (docId) => {
    try {
      const res = await fetch(`http://localhost:5000/documents/${docId}/chunks`);
      if (!res.ok) throw new Error('Failed to fetch chunks');
      const chunkData = await res.json();
      setChunks(chunkData.map(chunk => chunk.content));
    } catch (err) {
      setError(err.message);
    }
  };

  // When user selects a document, fetch chunks
  const handleSelectDoc = (doc) => {
    setSelectedDoc(doc);
    fetchChunks(doc.id);
  };

  // Upload file and auto-select it
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file || !file.name.endsWith('.md')) {
      setError('❌ Only .md files are allowed.');
      setMessage('');
      return;
    }

    setError('');
    setMessage('');
    setUploading(true);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('http://localhost:5000/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      await res.json();
      setMessage(`✅ Uploaded: ${file.name}`);

      // Fetch updated documents list and auto-select uploaded file
      const updatedDocs = await fetchDocuments();
      const matchedDoc = updatedDocs.find(doc => doc.name === file.name);
      if (matchedDoc) {
        setSelectedDoc(matchedDoc);
        fetchChunks(matchedDoc.id);
      } else {
        setSelectedDoc(null);
        setChunks([]);
      }

    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  return (
    <div className="container">
      <aside className="sidebar">
        <h2>📄CHUNK MATE</h2>
        <h3>Uploaded Documents</h3>
        <div className="document-list">
          {documents.map((doc, index) => {
            return (
              <button
                key={index}
                onClick={() => handleSelectDoc(doc)}
                className={selectedDoc?.name === doc.name ? 'active' : ''}
              >
                {doc.filename || 'Untitled'}
              </button>
            );
          })}
        </div>

        <input
          type="file"
          id="upload"
          accept=".md"
          onChange={handleFileChange}
          style={{ display: 'none' }}
          disabled={uploading}
        />
        <label htmlFor="upload" className="upload-button">
          {uploading ? 'Uploading...' : 'Upload .md file'}
        </label>

        {message && <p className="success">{message}</p>}
        {error && <p className="error">{error}</p>}
      </aside>

      <main className="content">
        <h3 style={{ color: 'black' }}>
            <center>SELECT ANY ONE OF THE DOCUMENT TO VIEW ITS CHUNKS.</center>
          </h3>
        {selectedDoc ? (
          <>
            <h3>{selectedDoc.filename}</h3>
            <div className="chunk-list">
              {chunks.length > 0 ? (
                chunks.map((chunk, index) => {
                  // Copy chunk text to clipboard
                  const handleCopy = () => {
                    navigator.clipboard.writeText(chunk);
                    alert('Copied chunk #' + (index + 1));
                  };

                  // Download chunk as .txt file
                  const handleDownload = () => {
                    const blob = new Blob([chunk], { type: 'text/plain' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `chunk_${index + 1}.txt`;
                    a.click();
                    URL.revokeObjectURL(url);
                  };

                  return (
                    <div key={index} className="chunk-card">
                      <div className="chunk-number">{index + 1}</div>
                      <div className="chunk-content">{chunk}</div>
                      <div className="chunk-actions" style={{ marginTop: '10px' }}>
                        <button onClick={handleCopy}>Copy</button>
                        <button onClick={handleDownload} style={{ marginLeft: '10px' }}>Download</button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p>No chunks found for this document.</p>
              )}
            </div>
          </>
        ) : (
          <a></a>
        )}
      </main>
    </div>
  );
}

export default App;
