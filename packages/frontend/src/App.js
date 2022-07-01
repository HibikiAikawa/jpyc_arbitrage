//import logo from "./logo.svg";
//import "./App.css";
import "@fortawesome/fontawesome-free/css/all.css";
import React from "react";
import { Home } from "pages";
import Menu from "./pages/Menu";

function App() {
  return (
    <div className="App bg-slate-100"> {/*bg-violet-200*/}
      <header className="flex">
        <Menu className=""/>
        <Home className=""/>
      </header>
    </div>
  );
}

export default App;
