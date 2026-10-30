package com.orderflow.sentinel.repository;

import com.orderflow.sentinel.model.IncidentLogEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IncidentLogRepository extends JpaRepository<IncidentLogEntity, Long> {
    List<IncidentLogEntity> findAllByOrderByTimestampDesc();
}
