package com.pos.sales.application.service;

import java.util.List;

import com.pos.sales.domain.model.dynamo.ProductoEntity;
import com.pos.sales.infrastructure.dynamodb.ProductoDynamoRepository;
import org.springframework.stereotype.Service;

@Service
public class ProductoDynamoService {

    private final ProductoDynamoRepository productoRepository;

    public ProductoDynamoService(ProductoDynamoRepository productoRepository) {
        this.productoRepository = productoRepository;
    }

    public List<ProductoEntity> listarTodos() {
        return productoRepository.listarTodos();
    }

    public ProductoEntity guardarProducto(ProductoEntity producto) {
        return productoRepository.guardarProducto(producto);
    }
}
