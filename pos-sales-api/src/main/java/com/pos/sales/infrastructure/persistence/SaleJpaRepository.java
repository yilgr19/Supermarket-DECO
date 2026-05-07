package com.pos.sales.infrastructure.persistence;

import com.pos.sales.domain.model.SaleEntity;
import com.pos.sales.domain.model.SaleStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SaleJpaRepository extends JpaRepository<SaleEntity, UUID> {

    @Query("SELECT DISTINCT s FROM SaleEntity s LEFT JOIN FETCH s.lines WHERE s.id = :id")
    Optional<SaleEntity> findByIdWithLines(@Param("id") UUID id);

    @Query("SELECT DISTINCT s FROM SaleEntity s LEFT JOIN FETCH s.lines WHERE s.terminalId = :terminalId AND s.status = :status ORDER BY s.frozenAt ASC")
    List<SaleEntity> findByTerminalIdAndStatusOrderByFrozenAtAsc(@Param("terminalId") String terminalId,
                                                                 @Param("status") SaleStatus status);

    List<SaleEntity> findByStatusAndFrozenAtIsNotNullAndFrozenAtBefore(SaleStatus status, Instant threshold);
}
