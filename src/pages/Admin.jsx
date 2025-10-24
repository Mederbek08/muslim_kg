import React, { useState, useEffect } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  getDoc,
} from "firebase/firestore";
import { auth, db } from "../firebase";
import { useNavigate } from "react-router-dom";
import { AiOutlineLogout, AiOutlinePlus } from "react-icons/ai";
import { BsTrash, BsPencil } from "react-icons/bs";
import { FaMoon } from "react-icons/fa";

const ADMIN_EMAIL = "mederbekrahmatullaev7@gmail.com"; // Сенин Gmail

const Admin = () => {
  const [user, setUser] = useState(null);
  const [category, setCategory] = useState("");
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [images, setImages] = useState([""]);
  const [products, setProducts] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  // --- Автоматтык текшерүү ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        // Автоматтык Gmail логин
        try {
          await signInWithEmailAndPassword(auth, ADMIN_EMAIL, prompt("Паролуңузду жазыңыз:"));
        } catch (e) {
          alert("❌ Кирүү ката: " + e.message);
          navigate("/login");
        }
      } else {
        // Текшерүү
        if (currentUser.email === ADMIN_EMAIL) {
          setUser(currentUser);
          setLoading(false);
          fetchProducts();
        } else {
          alert("⛔ Бул аккаунт админ эмес!");
          await signOut(auth);
          navigate("/");
        }
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  // --- Товарлар жүктөө ---
  const fetchProducts = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "products"));
      const data = querySnapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));
      setProducts(data);
    } catch (e) {
      console.error(e);
    }
  };

  // --- Жаңы сүрөт кошуу ---
  const addImageField = () => {
    if (images.length < 5) setImages([...images, ""]);
  };

  const updateImage = (index, value) => {
    const newImgs = [...images];
    newImgs[index] = value;
    setImages(newImgs);
  };

  // --- Товар сактоо ---
  const handleSave = async () => {
    if (!category || !title || !price) {
      alert("⚠️ Бардык талааларды толтуруңуз!");
      return;
    }
    const validImages = images.filter((i) => i.trim() !== "");
    try {
      if (editingId) {
        await updateDoc(doc(db, "products", editingId), {
          category,
          title,
          price: Number(price),
          stock: Number(stock),
          images: validImages,
          updatedAt: new Date(),
        });
        alert("✅ Товар жаңыртылды!");
      } else {
        await addDoc(collection(db, "products"), {
          category,
          title,
          price: Number(price),
          stock: Number(stock),
          images: validImages,
          createdAt: new Date(),
        });
        alert("✅ Жаңы товар кошулду!");
      }
      resetForm();
      fetchProducts();
    } catch (e) {
      console.error(e);
      alert("❌ Ката кетти!");
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setCategory("");
    setTitle("");
    setPrice("");
    setStock("");
    setImages([""]);
  };

  // --- Товар өчүрүү ---
  const handleDelete = async (id) => {
    if (window.confirm("Бул товарды чын эле өчүрөсүзбү?")) {
      await deleteDoc(doc(db, "products", id));
      fetchProducts();
    }
  };

  // --- Товар өзгөртүү ---
  const handleEdit = (product) => {
    setEditingId(product.id);
    setCategory(product.category);
    setTitle(product.title);
    setPrice(product.price);
    setStock(product.stock);
    setImages(product.images || [""]);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // --- Logout ---
  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  // --- Scroll effect ---
  useEffect(() => {
    const scroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", scroll);
    return () => window.removeEventListener("scroll", scroll);
  }, []);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-lg font-semibold text-gray-600">
        Жүктөлүүдө...
      </div>
    );

  if (!user) return null;

  const totalValue = products.reduce(
    (sum, p) => sum + p.price * (p.stock || 0),
    0
  );

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header
        className={`fixed top-0 left-0 w-full z-50 shadow-md transition-all ${
          scrolled ? "bg-white/90 backdrop-blur-md" : "bg-white"
        }`}
      >
        <div className="max-w-[1200px] mx-auto flex justify-between items-center px-5 py-3">
          <div className="flex items-center gap-2">
            <FaMoon className="text-2xl" />
            <h1 className="text-2xl font-bold">Admin Panel</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:block text-gray-600 text-sm">
              {user.email}
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 bg-black text-white px-4 py-2 rounded-full hover:bg-gray-800 transition"
            >
              <AiOutlineLogout />
              Чыгуу
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[1200px] mx-auto px-5 pt-24 pb-10">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white shadow rounded-lg p-4 text-center">
            <p className="text-gray-500 text-sm">Жалпы товар</p>
            <h2 className="text-2xl font-bold">{products.length}</h2>
          </div>
          <div className="bg-white shadow rounded-lg p-4 text-center">
            <p className="text-gray-500 text-sm">Жалпы нарк</p>
            <h2 className="text-2xl font-bold">
              {totalValue.toLocaleString()} сом
            </h2>
          </div>
          <div className="bg-white shadow rounded-lg p-4 text-center hidden sm:block">
            <p className="text-gray-500 text-sm">Категориялар</p>
            <h2 className="text-2xl font-bold">
              {new Set(products.map((p) => p.category)).size}
            </h2>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white shadow-xl rounded-xl p-5 mb-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <AiOutlinePlus />
            {editingId ? "Товарды өзгөртүү" : "Жаңы товар кошуу"}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <select
              className="border p-3 rounded-lg"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">Категория тандаңыз</option>
              <option>Одежда</option>
              <option>Техника</option>
              <option>Обувь</option>
              <option>Аксессуары</option>
              <option>Ислам товары</option>
            </select>

            <input
              type="text"
              placeholder="Товардын аты"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="border p-3 rounded-lg"
            />

            <input
              type="number"
              placeholder="Баасы"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="border p-3 rounded-lg"
            />

            <input
              type="number"
              placeholder="Саны"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              className="border p-3 rounded-lg"
            />
          </div>

          {/* Images */}
          <div className="mt-4">
            <h3 className="font-semibold mb-2">Сүрөттөр (5 чейин):</h3>
            {images.map((img, i) => (
              <input
                key={i}
                type="text"
                placeholder={`Сүрөт ${i + 1} URL`}
                value={img}
                onChange={(e) => updateImage(i, e.target.value)}
                className="border p-2 w-full rounded-lg mb-2"
              />
            ))}
            {images.length < 5 && (
              <button
                onClick={addImageField}
                className="bg-gray-200 hover:bg-gray-300 text-sm px-4 py-2 rounded-lg"
              >
                + Дагы сүрөт кошуу
              </button>
            )}
          </div>

          <div className="flex gap-3 mt-5">
            <button
              onClick={handleSave}
              className="flex-1 bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition"
            >
              {editingId ? "Сактоо" : "Кошуу"}
            </button>
            {editingId && (
              <button
                onClick={resetForm}
                className="flex-1 bg-gray-500 text-white py-3 rounded-lg hover:bg-gray-600 transition"
              >
                Жокко чыгаруу
              </button>
            )}
          </div>
        </div>

        {/* Products */}
        <h3 className="text-xl font-bold mb-4">Товарлар</h3>
        {products.length === 0 ? (
          <p className="text-gray-500">Товар жок</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {products.map((p) => (
              <div
                key={p.id}
                className="bg-white shadow rounded-xl overflow-hidden hover:shadow-lg transition"
              >
                <img
                  src={p.images?.[0] || "https://via.placeholder.com/400x300"}
                  alt={p.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h4 className="font-bold text-lg mb-1">{p.title}</h4>
                  <p className="text-gray-600 text-sm mb-2">{p.category}</p>
                  <p className="font-semibold text-black mb-2">
                    {p.price.toLocaleString()} сом
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(p)}
                      className="flex-1 bg-gray-200 hover:bg-gray-300 rounded-lg py-2 text-sm font-semibold"
                    >
                      <BsPencil /> Өзгөртүү
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="bg-red-500 hover:bg-red-600 text-white rounded-lg px-4 py-2"
                    >
                      <BsTrash />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Admin;
