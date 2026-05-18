import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Detail from './pages/Detail';
import Register from './pages/Register';
import AdRequest from './pages/AdRequest';
import Admin from './pages/Admin';

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/listing/:id" element={<Detail />} />
        <Route path="/register/:type" element={<Register />} />
        <Route path="/ad" element={<AdRequest />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </Layout>
  );
}
