import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ArchivedProducts = () => {
    const [archived, setArchived] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortField, setSortField] = useState('name');
    const [sortOrder, setSortOrder] = useState('asc');

    const token = localStorage.getItem('token'); // Optional if you're using auth

    const fetchArchived = async () => {
        try {
            const response = await axios.get('http://localhost:8000/api/archived-products/', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (
                response.headers['content-type']?.includes('application/json')
            ) {
                if (Array.isArray(response.data)) {
                    setArchived(response.data);
                } else if (response.data.results) {
                    setArchived(response.data.results);
                } else {
                    console.warn('Unexpected response format:', response.data);
                    setArchived([]);
                }
            } else {
                console.warn('Non-JSON response received:', response.data);
                setArchived([]);
            }
        } catch (error) {
            console.error('Error fetching archived products:', error);
            setArchived([]);
        } finally {
            setLoading(false);
        }
    };

    const handleRestore = async (id) => {
        try {
            await axios.post(`http://localhost:8000/api/products/${id}/restore/`, null, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setArchived(prev => prev.filter(p => p.id !== id));
        } catch (error) {
            console.error('Error restoring product:', error);
        }
    };

    const handleRestoreAll = async () => {
        const promises = archived.map(product =>
            axios.post(`http://localhost:8000/api/products/${product.id}/restore/`, null, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
        );
        try {
            await Promise.all(promises);
            alert('All products restored!');
            setArchived([]);
        } catch (error) {
            console.error('Error restoring all products:', error);
            alert('Some products failed to restore.');
        }
    };

    const handleSort = (field) => {
        if (field === sortField) {
            setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortField(field);
            setSortOrder('asc');
        }
    };

    const sortedProducts = [...archived]
        .filter(product =>
            product.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .sort((a, b) => {
            const aVal = a[sortField];
            const bVal = b[sortField];
            if (typeof aVal === 'string') {
                return sortOrder === 'asc'
                    ? aVal.localeCompare(bVal)
                    : bVal.localeCompare(aVal);
            }
            return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
        });

    const downloadCSV = () => {
        if (!archived.length) {
            alert('No data to export.');
            return;
        }

        const headers = ['ID', 'Name', 'SKU', 'Quantity'];
        const rows = archived.map(product => [
            product.id,
            product.name,
            product.sku,
            product.quantity,
        ]);

        const csvContent =
            'data:text/csv;charset=utf-8,' +
            [headers, ...rows].map(e => e.join(',')).join('\n');

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', 'archived_products.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    useEffect(() => {
        fetchArchived();
    }, []);

    if (loading) return <p>Loading archived products...</p>;

    return (
        <div>
            <h2>Archived Products</h2>

            <input
                type="text"
                placeholder="Search by name..."
                className="form-control mb-3"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />

            {archived.length > 0 && (
                <div className="mb-3">
                    <button className="btn btn-primary me-2" onClick={handleRestoreAll}>
                        Restore All
                    </button>
                    <button className="btn btn-secondary" onClick={downloadCSV}>
                        Download CSV
                    </button>
                </div>
            )}

            {sortedProducts.length === 0 ? (
                <p>No archived products found.</p>
            ) : (
                <table className="table">
                    <thead>
                        <tr>
                            <th onClick={() => handleSort('name')} style={{ cursor: 'pointer' }}>
                                Name {sortField === 'name' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
                            </th>
                            <th onClick={() => handleSort('sku')} style={{ cursor: 'pointer' }}>
                                SKU {sortField === 'sku' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
                            </th>
                            <th onClick={() => handleSort('quantity')} style={{ cursor: 'pointer' }}>
                                Quantity {sortField === 'quantity' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
                            </th>
                            <th>Restore</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedProducts.map(product => (
                            <tr key={product.id}>
                                <td>{product.name}</td>
                                <td>{product.sku}</td>
                                <td>{product.quantity}</td>
                                <td>
                                    <button
                                        className="btn btn-success btn-sm"
                                        onClick={() => handleRestore(product.id)}
                                    >
                                        Restore
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default ArchivedProducts;
