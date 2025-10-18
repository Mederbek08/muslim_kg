import React, { useState, useEffect } from "react";
import { AiOutlineMenu, AiOutlineClose } from "react-icons/ai";
import { BsPersonFill, BsCart3, BsSearch } from "react-icons/bs";
import AOS from "aos";
import "aos/dist/aos.css";

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    AOS.init({ duration: 700, once: true });
  }, []);

  return (
    <header className="w-full bg-white text-black shadow-md fixed top-0 left-0 z-50">
      <div
        className="max-w-7xl mx-auto flex justify-between items-center px-6 py-4 container"
        data-aos="fade-down"
      >
        <div className="flex items-center gap-4">
          <button
            className="md:hidden text-2xl"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <AiOutlineClose /> : <AiOutlineMenu />}
          </button>

          <img
            src="/logo.png"
            alt="Muslim_kg Logo"
            className="w-32 object-contain cursor-pointer"
          />
        </div>

        <nav className="hidden md:flex gap-8 font-medium text-lg">
          <a href="#odejda" className="hover:text-gray-500 transition">
            Одежда
          </a>
          <a href="#tehnika" className="hover:text-gray-500 transition">
            Техника
          </a>
          <a href="#sport" className="hover:text-gray-500 transition">
            Спорт
          </a>
          <a href="#aksessuary" className="hover:text-gray-500 transition">
            Аксессуары
          </a>
          <a href="#obuv" className="hover:text-gray-500 transition">
            Обувь
          </a>
        </nav>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center border border-gray-300 rounded-full px-3 py-1">
            <BsSearch className="text-gray-600" />
            <input
              type="text"
              placeholder="Поиск..."
              className="outline-none px-2 text-sm bg-transparent"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>

          <BsPersonFill className="cursor-pointer text-xl hover:text-gray-500" />
          <BsCart3 className="cursor-pointer text-xl hover:text-gray-500" />
        </div>
      </div>

      {menuOpen && (
        <div
          className="md:hidden bg-white shadow-md flex flex-col px-6 py-4 gap-4 text-lg font-medium"
          data-aos="fade-down"
        >
          <a href="#odejda" onClick={() => setMenuOpen(false)}>
            Одежда
          </a>
          <a href="#tehnika" onClick={() => setMenuOpen(false)}>
            Техника
          </a>
          <a href="#sport" onClick={() => setMenuOpen(false)}>
            Спорт
          </a>
          <a href="#aksessuary" onClick={() => setMenuOpen(false)}>
            Аксессуары
          </a>
          <a href="#obuv" onClick={() => setMenuOpen(false)}>
            Обувь
          </a>
        </div>
      )}
    </header>
  );
};

export default Header;
