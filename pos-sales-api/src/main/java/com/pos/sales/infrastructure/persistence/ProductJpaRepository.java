package com.pos.sales.infrastructure.persistence;

import com.pos.sales.domain.model.ProductEntity;
import com.pos.sales.domain.model.ProductStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Optional;

public interface ProductJpaRepository extends JpaRepository<ProductEntity, Long>, JpaSpecificationExecutor<ProductEntity> {

    Optional<ProductEntity> findByBarcode(String barcode);

    boolean existsByBarcodeAndIdNot(String barcode, Long id);
}
