package com.pos.sales.infrastructure.persistence;

import com.pos.sales.domain.model.ReceiptEntity;
import com.pos.sales.domain.model.ReceiptType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface ReceiptJpaRepository extends JpaRepository<ReceiptEntity, UUID> {

    Optional<ReceiptEntity> findByTransactionId(String transactionId);

    @Query("SELECT DISTINCT r FROM ReceiptEntity r LEFT JOIN FETCH r.lines WHERE r.transactionId = :txn")
    Optional<ReceiptEntity> findByTransactionIdWithLines(@Param("txn") String txn);

    Optional<ReceiptEntity> findFirstBySaleIdAndReceiptTypeOrderByCreatedAtDesc(UUID saleId, ReceiptType receiptType);
}
