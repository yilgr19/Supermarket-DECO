package com.pos.sales.adapter.external;

import com.pos.sales.application.exception.CustomerNotFoundException;
import com.pos.sales.domain.model.CreditStatus;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Service
public class InMemoryCustomerDirectory {

    public record CustomerEntry(String id,
                                String fullName,
                                String documentType,
                                String documentNumber,
                                CreditStatus creditStatus) {
    }

    private final Map<String, CustomerEntry> byId = new ConcurrentHashMap<>();
    private final Map<String, CustomerEntry> byDocument = new ConcurrentHashMap<>();

    @PostConstruct
    void seed() {
        CustomerEntry approved = new CustomerEntry("cust-1", "Juan Pérez", "CC", "12345678", CreditStatus.APPROVED);
        CustomerEntry rejected = new CustomerEntry("cust-2", "María García", "CC", "87654321", CreditStatus.REJECTED);
        CustomerEntry pending = new CustomerEntry("cust-3", "Ana Torres", "CE", "101010", CreditStatus.PENDING);
        for (var e : List.of(approved, rejected, pending)) {
            byId.put(e.id(), e);
            byDocument.put(e.documentNumber(), e);
        }
    }

    public List<CustomerEntry> searchByName(String name) {
        if (name == null || name.isBlank()) {
            return List.of();
        }
        final String needle = name.toLowerCase(Locale.ROOT);
        return byId.values().stream()
                .filter(c -> c.fullName().toLowerCase(Locale.ROOT).contains(needle))
                .collect(Collectors.toUnmodifiableList());
    }

    public CustomerEntry requireByDocument(String doc) {
        if (doc == null || doc.isBlank()) {
            throw new CustomerNotFoundException("documento vacío");
        }
        CustomerEntry c = byDocument.get(doc.trim());
        if (c == null) {
            throw new CustomerNotFoundException("Cliente no encontrado / Customer not found: " + doc);
        }
        return c;
    }

    public CustomerEntry requireById(String id) {
        CustomerEntry c = byId.get(id);
        if (c == null) {
            throw new CustomerNotFoundException("Cliente no encontrado / Customer not found: " + id);
        }
        return c;
    }
}
