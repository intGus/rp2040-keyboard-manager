import React, { useState } from 'react';
import KeycodeInput from './components/KeycodeInput';
import LEDIntensityInput from './components/LEDIntensityInput';
import SerialTerminal from './components/SerialTerminal';

const App = () => {
  const [keycodes, setKeycodes] = useState({
    GP0: ["E"],
    GP9: ["R"],
    GP12: ["O"],
    GP15: ["R"],
  }); // Initial keycodes for each GPIO pin
  const [intensities, setIntensities] = useState([25, 50, 75, 100]); // Initial LED intensities

  const [fileHandle, setFileHandle] = useState(null);

  const [serialPort, setSerialPort] = useState(null);
  const [serialOutput, setSerialOutput] = useState('');

  // Function to load configuration file and update state
  const loadConfig = async () => {
    try {
      const [handle] = await window.showOpenFilePicker({
        types: [{ description: 'JSON Files', accept: { 'application/json': ['.json'] } }],
      });
      const file = await handle.getFile();
      const contents = await file.text();
      const config = JSON.parse(contents);

      // Update state with config data
      setKeycodes(Object.values(config.button_pins));
      setIntensities(config.led_intensities || intensities);
      setFileHandle(handle); // Save handle for future writes

      // Start serial reading after loading the config
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

    // Format the data to match the expected JSON structure
    const configData = {
      button_pins: {
        GP0: keycodes[0],
        GP9: keycodes[1],
        GP12: keycodes[2],
        GP15: keycodes[3],
      },
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

  // Function to send reset signal through Web Serial API
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
      // Open the port if it's not open yet
      if (!serialPort) {
        
        setSerialPort(port);
        await port.open({ baudRate: 115200 });
      } else if (!serialPort.readable) {
        await serialPort.open({ baudRate: 115200 });
      }
  
      const reader = port.readable.getReader();
      const decoder = new TextDecoder();
  
      // Read loop
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

  return (
    <div className="p-4">
      <button
        onClick={loadConfig}
        className="mb-4 bg-green-500 text-white py-2 px-4 rounded"
      >
        Load Config File
      </button>
      <div className="grid grid-cols-4 gap-4 mb-4">
        {Object.entries(keycodes).map(([pin, keycodeArray], index) => (
          <div key={index} className="flex flex-col items-center">
            <KeycodeInput keycodes={keycodeArray} /> {/* Pass entire array of keycodes */}
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
      <div className="flex flex-col mb-4">
        <SerialTerminal output={serialOutput} />
        <button
          className="mt-2 bg-blue-500 text-white py-2 px-4 rounded"
          onClick={saveConfig}
        >
          Reset Board
        </button>
      </div>
    </div>
  );
};

export default App;
