import { useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { User, Package, MapPin, ChevronDown, ChevronUp, CheckCircle } from 'lucide-react';
import { useAuth }  from '../context/AuthContext';
import { mockOrders, formatNaira } from '../data/products';

// ─── ProfilePage ──────────────────────────────────────────────────────────────
// Tabs: Account Info | Order History | Address Book
// Redirects to /login if no user is logged in.

const TABS = ['Account', 'Orders', 'Addresses'];

const STATUS_COLOR = {
  Delivered: '#2d6a2d',
  Processing: '#856404',
  Shipped: '#1a4080',
};

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab]         = useState('Account');
  const [expandedOrder, setExpandedOrder] = useState(null);

  // Guard: must be logged in
  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="profile-page">
      <div className="container">

        {/* Header */}
        <div className="profile-header">
          <div className="profile-avatar">{user.avatar}</div>
          <div>
            <h1 className="profile-name">{user.name}</h1>
            <p className="profile-email">{user.email}</p>
          </div>
        </div>

        {/* Tab nav */}
        <div className="profile-tabs">
          {TABS.map(tab => (
            <button
              key={tab}
              className={`profile-tab ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === 'Account'   && <User size={16} />}
              {tab === 'Orders'    && <Package size={16} />}
              {tab === 'Addresses' && <MapPin size={16} />}
              {tab}
            </button>
          ))}
        </div>

        {/* ── ACCOUNT TAB ── */}
        {activeTab === 'Account' && (
          <div className="profile-section">
            <h2 className="profile-section-title">Account Information</h2>
            <div className="profile-info-grid">
              <div className="profile-info-row">
                <span className="pi-label">Full Name</span>
                <span className="pi-value">{user.name}</span>
              </div>
              <div className="profile-info-row">
                <span className="pi-label">Email</span>
                <span className="pi-value">{user.email}</span>
              </div>
              <div className="profile-info-row">
                <span className="pi-label">Member Since</span>
                <span className="pi-value">January 2025</span>
              </div>
              <div className="profile-info-row">
                <span className="pi-label">Total Orders</span>
                <span className="pi-value">{mockOrders.length}</span>
              </div>
            </div>
            <button className="profile-danger-btn" onClick={logout}>Sign Out</button>
          </div>
        )}

        {/* ── ORDERS TAB ── */}
        {activeTab === 'Orders' && (
          <div className="profile-section">
            <h2 className="profile-section-title">Order History</h2>
            {mockOrders.length === 0 ? (
              <div className="empty-state">
                <p>No orders yet.</p>
                <Link to="/" className="empty-state-btn">Start Shopping</Link>
              </div>
            ) : (
              <div className="orders-list">
                {mockOrders.map(order => (
                  <div key={order.id} className="order-card">
                    <div
                      className="order-card-header"
                      onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                    >
                      <div className="order-meta">
                        <span className="order-id">{order.id}</span>
                        <span className="order-date">{order.date}</span>
                      </div>
                      <div className="order-right">
                        <span
                          className="order-status"
                          style={{ color: STATUS_COLOR[order.status] }}
                        >
                          <CheckCircle size={14} /> {order.status}
                        </span>
                        <span className="order-total">{formatNaira(order.total)}</span>
                        {expandedOrder === order.id
                          ? <ChevronUp size={16} />
                          : <ChevronDown size={16} />
                        }
                      </div>
                    </div>

                    {/* Expanded items */}
                    {expandedOrder === order.id && (
                      <div className="order-items">
                        {order.items.map((item, i) => (
                          <div key={i} className="order-item-row">
                            <span>{item.name}</span>
                            <span className="order-item-qty">×{item.qty}</span>
                            <span>{formatNaira(item.price * item.qty)}</span>
                          </div>
                        ))}
                        <div className="order-item-total">
                          <span>Total</span>
                          <span>{formatNaira(order.total)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── ADDRESSES TAB ── */}
        {activeTab === 'Addresses' && (
          <div className="profile-section">
            <h2 className="profile-section-title">Saved Addresses</h2>
            <div className="addresses-grid">
              {user.addresses.map(addr => (
                <div key={addr.id} className={`address-card ${addr.isDefault ? 'default' : ''}`}>
                  {addr.isDefault && (
                    <span className="address-default-badge">Default</span>
                  )}
                  <p className="address-label">{addr.label}</p>
                  <p className="address-text">{addr.address}</p>
                  <p className="address-text">{addr.city}, {addr.state} {addr.postalCode}</p>
                  <p className="address-text">{addr.country}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
