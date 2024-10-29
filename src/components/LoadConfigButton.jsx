import React from 'react';

const LoadConfigButton = ({ onLoadConfig }) => {
  const handleFileOpen = async () => {
    try {
      // Show the file picker and request a file
      const [fileHandle] = await window.showOpenFilePicker({
        types: [{ description: 'JSON Files', accept: { 'application/json': ['.json'] } }],
      });
      const file = await fileHandle.getFile();
      const contents = await file.text();
      const config = JSON.parse(contents);
      onLoadConfig(config); // Pass data to parent component
    } catch (error) {
      console.error("Failed to load configuration file:", error);
      alert("Could not load the configuration file.");
    }
  };

  return (
    <button
      onClick={handleFileOpen}
      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
    >
      Load Config File
    </button>
  );
};

export default LoadConfigButton;