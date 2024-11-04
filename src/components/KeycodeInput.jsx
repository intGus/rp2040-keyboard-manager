import React from 'react';

const KeycodeInput = ({ keycodes }) => {
  return (
    <div className="grid grid-cols-4 gap-3">
      {keycodes.map((keycode, index) => (
        <span
          key={index}
          className="shadow rounded py-2 px-3 text-gray-700 text-sm bg-indigo-50 text-center hover:bg-indigo-100 transition-colors duration-200"
        >
          {keycode}
        </span>
      ))}
    </div>
  );
};

export default KeycodeInput;