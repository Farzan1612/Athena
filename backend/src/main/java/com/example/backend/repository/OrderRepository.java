package com.example.backend.repository;

import com.example.backend.model.Order;
import com.example.backend.model.Order.Status;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    // Basic query
    List<Order> findAll();

    // Get order by ID with user (simpler query)
    Optional<Order> findById(Long id);

    // User-specific queries (simplified)
    List<Order> findByUser_UserId(Long userId);

    // Status-specific queries (simplified)
    List<Order> findByStatus(Status status);

    // Legacy queries (keep for backward compatibility)
    @Query("SELECT o FROM Order o ORDER BY o.orderId ASC")
    List<Order> findAllOrderByOrderIdAsc();
}