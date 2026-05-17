import { useState, useMemo } from "react";
import { Navigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  TrendingUp,
  Package,
  ShoppingBag,
  DollarSign,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import {
  products as initialProducts,
  mockOrders,
  formatNaira,
} from "../data/products";

// ─── AdminPage ────────────────────────────────────────────────────────────────
// Sections: Stats cards | Sales chart | Product table (add/edit/delete)
// Uses recharts for the bar chart.
// Guards with useAuth — must be logged in.
//
// INTERVIEW NOTE: In a real app, this page would be behind an admin role check.
// Here we just require any logged-in user for demo purposes.

// Build monthly revenue data from mock orders.(FLAW; Makes use of Hard-Coded values)
// function buildChartData() {
//   const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
//   return months.map((month, i) => ({
//     month,
//     revenue: [395, 590, 720, 670, 700, 750][i],
//     orders:  [4,   7,   6,   5,  10, 12][i],
//   }));
// }

// Build monthly revenue data from mock orders(FIX; Scales according to mock order)
function buildChartData() {
  const monthMap = {};

  mockOrders.forEach((order) => {
    const month = new Date(order.date).toLocaleString("en-US", {
      month: "short",
    });

    if (!monthMap[month]) {
      monthMap[month] = {
        month,
        revenue: 0,
        orders: 0,
      };
    }

    monthMap[month].revenue += order.total;
    monthMap[month].orders += 1;
  });

  return Object.values(monthMap);
}

const EMPTY_FORM = {
  name: "",
  price: "",
  category: "Smartphones",
  stock: "",
  description: "",
};

export default function AdminPage() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;

  const [productList, setProductList] = useState(initialProducts);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [activeTab, setActiveTab] = useState("overview");

  const chartData = useMemo(() => buildChartData(), []);

  // ── Stats ──
  const totalRevenue = mockOrders.reduce((s, o) => s + o.total, 0);
  const totalOrders = mockOrders.length;
  const totalProducts = productList.length;
  const lowStock = productList.filter((p) => p.stock <= 5).length;

  // ── Form handlers ──
  const openAdd = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setFormErrors({});
    setShowModal(true);
  };

  const openEdit = (product) => {
    setForm({
      name: product.name,
      price: String(product.price),
      category: product.category,
      stock: String(product.stock),
      description: product.description,
    });
    setEditingId(product.id);
    setFormErrors({});
    setShowModal(true);
  };

  const handleDelete = (id) => {
    if (window.confirm("Delete this product?")) {
      setProductList((prev) => prev.filter((p) => p.id !== id));
    }
  };

  const validateForm = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.price || isNaN(form.price)) e.price = "Enter a valid price";
    if (!form.stock || isNaN(form.stock))
      e.stock = "Enter a valid stock number";
    if (!form.description.trim()) e.description = "Description is required";
    return e;
  };

  const handleSave = () => {
    const errs = validateForm();
    if (Object.keys(errs).length) {
      setFormErrors(errs);
      return;
    }

    if (editingId) {
      // Edit existing
      setProductList((prev) =>
        prev.map((p) =>
          p.id === editingId
            ? {
                ...p,
                name: form.name,
                price: Number(form.price),
                category: form.category,
                stock: Number(form.stock),
                description: form.description,
              }
            : p
        )
      );
    } else {
      // Add new
      const newProduct = {
        id: "p" + Date.now(),
        name: form.name,
        price: Number(form.price),
        category: form.category,
        stock: Number(form.stock),
        description: form.description,
        image: "/images/p1.png",
        images: ["/images/p1.png"],
        rating: 0,
        reviewCount: 0,
        features: [],
        reviews: [],
        addedDate: new Date().toISOString().split("T")[0],
        deliveryDays: "3–5",
      };
      setProductList((prev) => [newProduct, ...prev]);
    }
    setShowModal(false);
  };

  const StatCard = ({ icon: Icon, label, value, color }) => (
    <div className="stat-card">
      <div className="stat-icon" style={{ background: color + "20", color }}>
        <Icon size={22} />
      </div>
      <div>
        <p className="stat-label">{label}</p>
        <p className="stat-value">{value}</p>
      </div>
    </div>
  );

  return (
    <div className="admin-page">
      <div className="container">
        <div className="admin-header">
          <h1 className="admin-title">Admin Dashboard</h1>
          <p className="admin-sub">Manage your AETHER store</p>
        </div>

        {/* Tab nav */}
        <div className="admin-tabs">
          <button
            className={`admin-tab ${activeTab === "overview" ? "active" : ""}`}
            onClick={() => setActiveTab("overview")}
          >
            Overview
          </button>
          <button
            className={`admin-tab ${activeTab === "products" ? "active" : ""}`}
            onClick={() => setActiveTab("products")}
          >
            Products
          </button>
          <button
            className={`admin-tab ${activeTab === "orders" ? "active" : ""}`}
            onClick={() => setActiveTab("orders")}
          >
            Orders
          </button>
        </div>

        {/* ── OVERVIEW TAB ── */}
        {activeTab === "overview" && (
          <>
            {/* Stats */}
            <div className="stats-grid">
              <StatCard
                icon={DollarSign}
                label="Total Revenue"
                value={formatNaira(totalRevenue)}
                color="#2d6a2d"
              />
              <StatCard
                icon={ShoppingBag}
                label="Total Orders"
                value={totalOrders}
                color="#1a4080"
              />
              <StatCard
                icon={Package}
                label="Products Listed"
                value={totalProducts}
                color="var(--primary)"
              />
              <StatCard
                icon={TrendingUp}
                label="Low Stock Items"
                value={lowStock}
                color="#856404"
              />
            </div>

            {/* Sales Chart */}
            <div className="chart-card">
              <h2 className="chart-title">Monthly Revenue</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={chartData}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e8e4dc" />
                  <XAxis dataKey="month" tick={{ fontSize: 13 }} />
                  {/* <YAxis tick={{ fontSize: 13 }} tickFormatter={v => formatNaira(v)} /> */}
                  <YAxis
                    tick={{ fontSize: 13 }}
                    tickFormatter={(v) => `₦${(v / 1000000).toFixed(1)}M`}
                  />
                  <Tooltip formatter={(v) => [formatNaira(v), "Revenue"]} />
                  <Bar
                    dataKey="revenue"
                    fill="var(--primary)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        )}

        {/* ── PRODUCTS TAB ── */}
        {activeTab === "products" && (
          <>
            <div className="admin-section-header">
              <h2 className="admin-section-title">
                Products ({productList.length})
              </h2>
              <button className="admin-add-btn" onClick={openAdd}>
                <Plus size={16} /> Add Product
              </button>
            </div>

            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Rating</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {productList.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <div className="admin-product-cell">
                          <img
                            src={p.image}
                            alt={p.name}
                            className="admin-product-thumb"
                          />
                          <span className="admin-product-name">{p.name}</span>
                        </div>
                      </td>
                      <td>{p.category}</td>
                      <td>
                        {p.salePrice ? (
                          <>
                            <span className="admin-sale-price">
                              {formatNaira(p.salePrice)}
                            </span>{" "}
                            <span className="admin-orig-price">
                              {formatNaira(p.price)}
                            </span>
                          </>
                        ) : (
                          formatNaira(p.price)
                        )}
                      </td>
                      <td>
                        <span
                          className={`stock-pill ${
                            p.stock <= 5 ? "low" : "ok"
                          }`}
                        >
                          {p.stock}
                        </span>
                      </td>
                      <td>{p.rating > 0 ? `⭐ ${p.rating}` : "—"}</td>
                      <td>
                        <div className="admin-actions">
                          <button
                            className="admin-edit-btn"
                            onClick={() => openEdit(p)}
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            className="admin-delete-btn"
                            onClick={() => handleDelete(p.id)}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ── ORDERS TAB ── */}
        {activeTab === "orders" && (
          <>
            <h2
              className="admin-section-title"
              style={{ marginBottom: "20px" }}
            >
              Order Management
            </h2>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Date</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {mockOrders.map((order) => (
                    <tr key={order.id}>
                      <td className="order-id-cell">{order.id}</td>
                      <td>{order.date}</td>
                      <td>
                        {order.items.reduce((s, i) => s + i.qty, 0)} item(s)
                      </td>
                      <td>{formatNaira(order.total)}</td>
                      <td>
                        {/* <span className="order-status-pill delivered">{order.status}</span> */}
                        <span
                          className={`order-status-pill ${order.status
                            .toLowerCase()
                            .replace(/\s+/g, "-")}`}
                        >
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* ── Add / Edit Modal ── */}
      {showModal && (
        <>
          <div className="modal-overlay" onClick={() => setShowModal(false)} />
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">
                {editingId ? "Edit Product" : "Add New Product"}
              </h3>
              <button
                className="modal-close"
                onClick={() => setShowModal(false)}
              >
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              {[
                { label: "Product Name *", key: "name", type: "text" },
                { label: "Price (₦) *", key: "price", type: "number" },
                { label: "Stock *", key: "stock", type: "number" },
              ].map(({ label, key, type }) => (
                <div key={key} className="modal-field">
                  <label>{label}</label>
                  <input
                    type={type}
                    value={form[key]}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, [key]: e.target.value }))
                    }
                    className={formErrors[key] ? "input-error" : ""}
                  />
                  {formErrors[key] && (
                    <p className="field-error">{formErrors[key]}</p>
                  )}
                </div>
              ))}

              <div className="modal-field">
                <label>Category</label>
                <select
                  value={form.category}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, category: e.target.value }))
                  }
                >
                  <option>Smartphones</option>
                  <option>Laptops & Computing</option>
                  <option>Fashion & Clothing</option>
                  <option>Watches & Accessories</option>
                  <option>Audio & Electronics</option>
                  <option>Gaming</option>
                  <option>Home & Living</option>
                  <option>Beauty & Care</option>
                  <option>Bags</option>
                  <option>Fitness</option>
                </select>
              </div>

              <div className="modal-field">
                <label>Description *</label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, description: e.target.value }))
                  }
                  className={formErrors.description ? "input-error" : ""}
                />
                {formErrors.description && (
                  <p className="field-error">{formErrors.description}</p>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="modal-cancel"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button className="modal-save" onClick={handleSave}>
                {editingId ? "Save Changes" : "Add Product"}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
