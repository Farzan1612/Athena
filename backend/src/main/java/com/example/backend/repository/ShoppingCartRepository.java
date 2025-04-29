package com.example.backend.repository;

import com.example.backend.model.ShoppingCart;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

public interface ShoppingCartRepository extends JpaRepository<ShoppingCart, Long> {
    List<ShoppingCart> findByUser_UserId(Long userId); // Find cart items by user ID
    Optional<ShoppingCart> findByUser_UserIdAndProduct_ProductId(Long userId, Long productId); // Find cart item by user ID and product ID
    
    @Modifying
    @Transactional
    @Query(value = "DELETE FROM shopping_cart WHERE product_id = :productId", nativeQuery = true)
    void deleteByProductId(@Param("productId") Long productId);
    
    List<ShoppingCart> findByProduct_ProductId(Long productId);
}