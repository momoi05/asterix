import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css'
import Login from './Pages/login';
import Register from './Pages/register';
import Map from './Pages/map';
import Profil from './Pages/profil';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/map" element={<Map />} />
        <Route path="/profil" element={<Profil />} />

      </Routes>
    </BrowserRouter>
  )
}

export default App
