package com.pos.sales.adapter.rest;

import com.pos.sales.adapter.rest.request.*;
import com.pos.sales.adapter.rest.dto.SaleDto;
import com.pos.sales.adapter.rest.dto.ReceiptDto;
import com.pos.sales.application.service.CheckoutService;
import com.pos.sales.application.service.ReturnService;
import com.pos.sales.application.service.SaleLifecycleService;
import com.pos.sales.domain.model.DiscountType;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/sales")
@Validated
public class SaleController {

    private final SaleLifecycleService saleLifecycleService;
    private final CheckoutService checkoutService;
    private final ReturnService returnService;
    private final String defaultTerminalId;
    private final String defaultCashierId;

    public SaleController(SaleLifecycleService saleLifecycleService,
                         CheckoutService checkoutService,
                         ReturnService returnService,
                         @Value("${pos.sales.default-terminal-id}") String defaultTerminalId,
                         @Value("${pos.sales.default-cashier-id}") String defaultCashierId) {
        this.saleLifecycleService = saleLifecycleService;
        this.checkoutService = checkoutService;
        this.returnService = returnService;
        this.defaultTerminalId = defaultTerminalId;
        this.defaultCashierId = defaultCashierId;
    }

    @PostMapping
    public ResponseEntity<SaleDto> create(@Valid @RequestBody(required = false) CreateSaleRequest body,
                                         HttpServletRequest request) {
        String terminalId = body != null && notBlank(body.terminalId()) ? body.terminalId().trim() : defaultTerminalId;
        String cashierId = resolveCashierId(request);
        String customerId = body != null && notBlank(body.customerId()) ? body.customerId().trim() : null;
        var sale = saleLifecycleService.createSale(terminalId, cashierId, customerId);
        return ResponseEntity.status(HttpStatus.CREATED).body(RestMapper.toSale(sale));
    }

    @GetMapping("/frozen")
    public List<SaleDto> listFrozen(@RequestParam String terminalId) {
        return saleLifecycleService.listFrozen(terminalId).stream()
                .map(RestMapper::toSale)
                .collect(Collectors.toList());
    }

    @GetMapping("/{saleId}")
    public SaleDto get(@PathVariable UUID saleId) {
        return RestMapper.toSale(saleLifecycleService.getSale(saleId));
    }

    @PatchMapping("/{saleId}")
    public SaleDto patchCustomer(@PathVariable UUID saleId,
                                 @RequestBody(required = false) PatchSaleCustomerRequest body) {
        if (body == null) {
            return RestMapper.toSale(saleLifecycleService.getSale(saleId));
        }
        return RestMapper.toSale(saleLifecycleService.linkCustomer(saleId, trimOrNull(body.customerId())));
    }

    @PostMapping("/{saleId}/items")
    public SaleDto addItem(@PathVariable UUID saleId, @Valid @RequestBody AddSaleLineRequest body) {
        validateProductRef(body.productId(), body.barcode());
        return RestMapper.toSale(saleLifecycleService.addItem(saleId, trimOrNull(body.productId()),
                trimOrNull(body.barcode()), body.quantity()));
    }

    @PutMapping("/{saleId}/items/{itemId}")
    public SaleDto updateItem(@PathVariable UUID saleId,
                              @PathVariable UUID itemId,
                              @Valid @RequestBody UpdateLineQuantityRequest body) {
        return RestMapper.toSale(saleLifecycleService.updateItemQuantity(saleId, itemId, body.quantity()));
    }

    @DeleteMapping("/{saleId}/items/{itemId}")
    public SaleDto removeItem(@PathVariable UUID saleId, @PathVariable UUID itemId) {
        return RestMapper.toSale(saleLifecycleService.removeLine(saleId, itemId));
    }

    @PostMapping("/{saleId}/discount")
    public SaleDto discount(@PathVariable UUID saleId, @Valid @RequestBody ApplyDiscountRequest body) {
        BigDecimal dv = body.discountValue();
        DiscountType dt = body.discountType();
        return RestMapper.toSale(saleLifecycleService.applyDiscount(saleId, dt, dv));
    }

    @PostMapping("/{saleId}/freeze")
    public SaleDto freeze(@PathVariable UUID saleId) {
        return RestMapper.toSale(saleLifecycleService.freeze(saleId));
    }

    @PostMapping("/{saleId}/resume")
    public SaleDto resume(@PathVariable UUID saleId) {
        return RestMapper.toSale(saleLifecycleService.resume(saleId));
    }

    @PostMapping("/{saleId}/cancel")
    public SaleDto cancel(@PathVariable UUID saleId, @Valid @RequestBody CancelSaleRequest body) {
        return RestMapper.toSale(saleLifecycleService.cancel(saleId, body.reason()));
    }

    @PostMapping("/{saleId}/checkout")
    public ReceiptDto checkout(@PathVariable UUID saleId, @Valid @RequestBody CheckoutSaleRequest body) {
        return RestMapper.toReceipt(checkoutService.checkout(saleId, body.paymentType(), body.amountReceived(),
                trimOrNull(body.customerId())));
    }

    @PostMapping("/{saleId}/return")
    public ReceiptDto fullReturn(@PathVariable UUID saleId, @Valid @RequestBody FullReturnRequest body) {
        return RestMapper.toReceipt(returnService.fullReturn(saleId, body.reason()));
    }

    @PostMapping("/{saleId}/partial-return")
    public ReceiptDto partialReturn(@PathVariable UUID saleId, @Valid @RequestBody PartialReturnRequest body) {
        List<ReturnService.PartialLine> rows = body.items().stream()
                .map(r -> new ReturnService.PartialLine(r.saleItemId(), r.quantity(), r.reason()))
                .collect(Collectors.toList());
        return RestMapper.toReceipt(returnService.partialReturn(saleId, rows));
    }

    private String resolveCashierId(HttpServletRequest request) {
        String h = request.getHeader("X-Cashier-Id");
        return notBlank(h) ? h.trim() : defaultCashierId;
    }

    private static boolean notBlank(String s) {
        return s != null && !s.isBlank();
    }

    private static String trimOrNull(String s) {
        if (s == null || s.isBlank()) {
            return null;
        }
        return s.trim();
    }

    private static void validateProductRef(String productId, String barcode) {
        if (!notBlank(productId) && !notBlank(barcode)) {
            throw new IllegalArgumentException("Se requiere productId o barcode / productId or barcode required");
        }
    }
}
