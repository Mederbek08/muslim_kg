import React, { useState, useEffect } from "react";
import { Lock, User, Key, AlertTriangle } from "lucide-react";
import { initializeApp } from 'firebase/app';
import { 
    getAuth, 
    signInWithCustomToken, 
    signInAnonymously, 
    signInWithEmailAndPassword
} from 'firebase/auth';

// --- ВНИМАНИЕ: Заглушка для useNavigate ---
// В вашем реальном проекте, используйте:
// import { useNavigate } from 'react-router-dom';
const useNavigate = () => {
    return (path) => {
        // Симуляция работы navigate для среды Canvas
        console.log(`Navigating to ${path} using simulated hook. Replace this mock with the real hook in your project.`);
        window.location.href = path;
    };
};
// ------------------------------------------

// --- Обязательная инициализация Firebase ---
const useFirebaseInit = () => {
    const [auth, setAuth] = useState(null);
    const [userId, setUserId] = useState(null);
    const [isAuthReady, setIsAuthReady] = useState(false);

    useEffect(() => {
        let newAuth;
        const initializeFirebase = async () => {
            try {
                // 1. Получение обязательных глобальных переменных
                const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
                const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : null;
                const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

                console.log("=== Firebase Initialization Debug ===");
                console.log("App ID:", appId);
                console.log("Config exists:", !!firebaseConfig);
                console.log("Token exists:", !!initialAuthToken);

                if (!firebaseConfig) {
                    console.error("FIREBASE ERROR: Firebase config is missing.");
                    console.log("Attempting to use default Firebase instance if available...");
                    // Попытка получить существующий auth (если Firebase уже инициализирован глобально)
                    try {
                        newAuth = getAuth();
                        setAuth(newAuth);
                        setIsAuthReady(true);
                        console.log("Using existing Firebase Auth instance.");
                        return;
                    } catch (e) {
                        console.error("No Firebase instance found. Cannot proceed.");
                        setIsAuthReady(true);
                        return;
                    }
                }

                // 2. Инициализация App и Auth
                const app = initializeApp(firebaseConfig, appId);
                newAuth = getAuth(app);
                setAuth(newAuth);
                
                // 3. Базовая аутентификация (токен или анонимно)
                if (initialAuthToken) {
                    await signInWithCustomToken(newAuth, initialAuthToken);
                } else {
                    await signInAnonymously(newAuth);
                }

                setUserId(newAuth.currentUser?.uid || 'anonymous');
                setIsAuthReady(true);
                console.log("Firebase initialized and base auth completed.");
                console.log("Current User UID:", newAuth.currentUser?.uid);

            } catch (e) {
                console.error("FIREBASE INITIALIZATION FAILED:", e);
                setIsAuthReady(true);
            }
        };

        initializeFirebase();

        return () => {
            // Очистка при необходимости
        };
    }, []);

    return { auth, userId, isAuthReady };
};
// ---------------------------------

