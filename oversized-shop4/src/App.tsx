
import { useMemo, useState, type FormEvent } from 'react'
import {
  ShoppingBag, ShoppingCart, Plus, Minus, X,
  PackagePlus, Search, Star, Eye, Trash2
} from 'lucide-react'
import './App.css'

type Category = 'Plain' | 'Graphic' | 'Vintage' | 'Printed'

type Product = {
  id: number
  name: string
  category: Category
  description: string
  specification: string
  image: string
  rating: number
  price: number
  quantity: number
}

const initialProducts: Product[] = [
  {
    id: 1,
    name: 'Classic Rebel Tee',
    category: 'Plain',
    description: 'A minimalist grey oversized T-shirt for everyday streetwear.',
    specification: 'Cotton blend, relaxed fit, drop shoulder',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSFxKBgE-hsUI5Gq7V_jtw9moGtigICUo1HbxjAQVjAPw&s=10',
    rating: 4.9,
    price: 499,
    quantity: 12,
  },
  {
    id: 2,
    name: 'Offbeat Graphic Tee',
    category: 'Plain',
    description: 'A clean white essential with a comfortable loose silhouette.',
    specification: 'Soft cotton, oversized fit, crew neck',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQguluVB0Oubsty0yhynYlFRfIoI-xUu9gVsNFDYqn8PQ&s=10',
    rating: 4.8,
    price: 449,
    quantity: 3,
  },
  {
    id: 3,
    name: 'Jordan Graphic Tee',
    category: 'Graphic',
    description: 'A graphic oversized shirt inspired by classic street fashion.',
    specification: 'Cotton fabric, printed design, drop shoulder',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSrzgq8P7OvyUVeESodbF74zjtsFDWN-kCD7_kHY-e_yg&s=10',
    rating: 4.7,
    price: 599,
    quantity: 9,
  },
  {
    id: 4,
    name: 'Billie Eilish Printed Tee',
    category: 'Printed',
    description: 'A relaxed printed shirt that adds character to casual outfits.',
    specification: 'Cotton blend, relaxed fit, graphic print',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcReVHP6Fl3KHFy0DaKsSElIwsgKAEkPiQ88Ge8NBi1VWA&s=10',
    rating: 4.6,
    price: 549,
    quantity: 7,
  },
]

const money = (amount: number) =>
  new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
  }).format(amount)

const categories = ['All', 'Plain', 'Graphic', 'Vintage', 'Printed']

const emptyForm = {
  name: '',
  category: 'Plain' as Category,
  description: '',
  specification: '',
  image: '',
  rating: '5',
  price: '',
  quantity: '',
}

