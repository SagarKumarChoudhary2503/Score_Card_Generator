import React, { useState } from "react";
import ScoreCard from "./ScoreCard";
import Header from "./Header";
import Footer from "./Footer";

const App = () => {
  const handleFormSubmission = () => {
    "";
  };

  return (
    <div>
      <Header />
      <ScoreCard onSubmit={handleFormSubmission} />
      <Footer />
    </div>
  );
};

export default App;
