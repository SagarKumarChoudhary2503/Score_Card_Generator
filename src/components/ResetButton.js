import React from "react";

const ResetButton = ({ onClick }) => {
  return (
    <button type="button" onClick={onClick} className="btn btn-secondary">
      Reset
    </button>
  );
};

export default ResetButton;
