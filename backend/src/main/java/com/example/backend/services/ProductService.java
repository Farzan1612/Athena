package com.example.backend.services;

import com.example.backend.model.Product;
import com.example.backend.repository.ProductRepository;
import com.example.backend.repository.OrderDetailRepository;
import com.example.backend.repository.ShoppingCartRepository;
import com.example.backend.repository.ReviewRepository;
import jakarta.validation.constraints.Size;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private WishlistService wishlistService; // Inject WishlistService
    
    @Autowired
    private ShoppingCartRepository shoppingCartRepository;
    
    @Autowired
    private OrderDetailRepository orderDetailRepository;
    
    @Autowired
    private ReviewRepository reviewRepository;

    // Create a new product
    public Product createProduct(Product product) {
        return productRepository.save(product);
    }

    // Get all products
    public List<Product> getAllProducts() {
        List<Product> products = productRepository.findAll();
        System.out.println("Fetched Products: " + products.size()); // Check how many are returned
        return products;
    }


    // Get product by ID
    public Optional<Product> getProductById(Long productId) {
        System.out.println("Attempting to fetch product with ID: " + productId);
        Optional<Product> product = productRepository.findById(productId);
        if (product.isPresent()) {
            System.out.println("Product found: " + product.get().getName());
            // Verify category is not null
            if (product.get().getCategory() == null) {
                System.err.println("WARNING: Product with ID " + productId + " has null category!");
            }
            return product;
        } else {
            System.err.println("ERROR: Product with ID " + productId + " not found in database");
            return Optional.empty();
        }
    }

    // Update product
    public Product updateProduct(Long productId, Product productDetails) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + productId));
        product.setName(productDetails.getName());
        product.setDescription(productDetails.getDescription());
        product.setPrice(productDetails.getPrice());
        product.setStockQuantity(productDetails.getStockQuantity());
        product.setSize(productDetails.getSize());
        product.setImageUrl(productDetails.getImageUrl());
        product.setCategory(productDetails.getCategory());
        return productRepository.save(product);
    }

    // Delete product
    @Transactional
    public void deleteProduct(Long productId) {
        System.out.println("Attempting to delete product with ID: " + productId);
        // Check if the product exists
        if (!productRepository.existsById(productId)) {
            throw new RuntimeException("Product not found with id: " + productId);
        }

        try {
            // Use direct SQL commands to delete dependent entities first
            System.out.println("Deleting reviews for product " + productId);
            reviewRepository.deleteByProductId(productId);
            
            System.out.println("Deleting shopping cart entries for product " + productId);
            shoppingCartRepository.deleteByProductId(productId);
            
            System.out.println("Deleting wishlist entries for product " + productId);
            wishlistService.removeByProductId(productId);
            
            System.out.println("Deleting order details for product " + productId);
            orderDetailRepository.deleteByProductId(productId);
            
            // Finally, delete the product directly using native SQL
            System.out.println("Deleting product " + productId);
            productRepository.deleteProductById(productId);
            
            System.out.println("Product " + productId + " deleted successfully");
        } catch (Exception e) {
            System.err.println("Error deleting product: " + e.getMessage());
            System.err.println("Exception type: " + e.getClass().getName());
            e.printStackTrace();
            throw new RuntimeException("Failed to delete product: " + e.getMessage(), e);
        }
    }

    // Find products by category ID
    public List<Product> findByCategoryId(Long categoryId) {
        return productRepository.findByCategory_CategoryId(categoryId);
    }

    // Search products by name (case-insensitive)
    public List<Product> findByNameContainingIgnoreCase(String name) {
        return productRepository.findByNameContainingIgnoreCase(name);
    }

    // ... other imports and code ...
    public List<Product> filterProducts(Long categoryId, BigDecimal minPrice, BigDecimal maxPrice, Product.Size size, Boolean inStock) {
        return productRepository.findByFilters(categoryId, minPrice, maxPrice, size, inStock);
    }
}