export default function App() {
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [filter, setFilter] = useState('All')
  const [search, setSearch] = useState('')
  const [cart, setCart] = useState<Record<number, number>>({})
  const [selected, setSelected] = useState<Product | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [showCart, setShowCart] = useState(false)
  const [form, setForm] = useState(emptyForm)

  const visibleProducts = useMemo(
    () =>
      products.filter(
        p =>
          (filter === 'All' || p.category === filter) &&
          p.name.toLowerCase().includes(search.toLowerCase())
      ),
    [products, filter, search]
  )

  const totalItems = Object.values(cart).reduce(
    (sum, qty) => sum + qty,
    0
  )

  const total = products.reduce(
    (sum, p) => sum + p.price * (cart[p.id] ?? 0),
    0
  )

  function addToCart(id: number) {
    const product = products.find(p => p.id === id)
    if (!product) return

    setCart(prev => {
      const qty = prev[id] ?? 0
      if (qty >= product.quantity) return prev
      return { ...prev, [id]: qty + 1 }
    })
  }

  function changeQuantity(id: number, amount: number) {
    setCart(prev => {
      const next = (prev[id] ?? 0) + amount

      if (next <= 0) {
        const updated = { ...prev }
        delete updated[id]
        return updated
      }

      const product = products.find(p => p.id === id)
      if (!product || next > product.quantity) return prev

      return { ...prev, [id]: next }
    })
  }

  function adjustStock(id: number, amount: number) {
    const cartQuantity = cart[id] ?? 0

    setProducts(prev =>
      prev.map(product =>
        product.id === id
          ? {
              ...product,
              quantity: Math.max(cartQuantity, product.quantity + amount),
            }
          : product
      )
    )
  }

  function addProduct(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()

    if (
      !form.name.trim() ||
      !form.description.trim() ||
      !form.specification.trim() ||
      !form.image.trim() ||
      form.price === '' ||
      form.quantity === '' ||
      !Number.isFinite(Number(form.price)) ||
      Number(form.price) <= 0 ||
      !Number.isInteger(Number(form.quantity)) ||
      Number(form.quantity) < 0 ||
      !Number.isFinite(Number(form.rating)) ||
      Number(form.rating) < 1 ||
      Number(form.rating) > 5
    ) {
      alert('Please complete every field with valid information.')
      return
    }

    const newProduct: Product = {
      id: Date.now(),
      ...form,
      rating: Number(form.rating),
      price: Number(form.price),
      quantity: Number(form.quantity),
    }

    setProducts(prev => [...prev, newProduct])
    setForm(emptyForm)
    setFilter('All')
    setSearch('')
    setShowForm(false)
  }

  function removeProduct(id: number) {
    setProducts(prev => prev.filter(p => p.id !== id))
    setCart(prev => {
      const updated = { ...prev }
      delete updated[id]
      return updated
    })

    if (selected?.id === id) setSelected(null)
  }

  return (
    <div className="store">
      <header className="topbar">
        <a href="#" className="brand">
          <span className="brand-icon"><ShoppingBag size={22} /></span>
          OVERSIZED<span className="brand-accent">STUDIO.</span>
        </a>

        <div className="header-actions">
          <button className="btn btn-dark" onClick={() => setShowForm(true)}>
            <PackagePlus size={18} /> <span>Add Product</span>
          </button>
          <button className="btn btn-outline" onClick={() => setShowCart(true)}>
            <ShoppingCart size={18} /> Cart
            <span className="cart-count">{totalItems}</span>
          </button>
        </div>
      </header>

      <main className="main-content">
        <section className="hero">
          <div className="hero-copy">
            <span className="eyebrow">NEW SEASON · NEW ENERGY</span>
            <h1>BIG FIT.<br />BOLD <span>STYLE.</span></h1>
            <p>
              Made for comfort. Designed for self-expression.
              Discover your everyday oversized essentials.
            </p>
            <button
              className="btn btn-orange"
              onClick={() =>
                document.getElementById('products')?.scrollIntoView({
                  behavior: 'smooth',
                })
              }
            >
              SHOP THE COLLECTION <span>↗</span>
            </button>
            <div className="hero-note">
              <span className="hero-dot" />
              YOUR STYLE, YOUR RULES.
            </div>
          </div>

          <div className="hero-art">
            <img
              src="https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=1000"
              alt="Oversized casual T-shirt"
            />
            <div className="art-label">
              <span>THE DAILY UNIFORM</span>
              <strong>01 / ESSENTIALS</strong>
            </div>
            <span className="art-circle">OVR<br />SIZE</span>
          </div>
        </section>

        <div className="benefits">
          <div><strong>01</strong><span>RELAXED FITS</span></div>
          <div><strong>02</strong><span>EVERYDAY COMFORT</span></div>
          <div><strong>03</strong><span>STREETWEAR ESSENTIALS</span></div>
        </div>

        <section id="products" className="collection">
          <div className="section-heading">
            <div>
              <span className="eyebrow dark-eyebrow">FIND YOUR FIT</span>
              <h2>THE COLLECTION<span>.</span></h2>
              <p>Everyday pieces. Uncomplicated style.</p>
            </div>

            <label className="search-box">
              <Search size={18} />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search T-shirts..."
              />
            </label>
          </div>

          <div className="filters">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setFilter(category)}
                className={`filter-btn ${filter === category ? 'active' : ''}`}
              >
                {category}
              </button>
            ))}
            <span className="result-count">
              {visibleProducts.length} PRODUCTS
            </span>
          </div>

          <div className="product-grid">
            {visibleProducts.map(product => {
              const qty = cart[product.id] ?? 0

              return (
                <article className="product-card" key={product.id}>
                  <div className="product-image">
                    <img src={product.image} alt={product.name} />
                    <span className="category-tag">{product.category}</span>

                    {product.quantity < 5 && (
                      <span className="stock-tag">LOW STOCK</span>
                    )}

                    <button
                      className="quick-view"
                      onClick={() => setSelected(product)}
                    >
                      <Eye size={17} /> QUICK VIEW
                    </button>
                  </div>

                  <div className="product-info">
                    <div className="product-title-row">
                      <h3>{product.name}</h3>
                      <button
                        className="delete-btn"
                        title="Delete product"
                        onClick={() => removeProduct(product.id)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <p className="product-description">{product.description}</p>

                    <div className="product-meta">
                      <span className="product-price">{money(product.price)}</span>
                      <span className="rating">
                        <Star size={14} fill="currentColor" /> {product.rating.toFixed(1)}
                      </span>
                    </div>

                    <div className="stock-info">
                      <span>Available stock</span>
                      <div className="stock-control">
                        <button
                          onClick={() => adjustStock(product.id, -1)}
                          disabled={product.quantity <= qty}
                          aria-label={`Decrease available stock for ${product.name}`}
                        >
                          <Minus size={13} />
                        </button>
                        <strong>{product.quantity}</strong>
                        <button
                          onClick={() => adjustStock(product.id, 1)}
                          aria-label={`Increase available stock for ${product.name}`}
                        >
                          <Plus size={13} />
                        </button>
                      </div>
                    </div>

                    <div className="quantity-row">
                      <span>Cart quantity</span>
                      <div className="quantity-control">
                        <button
                          onClick={() => changeQuantity(product.id, -1)}
                          disabled={qty === 0}
                          aria-label="Decrease quantity"
                        >
                          <Minus size={14} />
                        </button>
                        <strong>{qty}</strong>
                        <button
                          onClick={() => changeQuantity(product.id, 1)}
                          disabled={qty >= product.quantity}
                          aria-label="Increase quantity"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>

                    <div className="subtotal">
                      <span>Subtotal</span>
                      <strong>{money(product.price * qty)}</strong>
                    </div>

                    <button
                      className="add-cart-btn"
                      onClick={() => addToCart(product.id)}
                      disabled={qty >= product.quantity}
                    >
                      {qty >= product.quantity ? 'STOCK LIMIT REACHED' : 'ADD TO CART +'}
                    </button>
                  </div>
                </article>
              )
            })}
          </div>

          {visibleProducts.length === 0 && (
            <div className="empty-state">
              <ShoppingBag size={36} />
              <h3>No products found.</h3>
              <p>Try another keyword or category.</p>
            </div>
          )}
        </section>

        <section className="total-panel">
          <div>
            <span className="eyebrow dark-eyebrow">YOUR ORDER SUMMARY</span>
            <h2>YOUR BAG TOTAL<span>.</span></h2>
            <p>{totalItems} item(s) in your cart</p>
          </div>
          <div className="total-right">
            <strong>{money(total)}</strong>
            <button className="btn btn-dark" onClick={() => setShowCart(true)}>
              VIEW YOUR BAG ↗
            </button>
          </div>
        </section>
      </main>

      <footer className="footer">
        <a href="#" className="brand footer-brand">
          OVERSIZED<span className="brand-accent">STUDIO.</span>
        </a>
        <p>LESS FITTED. MORE YOU.</p>
        <span>© 2026 OVERSIZED STUDIO.</span>
      </footer>

      {selected && (
        <div className="overlay" onClick={() => setSelected(null)}>
          <div className="modal details-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-heading">
              <h2>PRODUCT DETAILS</h2>
              <button className="close-btn" onClick={() => setSelected(null)}>
                <X />
              </button>
            </div>

            <div className="details-grid">
              <img src={selected.image} alt={selected.name} />
              <div>
                <span className="eyebrow dark-eyebrow">{selected.category}</span>
                <h3>{selected.name}</h3>
                <strong className="details-price">{money(selected.price)}</strong>
                <p>{selected.description}</p>
                <p><b>Specifications:</b> {selected.specification}</p>
                <p><b>Rating:</b> {selected.rating}/5</p>
                <p><b>Available stock:</b> {selected.quantity}</p>
                <button
                  className="add-cart-btn"
                  onClick={() => addToCart(selected.id)}
                  disabled={(cart[selected.id] ?? 0) >= selected.quantity}
                >
                  ADD TO CART +
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <div className="overlay" onClick={() => setShowForm(false)}>
          <form
            className="modal product-form"
            onSubmit={addProduct}
            onClick={e => e.stopPropagation()}
          >
            <div className="modal-heading">
              <div>
                <span className="eyebrow dark-eyebrow">YOUR INVENTORY</span>
                <h2>ADD NEW PRODUCT.</h2>
              </div>
              <button type="button" className="close-btn" onClick={() => setShowForm(false)}>
                <X />
              </button>
            </div>

            <div className="form-grid">
              <label>Product Name *
                <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              </label>

              <label>Category *
                <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value as Category })}>
                  {categories.slice(1).map(c => <option key={c}>{c}</option>)}
                </select>
              </label>

              <label className="full-width">Feature Image URL *
                <input required type="url" value={form.image} onChange={e => setForm({ ...form, image: e.target.value })} placeholder="https://example.com/tshirt.jpg" />
              </label>

              <label className="full-width">Description *
                <textarea required rows={2} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              </label>

              <label className="full-width">Product Specification *
                <textarea required rows={2} value={form.specification} onChange={e => setForm({ ...form, specification: e.target.value })} placeholder="Material, fit, neckline..." />
              </label>

              <label>Rating (1–5) *
                <input required type="number" min="1" max="5" step="0.1" value={form.rating} onChange={e => setForm({ ...form, rating: e.target.value })} />
              </label>

              <label>Price (PHP) *
                <input required type="number" min="0.01" step="0.01" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} />
              </label>

              <label className="full-width">Stock Quantity *
                <input required type="number" min="0" step="1" value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} />
              </label>
            </div>

            <button type="submit" className="add-cart-btn">SAVE PRODUCT +</button>
          </form>
        </div>
      )}

      {showCart && (
        <div className="overlay" onClick={() => setShowCart(false)}>
          <div className="modal cart-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-heading">
              <div>
                <span className="eyebrow dark-eyebrow">YOUR SELECTION</span>
                <h2>SHOPPING BAG.</h2>
              </div>
              <button className="close-btn" onClick={() => setShowCart(false)}>
                <X />
              </button>
            </div>

            {products.filter(p => (cart[p.id] ?? 0) > 0).length === 0 ? (
              <div className="empty-state">
                <ShoppingBag size={32} />
                <p>Your bag is empty. Find your next favorite tee.</p>
              </div>
            ) : (
              products.filter(p => (cart[p.id] ?? 0) > 0).map(p => (
                <div className="cart-item" key={p.id}>
                  <img src={p.image} alt={p.name} />
                  <div className="cart-item-info">
                    <strong>{p.name}</strong>
                    <span>{money(p.price)} each</span>
                    <div className="quantity-control">
                      <button onClick={() => changeQuantity(p.id, -1)} aria-label="Decrease quantity"><Minus size={14} /></button>
                      <strong>{cart[p.id]}</strong>
                      <button onClick={() => changeQuantity(p.id, 1)} disabled={(cart[p.id] ?? 0) >= p.quantity} aria-label="Increase quantity"><Plus size={14} /></button>
                    </div>
                  </div>
                  <strong>{money(p.price * (cart[p.id] ?? 0))}</strong>
                </div>
              ))
            )}

            <div className="cart-total">
              <span>TOTAL</span>
              <strong>{money(total)}</strong>
            </div>

            <button className="add-cart-btn" onClick={() => { setCart({}); setShowCart(false) }}>
              CLEAR CART
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
