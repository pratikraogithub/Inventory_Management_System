// src/pages/Dashboard.jsx
import Navbar from '../components/Navbar';
import ProductList from '../components/ProductList';
import ProductForm from '../components/ProductForm';
import { useState } from 'react';

export default function Dashboard() {
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [refresh, setRefresh] = useState(false);

    const handleSaved = () => {
        setSelectedProduct(null);
        setRefresh(!refresh);
    };

    return (
        <div>
            <Navbar />
            <div className="container mt-4">
                <ProductForm selectedProduct={selectedProduct} onSaved={handleSaved} />
                <ProductList key={refresh} onEdit={setSelectedProduct} />
            </div>
        </div>
    );
}
