package com.pos.sales.application.service;

import com.pos.sales.application.exception.ReceiptNotFoundException;
import com.pos.sales.domain.model.ReceiptEntity;
import com.pos.sales.infrastructure.persistence.ReceiptJpaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ReceiptQueryService {

    private final ReceiptJpaRepository receiptRepository;

    public ReceiptQueryService(ReceiptJpaRepository receiptRepository) {
        this.receiptRepository = receiptRepository;
    }

    @Transactional(readOnly = true)
    public ReceiptEntity requireByTransactionId(String transactionId) {
        return receiptRepository.findByTransactionIdWithLines(transactionId)
                .orElseThrow(() -> new ReceiptNotFoundException(transactionId));
    }
}
