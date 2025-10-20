import { Route, Routes } from 'react-router-dom';



import Home from './pages/Home';
import Admin from './pages/Admin';
import Login from './components/Login';
import About from './pages/About';


const App = () => {
    return (
        <div>

            <Routes>
                <Route path='/' element={<Home />} />
                <Route path='/admin' element={<Admin />} />
                <Route path='/login' element={<Login />} />
                <Route path='/about' element={<About />} />
            </Routes>

        </div>
    );
}

export default App;