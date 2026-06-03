package com.supermarket.lambda;

import com.amazonaws.AmazonServiceException;
import com.amazonaws.services.dynamodbv2.document.DynamoDB;
import com.amazonaws.services.dynamodbv2.document.Item;
import com.amazonaws.services.dynamodbv2.document.ItemCollection;
import com.amazonaws.services.dynamodbv2.document.ScanOutcome;
import com.amazonaws.services.dynamodbv2.document.Table;
import com.amazonaws.services.dynamodbv2.document.internal.IteratorSupport;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyRequestEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyResponseEvent;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class ProductosHandlerTest {

    @Mock
    private DynamoDB dynamoDB;

    @Mock
    private Table table;

    private ProductosHandler handler;

    @BeforeEach
    void setUp() {
        handler = new ProductosHandler(dynamoDB);
        when(dynamoDB.getTable("Productos")).thenReturn(table);
    }

    @Test
    void listarProductos_retorna200ConCatalogo() throws Exception {
        Item item = new Item()
                .withPrimaryKey("id", "prod-001")
                .withString("nombre", "Arroz 1kg")
                .withNumber("precio", 2.5);

        @SuppressWarnings("unchecked")
        ItemCollection<ScanOutcome> collection = mock(ItemCollection.class);
        @SuppressWarnings("unchecked")
        IteratorSupport<Item, ScanOutcome> iterator = mock(IteratorSupport.class);
        when(table.scan()).thenReturn(collection);
        when(collection.iterator()).thenReturn(iterator);
        when(iterator.hasNext()).thenReturn(true, false);
        when(iterator.next()).thenReturn(item);

        APIGatewayProxyRequestEvent request = new APIGatewayProxyRequestEvent()
                .withHttpMethod("GET");

        APIGatewayProxyResponseEvent response = handler.handleRequest(request, LambdaTestSupport.mockContext());

        assertEquals(200, response.getStatusCode());
        assertTrue(response.getBody().contains("prod-001"));
        assertTrue(response.getBody().contains("Arroz 1kg"));
    }

    @Test
    void listarProductos_tablaVacia_retorna200ConArregloVacio() {
        @SuppressWarnings("unchecked")
        ItemCollection<ScanOutcome> collection = mock(ItemCollection.class);
        @SuppressWarnings("unchecked")
        IteratorSupport<Item, ScanOutcome> iterator = mock(IteratorSupport.class);
        when(table.scan()).thenReturn(collection);
        when(collection.iterator()).thenReturn(iterator);
        when(iterator.hasNext()).thenReturn(false);

        APIGatewayProxyRequestEvent request = new APIGatewayProxyRequestEvent()
                .withHttpMethod("GET");

        APIGatewayProxyResponseEvent response = handler.handleRequest(request, LambdaTestSupport.mockContext());

        assertEquals(200, response.getStatusCode());
        assertEquals("[]", response.getBody().trim());
    }

    @Test
    void obtenerPorId_existente_retorna200() {
        Item item = new Item()
                .withPrimaryKey("id", "prod-002")
                .withString("nombre", "Leche entera 1L")
                .withNumber("precio", 18.5);
        when(table.getItem("id", "prod-002")).thenReturn(item);

        APIGatewayProxyRequestEvent request = new APIGatewayProxyRequestEvent()
                .withHttpMethod("GET")
                .withPathParameters(Map.of("id", "prod-002"));

        APIGatewayProxyResponseEvent response = handler.handleRequest(request, LambdaTestSupport.mockContext());

        assertEquals(200, response.getStatusCode());
        assertTrue(response.getBody().contains("Leche entera 1L"));
    }

    @Test
    void obtenerPorId_inexistente_retorna404() {
        when(table.getItem("id", "prod-999")).thenReturn(null);

        APIGatewayProxyRequestEvent request = new APIGatewayProxyRequestEvent()
                .withHttpMethod("GET")
                .withPathParameters(Map.of("id", "prod-999"));

        APIGatewayProxyResponseEvent response = handler.handleRequest(request, LambdaTestSupport.mockContext());

        assertEquals(404, response.getStatusCode());
        assertTrue(response.getBody().contains("Producto no encontrado"));
    }

    @Test
    void buscarPorNombre_retornaSoloCoincidencias() throws Exception {
        Item arroz = new Item()
                .withPrimaryKey("id", "prod-001")
                .withString("nombre", "Arroz 1kg")
                .withNumber("precio", 4500);
        Item pan = new Item()
                .withPrimaryKey("id", "prod-003")
                .withString("nombre", "Pan integral")
                .withNumber("precio", 6800);

        @SuppressWarnings("unchecked")
        ItemCollection<ScanOutcome> collection = mock(ItemCollection.class);
        @SuppressWarnings("unchecked")
        IteratorSupport<Item, ScanOutcome> iterator = mock(IteratorSupport.class);
        when(table.scan()).thenReturn(collection);
        when(collection.iterator()).thenReturn(iterator);
        when(iterator.hasNext()).thenReturn(true, true, false);
        when(iterator.next()).thenReturn(arroz, pan);

        APIGatewayProxyRequestEvent request = new APIGatewayProxyRequestEvent()
                .withHttpMethod("GET")
                .withQueryStringParameters(Map.of("q", "pan"));

        APIGatewayProxyResponseEvent response = handler.handleRequest(request, LambdaTestSupport.mockContext());

        assertEquals(200, response.getStatusCode());
        assertTrue(response.getBody().contains("Pan integral"));
        assertTrue(!response.getBody().contains("prod-001"));
    }

    @Test
    void listarProductos_errorConexion_retorna500() {
        when(table.scan()).thenThrow(new AmazonServiceException("Connection refused"));

        APIGatewayProxyRequestEvent request = new APIGatewayProxyRequestEvent()
                .withHttpMethod("GET");

        APIGatewayProxyResponseEvent response = handler.handleRequest(request, LambdaTestSupport.mockContext());

        assertEquals(500, response.getStatusCode());
        assertTrue(response.getBody().contains("Error al consultar productos"));
    }
}
