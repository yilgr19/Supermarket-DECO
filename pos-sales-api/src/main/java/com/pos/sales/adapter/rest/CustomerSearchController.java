package com.pos.sales.adapter.rest;

import com.pos.sales.adapter.external.InMemoryCustomerDirectory;
import com.pos.sales.adapter.rest.dto.CustomerDto;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/customers")
public class CustomerSearchController {

    private final InMemoryCustomerDirectory customers;

    public CustomerSearchController(InMemoryCustomerDirectory customers) {
        this.customers = customers;
    }

    @GetMapping("/search")
    public List<CustomerDto> search(@RequestParam(required = false) String name) {
        return customers.searchByName(name).stream().map(RestMapper::toCustomer).collect(Collectors.toList());
    }

    @GetMapping("/document/{documentNumber}")
    public CustomerDto byDocument(@PathVariable String documentNumber) {
        return RestMapper.toCustomer(customers.requireByDocument(documentNumber));
    }
}
