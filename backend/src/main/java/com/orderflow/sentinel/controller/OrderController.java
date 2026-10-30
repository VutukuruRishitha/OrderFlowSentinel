package com.orderflow.sentinel.controller;

import com.orderflow.sentinel.model.ActionExecutionRequest;
import com.orderflow.sentinel.model.ActionExecutionResponse;
import com.orderflow.sentinel.model.OrderEntity;
import com.orderflow.sentinel.service.OrderService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "*")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @GetMapping
    public List<OrderEntity> getOrders() {
        return orderService.getAllOrders();
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<OrderEntity> getOrder(@PathVariable String orderId) {
        return orderService.getOrderByOrderId(orderId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<OrderEntity> createOrder(@RequestBody Map<String, Object> payload) {
        String customerName = (String) payload.getOrDefault("customerName", "Client");
        String customerEmail = (String) payload.getOrDefault("customerEmail", "client@domain.com");
        Double amount = payload.get("totalAmount") != null ? Double.parseDouble(payload.get("totalAmount").toString()) : 2500.00;
        String initialStatus = (String) payload.getOrDefault("initialStatus", "API_FAILURE");

        OrderEntity created = orderService.createOrder(customerName, customerEmail, amount, initialStatus);
        return ResponseEntity.ok(created);
    }

    @PostMapping("/{orderId}/status")
    public ResponseEntity<OrderEntity> updateStatus(@PathVariable String orderId, @RequestBody Map<String, String> payload) {
        String newStatus = payload.get("status");
        if (newStatus == null) {
            return ResponseEntity.badRequest().build();
        }
        OrderEntity updated = orderService.updateStatus(orderId, newStatus);
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/{orderId}/action")
    public ResponseEntity<ActionExecutionResponse> executeAction(@PathVariable String orderId, @RequestBody ActionExecutionRequest request) {
        String action = request.getAction();
        if (action == null) {
            return ResponseEntity.badRequest().build();
        }
        ActionExecutionResponse response = orderService.executeAction(orderId, action);
        return ResponseEntity.ok(response);
    }
}
