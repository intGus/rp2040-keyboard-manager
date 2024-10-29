import React from 'react';

const LEDIntensityInput = ({ intensity, onChange }) => {
  const handleSliderChange = (event) => {
    const newValue = Number(event.target.value);
    onChange(newValue);
  };

  const handleInputChange = (event) => {
    const newValue = Number(event.target.value);
    if (newValue >= 0 && newValue <= 100) {
      onChange(newValue);
    }
  };

  return (
    <div className="flex items-center mb-4">
      <input
        type="number"
        value={intensity}
        onChange={handleInputChange}
        className="shadow appearance-none border rounded w-16 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mr-4"
        min="0"
        max="100"
        placeholder="0"
      />
      <input
        type="range"
        value={intensity}
        onChange={handleSliderChange}
        className="slider w-full h-2 bg-gray-200 rounded appearance-none cursor-pointer"
        min="0"
        max="100"
        style={{ writingMode: 'bt-lr', transform: 'rotate(270deg)' }} // Vertical slider
      />
    </div>
  );
};

export default LEDIntensityInput;