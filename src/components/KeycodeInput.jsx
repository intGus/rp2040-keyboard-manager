import React from 'react';

const KeycodeInput = ({ keycodes }) => {
  return (
    <div className="flex space-x-2">
      {keycodes.map((keycode, index) => (
        <span
          key={index}
          className="shadow rounded w-16 py-2 px-3 text-gray-700 bg-gray-100 text-center"
        >
          {keycode}
        </span>
      ))}
    </div>
  );
};

export default KeycodeInput;