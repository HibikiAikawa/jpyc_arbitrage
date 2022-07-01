import React, { useState } from "react";

  const Menu = (props) => {
    const [isOpen, setIsOpen] = useState(false);

    const MenuOpen =()=>{
      setIsOpen(!isOpen)
    }

    const textStyle= "text-white tracking-wide text-xl pb-4 font-thin hover:text-teal-300 hover:duration-500";

    const menuCss =
      isOpen ? "h-100 w-0 bg-indigo-900 ease-out duration-500 z-10" : "h-100 w-80 bg-indigo-900 ease-out duration-500 z-10";

    const btnCss=
    isOpen ? ["text-black p-4 text-2xl", ">"] : ["text-white p-4 text-2xl","<"];


    const titleCss=
      isOpen ? "invisible" : "visible delay-200 text-teal-300 p-3 font-bold text-2xl text-center";
    const listCss =
      isOpen ? "invisible" : "visible delay-200";

    return (
      <div className={menuCss}>
        <button className={btnCss[0]} onClick={MenuOpen}>{btnCss[1]}</button>
        <p className={titleCss}>JPYC Arbitrage Bot</p>

        <div className="p-5">
          <ul className={listCss}>
            <li className={textStyle}>
              <i className="fa-solid fa-magnifying-glass pr-3"></i>
              <a href="https://polygonscan.com/">Polygon scan</a></li>
            <li className={textStyle}>
              <i className="fa-solid fa-book pr-3"></i>
              <a href="">Docs</a></li>
            <li className={textStyle}>
              <i className="fa-solid fa-user pr-3"></i>
              <a href="">Team</a></li>
            <li className={textStyle}>
              <i className="fa-solid fa-envelope pr-3"></i>
              <a href="">Contact</a></li>
        </ul>
        </div>
      </div>
    );
  };

  export default Menu;
