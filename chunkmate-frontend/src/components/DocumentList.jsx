// src/components/DocumentList.jsx
function DocumentList({ documents, onSelect }) {
    return (
      <ul className="document-list">
        {documents.map(doc => (
          <li key={doc._id} onClick={() => onSelect(doc._id)}>
            {doc.name}
          </li>
        ))}
      </ul>
    );
  }
  
  export default DocumentList;
  