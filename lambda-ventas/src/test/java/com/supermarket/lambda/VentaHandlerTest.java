package com.supermarket.lambda;

import com.amazonaws.AmazonServiceException;
import com.amazonaws.services.dynamodbv2.document.DynamoDB;
import com.amazonaws.services.dynamodbv2.document.Item;
import com.amazonaws.services.dynamodbv2.document.Table;
import com.amazonaws.services.dynamodbv2.document.spec.UpdateItemSpec;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyRequestEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyResponseEvent;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class VentaHandlerTest {

    @Mock
    private DynamoDB dynamoDB;

    @Mock
    private Table ventasTable;

    @Mock
    private Table productosTable;

    private VentaHandler handler;

    @BeforeEach
    void setUp() {
        handler = new VentaHandler(dynamoDB);
        when(dynamoDB.getTable("Ventas")).thenReturn(ventasTable);
        when(dynamoDB.getTable("Productos")).thenReturn(productosTable);

        Item producto = new Item()
                .withPrimaryKey("id", "prod-001")
                .withString("nombre", "Arroz 1kg")
                .withInt("stock_disponible", 100);
        when(productosTable.getItem("id", "prod-001")).thenReturn(producto);
    }

    @Test
    void registrarVenta_exitosa_retorna201() {
        String body = """
                {
                  "items": [
                    {"id": "prod-001", "nombre": "Arroz 1kg", "precio": 4500, "cantidad": 2}
                  ],
                  "descuento": 0
                }
                """;

        APIGatewayProxyRequestEvent request = new APIGatewayProxyRequestEvent()
                .withHttpMethod("POST")
                .withBody(body);

        APIGatewayProxyResponseEvent response = handler.handleRequest(request, LambdaTestSupport.mockContext());

        assertEquals(201, response.getStatusCode());
        assertTrue(response.getBody().contains("Venta procesada con éxito"));
        assertTrue(response.getBody().contains("idVenta"));
        assertTrue(response.getBody().contains("\"subtotal\":9000"));
        assertTrue(response.getBody().contains("\"iva\":1710"));
        assertTrue(response.getBody().contains("\"total\":10710"));

        verify(productosTable).updateItem(any(UpdateItemSpec.class));
        ArgumentCaptor<Item> captor = ArgumentCaptor.forClass(Item.class);
        verify(ventasTable).putItem(captor.capture());
        assertTrue(captor.getValue().getString("idVenta").startsWith("VNT-"));
    }

    @Test
    void registrarVenta_stockInsuficiente_retorna409() {
        when(productosTable.getItem("id", "prod-001")).thenReturn(
                new Item()
                        .withPrimaryKey("id", "prod-001")
                        .withString("nombre", "Arroz 1kg")
                        .withInt("stock_disponible", 1));

        String body = """
                {
                  "items": [
                    {"id": "prod-001", "nombre": "Arroz 1kg", "precio": 4500, "cantidad": 5}
                  ]
                }
                """;

        APIGatewayProxyRequestEvent request = new APIGatewayProxyRequestEvent()
                .withHttpMethod("POST")
                .withBody(body);

        APIGatewayProxyResponseEvent response = handler.handleRequest(request, LambdaTestSupport.mockContext());

        assertEquals(409, response.getStatusCode());
        assertTrue(response.getBody().contains("Stock insuficiente"));
        verify(ventasTable, times(0)).putItem(any(Item.class));
    }

    @Test
    void registrarVenta_bodyVacio_retorna400() {
        APIGatewayProxyRequestEvent request = new APIGatewayProxyRequestEvent()
                .withHttpMethod("POST")
                .withBody("");

        APIGatewayProxyResponseEvent response = handler.handleRequest(request, LambdaTestSupport.mockContext());

        assertEquals(400, response.getStatusCode());
        assertTrue(response.getBody().contains("cuerpo de la petición"));
    }

    @Test
    void registrarVenta_itemsVacios_retorna400() {
        APIGatewayProxyRequestEvent request = new APIGatewayProxyRequestEvent()
                .withHttpMethod("POST")
                .withBody("{\"items\":[]}");

        APIGatewayProxyResponseEvent response = handler.handleRequest(request, LambdaTestSupport.mockContext());

        assertEquals(400, response.getStatusCode());
        assertTrue(response.getBody().contains("items"));
    }

    @Test
    void registrarVenta_itemIncompleto_retorna400() {
        APIGatewayProxyRequestEvent request = new APIGatewayProxyRequestEvent()
                .withHttpMethod("POST")
                .withBody("{\"items\":[{\"id\":\"prod-001\",\"precio\":4500}]}");

        APIGatewayProxyResponseEvent response = handler.handleRequest(request, LambdaTestSupport.mockContext());

        assertEquals(400, response.getStatusCode());
        assertTrue(response.getBody().contains("id, nombre, precio y cantidad"));
    }

    @Test
    void registrarVenta_errorConexionDynamo_retorna500() {
        doThrow(new AmazonServiceException("Connection refused"))
                .when(ventasTable).putItem(any(Item.class));

        String body = """
                {
                  "items": [
                    {"id": "prod-001", "nombre": "Arroz 1kg", "precio": 4500, "cantidad": 1}
                  ]
                }
                """;

        APIGatewayProxyRequestEvent request = new APIGatewayProxyRequestEvent()
                .withHttpMethod("POST")
                .withBody(body);

        APIGatewayProxyResponseEvent response = handler.handleRequest(request, LambdaTestSupport.mockContext());

        assertEquals(500, response.getStatusCode());
        assertTrue(response.getBody().contains("Error al registrar la venta"));
    }
}
