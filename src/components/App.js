import React, { useState } from "react";
import ScoreCardForm from "./ScoreCardForm";
import Header from "./Header";
import Footer from "./Footer";

const App = () => {
  const handleSubmit = (data) => {
    console.log("Form data:", data);
  };

  return (
    <div>
      <Header/>
      <ScoreCardForm onSubmit={handleSubmit} />{" "}
      <Footer/>
    </div>
  );
};

export default App;
