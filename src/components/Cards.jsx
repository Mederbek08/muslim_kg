import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Package, DollarSign, Box, Loader2, AlertTriangle, ShoppingCart, Tag, CheckCircle, Image as ImageIcon } from 'lucide-react'; 

// URL фейкового API, который возвращает МАССИВ объектов
const API_URL = 'https://jsonplaceholder.typicode.com/posts?_limit=4'; // Увеличим до 4 товаров

// ... (Вспомогательные компоненты Alert и formatSom остаются без изменений) ...

// =============================================================
// --- Вспомогательные Компоненты / Функции ---
// =============================================================

const Alert = ({ message, type, onClose }) => {
    const isSuccess = type === 'success';
    const bgColor = isSuccess ? 'bg-green-500' : 'bg-red-500';
    const Icon = isSuccess ? CheckCircle : AlertTriangle;

    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className={`absolute top-4 left-1/2 transform -translate-x-1/2 z-20 p-3 rounded-lg text-white font-medium flex items-center shadow-xl ${bgColor}`}>
            <Icon className="w-5 h-5 mr-2" />
            <span>{message}</span>
        </div>
    );
};

const formatSom = (amount) => {
    return new Intl.NumberFormat('ru-RU', { 
        style: 'currency', 
        currency: 'KGS', 
        minimumFractionDigits: 2 
    }).format(amount).replace('KGS', 'СОМ');
};

// =============================================================
// --- 1. ProductCard (Дочерний компонент: Рендерит одну карточку) ---
// =============================================================

const ProductCard = ({ product }) => {
    const [alert, setAlert] = useState(null); 
    const { title, price, inStock, description, imageUrl } = product; 
    
    const handlePurchase = () => {
        setAlert({
            message: `Товар #${product.id} добавлен в корзину!`,
            type: 'success'
        });
    };

    const formattedPrice = formatSom(parseFloat(price));

    return (
      <div className="relative w-full rounded-2xl shadow-xl 
                      bg-gradient-to-r from-purple-600 to-blue-500 
                      p-0.5 transform hover:scale-[1.03] transition duration-300">
          
          {alert && (
              <Alert 
                  message={alert.message} 
                  type={alert.type} 
                  onClose={() => setAlert(null)} 
              />
          )}

          <div className="p-6 rounded-[calc(1.5rem-2px)] backdrop-filter backdrop-blur-lg bg-black bg-opacity-20 
                          flex flex-col space-y-4 h-full text-white">
              
              {/* Изображение Товара - Адаптивная высота */}
              <div className="w-full h-40 md:h-48 bg-gray-200 rounded-lg overflow-hidden mb-2 relative">
                  {imageUrl ? (
                      <img 
                          src={imageUrl} 
                          alt={title} 
                          className="w-full h-full object-cover" 
                      />
                  ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-500">
                          <ImageIcon className="w-12 h-12"/>
                      </div>
                  )}
              </div>

              {/* НАЗВАНИЕ ТОВАРА */}
              <div className="flex items-start space-x-3">
                  <Package className="w-6 h-6 text-yellow-300 mt-1 flex-shrink-0" />
                  <h2 className="text-xl font-extrabold leading-snug flex-grow">
                      {title}
                  </h2>
              </div>

              {/* ЦЕНА (СОМ) */}
              {/* Адаптивный размер текста цены */}
              <div className="flex items-end justify-between border-t border-white border-opacity-30 pt-4">
                  <div className="flex flex-col">
                      <span className="text-sm font-light opacity-80">Цена:</span>
                      <p className="text-2xl sm:text-3xl font-black">
                          {formattedPrice}
                      </p>
                  </div>
              </div>

              {/* ОПИСАНИЕ */}
              <div className="pt-2">
                  <p className="text-sm font-semibold mb-1 flex items-center space-x-1 opacity-80">
                     <Tag className="w-4 h-4 opacity-70"/> Краткое описание:
                  </p>
                  {/* Адаптивный размер текста описания */}
                  <p className="text-xs sm:text-sm opacity-90 leading-normal">
                    {description}
                  </p>
              </div>

              {/* КНОПКА CTA - Адаптивный размер */}
              <button 
                className="w-full py-3 mt-4 bg-white text-purple-600 font-bold text-base md:text-lg 
                           rounded-lg shadow-lg hover:shadow-xl transition duration-200 
                           flex items-center justify-center space-x-2 disabled:opacity-50"
                onClick={handlePurchase}
                disabled={inStock <= 0}
              >
                <ShoppingCart className="w-5 h-5"/>
                <span>{inStock > 0 ? 'Добавить в корзину' : 'Нет в наличии'}</span>
              </button>
          </div>
      </div>
    );
};

// =============================================================
// --- 2. ProductListing (Родительский компонент: Загрузка данных) ---
// =============================================================

const ProductListing = () => {
    const [products, setProducts] = useState([]); 
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchProducts = async () => {
        try {
            const response = await axios.get(API_URL);
            
            const adaptedProducts = response.data.map((item, index) => ({
                id: item.id,
                title: `Товар #${item.id} - ${item.title.substring(0, 15)}...`,
                price: (25000 / (index + 1)).toFixed(2), 
                inStock: (5 - index) > 0 ? (5 - index) : 0, 
                description: item.body.substring(0, 80) + '...',
                imageUrl: `https://via.placeholder.com/400x200?text=Product+${item.id}` 
            }));
            
            setProducts(adaptedProducts);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };
    
    useEffect(() => {
        fetchProducts();
    }, []);

    // ... (Блоки загрузки и ошибки остаются без изменений) ...

    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen p-4">
            <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
            <p className="ml-3 text-gray-700 font-semibold">Загрузка списка товаров...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center min-h-screen p-4">
            <AlertTriangle className="w-10 h-10 text-red-500" />
            <p className="ml-3 text-red-700 font-bold">Ошибка загрузки списка: {error}</p>
        </div>
      );
    }
    
    // --- Рендеринг списка карточек через map() ---
    return (
        <div className="min-h-screen p-4 sm:p-8 bg-gray-100">
            <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-800 text-center">
                Наши Рекомендуемые Товары
            </h1>
            
            {/* ⬅️ КЛЮЧЕВОЙ МОМЕНТ: АДАПТИВНАЯ СЕТКА */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
                {products.map((product) => (
                    <ProductCard 
                        key={product.id} 
                        product={product} 
                    />
                ))}
            </div>
        </div>
    );
};

export default ProductListing;