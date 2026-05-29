package com.supermarket.lambda;

import com.amazonaws.AmazonServiceException;
import com.amazonaws.services.dynamodbv2.document.DynamoDB;
import com.amazonaws.services.dynamodbv2.document.Item;
import com.amazonaws.services.dynamodbv2.document.Table;
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
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class VentaHandlerTest {

    @Mock
    private DynamoDB dynamoDB;

    @Mock
    private Table table;

    private VentaHandler handler;

    @BeforeEach
    void setUp() {
        handler = new VentaHandler(dynamoDB);
        when(dynamoDB.getTable("Ventas")).thenReturn(table);
    }

    @Test
    void registrarVenta_exitosa_retorna201() {
        String body = """
                {
                  "items": [
                    {"id": "prod-001", "nombre": "Arroz 1kg", "precio": 2.5, "cantidad": 2}
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
        assertTrue(response.getBody().contains("\"subtotal\":5"));
        assertTrue(response.getBody().contains("\"iva\":1"));
        assertTrue(response.getBody().contains("\"total\":6"));

        ArgumentCaptor<Item> captor = ArgumentCaptor.forClass(Item.class);
        verify(table).putItem(captor.capture());
        assertTrue(captor.getValue().getString("idVenta").startsWith("VNT-"));
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
                .withBody("{\"items\":[{\"id\":\"prod-001\",\"precio\":2.5}]}");

        APIGatewayProxyResponseEvent response = handler.handleRequest(request, LambdaTestSupport.mockContext());

        assertEquals(400, response.getStatusCode());
        assertTrue(response.getBody().contains("id, nombre, precio y cantidad"));
    }

    @Test
    void registrarVenta_errorConexionDynamo_retorna500() {
        doThrow(new AmazonServiceException("Connection refused"))
                .when(table).putItem(any(Item.class));

        String body = """
                {
                  "items": [
                    {"id": "prod-001", "nombre": "Arroz 1kg", "precio": 2.5, "cantidad": 1}
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
