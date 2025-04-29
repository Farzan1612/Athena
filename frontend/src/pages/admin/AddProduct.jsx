import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../../styles/admin/ProductForm.css";

const AddProduct = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stockQuantity: "",
    imageUrl: "",
    categoryId: "",
    size: "M", // Default size - matches backend enum
    color: "",
    brand: "",
    featured: false
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      console.log("Fetching categories...");
      setLoading(true);
      const response = await axios.get("http://localhost:8080/api/categories", {
        withCredentials: true
      });
      console.log("Categories fetched successfully:", response.data);
      if (Array.isArray(response.data) && response.data.length > 0) {
        setCategories(response.data);
      } else {
        console.warn("No categories found or invalid response format:", response.data);
        setError("No categories available. Please create categories first.");
      }
    } catch (err) {
      console.error("Error fetching categories:", err);
      if (err.response) {
        console.error("Response status:", err.response.status);
        console.error("Response data:", err.response.data);
        setError(`Failed to load categories: ${err.response.data.message || err.response.statusText}`);
      } else if (err.request) {
        console.error("No response received:", err.request);
        setError("Failed to load categories: No response from server");
      } else {
        console.error("Error details:", err.message);
        setError(`Failed to load categories: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setLoading(true);
    setError(null);
    
    // Validate category ID is selected
    if (!formData.categoryId) {
      setError("Please select a category");
      setLoading(false);
      return;
    }
    
    try {
      // Ensure the size is a valid enum value
      console.log("Size value:", formData.size);
      
      // Use the create-with-category-id endpoint that directly accepts categoryId
      const productResponse = await axios.post("http://localhost:8080/api/products/create-with-category-id", {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        stockQuantity: parseInt(formData.stockQuantity),
        imageUrl: formData.imageUrl,
        size: formData.size,
        categoryId: parseInt(formData.categoryId),
        color: formData.color,
        brand: formData.brand,
        featured: formData.featured
      }, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log("Product created successfully:", productResponse.data);
      navigate("/admin/products");
    } catch (err) {
      console.error("Error adding product:", err);
      if (err.response) {
        console.error("Response status:", err.response.status);
        console.error("Response data:", err.response.data);
        
        // Add more detailed error information
        if (err.response.data && err.response.data.message) {
          if (err.response.data.message.includes("category_id")) {
            setError("Category ID issue: The system couldn't process the category. Please try selecting a different category or contact the administrator.");
          } else {
            setError(`Failed to add product: ${err.response.data.message}`);
          }
        } else {
          setError("Unknown server error. Please check the console for details.");
        }
      } else if (err.request) {
        // The request was made but no response was received
        setError("No response from server. Please check your connection.");
      } else {
        // Something happened in setting up the request
        setError(`Error: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="product-form-container">
      <div className="form-header">
        <h1>Add New Product</h1>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit} className="product-form">
        <div className="form-group">
          <label htmlFor="name">Product Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            required
          />
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="price">Price (₹)</label>
            <input
              type="number"
              id="price"
              name="price"
              min="0"
              step="0.01"
              value={formData.price}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="stockQuantity">Stock Quantity</label>
            <input
              type="number"
              id="stockQuantity"
              name="stockQuantity"
              min="0"
              value={formData.stockQuantity}
              onChange={handleInputChange}
              required
            />
          </div>
        </div>
        
        <div className="form-group">
          <label htmlFor="imageUrl">Image URL</label>
          <input
            type="url"
            id="imageUrl"
            name="imageUrl"
            value={formData.imageUrl}
            onChange={handleInputChange}
            required
          />
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="categoryId">Category</label>
            {loading ? (
              <div>Loading categories...</div>
            ) : (
              <select
                id="categoryId"
                name="categoryId"
                value={formData.categoryId}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Category</option>
                {categories && categories.length > 0 ? (
                  categories.map(category => (
                    <option key={category.categoryId} value={category.categoryId}>
                      {category.name}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>No categories available</option>
                )}
              </select>
            )}
            {categories && categories.length === 0 && !loading && (
              <div className="text-danger mt-1">
                No categories available. Please add categories first.
              </div>
            )}
            <div className="mt-2">
              <button 
                type="button" 
                className="btn btn-sm btn-link p-0"
                onClick={() => navigate("/admin/categories")}
              >
                Manage Categories
              </button>
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="size">Size</label>
            <select
              id="size"
              name="size"
              value={formData.size}
              onChange={handleInputChange}
            >
              <option value="S">Small</option>
              <option value="M">Medium</option>
              <option value="L">Large</option>
              <option value="XL">X-Large</option>
              <option value="XXL">XX-Large</option>
            </select>
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="color">Color</label>
            <input
              type="text"
              id="color"
              name="color"
              value={formData.color}
              onChange={handleInputChange}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="brand">Brand</label>
            <input
              type="text"
              id="brand"
              name="brand"
              value={formData.brand}
              onChange={handleInputChange}
            />
          </div>
        </div>
        
        <div className="form-group checkbox-group">
          <input
            type="checkbox"
            id="featured"
            name="featured"
            checked={formData.featured}
            onChange={handleInputChange}
          />
          <label htmlFor="featured">Featured Product</label>
        </div>
        
        <div className="form-actions">
          <button 
            type="button" 
            onClick={() => navigate("/admin/products")}
            className="btn btn-secondary"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? "Adding..." : "Add Product"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProduct;