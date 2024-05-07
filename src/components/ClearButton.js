import React from "react";

const ClearButton = ({ handleClearButtonClick }) => {
  return (
    <button
      type="button"
      onClick={handleClearButtonClick}
    >
      Refresh
    </button>
  );
};

export default ClearButton;
