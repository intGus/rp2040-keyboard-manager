import React, { useEffect, useRef } from 'react';

const SerialTerminal = ({ output }) => {
  const outputRef = useRef(null);

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output]);

  return (
    <div className="mb-4">
      <h2 className="text-xl font-semibold mb-2">Serial Terminal</h2>
      <div
        className="border border-gray-300 rounded-md p-2 h-32 overflow-y-auto"
        ref={outputRef}
      >
        <pre className="whitespace-pre-wrap">{output}</pre>
      </div>
    </div>
  );
};

export default SerialTerminal;