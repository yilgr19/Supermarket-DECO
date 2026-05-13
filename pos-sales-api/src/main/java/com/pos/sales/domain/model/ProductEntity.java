package com.pos.sales.domain.model;

import jakarta.persistence.*;

import java.math.BigDecimal;

@Entity
@Table(name = "pos_product")
public class ProductEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 256)
    private String nombre;

    @Column(nullable = false, length = 1024)
    private String descripcion;

    @Column(nullable = false, length = 128)
    private String subcategoria;

    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal precio;

    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal precioxcantidad;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    private ProductStatus estado;

    @Column(nullable = false, unique = true, length = 32)
    private String barcode;

    @Column(nullable = false)
    private int availableStock;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public String getSubcategoria() {
        return subcategoria;
    }

    public void setSubcategoria(String subcategoria) {
        this.subcategoria = subcategoria;
    }

    public BigDecimal getPrecio() {
        return precio;
    }

    public void setPrecio(BigDecimal precio) {
        this.precio = precio;
    }

    public BigDecimal getPrecioxcantidad() {
        return precioxcantidad;
    }

    public void setPrecioxcantidad(BigDecimal precioxcantidad) {
        this.precioxcantidad = precioxcantidad;
    }

    public ProductStatus getEstado() {
        return estado;
    }

    public void setEstado(ProductStatus estado) {
        this.estado = estado;
    }

    public String getBarcode() {
        return barcode;
    }

    public void setBarcode(String barcode) {
        this.barcode = barcode;
    }

    public int getAvailableStock() {
        return availableStock;
    }

    public void setAvailableStock(int availableStock) {
        this.availableStock = availableStock;
    }
}
