package com.pos.sales.adapter.rest;

import java.util.ArrayList;
import java.util.List;

import com.pos.sales.domain.model.dynamo.ProductoEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbEnhancedClient;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbTable;
import software.amazon.awssdk.enhanced.dynamodb.TableSchema;

@RestController
@RequestMapping("/api")
public class ProductoController {

    private static final String TABLA_PRODUCTOS = "Productos";

    private final DynamoDbTable<ProductoEntity> productoTable;

    public ProductoController(DynamoDbEnhancedClient dynamoDbEnhancedClient) {
        this.productoTable = dynamoDbEnhancedClient.table(
                TABLA_PRODUCTOS,
                TableSchema.fromBean(ProductoEntity.class));
    }

    @GetMapping("/productos")
    public List<ProductoEntity> listarProductos() {
        List<ProductoEntity> productos = new ArrayList<>();
        productoTable.scan().items().forEach(productos::add);
        return productos;
    }
}
