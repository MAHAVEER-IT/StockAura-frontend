import { useMemo, useState } from 'react'

const money = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
})

export default function ProductList({ products, onEdit, onDelete }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [priceSortOrder, setPriceSortOrder] = useState('none')
  const [expirySortOrder, setExpirySortOrder] = useState('none')

  const normalizedProducts = useMemo(
    () =>
      products.map((product) => ({
        ...product,
        categoryLabel: product.category?.name || product.category || 'N/A',
      })),
    [products],
  )

  const categoryOptions = useMemo(() => {
    const options = new Set(normalizedProducts.map((product) => product.categoryLabel))
    return ['all', ...Array.from(options)]
  }, [normalizedProducts])

  const filteredProducts = useMemo(() => {
    const q = searchTerm.trim().toLowerCase()

    const filtered = normalizedProducts.filter((product) => {
      const matchesSearch =
        !q ||
        product.name.toLowerCase().includes(q) ||
        String(product.barcode).toLowerCase().includes(q)
      const matchesCategory =
        selectedCategory === 'all' || product.categoryLabel === selectedCategory

      return matchesSearch && matchesCategory
    })

    if (priceSortOrder === 'none' && expirySortOrder === 'none') {
      return filtered
    }

    return [...filtered].sort((a, b) => {
      const expiryA = Number.isNaN(new Date(a.expiry).getTime())
        ? Number.MAX_SAFE_INTEGER
        : new Date(a.expiry).getTime()
      const expiryB = Number.isNaN(new Date(b.expiry).getTime())
        ? Number.MAX_SAFE_INTEGER
        : new Date(b.expiry).getTime()
      const expiryDiff = expiryA - expiryB
      const priceDiff = Number(a.price) - Number(b.price)

      if (expirySortOrder !== 'none' && expiryDiff !== 0) {
        return expirySortOrder === 'asc' ? expiryDiff : -expiryDiff
      }

      if (priceSortOrder !== 'none' && priceDiff !== 0) {
        return priceSortOrder === 'asc' ? priceDiff : -priceDiff
      }

      return 0
    })
  }, [normalizedProducts, searchTerm, selectedCategory, priceSortOrder, expirySortOrder])

  const handleResetFilters = () => {
    setSearchTerm('')
    setSelectedCategory('all')
    setPriceSortOrder('none')
    setExpirySortOrder('none')
  }

  return (
    <section className="product-list" aria-label="Product list management">
      <h3>Products</h3>

      <div className="product-filter-bar" aria-label="Product filters">
        <div className="product-filter-field">
          <label htmlFor="product-search">Search</label>
          <input
            id="product-search"
            type="text"
            placeholder="Search by name or barcode"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>

        <div className="product-filter-field">
          <label htmlFor="product-category-filter">Category</label>
          <select
            id="product-category-filter"
            value={selectedCategory}
            onChange={(event) => setSelectedCategory(event.target.value)}
          >
            <option value="all">All Categories</option>
            {categoryOptions
              .filter((option) => option !== 'all')
              .map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
          </select>
        </div>

        <button className="table-btn" type="button" onClick={handleResetFilters}>
          Reset Filters
        </button>
      </div>

      {products.length === 0 ? (
        <p className="empty-state">No products yet. Add your first product.</p>
      ) : filteredProducts.length === 0 ? (
        <p className="empty-state">No products match the selected filters.</p>
      ) : (
        <div className="product-table-wrap">
          <table>
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Category</th>
                <th>
                  <div className="price-header-wrap">
                    <span>Price</span>
                    <div className="price-sort-controls" aria-label="Sort by price">
                      <button
                        className={`sort-arrow ${priceSortOrder === 'asc' ? 'active' : ''}`}
                        type="button"
                        onClick={() => setPriceSortOrder('asc')}
                        aria-label="Sort price ascending"
                      >
                        ▲
                      </button>
                      <button
                        className={`sort-arrow ${priceSortOrder === 'desc' ? 'active' : ''}`}
                        type="button"
                        onClick={() => setPriceSortOrder('desc')}
                        aria-label="Sort price descending"
                      >
                        ▼
                      </button>
                    </div>
                  </div>
                </th>
                <th>Barcode</th>
                <th>
                  <div className="price-header-wrap">
                    <span>Expiry</span>
                    <div className="price-sort-controls" aria-label="Sort by expiry">
                      <button
                        className={`sort-arrow ${expirySortOrder === 'asc' ? 'active' : ''}`}
                        type="button"
                        onClick={() => setExpirySortOrder('asc')}
                        aria-label="Sort expiry ascending"
                      >
                        ▲
                      </button>
                      <button
                        className={`sort-arrow ${expirySortOrder === 'desc' ? 'active' : ''}`}
                        type="button"
                        onClick={() => setExpirySortOrder('desc')}
                        aria-label="Sort expiry descending"
                      >
                        ▼
                      </button>
                    </div>
                  </div>
                </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product.id}>
                  <td>
                    <img className="product-thumb" src={product.image} alt={product.name} />
                  </td>
                  <td>{product.name}</td>
                  <td>{product.categoryLabel}</td>
                  <td>{money.format(product.price)}</td>
                  <td>{product.barcode}</td>
                  <td>{product.expiry}</td>
                  <td>
                    <div className="row-actions">
                      <button
                        className="table-btn"
                        type="button"
                        onClick={() => onEdit(product)}
                      >
                        Edit
                      </button>
                      <button
                        className="table-btn danger"
                        type="button"
                        onClick={() => onDelete(product.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
