package com.example.backend.controller;

import com.example.backend.dto.ProductCreateDTO;
import com.example.backend.model.Category;
import com.example.backend.model.Product;
import com.example.backend.services.CategoryService;
import com.example.backend.services.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "http://localhost:5173")
public class ProductController {

    @Autowired
    private ProductService productService;
    
    @Autowired
    private CategoryService categoryService;
    
    @Autowired
    private JdbcTemplate jdbcTemplate;

    // Adding OPTIONS mapping to help with CORS issues
    @RequestMapping(method = RequestMethod.OPTIONS)
    public ResponseEntity<?> handleOptions() {
        return ResponseEntity.ok().build();
    }
    
    // Create a new product
    @PostMapping
    public ResponseEntity<Product> createProduct(@RequestBody Product product) {
        System.out.println("Received product data: " + product.toString());
        System.out.println("Category: " + (product.getCategory() != null ? product.getCategory().getCategoryId() : "null"));
        Product createdProduct = productService.createProduct(product);
        return ResponseEntity.ok(createdProduct);
    }
    
    // Create a new product with DTO (accepting categoryId directly)
    @PostMapping("/create-with-category-id")
    public ResponseEntity<?> createProductWithCategoryId(@RequestBody ProductCreateDTO productDTO) {
        try {
            // Find the category by ID
            Optional<Category> categoryOpt = categoryService.getCategoryById(productDTO.getCategoryId());
            if (!categoryOpt.isPresent()) {
                return ResponseEntity.badRequest().body("Category not found with id: " + productDTO.getCategoryId());
            }
            
            // Create new product entity from DTO
            Product product = new Product();
            product.setName(productDTO.getName());
            product.setDescription(productDTO.getDescription());
            product.setPrice(productDTO.getPrice());
            product.setStockQuantity(productDTO.getStockQuantity());
            product.setImageUrl(productDTO.getImageUrl());
            product.setSize(productDTO.getSize());
            product.setCategory(categoryOpt.get());
            
            // Set optional fields if they exist
            if (productDTO.getColor() != null) {
                product.setColor(productDTO.getColor());
            }
            if (productDTO.getBrand() != null) {
                product.setBrand(productDTO.getBrand());
            }
            if (productDTO.getFeatured() != null) {
                product.setFeatured(productDTO.getFeatured());
            }
            
            // Save the product
            Product createdProduct = productService.createProduct(product);
            return ResponseEntity.ok(createdProduct);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error creating product: " + e.getMessage());
        }
    }

    // Get all products
    @GetMapping
    public ResponseEntity<List<Product>> getAllProducts() {
        List<Product> products = productService.getAllProducts();
        return ResponseEntity.ok(products);
    }

    // Get product by ID
    @GetMapping("/{productId}")
    public ResponseEntity<Product> getProductById(@PathVariable Long productId) {
        return productService.getProductById(productId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Update product
    @PutMapping("/{productId}")
    public ResponseEntity<Product> updateProduct(@PathVariable Long productId, @RequestBody Product productDetails) {
        Product updatedProduct = productService.updateProduct(productId, productDetails);
        return ResponseEntity.ok(updatedProduct);
    }

    // Delete product
    @DeleteMapping("/{productId}")
    public ResponseEntity<?> deleteProduct(@PathVariable Long productId) {
        try {
            // Check if product exists
            if (!productService.getProductById(productId).isPresent()) {
                return ResponseEntity.notFound().build();
            }
            
            System.out.println("Deleting product with ID: " + productId);
            
            // Delete in specific order to maintain referential integrity
            // 1. Delete reviews
            jdbcTemplate.update("DELETE FROM reviews WHERE product_id = ?", productId);
            System.out.println("Deleted reviews for product " + productId);
            
            // 2. Delete from shopping cart
            jdbcTemplate.update("DELETE FROM shopping_cart WHERE product_id = ?", productId);
            System.out.println("Deleted shopping cart entries for product " + productId);
            
            // 3. Delete from wishlist
            jdbcTemplate.update("DELETE FROM wishlist WHERE product_id = ?", productId);
            System.out.println("Deleted wishlist entries for product " + productId);
            
            // 4. Delete from order_details
            jdbcTemplate.update("DELETE FROM order_details WHERE product_id = ?", productId);
            System.out.println("Deleted order details for product " + productId);
            
            // 5. Finally delete the product
            jdbcTemplate.update("DELETE FROM products WHERE product_id = ?", productId);
            System.out.println("Deleted product " + productId);
            
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            System.err.println("Error in deleteProduct: " + e.getMessage());
            e.printStackTrace();
            
            // More specific error handling
            if (e.getMessage() != null && e.getMessage().contains("foreign key constraint")) {
                return ResponseEntity.status(409).body(Map.of(
                    "message", "This product cannot be deleted because it is referenced by other data in the system.",
                    "details", e.getMessage()
                ));
            }
            
            // General error handling
            return ResponseEntity.status(500).body(Map.of(
                "message", "Failed to delete product: " + e.getMessage(),
                "errorType", e.getClass().getSimpleName()
            ));
        }
    }

    // Find products by category ID
    @GetMapping("/category/{categoryId}")
    public ResponseEntity<List<Product>> findByCategoryId(@PathVariable Long categoryId) {
        List<Product> products = productService.findByCategoryId(categoryId);
        return ResponseEntity.ok(products);
    }

    // Search products by name (case-insensitive)
    @GetMapping("/search/{name}")
    public ResponseEntity<List<Product>> findByNameContainingIgnoreCase(@PathVariable String name) {
        List<Product> products = productService.findByNameContainingIgnoreCase(name);
        return ResponseEntity.ok(products);
    }

    // Filter products by multiple criteria
    @GetMapping("/filter")
    public ResponseEntity<List<Product>> filterProducts(
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) Product.Size size,
            @RequestParam(required = false) Boolean inStock) {
        List<Product> products = productService.filterProducts(categoryId, minPrice, maxPrice, size, inStock);
        return ResponseEntity.ok(products);
    }

    // Direct JDBC deletion endpoint
    @DeleteMapping("/force-delete/{productId}")
    public ResponseEntity<?> forceDeleteProduct(@PathVariable Long productId) {
        try {
            // Check if product exists
            if (!productService.getProductById(productId).isPresent()) {
                return ResponseEntity.notFound().build();
            }
            
            System.out.println("Force deleting product with ID: " + productId);
            
            // Delete in specific order to maintain referential integrity
            // 1. Delete reviews
            jdbcTemplate.update("DELETE FROM reviews WHERE product_id = ?", productId);
            System.out.println("Deleted reviews for product " + productId);
            
            // 2. Delete from shopping cart
            jdbcTemplate.update("DELETE FROM shopping_cart WHERE product_id = ?", productId);
            System.out.println("Deleted shopping cart entries for product " + productId);
            
            // 3. Delete from wishlist
            jdbcTemplate.update("DELETE FROM wishlist WHERE product_id = ?", productId);
            System.out.println("Deleted wishlist entries for product " + productId);
            
            // 4. Delete from order_details
            jdbcTemplate.update("DELETE FROM order_details WHERE product_id = ?", productId);
            System.out.println("Deleted order details for product " + productId);
            
            // 5. Finally delete the product
            jdbcTemplate.update("DELETE FROM products WHERE product_id = ?", productId);
            System.out.println("Deleted product " + productId);
            
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            System.err.println("Error in forceDeleteProduct: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of(
                "message", "Failed to delete product: " + e.getMessage(),
                "errorType", e.getClass().getSimpleName()
            ));
        }
    }
}