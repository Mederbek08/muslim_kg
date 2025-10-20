import React from 'react'
import Router from './router' 
import CartModal from './components/CartModal'
import { CartProvider } from './components/CartContext';

const App = () => {
  return (
    <>
      <CartProvider>
            <Router />     <CartModal />
      </CartProvider>
    </>
  )
}

export default App