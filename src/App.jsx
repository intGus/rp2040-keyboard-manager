import React, { useState, useEffect, useRef } from 'react';
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
  const [editingPin, setEditingPin] = useState(null);
  const [isStringMode, setIsStringMode] = useState({}); // Track string/array mode for each pin
  const [tempStrings, setTempStrings] = useState({}); // Temporary storage for string values

  const textAreaRefs = useRef({}); // Store references to textareas for focusing

  const loadConfig = async () => {
    try {
      const [handle] = await window.showOpenFilePicker({
        types: [{ description: 'JSON Files', accept: { 'application/json': ['.json'] } }],
      });
      const file = await handle.getFile();
      const contents = await file.text();
      const config = JSON.parse(contents);

      const initialStringMode = {};
      const initialTempStrings = {};

      // Set initial state for string mode and temporary strings
      for (const [pin, value] of Object.entries(config.button_pins)) {
        if (typeof value === "object" && "string" in value) {
          initialStringMode[pin] = true;
          initialTempStrings[pin] = value.string;
        } else {
          initialStringMode[pin] = false;
          initialTempStrings[pin] = ""; // Default empty if no string exists
        }
      }

      setKeycodes(config.button_pins);
      setIntensities(config.led_intensities || intensities);
      setFileHandle(handle);
      setIsStringMode(initialStringMode);
      setTempStrings(initialTempStrings);

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

    // Prepare config data with temporary strings in memory
    const configData = {
      button_pins: Object.fromEntries(
        Object.entries(keycodes).map(([pin, value]) => [
          pin,
          isStringMode[pin]
            ? { string: (tempStrings[pin] || "").replace(/\\n/g, "\n") } // Replace \\n with \n
            : value,
        ])
      ),
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
        const resetSignal = new TextEncoder().encode('\x04');
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

  const toggleEditing = (pin) => {
    setEditingPin(editingPin === pin ? null : pin);
  };

  const handleKeyPress = (event) => {
    if (!editingPin || isStringMode[editingPin]) return;

    // Handle special cases for certain keys
    let key;
    if (event.key === " ") {
      key = "SPACE";
    } else if (event.key === "Meta") {
      key = "GUI";
    } else {
      key = event.key.toUpperCase();
    }

    setKeycodes((prevKeycodes) => {
      const newKeycodes = { ...prevKeycodes };

      // Ensure newKeycodes[editingPin] is an array before proceeding
      if (!Array.isArray(newKeycodes[editingPin])) {
        newKeycodes[editingPin] = []; // Initialize as an empty array if it's not already an array
      }

      const index = newKeycodes[editingPin].indexOf(key);

      if (index > -1) {
        newKeycodes[editingPin] = newKeycodes[editingPin].filter((k) => k !== key);
      } else {
        newKeycodes[editingPin] = [...newKeycodes[editingPin], key];
      }

      return newKeycodes;
    });
  };


  useEffect(() => {
    if (editingPin && !isStringMode[editingPin]) {
      window.addEventListener("keydown", handleKeyPress);
    } else {
      window.removeEventListener("keydown", handleKeyPress);
    }
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [editingPin, isStringMode]);

  const handleStringChange = (event, pin) => {
    const newString = event.target.value;
    setTempStrings((prev) => ({ ...prev, [pin]: newString }));
  };

  const toggleMode = (pin) => {
    setIsStringMode((prev) => ({ ...prev, [pin]: !prev[pin] }));

    // Enable editing only if it’s not already enabled for this pin
    if (editingPin !== pin) {
      toggleEditing(pin);
    }

    // Focus on the textarea if switching to string mode
    if (!isStringMode[pin] && textAreaRefs.current[pin]) {
      setTimeout(() => textAreaRefs.current[pin].focus(), 0);
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
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
            <div className="flex items-center mb-2">
              <label className="mr-2 text-sm text-gray-600">String Mode</label>
              <input
                type="checkbox"
                checked={isStringMode[pin] || false}
                onClick={(e) => e.stopPropagation()}
                onChange={() => toggleMode(pin)}
              />
            </div>
            <div className="overflow-y-auto max-h-32 w-full px-2">
              {isStringMode[pin] ? (
                <textarea
                  ref={(el) => (textAreaRefs.current[pin] = el)}
                  value={tempStrings[pin] || ""}
                  onChange={(e) => handleStringChange(e, pin)}
                  disabled={editingPin !== pin}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full p-2 border rounded bg-gray-100"
                />
              ) : (
                Array.isArray(keycodeArray) ? <KeycodeInput keycodes={keycodeArray} /> : null
              )}
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
