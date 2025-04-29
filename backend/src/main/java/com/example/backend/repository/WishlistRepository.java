package com.example.backend.repository;

import com.example.backend.model.Product;
import com.example.backend.model.User;
import com.example.backend.model.Wishlist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

public interface WishlistRepository extends JpaRepository<Wishlist, Long> {

    // Find wishlist items by user ID
    List<Wishlist> findByUser_UserId(Long userId);

    // Find a specific wishlist item by user ID and product ID
    Optional<Wishlist> findByUser_UserIdAndProduct_ProductId(Long userId, Long productId);

    // Find wishlist items by product ID
    List<Wishlist> findByProduct_ProductId(Long productId);
    
    @Modifying
    @Transactional
    @Query(value = "DELETE FROM wishlist WHERE product_id = :productId", nativeQuery = true)
    void deleteByProductId(@Param("productId") Long productId);
}
