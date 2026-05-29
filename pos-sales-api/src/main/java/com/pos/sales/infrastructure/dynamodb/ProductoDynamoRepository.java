package com.pos.sales.infrastructure.dynamodb;

import java.util.ArrayList;
import java.util.List;

import com.pos.sales.domain.model.dynamo.ProductoEntity;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Repository;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbEnhancedClient;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbTable;
import software.amazon.awssdk.enhanced.dynamodb.TableSchema;

@Repository
public class ProductoDynamoRepository {

    private final DynamoDbTable<ProductoEntity> productoTable;

    public ProductoDynamoRepository(
            DynamoDbEnhancedClient dynamoDbEnhancedClient,
            @Value("${aws.dynamodb.productos-table}") String productosTableName) {
        this.productoTable = dynamoDbEnhancedClient.table(
                productosTableName,
                TableSchema.fromBean(ProductoEntity.class));
    }

    public List<ProductoEntity> listarTodos() {
        List<ProductoEntity> productos = new ArrayList<>();
        productoTable.scan().items().forEach(productos::add);
        return productos;
    }

    public ProductoEntity guardarProducto(ProductoEntity producto) {
        productoTable.putItem(producto);
        return producto;
    }
}
