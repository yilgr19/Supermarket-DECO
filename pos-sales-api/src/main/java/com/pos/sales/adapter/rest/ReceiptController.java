package com.pos.sales.adapter.rest;

import com.pos.sales.adapter.rest.dto.ReceiptDto;
import com.pos.sales.application.service.ReceiptQueryService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/receipts")
public class ReceiptController {

    private final ReceiptQueryService receipts;

    public ReceiptController(ReceiptQueryService receipts) {
        this.receipts = receipts;
    }

    @GetMapping("/{transactionId}")
    public ReceiptDto get(@PathVariable String transactionId) {
        return RestMapper.toReceipt(receipts.requireByTransactionId(transactionId));
    }
}
