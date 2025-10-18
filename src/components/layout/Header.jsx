import React, { useState, useEffect } from "react";
import { AiOutlineMenu, AiOutlineClose } from "react-icons/ai";
import { BsPersonFill, BsCart3, BsSearch } from "react-icons/bs";
import AOS from "aos";
import "aos/dist/aos.css";
import { FaMoon } from "react-icons/fa";

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    AOS.init({ duration: 700, once: true });

    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 shadow-lg ${
        scrolled ? "bg-white/90 shadow-lg backdrop-blur-md" : "bg-white"
      }`}
    >
      <div
        className="max-w-[1400px] mx-auto flex justify-between items-center px-6 py-3 md:py-4"
        data-aos="fade-down"
      >
        <div className="flex items-center gap-3">
          <button
            className="md:hidden text-3xl"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <AiOutlineClose /> : <AiOutlineMenu />}
          </button>

          <div
            className="flex items-center gap-3 cursor-pointer select-none"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            <FaMoon className="text-3xl text-black" />
      
            <span className="text-3xl font-bold text-black tracking-wide">
              Muslim_kg
            </span>
          </div>
        </div>

        <nav className="hidden md:flex gap-10 font-semibold text-gray-800 text-lg">
          {["Одежда", "Техника", "Спорт", "Аксессуары", "Обувь"].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              className="hover:text-gray-500 transition-colors"
            >
              {item}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-5">
          <div className="hidden md:flex items-center border border-gray-300 rounded-full px-4 py-2 transition focus-within:ring-2 ring-gray-300">
            <BsSearch className="text-gray-600" />
            <input
              type="text"
              placeholder="Поиск..."
              className="outline-none px-2 text-base bg-transparent"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>

          <BsPersonFill className="cursor-pointer text-2xl hover:scale-130 duration-300" />
          <BsCart3 className="cursor-pointer text-2xl hover:scale-130 duration-300" />
        </div>
      </div>


      {menuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            onClick={() => setMenuOpen(false)}
          />
          <div
            className="md:hidden absolute top-full left-0 w-full bg-white shadow-md flex flex-col px-6 py-5 gap-5 text-lg font-semibold text-gray-800 z-50"
            data-aos="fade-down"
          >
            {["Одежда", "Техника", "Спорт", "Аксессуары", "Обувь"].map(
              (item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  onClick={() => setMenuOpen(false)}
                  className="hover:text-gray-500 transition-colors"
                >
                  {item}
                </a>
              )
            )}
          </div>
        </>
      )}
    </header>
  );
};

export default Header;
