import { Route, Routes } from 'react-router-dom';



import Home from './pages/Home';

const App = () => {
    return (
        <div>

            <Routes>
                <Route index element={<Home />} />

            </Routes>

        </div>
    );
}

export default App;