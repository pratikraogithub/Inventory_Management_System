// src/components/ProductForm.jsx
import { useEffect, useState } from 'react';
import api from '../utils/api';

export default function ProductForm({ selectedProduct, onSaved }) {
    const [product, setProduct] = useState({
        name: '',
        quantity: 0,
        price: '',
        supplier_id: '',
    });
    const [suppliers, setSuppliers] = useState([]);

    const fetchSuppliers = async () => {
        const res = await api.get('suppliers/');
        setSuppliers(res.data);
    };

    useEffect(() => {
        fetchSuppliers();
    }, []);

    useEffect(() => {
        if (selectedProduct) {
            setProduct({
                name: selectedProduct.name,
                quantity: selectedProduct.quantity,
                price: selectedProduct.price,
                supplier_id: selectedProduct.supplier?.id || '',
            });
        }
    }, [selectedProduct]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (selectedProduct) {
                await api.put(`products/${selectedProduct.id}/`, product);
            } else {
                await api.post('products/', product);
            }
            setProduct({ name: '', quantity: 0, price: '', supplier_id: '' });
            onSaved(); // refresh
        } catch (err) {
            console.error(err);
            alert('Error saving product');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="mt-4">
            <h4>{selectedProduct ? 'Edit Product' : 'Add Product'}</h4>
            <input className="form-control mb-2" placeholder="Name"
                value={product.name} onChange={(e) => setProduct({ ...product, name: e.target.value })} />
            <input className="form-control mb-2" placeholder="Quantity" type="number"
                value={product.quantity} onChange={(e) => setProduct({ ...product, quantity: e.target.value })} />
            <input className="form-control mb-2" placeholder="Price" type="number"
                value={product.price} onChange={(e) => setProduct({ ...product, price: e.target.value })} />
            <select className="form-control mb-2"
                value={product.supplier_id} onChange={(e) => setProduct({ ...product, supplier_id: e.target.value })}>
                <option value="">Select Supplier</option>
                {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                ))}
            </select>
            <button className="btn btn-success">{selectedProduct ? 'Update' : 'Add'}</button>
        </form>
    );
}
