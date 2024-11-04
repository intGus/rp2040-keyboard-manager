import React from 'react';

const LEDIntensityInput = ({ intensity, onChange }) => {
  const handleSliderChange = (event) => {
    const newValue = Number(event.target.value);
    onChange(newValue);
  };

  return (
    <div className="mb-6">
      <label className="block text-gray-600 text-sm font-bold mb-2">LED Intensity</label>
      <div className="flex items-center space-x-4">
        <input
          type="range"
          value={intensity}
          onChange={handleSliderChange}
          className="slider w-full h-2 bg-indigo-200 rounded-full appearance-none cursor-pointer"
          min="0"
          max="100"
        />
        <div className="ml-4 text-indigo-600 font-semibold">{intensity}%</div>
      </div>
    </div>
  );
};

export default LEDIntensityInput;
