import React from 'react';
import './App.css';
import {BrowserRouter} from "react-router-dom";
import AppRouter from "./components/router/AppRouter";

function App() {
  return (
    <div className="App">
        <BrowserRouter>
            <AppRouter/>
        </BrowserRouter>
    </div>
  );
}

export default App;
