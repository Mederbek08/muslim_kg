import { createBrowserRouter } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Layout from "./components/layout/Layout";

export const router = createBrowserRouter([
    {
        path:"/",
        element:<Layout/>,
        children:[
            {
                path:"/",
                element:<Home/>
            },
        ]
    }
])