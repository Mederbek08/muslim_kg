import React, { useState, useEffect } from "react";
import { Menu, X, User, ShoppingCart, Search } from "lucide-react";
import { NavLink } from "react-router-dom";

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [menuOpen]);

  return (
    <>
      <header
        className={`fixed top-0 left-0 w-full transition-all duration-300 backdrop-blur-md shadow-lg ${
          scrolled ? " backdrop-blur-md shadow-lg" : " backdrop-blur-md shadow-lg"
        }`}
        style={{ zIndex: 100 }}
      >
        {/* Main Header */}
        <div className="max-w-[1800px] mx-auto flex justify-between items-center px-4 sm:px-6 py-3 md:py-4">
          {/* Left: Menu + Logo */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              className="text-gray-800 hover:text-purple-600 transition-all duration-200 active:scale-95 md:hidden"
              onClick={() => {
                setMenuOpen(!menuOpen);
                setSearchOpen(false);
              }}
              aria-label="Toggle menu"
            >
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            <div
              className="flex items-center gap-2 sm:gap-3 cursor-pointer select-none"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-br from-purple-600 to-blue-500 rounded-full flex items-center justify-center shadow-md">
                <span className="text-white text-base sm:text-lg font-bold">M</span>
              </div>
              <span className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent tracking-wide">
                Muslim_kg
              </span>
            </div>
          </div>

          {/* Center: Desktop Navigation */}
          <nav className="hidden md:flex gap-6 lg:gap-10 font-semibold text-gray-700 text-base lg:text-lg">
            {["Одежда", "Техника", "Спорт", "Аксессуары", "Обувь"].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="hover:text-purple-600 transition-colors duration-200 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-purple-600 hover:after:w-full after:transition-all after:duration-300"
              >
                {item}
              </a>
            ))}
          </nav>

          {/* Right: Icons */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Desktop Search */}
            <div className="hidden lg:flex items-center bg-gray-100/80 backdrop-blur-sm border border-gray-200 rounded-full px-4 py-2 transition focus-within:ring-2 ring-purple-400 focus-within:bg-white/90">
              <Search className="text-gray-500 w-4 h-4" />
              <input
                type="text"
                placeholder="Поиск товаров..."
                className="outline-none px-2 text-sm bg-transparent w-36 text-gray-700 placeholder:text-gray-400"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </div>

            {/* Mobile Search Icon */}
            <button
              className="lg:hidden text-gray-700 hover:text-purple-600 transition-transform duration-200 active:scale-95"
              onClick={() => {
                setSearchOpen(!searchOpen);
                setMenuOpen(false);
              }}
              aria-label="Search"
            >
              <Search className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

          <NavLink
            className="text-gray-800 hover:text-purple-600 transition-all duration-200 hover:scale-110 active:scale-95"
            aria-label="User profile"
            to="/login"
          >
            <User className="w-5 h-5" />
          </NavLink>
          
          <button
            className="text-gray-800 hover:text-purple-600 transition-all duration-200 hover:scale-110 active:scale-95 relative"
            aria-label="Shopping cart"
          >
            <ShoppingCart className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 bg-purple-600 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
              3
            </span>
          </button>
        </div>
      </div>

        {/* Mobile Search Bar */}
        {searchOpen && (
          <div className="lg:hidden bg-white/95 backdrop-blur-md border-t border-gray-200 px-4 py-3 animate-fadeIn shadow-md">
            <div className="flex items-center bg-gray-100/80 backdrop-blur-sm rounded-full px-4 py-2.5 focus-within:ring-2 ring-purple-400 focus-within:bg-white/90 transition-all">
              <Search className="text-gray-500 w-5 h-5 flex-shrink-0" />
              <input
                type="text"
                placeholder="Поиск товаров..."
                className="outline-none px-3 text-base bg-transparent w-full text-gray-700 placeholder:text-gray-400"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                autoFocus
              />
              {searchText && (
                <button
                  onClick={() => setSearchText("")}
                  className="text-gray-400 hover:text-gray-600 flex-shrink-0 ml-2"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Mobile Menu Overlay - Outside header */}
      {menuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm md:hidden animate-fadeIn"
            style={{ zIndex: 200 }}
            onClick={() => setMenuOpen(false)}
          />
          <div 
            className="md:hidden fixed top-0 left-0 w-[280px] sm:w-[320px] h-full bg-gradient-to-b from-white to-gray-50 shadow-2xl animate-slideInLeft overflow-y-auto" 
            style={{ zIndex: 201 }}
          >
            {/* Menu Header */}
            <div className="bg-gradient-to-br from-purple-600 to-blue-500 p-6 mb-2">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 bg-white rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-purple-600 text-xl font-bold">M</span>
                  </div>
                  <span className="text-2xl font-bold text-white tracking-wide">
                    Muslim_kg
                  </span>
                </div>
                <button
                  onClick={() => setMenuOpen(false)}
                  className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <p className="text-white/95 text-sm font-medium">Добро пожаловать в наш магазин!</p>
            </div>

            {/* Navigation Links */}
            <nav className="flex flex-col px-4 gap-1 mt-4">
              {["Одежда", "Техника", "Спорт", "Аксессуары", "Обувь"].map((item, index) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  onClick={() => setMenuOpen(false)}
                  className="group flex items-center gap-3 py-3.5 px-4 rounded-xl hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 transition-all duration-300 border border-transparent hover:border-purple-200 hover:shadow-sm animate-slideDown"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                    <span className="text-purple-600 font-bold text-sm">{index + 1}</span>
                  </div>
                  <span className="text-base font-semibold text-gray-800 group-hover:text-purple-600 transition-colors">
                    {item}
                  </span>
                </a>
              ))}
            </nav>

            {/* Menu Footer */}
            <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-gray-100 to-transparent">
              <div className="flex gap-3">
                <button className="flex-1 bg-gradient-to-r from-purple-600 to-blue-500 text-white py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-blue-600 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95">
                  Профиль
                </button>
                <button className="flex-1 bg-white text-purple-600 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-all border-2 border-purple-600 shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95">
                  Корзина
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      <style>{`
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .animate-slideInLeft {
          animation: slideInLeft 0.3s ease-out;
        }
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
          opacity: 0;
          animation-fill-mode: forwards;
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </>
  );
};

export default Header;