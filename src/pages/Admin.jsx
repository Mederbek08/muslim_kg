// src/pages/Admin.jsx
import React, { useState, useEffect } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db, storage } from "../firebase";
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useNavigate } from "react-router-dom";
import { FaMoon } from "react-icons/fa";
import { AiOutlineLogout, AiOutlinePlus } from "react-icons/ai";
import { BsTrash, BsPencil } from "react-icons/bs";

const Admin = () => {
  const [category, setCategory] = useState("");
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [image, setImage] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        navigate("/login");
      } else {
        setUser(currentUser);
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (user) {
      fetchProducts();
    }
  }, [user]);

  const fetchProducts = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "products"));
      const productsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setProducts(productsData);
    } catch (error) {
      console.error("Товарларды жүктөөдө ката:", error);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  const handleUpload = async () => {
    if (!category || !title || !price) {
      alert("Категория, аталышы жана баасы милдеттүү!");
      return;
    }

    try {
      // Сүрөт URL колдонобуз (Storage'сиз)
      const finalImageUrl = imageUrl || "https://via.placeholder.com/400x300?text=No+Image";

      if (editingId) {
        // Өзгөртүү
        const productRef = doc(db, "products", editingId);
        await updateDoc(productRef, {
          category,
          title,
          price: Number(price),
          stock: Number(stock) || 0,
          imageUrl: finalImageUrl,
          updatedAt: new Date(),
        });
        alert("✅ Товар ийгиликтүү өзгөртүлдү!");
        setEditingId(null);
      } else {
        // Жаңы кошуу
        await addDoc(collection(db, "products"), {
          category,
          title,
          price: Number(price),
          stock: Number(stock) || 0,
          imageUrl: finalImageUrl,
          createdAt: new Date(),
        });
        alert("✅ Товар ийгиликтүү кошулду!");
      }

      setCategory("");
      setTitle("");
      setPrice("");
      setStock("");
      setImage(null);
      setImageUrl("");
      fetchProducts();
    } catch (error) {
      console.error(error);
      alert("❌ Ката кетти, кайра аракет кылыңыз!");
    }
  };

  const handleEdit = (product) => {
    setEditingId(product.id);
    setCategory(product.category);
    setTitle(product.title);
    setPrice(product.price);
    setStock(product.stock || 0);
    setImageUrl(product.imageUrl || "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (window.confirm("Бул товарды өчүрөсүзбү?")) {
      try {
        await deleteDoc(doc(db, "products", id));
        alert("✅ Товар өчүрүлдү!");
        fetchProducts();
      } catch (error) {
        console.error(error);
        alert("❌ Өчүрүүдө ката кетти!");
      }
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setCategory("");
    setTitle("");
    setPrice("");
    setStock("");
    setImage(null);
    setImageUrl("");
  };

  if (!user) return null;

  const totalProducts = products.length;
  const totalValue = products.reduce((sum, p) => sum + (p.price * (p.stock || 0)), 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Header.jsx стилинде */}
      <header
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 shadow-lg ${
          scrolled ? "bg-white/90 shadow-lg backdrop-blur-md" : "bg-white"
        }`}
      >
        <div className="max-w-[1400px] mx-auto flex justify-between items-center px-6 py-3 md:py-4">
          <div className="flex items-center gap-3 cursor-pointer select-none">
            <FaMoon className="text-3xl text-black" />
            <span className="text-3xl font-bold text-black tracking-wide">
              Admin Panel
            </span>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-black text-white px-5 py-2 rounded-full hover:bg-gray-800 transition-colors font-semibold"
          >
            <AiOutlineLogout className="text-xl" />
            Чыгуу
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-[1400px] mx-auto px-6 pt-24 pb-12">
        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-black">
            <p className="text-gray-600 text-sm font-semibold mb-1">Жалпы товарлар</p>
            <p className="text-3xl font-bold text-black">{totalProducts}</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-gray-600">
            <p className="text-gray-600 text-sm font-semibold mb-1">Жалпы наркы</p>
            <p className="text-3xl font-bold text-black">{totalValue.toLocaleString()} ₽</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-gray-400">
            <p className="text-gray-600 text-sm font-semibold mb-1">Категориялар</p>
            <p className="text-3xl font-bold text-black">{new Set(products.map(p => p.category)).size}</p>
          </div>
        </div>

        {/* Add/Edit Form */}
        <div className="bg-white shadow-xl rounded-2xl p-6 mb-8">
          <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
            <AiOutlinePlus />
            {editingId ? "Товарды өзгөртүү" : "Жаңы товар кошуу"}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select
              className="border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 ring-gray-300 transition"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">Категория тандаңыз</option>
              <option value="Одежда">Одежда</option>
              <option value="Техника">Техника</option>
              <option value="Спорт">Спорт</option>
              <option value="Аксессуары">Аксессуары</option>
              <option value="Обувь">Обувь</option>
              <option value="Ислам товары">Ислам товары</option>
            </select>

            <input
              type="text"
              placeholder="Товардын аталышы"
              className="border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 ring-gray-300 transition"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <input
              type="number"
              placeholder="Баасы (сом)"
              className="border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 ring-gray-300 transition"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />

            <input
              type="number"
              placeholder="Саны"
              className="border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 ring-gray-300 transition"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
            />

            <input
              type="text"
              placeholder="Сүрөттүн URL (мисалы: https://example.com/image.jpg)"
              className="border border-gray-300 p-3 rounded-lg md:col-span-2 focus:outline-none focus:ring-2 ring-gray-300 transition"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={handleUpload}
              className="flex-1 bg-black hover:bg-gray-800 text-white py-3 rounded-lg font-semibold transition"
            >
              {editingId ? "Өзгөртүүлөрдү сактоо" : "Товар кошуу"}
            </button>
            {editingId && (
              <button
                onClick={handleCancel}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 rounded-lg font-semibold transition"
              >
                Жокко чыгаруу
              </button>
            )}
          </div>
        </div>

        {/* Products Grid */}
        <h3 className="text-2xl font-bold mb-6 text-gray-800">Товарлар</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map(product => (
            <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <div className="relative">
                <img 
                  src={product.imageUrl} 
                  alt={product.title}
                  className="w-full h-48 object-cover"
                />
                <span className="absolute top-3 right-3 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-semibold text-gray-800">
                  {product.category}
                </span>
              </div>
              
              <div className="p-4">
                <h3 className="font-bold text-lg text-black mb-2 truncate">{product.title}</h3>
                
                <div className="flex justify-between items-center mb-3">
                  <span className="text-2xl font-bold text-black">{product.price?.toLocaleString()} ₽</span>
                  <span className="px-3 py-1 bg-gray-100 rounded-full text-xs font-semibold text-gray-800">
                    {product.stock || 0} дана
                  </span>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(product)}
                    className="flex-1 flex items-center justify-center gap-2 bg-gray-100 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors font-semibold"
                  >
                    <BsPencil />
                    Өзгөртүү
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="flex items-center justify-center bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                  >
                    <BsTrash />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {products.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p className="text-xl">Товарлар жок. Биринчи товарыңызды кошуңуз!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;