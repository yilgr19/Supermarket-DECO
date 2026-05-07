package com.pos.sales.infrastructure.scheduler;

import com.pos.sales.application.service.SaleLifecycleService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.Instant;

@Component
public class FrozenSaleExpiryScheduler {

    private final SaleLifecycleService saleLifecycleService;

    /** Horas antes de caducidad de una venta congelada (.kiro) */
    private final long holdExpiryHours;

    private static final String REASON_EN_ES =
            "Venta congelada expirada automáticamente / Frozen sale automatically expired";

    public FrozenSaleExpiryScheduler(SaleLifecycleService saleLifecycleService,
                                      @Value("${pos.sales.hold-expiry-hours:2}") long holdExpiryHours) {
        this.saleLifecycleService = saleLifecycleService;
        this.holdExpiryHours = holdExpiryHours;
    }

    @Scheduled(fixedDelayString = "${pos.sales.expiry-check-interval-ms:60000}")
    public void cancelExpiredFrozen() {
        Instant threshold = Instant.now().minus(Duration.ofHours(holdExpiryHours));
        saleLifecycleService.cancelExpiredFrozen(threshold, REASON_EN_ES);
    }
}
