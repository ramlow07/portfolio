import './i18n/config';
import SmoothScroll from './components/SmoothScroll/SmoothScroll';
import Cursor from './components/Cursor/Cursor';
import Navigation from './components/Navigation/Navigation';
import Hero from './components/Hero/Hero';
import Work from './components/Work/Work';
import Skills from './components/Skills/Skills';
import About from './components/About/About';
import Contact from './components/Contact/Contact';
import Footer from './components/Footer/Footer';
import './App.css';

function App() {
  return (
    <SmoothScroll>
      <div className="grain" aria-hidden />
      <Cursor />
      <Navigation />
      <main>
        <Hero />
        <Work />
        <Skills />
        <About />
        <Contact />
      </main>
      <Footer />
    </SmoothScroll>
  );
}

export default App;
