import React from 'react'
import Header from '../components/layout/Header'
import Footer from '../components/Footer'
import Slider from '../components/Slider'
import Cards from '../components/Cards'

function Home() {
  return (
    <div>
      <Header />
      <Slider />
      <Cards />
      <Footer />
    </div>
  )
}

export default Home