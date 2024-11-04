import React, { useState, useEffect } from 'react';
import KeycodeInput from './components/KeycodeInput';
import LEDIntensityInput from './components/LEDIntensityInput';
import SerialTerminal from './components/SerialTerminal';

const App = () => {
  const [keycodes, setKeycodes] = useState({
    GP1: ["E"],
    GP2: ["R"],
    GP14: ["O"],
    GP15: ["R"],
  });
  const [intensities, setIntensities] = useState([25, 50, 75, 100]);
  const [fileHandle, setFileHandle] = useState(null);
  const [serialPort, setSerialPort] = useState(null);
  const [serialOutput, setSerialOutput] = useState('');
  const [editingPin, setEditingPin] = useState(null); // Track the current pin being edited

  const loadConfig = async () => {
    try {
      const [handle] = await window.showOpenFilePicker({
        types: [{ description: 'JSON Files', accept: { 'application/json': ['.json'] } }],
      });
      const file = await handle.getFile();
      const contents = await file.text();
      const config = JSON.parse(contents);

      setKeycodes(config.button_pins);
      setIntensities(config.led_intensities || intensities);
      setFileHandle(handle);

      await startSerialRead();
    } catch (error) {
      console.error("Failed to load configuration file:", error);
      alert("Could not load the configuration file.");
    }
  };

  const saveConfig = async () => {
    if (!fileHandle) {
      alert("No configuration file loaded. Please load a file first.");
      return;
    }

    const configData = {
      button_pins: keycodes,
      led_intensities: intensities,
    };

    try {
      const writable = await fileHandle.createWritable();
      await writable.write(JSON.stringify(configData, null, 2));
      await writable.close();
      console.log("Configuration file saved successfully.");

      await sendResetSignal();
    } catch (error) {
      console.error("Failed to save configuration file:", error);
      alert("Could not save the configuration file.");
    }
  };

  const sendResetSignal = async () => {
    if (serialPort) {
      try {
        const writer = serialPort.writable.getWriter();
        const resetSignal = new TextEncoder().encode("1");
        await writer.write(resetSignal);
        writer.releaseLock();

        console.log("Reset signal sent successfully.");
      } catch (error) {
        console.error("Failed to send reset signal:", error);
        alert("Could not send reset signal.");
      }
    }
  };

  const startSerialRead = async () => {
    const port = await navigator.serial.requestPort();
    try {
      if (!serialPort) {
        setSerialPort(port);
        await port.open({ baudRate: 115200 });
      } else if (!serialPort.readable) {
        await serialPort.open({ baudRate: 115200 });
      }

      const reader = port.readable.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        setSerialOutput((prevOutput) => prevOutput + decoder.decode(value));
      }

      reader.releaseLock();
    } catch (error) {
      console.error("Failed to read from serial port:", error);
    }
  };

  // Toggle editing mode for a specific pin
  const toggleEditing = (pin) => {
    setEditingPin(editingPin === pin ? null : pin);
  };

  // Handle key presses to add or delete keycodes
  const handleKeyPress = (event) => {
    if (!editingPin) return;

    const key = event.key === " " ? "SPACE" : event.key.toUpperCase();

    setKeycodes((prevKeycodes) => {
      const newKeycodes = { ...prevKeycodes };

      // Check if the key is already in the array
      const index = newKeycodes[editingPin].indexOf(key);

      if (index > -1) {
        // Remove the key if it already exists
        newKeycodes[editingPin] = newKeycodes[editingPin].filter((k) => k !== key);
      } else {
        // Add the key if it doesn't exist
        newKeycodes[editingPin] = [...newKeycodes[editingPin], key];
      }
      return newKeycodes;
    });
  };

  useEffect(() => {
    if (editingPin) {
      window.addEventListener("keydown", handleKeyPress);
    } else {
      window.removeEventListener("keydown", handleKeyPress);
    }
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [editingPin]);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <button
        onClick={loadConfig}
        className="mb-6 bg-green-500 text-white py-2 px-6 rounded hover:bg-green-600 transition duration-200"
      >
        Load Config File
      </button>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-6">
        {Object.entries(keycodes).map(([pin, keycodeArray], index) => (
          <div
            key={index}
            onClick={() => toggleEditing(pin)}
            className={`cursor-pointer bg-white rounded-lg shadow-md p-4 flex flex-col items-center space-y-4 ${editingPin === pin ? "bg-yellow-100 border border-yellow-400" : ""
              }`}
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Pin: {pin}</h3>
            <div className="overflow-y-auto max-h-32 w-full px-2">
              <KeycodeInput keycodes={keycodeArray} />
            </div>
            <LEDIntensityInput
              intensity={intensities[index]}
              onChange={(newIntensity) => {
                const newIntensities = [...intensities];
                newIntensities[index] = newIntensity;
                setIntensities(newIntensities);
              }}
            />
          </div>
        ))}
      </div>

      <div className="flex flex-col items-center bg-white p-4 rounded-lg shadow-md mb-6">
        <SerialTerminal output={serialOutput} />
        <button
          className="mt-4 bg-blue-500 text-white py-2 px-6 rounded hover:bg-blue-600 transition duration-200"
          onClick={saveConfig}
        >
          Reset Board
        </button>
      </div>
    </div>
  );
};

export default App;
