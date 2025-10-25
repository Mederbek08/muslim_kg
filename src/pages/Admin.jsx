import React, { useState, useEffect } from "react";
import { LogOut, Plus, Trash2, Edit2, Image as ImageIcon, Moon } from "lucide-react";

const Admin = () => {
  const [category, setCategory] = useState("");
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState([null, null, null]);
  const [imageUrls, setImageUrls] = useState(["", "", ""]);
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [products, setProducts] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  // Колдонуучунун ролун текшерүү
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        navigate("/login");
        setLoading(false);
      } else {
        try {
          const userDocRef = doc(db, "users", currentUser.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists() && userDoc.data().role === "admin") {
            setUser(currentUser);
            setIsAdmin(true);
            setLoading(false);
          } else {
            alert("⛔ Сизде админ панелге кирүү укугу жок!");
            navigate("/");
            setLoading(false);
          }
        } catch (error) {
          console.error("Ката:", error);
          alert("⛔ Катчылык!");
          navigate("/");
          setLoading(false);
        }
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
    if (user && isAdmin) {
      fetchProducts();
    }
  }, [user, isAdmin]);

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
    navigate("/");
  };

  // Сүрөттөрдү жүктөө
  const handleImageChange = (e, index) => {
    const file = e.target.files[0];
    if (file) {
      const newImages = [...images];
      newImages[index] = file;
      setImages(newImages);
      
      // Preview үчүн
      const reader = new FileReader();
      reader.onloadend = () => {
        const newUrls = [...imageUrls];
        newUrls[index] = reader.result;
        setImageUrls(newUrls);
      };
      reader.readAsDataURL(file);
    }
  };

  // Сүрөттөрдү Firebase Storage'га жүктөө
  const uploadImages = async () => {
    const urls = [];
    setUploading(true);
    
    try {
      for (let i = 0; i < images.length; i++) {
        if (images[i]) {
          const imageRef = ref(storage, `products/${Date.now()}_${i}_${images[i].name}`);
          await uploadBytes(imageRef, images[i]);
          const url = await getDownloadURL(imageRef);
          urls.push(url);
        } else if (imageUrls[i] && imageUrls[i].startsWith('http')) {
          urls.push(imageUrls[i]);
        }
      }
      setUploading(false);
      return urls;
    } catch (error) {
      setUploading(false);
      console.error("Сүрөт жүктөөдө ката:", error);
      return urls;
    }
  };

  const handleUpload = async () => {
    if (!category || !title || !price) {
      alert("❌ Категория, аталышы жана баасы милдеттүү!");
      return;
    }

    try {
      const uploadedUrls = await uploadImages();
      
      const productData = {
        category,
        title,
        price: Number(price),
        stock: Number(stock) || 0,
        description: description || "",
        imageUrl: uploadedUrls[0] || "https://via.placeholder.com/400x300?text=No+Image",
        additionalImages: uploadedUrls.slice(1),
        updatedAt: new Date(),
      };

      if (editingId) {
        const productRef = doc(db, "products", editingId);
        await updateDoc(productRef, productData);
        alert("✅ Товар ийгиликтүү өзгөртүлдү!");
        setEditingId(null);
      } else {
        await addDoc(collection(db, "products"), {
          ...productData,
          createdAt: new Date(),
        });
        alert("✅ Товар ийгиликтүү кошулду!");
      }

      // Форманы тазалоо
      setCategory("");
      setTitle("");
      setPrice("");
      setStock("");
      setDescription("");
      setImages([null, null, null]);
      setImageUrls(["", "", ""]);
      fetchProducts();
    } catch (error) {
      console.error(error);
      alert("❌ Ката кетти!");
    }
  };

  const handleEdit = (product) => {
    setEditingId(product.id);
    setCategory(product.category);
    setTitle(product.title);
    setPrice(product.price);
    setStock(product.stock || 0);
    setDescription(product.description || "");
    setImageUrls([
      product.imageUrl || "",
      product.additionalImages?.[0] || "",
      product.additionalImages?.[1] || ""
    ]);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (window.confirm("❓ Бул товарды өчүрөсүзбү?")) {
      try {
        await deleteDoc(doc(db, "products", id));
        alert("✅ Товар өчүрүлдү!");
        fetchProducts();
      } catch (error) {
        console.error(error);
        alert("❌ Өчүрүүдө ката!");
      }
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setCategory("");
    setTitle("");
    setPrice("");
    setStock("");
    setDescription("");
    setImages([null, null, null]);
    setImageUrls(["", "", ""]);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 to-blue-500">
        <div className="text-center">
          <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-white mx-auto mb-4"></div>
          <p className="text-white text-xl font-semibold">Жүктөлүүдө...</p>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) return null;

  const totalProducts = products.length;
  const totalValue = products.reduce((sum, p) => sum + (p.price * (p.stock || 0)), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${scrolled ? "bg-white/95 shadow-lg backdrop-blur-md" : "bg-white"}`}>
        <div className="max-w-7xl mx-auto flex justify-between items-center px-4 sm:px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
              <FaMoon className="text-2xl text-white" />
            </div>
            <div>
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
                Admin Panel
              </span>
              <p className="text-xs text-gray-500">Muslim_kg</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600 hidden md:block">
              👤 {user?.email}
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-gradient-to-r from-red-500 to-pink-500 text-white px-5 py-2.5 rounded-xl hover:shadow-lg transition-all font-semibold"
            >
              <AiOutlineLogout className="text-xl" />
              <span className="hidden sm:inline">Чыгуу</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-28 pb-12">
        {/* Статистика */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-xl p-6 text-white">
            <p className="text-sm opacity-90 mb-2">Жалпы товарлар</p>
            <p className="text-4xl font-bold">{totalProducts}</p>
          </div>
          
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-xl p-6 text-white">
            <p className="text-sm opacity-90 mb-2">Жалпы наркы</p>
            <p className="text-4xl font-bold">{totalValue.toLocaleString()} ₽</p>
          </div>
          
          <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl shadow-xl p-6 text-white">
            <p className="text-sm opacity-90 mb-2">Категориялар</p>
            <p className="text-4xl font-bold">{new Set(products.map(p => p.category)).size}</p>
          </div>
        </div>

        {/* Форма */}
        <div className="bg-white shadow-2xl rounded-3xl p-6 sm:p-8 mb-8">
          <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent flex items-center gap-3">
            <AiOutlinePlus />
            {editingId ? "Товарды өзгөртүү" : "Жаңы товар кошуу"}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <select
              className="border-2 border-gray-300 p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition bg-gray-50"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">📂 Категория тандаңыз</option>
              <option value="Одежда">👕 Одежда</option>
              <option value="Техника">📱 Техника</option>
              <option value="Спорт">⚽ Спорт</option>
              <option value="Аксессуары">👜 Аксессуары</option>
              <option value="Обувь">👟 Обувь</option>
              <option value="Ислам товары">🕌 Ислам товары</option>
            </select>

            <input
              type="text"
              placeholder="📝 Товардын аталышы"
              className="border-2 border-gray-300 p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition bg-gray-50"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <input
              type="number"
              placeholder="💰 Баасы (сом)"
              className="border-2 border-gray-300 p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition bg-gray-50"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />

            <input
              type="number"
              placeholder="📦 Саны"
              className="border-2 border-gray-300 p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition bg-gray-50"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
            />

            <textarea
              placeholder="📄 Товар жөнүндө маалымат..."
              className="border-2 border-gray-300 p-4 rounded-xl md:col-span-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition h-32 bg-gray-50"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Сүрөттөр жүктөө */}
          <div className="mt-6">
            <h3 className="text-xl font-bold mb-4 text-gray-800">📸 Сүрөттөр (3 чейин)</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[0, 1, 2].map((index) => (
                <div key={index} className="relative">
                  <label className="cursor-pointer">
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 hover:border-purple-500 transition h-48 flex items-center justify-center bg-gray-50">
                      {imageUrls[index] ? (
                        <img src={imageUrls[index]} alt={`Preview ${index + 1}`} className="w-full h-full object-cover rounded-lg" />
                      ) : (
                        <div className="text-center">
                          <BsImage className="text-4xl text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-500">Сүрөт {index + 1}</p>
                        </div>
                      )}
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageChange(e, index)}
                      className="hidden"
                    />
                  </label>
                  {imageUrls[index] && (
                    <button
                      onClick={() => {
                        const newUrls = [...imageUrls];
                        newUrls[index] = "";
                        setImageUrls(newUrls);
                        const newImages = [...images];
                        newImages[index] = null;
                        setImages(newImages);
                      }}
                      className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                    >
                      <BsTrash />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 mt-8">
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="flex-1 bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white py-4 rounded-xl font-bold text-lg transition shadow-lg hover:shadow-xl disabled:opacity-50"
            >
              {uploading ? "Жүктөлүүдө..." : editingId ? "✅ Сактоо" : "➕ Кошуу"}
            </button>
            {editingId && (
              <button
                onClick={handleCancel}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-4 rounded-xl font-bold text-lg transition"
              >
                ❌ Жокко чыгаруу
              </button>
            )}
          </div>
        </div>

        {/* Товарлар тизмеси */}
        <h3 className="text-3xl font-bold mb-6 text-gray-800">📦 Товарлар</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map(product => (
            <div key={product.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all">
              <div className="relative h-56">
                <img 
                  src={product.imageUrl} 
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-3 right-3 px-4 py-1.5 bg-gradient-to-r from-purple-600 to-blue-500 text-white rounded-full text-sm font-bold shadow-lg">
                  {product.category}
                </span>
              </div>
              
              <div className="p-5">
                <h3 className="font-bold text-xl text-gray-800 mb-3 line-clamp-2">{product.title}</h3>
                
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <p className="text-sm text-gray-500">Баасы:</p>
                    <p className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
                      {product.price?.toLocaleString()} ₽
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Саны:</p>
                    <p className="text-2xl font-bold text-gray-800">
                      {product.stock || 0}
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(product)}
                    className="flex-1 flex items-center justify-center gap-2 bg-blue-500 text-white px-4 py-3 rounded-xl hover:bg-blue-600 transition font-semibold"
                  >
                    <BsPencil />
                    Өзгөртүү
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="flex items-center justify-center bg-red-500 text-white px-4 py-3 rounded-xl hover:bg-red-600 transition"
                  >
                    <BsTrash />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {products.length === 0 && (
          <div className="text-center py-20 text-gray-500">
            <p className="text-2xl">📦 Товарлар жок. Биринчи товарыңызды кошуңуз!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;