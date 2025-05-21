const ChunkDisplay = ({ chunks }) => {
  return (
    <div>
      <h3 className="text-xl font-bold mb-4">Chunk Details</h3>
      {chunks.map((chunk) => (
        <div key={chunk.id} className="chunk">
          <h4>Chunk #{chunk.chunk_number}</h4>
          <pre>{chunk.content}</pre>
        </div>
      ))}
    </div>
  );
};

export default ChunkDisplay;
