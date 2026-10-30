package com.orderflow.sentinel.controller;

import com.orderflow.sentinel.model.IncidentLogEntity;
import com.orderflow.sentinel.repository.IncidentLogRepository;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/incidents")
@CrossOrigin(origins = "*")
public class IncidentLogController {

    private final IncidentLogRepository incidentLogRepository;

    public IncidentLogController(IncidentLogRepository incidentLogRepository) {
        this.incidentLogRepository = incidentLogRepository;
    }

    @GetMapping
    public List<IncidentLogEntity> getIncidents() {
        return incidentLogRepository.findAllByOrderByTimestampDesc();
    }
}
