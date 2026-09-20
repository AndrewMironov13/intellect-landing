import { Nav } from '@/components/Nav'
import { Hero } from '@/components/Hero'
import { Ticker } from '@/components/Ticker'
import { Services } from '@/components/Services'
import { Winter } from '@/components/Winter'
import { Constructor } from '@/components/Constructor'
import { Works } from '@/components/Works'
import { Reviews } from '@/components/Reviews'
import { About } from '@/components/About'
import { Contact } from '@/components/Contact'
import { Footer } from '@/components/Footer'

export default function App() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Ticker />
        <Services />
        <Winter />
        <Constructor />
        <Works />
        <Reviews />
        <About />
        <Contact />
      </main>
      <Footer />
    </>
  )
}
