package com.orderflow.sentinel.controller;

import com.orderflow.sentinel.model.GroundedDiagnosisDTO;
import com.orderflow.sentinel.model.OrderEntity;
import com.orderflow.sentinel.service.AIDiagnosisService;
import com.orderflow.sentinel.service.OrderService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "*")
public class SentinelDiagnosisController {

    private final OrderService orderService;
    private final AIDiagnosisService aiDiagnosisService;

    public SentinelDiagnosisController(OrderService orderService, AIDiagnosisService aiDiagnosisService) {
        this.orderService = orderService;
        this.aiDiagnosisService = aiDiagnosisService;
    }

    @GetMapping("/{orderId}/diagnose")
    public ResponseEntity<GroundedDiagnosisDTO> diagnoseOrder(@PathVariable String orderId) {
        return orderService.getOrderByOrderId(orderId)
                .map(order -> ResponseEntity.ok(aiDiagnosisService.diagnose(order)))
                .orElse(ResponseEntity.notFound().build());
    }
}