const Login = ({ auth, isAuthReady }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Инициализация useNavigate (использует заглушку, определенную выше)
  const navigate = useNavigate(); 
  
  // Экран загрузки
  if (!isAuthReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <div className="flex flex-col items-center gap-4">
            <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded-full animate-pulse bg-purple-500"></div>
                <div className="w-4 h-4 rounded-full animate-pulse bg-blue-500 delay-150"></div>
                <div className="w-4 h-4 rounded-full animate-pulse bg-purple-500 delay-300"></div>
            </div>
            <p>Загрузка Firebase...</p>
        </div>
      </div>
    );
  }

  // Если Firebase не инициализирован - показываем понятную ошибку
  if (!auth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white p-4">
        <div className="max-w-md bg-red-900/30 border border-red-500 rounded-xl p-6 text-center">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-red-200 mb-2">Ошибка конфигурации Firebase</h2>
          <p className="text-red-300 text-sm mb-4">
            Firebase не инициализирован. Проверьте глобальные переменные:
          </p>
          <ul className="text-left text-red-300 text-xs space-y-1 bg-black/30 p-3 rounded">
            <li>• <code>__firebase_config</code></li>
            <li>• <code>__app_id</code></li>
            <li>• <code>__initial_auth_token</code> (опционально)</li>
          </ul>
          <p className="text-red-300 text-xs mt-4">
            Откройте консоль браузера (F12) для подробной информации.
          </p>
        </div>
      </div>
    );
  }

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    if (!email || !password) {
      setError("❌ Пожалуйста, введите Email и Пароль.");
      setLoading(false);
      return;
    }
    
    // Проверка, что объект auth доступен
    if (!auth) {
        setError("❌ Firebase не инициализирован. Обратитесь к администратору.");
        setLoading(false);
        return;
    }

    try {
      console.log("Attempting login with email:", email);
      await signInWithEmailAndPassword(auth, email, password);
      
      console.log("Login successful! User:", auth.currentUser?.email);
      
      // --- ПЕРЕНАПРАВЛЕНИЕ С ПОМОЩЬЮ useNavigate ---
      // В реальном проекте это вызовет React Router для навигации.
      navigate('/admin');
      // ---
      
    } catch (err) {
      // Улучшенная обработка ошибок Firebase для пользователя
      let errorMessage = "❌ Произошла ошибка. Повторите попытку.";
      
      console.error("Login error:", err.code, err.message);
      
      switch (err.code) {
        case "auth/invalid-email":
        case "auth/user-not-found":
        case "auth/wrong-password":
        case "auth/invalid-credential":
            // Унифицированное сообщение для неверных учетных данных
            errorMessage = "❌ Неверный Email или Пароль.";
            break;
        case "auth/network-request-failed":
            errorMessage = "❌ Ошибка сети. Проверьте подключение к Интернету.";
            break;
        case "auth/too-many-requests":
            errorMessage = "❌ Слишком много неудачных попыток. Повторите позже.";
            break;
        default:
            errorMessage = `❌ Ошибка: ${err.message}`;
            break;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Основная форма входа
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden transform transition duration-500 hover:shadow-purple-500/50">
        
        <div className="bg-gradient-to-r from-purple-700 to-blue-600 p-6 flex flex-col items-center">
          <Lock className="w-10 h-10 text-white mb-2" />
          <h2 className="text-2xl font-extrabold text-white">Вход для Администратора</h2>
          <p className="text-white/80 text-sm mt-1">Доступ разрешен только персоналу.</p>
        </div>

        <div className="p-8 flex flex-col gap-5">
          
          <div className="flex items-start p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
            <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <p className="ml-3 text-sm font-medium">
              Внимание! Это служебная страница. Используйте учетные данные администратора.
            </p>
          </div>
          
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="email"
              placeholder="Email Администратора"
              className="w-full border border-gray-300 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-shadow duration-300"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>
          
          <div className="relative">
            <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="password"
              placeholder="Пароль"
              className="w-full border border-gray-300 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-shadow duration-300"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>
          
          {error && <p className="text-red-500 text-sm text-center font-medium">{error}</p>}
          
          <button
            onClick={handleLogin}
            className={`w-full text-white py-3 rounded-xl font-bold text-lg transition duration-300 transform active:scale-[0.99] focus:outline-none focus:ring-4 ring-purple-300 ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 shadow-md shadow-purple-500/50 hover:scale-[1.01]'}`}
            disabled={loading}
          >
            {loading ? 'Вход...' : 'Войти в Панель'}
          </button>
        </div>
        
        <div className="p-4 text-center text-xs text-gray-500">
          <p>&copy; 2024 Muslim_Kg. Текущий UID: {auth?.currentUser?.uid || 'N/A'}</p>
        </div>
      </div>
    </div>
  );
};


const App = () => {
    const { auth, isAuthReady } = useFirebaseInit();

    return (
        <Login 
            auth={auth} 
            isAuthReady={isAuthReady} 
        />
    );
};

export default App;