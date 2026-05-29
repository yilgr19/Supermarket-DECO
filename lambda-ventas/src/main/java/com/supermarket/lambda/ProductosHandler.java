package com.supermarket.lambda;

import com.amazonaws.services.dynamodbv2.document.DynamoDB;
import com.amazonaws.services.dynamodbv2.document.Item;
import com.amazonaws.services.dynamodbv2.document.ItemCollection;
import com.amazonaws.services.dynamodbv2.document.ScanOutcome;
import com.amazonaws.services.dynamodbv2.document.Table;
import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyRequestEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyResponseEvent;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.supermarket.lambda.config.DynamoDbClientFactory;
import com.supermarket.lambda.util.ApiResponse;

import java.util.Iterator;
import java.util.Map;

/**
 * Lambda GET /api/productos — lista productos o devuelve uno por id.
 * Handler: com.supermarket.lambda.ProductosHandler::handleRequest
 */
public class ProductosHandler implements RequestHandler<APIGatewayProxyRequestEvent, APIGatewayProxyResponseEvent> {

    private static final String TABLA_PRODUCTOS =
            System.getenv().getOrDefault("TABLA_PRODUCTOS", "Productos");
    private static final ObjectMapper MAPPER = new ObjectMapper();

    private final DynamoDB dynamoDB;

    /** Constructor por defecto para AWS Lambda. */
    public ProductosHandler() {
        this(DynamoDbClientFactory.getDynamoDb());
    }

    /** Constructor inyectable para pruebas unitarias (mock de DynamoDB). */
    ProductosHandler(DynamoDB dynamoDB) {
        this.dynamoDB = dynamoDB;
    }

    @Override
    public APIGatewayProxyResponseEvent handleRequest(APIGatewayProxyRequestEvent request, Context context) {
        String method = request.getHttpMethod();
        if (method != null && !"GET".equalsIgnoreCase(method)) {
            return ApiResponse.error(405, "Método no permitido. Use GET.");
        }

        try {
            Map<String, String> pathParams = request.getPathParameters();
            String id = pathParams != null ? pathParams.get("id") : null;

            if (id != null && !id.isBlank()) {
                return obtenerPorId(id, context);
            }

            return listarTodos(context);
        } catch (Exception e) {
            context.getLogger().log("ERROR ProductosHandler: " + e.getMessage());
            return ApiResponse.error(500, "Error al consultar productos: " + e.getMessage());
        }
    }

    private APIGatewayProxyResponseEvent obtenerPorId(String id, Context context) {
        Table table = dynamoDB.getTable(TABLA_PRODUCTOS);
        Item item = table.getItem("id", id);

        if (item == null) {
            return ApiResponse.error(404, "Producto no encontrado");
        }

        context.getLogger().log("Producto obtenido: " + id);
        return ApiResponse.json(200, item.toJSONPretty());
    }

    private APIGatewayProxyResponseEvent listarTodos(Context context) throws Exception {
        Table table = dynamoDB.getTable(TABLA_PRODUCTOS);
        ItemCollection<ScanOutcome> items = table.scan();

        ArrayNode productos = MAPPER.createArrayNode();
        Iterator<Item> iterator = items.iterator();
        while (iterator.hasNext()) {
            Item item = iterator.next();
            ObjectNode producto = (ObjectNode) MAPPER.readTree(item.toJSONPretty());
            productos.add(producto);
        }

        context.getLogger().log("Productos listados: " + productos.size());
        return ApiResponse.json(200, productos.toString());
    }
}
