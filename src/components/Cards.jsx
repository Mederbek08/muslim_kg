import React, { useState, useEffect } from 'react';
import { Package, Loader2, AlertTriangle, ShoppingCart, CheckCircle, Box, Image } from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useCart } from './CartContext';

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
        <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 p-3 rounded-lg text-white font-medium flex items-center shadow-xl ${bgColor}`}>
            <Icon className="w-5 h-5 mr-2" />
            <span>{message}</span>
        </div>
    );
};

const formatSom = (amount) => {
    return new Intl.NumberFormat('ru-RU', { 
        style: 'currency', 
        currency: 'KGS', 
        minimumFractionDigits: 0 
    }).format(amount).replace('KGS', '₽');
};

// =============================================================
// --- 1. ProductCard (Дочерний компонент: Рендерит одну карточку) ---
// =============================================================

const ProductCard = ({ product }) => {
    const [alert, setAlert] = useState(null);
    const { addToCart, toggleCart } = useCart();
    const { id, title, price, stock, category, imageUrl } = product; 
    
    const handlePurchase = () => {
        if (stock > 0) {
            addToCart(product);
            setAlert({
                message: `${title} добавлен в корзину!`,
                type: 'success'
            });
            
            setTimeout(() => {
                toggleCart();
            }, 500);
        }
    };

    const formattedPrice = formatSom(parseFloat(price || 0));
    const inStock = stock > 0;

    return (
        <div className="relative w-full rounded-2xl shadow-xl bg-gradient-to-r from-purple-600 to-blue-500 p-0.5 transform hover:scale-105 transition duration-300">
            
            {alert && (
                <Alert 
                    message={alert.message} 
                    type={alert.type} 
                    onClose={() => setAlert(null)} 
                />
            )}

            <div className="p-6 rounded-2xl bg-white bg-opacity-10 backdrop-blur-lg flex flex-col space-y-4 h-full text-white">
                
                <div className="absolute top-8 right-8 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
                    <span className="text-xs font-bold text-purple-600">{category}</span>
                </div>

                <div className="w-full h-40 md:h-48 bg-gray-200 rounded-lg overflow-hidden mb-2 relative">
                    {imageUrl ? (
                        <img 
                            src={imageUrl} 
                            alt={title} 
                            className="w-full h-full object-cover" 
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-500">
                            <Image className="w-12 h-12"/>
                        </div>
                    )}
                </div>

                <div className="flex items-start space-x-3">
                    <Package className="w-6 h-6 text-yellow-300 mt-1 flex-shrink-0" />
                    <h2 className="text-xl font-extrabold leading-snug flex-grow">
                        {title}
                    </h2>
                </div>

                <div className="flex items-end justify-between border-t border-white border-opacity-30 pt-4">
                    <div className="flex flex-col">
                        <span className="text-sm font-light opacity-80">Цена:</span>
                        <p className="text-2xl sm:text-3xl font-black">
                            {formattedPrice}
                        </p>
                    </div>
                    <div className="flex flex-col items-end">
                        <span className="text-sm font-light opacity-80">В наличии:</span>
                        <p className={`text-lg font-bold ${inStock ? 'text-green-300' : 'text-red-300'}`}>
                            {stock} шт
                        </p>
                    </div>
                </div>

                <button 
                    className="w-full py-3 mt-4 bg-white text-purple-600 font-bold text-base md:text-lg rounded-lg shadow-lg hover:shadow-xl transition duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
                    onClick={handlePurchase}
                    disabled={!inStock}
                >
                    <ShoppingCart className="w-5 h-5"/>
                    <span>{inStock ? 'Добавить в корзину' : 'Нет в наличии'}</span>
                </button>
            </div>
        </div>
    );
};

// =============================================================
// --- 2. Cards (Родительский компонент: Загрузка и Фильтрация) ---
// =============================================================

const Cards = ({ searchTerm, categoryFilter, onCategorySelect }) => {
    
    const [products, setProducts] = useState([]); 
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setIsLoading(true);
                setError(null);
                
                const querySnapshot = await getDocs(collection(db, 'products'));
                const productsData = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                
                setProducts(productsData);
            } catch (err) {
                console.error('Ошибка загрузки товаров:', err);
                setError(err.message || 'Не удалось загрузить товары');
            } finally {
                setIsLoading(false);
            }
        };

        fetchProducts();
    }, []);

    
    // --- ЛОГИКА ФИЛЬТРАЦИИ И ПОИСКА ---
    
    // 1. Фильтрация по категории
    const filteredByCategory = categoryFilter === '' || categoryFilter === 'Все товары'
        ? products 
        : products.filter(p => p.category === categoryFilter);

    // 2. Фильтрация по поисковому запросу
    const finalFilteredProducts = filteredByCategory.filter(p => {
        if (!searchTerm) return true;
        
        const searchLower = searchTerm.toLowerCase();
        
        const titleMatch = p.title && String(p.title).toLowerCase().includes(searchLower);
        const categoryMatch = p.category && String(p.category).toLowerCase().includes(searchLower);
        
        return titleMatch || categoryMatch;
    });

    // Получаем уникальные категории для кнопок
    const categories = ['Все товары', ...new Set(products.map(p => p.category))];
    
    // --- Отображение состояний (Loader, Error) ---

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen p-4">
                <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
                <p className="ml-3 text-gray-700 font-semibold">Загрузка товаров из базы данных...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen p-4">
                <AlertTriangle className="w-10 h-10 text-red-500" />
                <p className="ml-3 text-red-700 font-bold">Ошибка: {error}</p>
            </div>
        );
    }

    if (products.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-4">
                <Box className="w-16 h-16 text-gray-400 mb-4" />
                <p className="text-xl text-gray-600 font-semibold">Отсутствует подключение к интернету</p>
                <p className="text-sm text-gray-500 mt-2">КОД ОШИБКИ: 404</p>
            </div>
        );
    }
    
    // --- Основной Рендер ---
    return (
        <div className="min-h-screen p-4 sm:p-8 bg-gray-100">
            <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-800 text-center">
                {searchTerm || categoryFilter ? "Результаты поиска и фильтрации" : "Наши Товары"}
            </h1>
            
            {/* Фильтр по категориям */}
            <div className="flex flex-wrap justify-center gap-3 mb-8">
                {categories.map(cat => (
                    <button
                        key={cat}
                        onClick={() => onCategorySelect(cat === 'Все товары' ? '' : cat)}
                        className={`px-4 py-2 rounded-full font-semibold transition-all duration-200 ${
                            (categoryFilter === cat || (categoryFilter === '' && cat === 'Все товары'))
                                ? 'bg-purple-600 text-white shadow-lg scale-105' 
                                : 'bg-white text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        {cat} ({cat === 'Все товары' ? products.length : products.filter(p => p.category === cat).length})
                    </button>
                ))}
            </div>

            {/* Статистика */}
            <div className="max-w-4xl mx-auto mb-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg shadow-md p-4 text-center">
                    <p className="text-gray-600 text-sm mb-1">Найдено товаров</p>
                    <p className="text-2xl font-bold text-purple-600">{finalFilteredProducts.length}</p>
                </div>
                <div className="bg-white rounded-lg shadow-md p-4 text-center">
                    <p className="text-gray-600 text-sm mb-1">В наличии</p>
                    <p className="text-2xl font-bold text-green-600">
                        {finalFilteredProducts.filter(p => p.stock > 0).length}
                    </p>
                </div>
                <div className="bg-white rounded-lg shadow-md p-4 text-center">
                    <p className="text-gray-600 text-sm mb-1">Средняя цена</p>
                    <p className="text-2xl font-bold text-blue-600">
                        {finalFilteredProducts.length > 0 
                            ? formatSom(finalFilteredProducts.reduce((sum, p) => sum + (parseFloat(p.price) || 0), 0) / finalFilteredProducts.length)
                            : '0 ₽'
                        }
                    </p>
                </div>
            </div>
            
            {/* Сетка товаров */}
            {finalFilteredProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
                    {finalFilteredProducts.map((product) => (
                        <ProductCard 
                            key={product.id} 
                            product={product} 
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-12">
                    <p className="text-xl text-gray-600">
                        Ничего не найдено по запросу 
                        <span className="font-bold text-purple-600 ml-1">
                            "{searchTerm || categoryFilter || 'Все товары'}"
                        </span>
                    </p>
                </div>
            )}
        </div>
    );
};

export default Cards;