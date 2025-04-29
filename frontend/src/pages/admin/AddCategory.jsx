import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Card, Form, Button, Container, Alert, ListGroup } from "react-bootstrap";

const AddCategory = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  const [formData, setFormData] = useState({
    name: "",
    description: ""
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
      setCategories(response.data || []);
    } catch (err) {
      console.error("Error fetching categories:", err);
      setError("Failed to load existing categories");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      const categoryData = {
        name: formData.name,
        description: formData.description || "Category description"
      };

      console.log("Sending category data:", categoryData);
      
      const response = await axios.post("http://localhost:8080/api/categories", categoryData, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log("Category created successfully:", response.data);
      setSuccess("Category created successfully");
      setFormData({
        name: "",
        description: ""
      });
      
      // Refresh the categories list
      fetchCategories();
    } catch (err) {
      console.error("Error adding category:", err);
      if (err.response) {
        setError(`Failed to add category: ${err.response.data.message || 'Unknown error'}`);
      } else {
        setError("Failed to add category. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (!window.confirm("Are you sure you want to delete this category?")) {
      return;
    }
    
    try {
      setLoading(true);
      await axios.delete(`http://localhost:8080/api/categories/${categoryId}`, {
        withCredentials: true
      });
      
      setSuccess("Category deleted successfully");
      fetchCategories();
    } catch (err) {
      console.error("Error deleting category:", err);
      setError("Failed to delete category");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-4">
      <Card>
        <Card.Header as="h5" className="bg-primary text-white">
          Manage Categories
        </Card.Header>
        <Card.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}
          
          <h6 className="mb-3">Add New Category</h6>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Category Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                placeholder="Enter category name"
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter category description (optional)"
                rows={3}
              />
            </Form.Group>
            
            <Button 
              variant="primary" 
              type="submit"
              disabled={loading}
            >
              {loading ? "Adding..." : "Add Category"}
            </Button>
          </Form>
          
          <hr className="my-4" />
          
          <h6 className="mb-3">Existing Categories</h6>
          {loading && <p>Loading categories...</p>}
          {!loading && categories.length === 0 && (
            <Alert variant="info">
              No categories found. Add your first category above.
            </Alert>
          )}
          
          {!loading && categories.length > 0 && (
            <ListGroup>
              {categories.map((category) => (
                <ListGroup.Item 
                  key={category.categoryId}
                  className="d-flex justify-content-between align-items-center"
                >
                  <div>
                    <strong>{category.name}</strong>
                    {category.description && (
                      <p className="text-muted mb-0 small">{category.description}</p>
                    )}
                  </div>
                  <Button 
                    variant="danger" 
                    size="sm"
                    onClick={() => handleDeleteCategory(category.categoryId)}
                  >
                    Delete
                  </Button>
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
        </Card.Body>
        <Card.Footer className="text-end">
          <Button 
            variant="secondary" 
            onClick={() => navigate("/admin/products")}
          >
            Back to Products
          </Button>
        </Card.Footer>
      </Card>
    </Container>
  );
};

export default AddCategory; 