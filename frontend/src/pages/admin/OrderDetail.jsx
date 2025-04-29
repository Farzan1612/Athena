import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import '../../styles/admin/OrderDetail.css';

const OrderDetail = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [orderDetails, setOrderDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const STATUS_OPTIONS = {
    PENDING: "PENDING",
    PROCESSING: "PROCESSING",
    SHIPPED: "SHIPPED",
    DELIVERED: "DELIVERED",
    CANCELLED: "CANCELLED"
  };

  useEffect(() => {
    fetchOrderData();
  }, [orderId]);

  const fetchOrderData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch order data
      const orderResponse = await axios.get(
        `http://localhost:8080/api/orders/${orderId}`,
        { withCredentials: true }
      );

      console.log('Order data:', orderResponse.data);
      
      const orderData = orderResponse.data;
      
      setOrder({
        ...orderData,
        formattedDate: orderData.orderDate ? new Date(orderData.orderDate).toLocaleDateString() : 'N/A',
        formattedAmount: new Intl.NumberFormat('en-IN', {
          style: 'currency',
          currency: 'INR',
          minimumFractionDigits: 2
        }).format(orderData.totalAmount)
      });

      // Process order details if they exist in the response
      if (orderData.orderDetails && Array.isArray(orderData.orderDetails)) {
        setOrderDetails(orderData.orderDetails);
      }
    } catch (err) {
      console.error("Failed to fetch order:", err);
      setError(err.response?.data?.message || err.message || "Failed to load order details");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (!STATUS_OPTIONS[newStatus]) {
      alert("Invalid status selected");
      return;
    }

    try {
      const response = await axios.put(
        `http://localhost:8080/api/orders/${orderId}/status?status=${newStatus}`,
        {},
        { withCredentials: true }
      );

      if (response.data?.status === newStatus) {
        setOrder({
          ...order,
          status: newStatus
        });
      } else {
        throw new Error("Status update not confirmed by server");
      }
    } catch (err) {
      console.error("Status update failed:", err);
      alert(err.response?.data?.error || "Failed to update order status");
    }
  };

  if (loading) return (
    <div className="loading">
      <div className="spinner"></div>
      <p>Loading order details...</p>
    </div>
  );

  if (error) return (
    <div className="error">
      <div className="error-icon">!</div>
      <div>{error}</div>
      <button className="btn btn-primary mt-3" onClick={fetchOrderData}>
        Retry
      </button>
    </div>
  );

  if (!order) return (
    <div className="error">
      <div className="error-icon">!</div>
      <div>Order not found</div>
      <Link to="/admin/orders" className="btn btn-primary mt-3">
        Back to Orders
      </Link>
    </div>
  );

  return (
    <div className="admin-order-detail">
      <div className="order-header">
        <div className="order-title">
          <h2>Order #{order.orderId}</h2>
          <span className={`status-badge ${(order.status || "pending").toLowerCase()}`}>
            {order.status}
          </span>
        </div>
        <div className="order-actions">
          <div className="status-control">
            <label htmlFor="status-select">Update Status:</label>
            <select
              id="status-select"
              value={order.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              className={`status-select ${order.status.toLowerCase()}`}
            >
              {Object.values(STATUS_OPTIONS).map(status => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
          <Link to="/admin/orders" className="btn btn-secondary">
            Back to Orders
          </Link>
        </div>
      </div>

      <div className="order-info-grid">
        <div className="order-info-card">
          <h3>Order Information</h3>
          <div className="info-row">
            <span>Order Date:</span>
            <span>{order.formattedDate}</span>
          </div>
          <div className="info-row">
            <span>Total Amount:</span>
            <span>{order.formattedAmount}</span>
          </div>
          <div className="info-row">
            <span>Payment Method:</span>
            <span>{order.paymentMethod || 'N/A'}</span>
          </div>
        </div>

        <div className="order-info-card">
          <h3>Customer Information</h3>
          <div className="info-row">
            <span>Name:</span>
            <span>{order.customerName}</span>
          </div>
          <div className="info-row">
            <span>Email:</span>
            <span>{order.email}</span>
          </div>
          <div className="info-row">
            <span>Phone:</span>
            <span>{order.phone || 'N/A'}</span>
          </div>
        </div>

        <div className="order-info-card full-width">
          <h3>Shipping Address</h3>
          <div className="info-row">
            <span>Address:</span>
            <span>{order.shippingAddress || 'N/A'}</span>
          </div>
        </div>

        <div className="order-info-card full-width">
          <h3>Order Items</h3>
          <div className="order-items-table">
            <table>
              <thead>
                <tr>
                  <th>Product Name</th>
                  <th>Price</th>
                  <th>Quantity</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {orderDetails.length > 0 ? (
                  orderDetails.map((item) => (
                    <tr key={item.orderDetailId}>
                      <td>
                        <div className="product-name">{item.product?.name || 'Product Not Found'}</div>
                      </td>
                      <td>{new Intl.NumberFormat('en-IN', {
                        style: 'currency',
                        currency: 'INR'
                      }).format(item.price)}</td>
                      <td>{item.quantity}</td>
                      <td>{new Intl.NumberFormat('en-IN', {
                        style: 'currency',
                        currency: 'INR'
                      }).format(item.price * item.quantity)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center">No items found for this order</td>
                  </tr>
                )}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan="3" className="text-right"><strong>Total:</strong></td>
                  <td><strong>{order.formattedAmount}</strong></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail; 