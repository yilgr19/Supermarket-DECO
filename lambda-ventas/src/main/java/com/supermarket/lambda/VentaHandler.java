package com.supermarket.lambda;

import com.amazonaws.services.dynamodbv2.document.DynamoDB;
import com.amazonaws.services.dynamodbv2.document.Item;
import com.amazonaws.services.dynamodbv2.document.Table;
import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyRequestEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyResponseEvent;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.supermarket.lambda.config.DynamoDbClientFactory;
import com.supermarket.lambda.util.ApiResponse;

import java.time.Instant;

/**
 * Lambda POST /api/v1/ventas — registra una venta con detalle de productos.
 */
public class VentaHandler implements RequestHandler<APIGatewayProxyRequestEvent, APIGatewayProxyResponseEvent> {

    private static final String TABLA_VENTAS =
            System.getenv().getOrDefault("TABLA_VENTAS", "Ventas");
    private static final double IVA_PORCENTAJE = 0.19;
    private static final ObjectMapper MAPPER = new ObjectMapper();

    private final DynamoDB dynamoDB;

    /** Constructor por defecto para AWS Lambda. */
    public VentaHandler() {
        this(DynamoDbClientFactory.getDynamoDb());
    }

    /** Constructor inyectable para pruebas unitarias (mock de DynamoDB). */
    VentaHandler(DynamoDB dynamoDB) {
        this.dynamoDB = dynamoDB;
    }

    @Override
    public APIGatewayProxyResponseEvent handleRequest(APIGatewayProxyRequestEvent request, Context context) {
        String method = request.getHttpMethod();
        if (method != null && !"POST".equalsIgnoreCase(method)) {
            return ApiResponse.error(405, "Método no permitido. Use POST.");
        }

        String body = request.getBody();
        if (body == null || body.isBlank()) {
            return ApiResponse.error(400, "El cuerpo de la petición es obligatorio.");
        }

        try {
            JsonNode payload = MAPPER.readTree(body);
            JsonNode itemsNode = resolverItems(payload);

            if (itemsNode == null || !itemsNode.isArray() || itemsNode.isEmpty()) {
                return ApiResponse.error(400,
                        "Se requiere el arreglo 'items' (o 'articulos') con al menos un producto.");
            }

            ArrayNode itemsNormalizados = MAPPER.createArrayNode();
            double subtotal = 0;

            for (JsonNode item : itemsNode) {
                if (!item.has("id") || !item.has("nombre") || !item.has("precio") || !item.has("cantidad")) {
                    return ApiResponse.error(400,
                            "Cada producto debe tener: id, nombre, precio y cantidad.");
                }
                int cantidad = item.get("cantidad").asInt();
                double precio = item.get("precio").asDouble();
                if (cantidad <= 0 || precio < 0) {
                    return ApiResponse.error(400, "precio y cantidad deben ser válidos.");
                }

                ObjectNode linea = MAPPER.createObjectNode()
                        .put("id", item.get("id").asText())
                        .put("nombre", item.get("nombre").asText())
                        .put("precio", precio)
                        .put("cantidad", cantidad);
                itemsNormalizados.add(linea);
                subtotal += precio * cantidad;
            }

            double descuento = payload.has("descuento") ? payload.get("descuento").asDouble() : 0;
            if (descuento < 0) {
                return ApiResponse.error(400, "El descuento no puede ser negativo.");
            }

            double base = subtotal - descuento;
            if (base < 0) {
                return ApiResponse.error(400, "El descuento no puede ser mayor al subtotal.");
            }

            double iva = Math.round(base * IVA_PORCENTAJE);
            double total = base + iva;

            String idVenta = "VNT-" + System.currentTimeMillis();
            String fecha = Instant.now().toString();

            ObjectNode venta = MAPPER.createObjectNode();
            venta.put("idVenta", idVenta);
            venta.put("fecha", fecha);
            venta.set("items", itemsNormalizados);
            venta.put("subtotal", subtotal);
            venta.put("descuento", descuento);
            venta.put("iva", iva);
            venta.put("total", total);

            Table table = dynamoDB.getTable(TABLA_VENTAS);
            table.putItem(Item.fromJSON(venta.toString()));

            context.getLogger().log("Venta registrada: " + idVenta);

            ObjectNode respuesta = MAPPER.createObjectNode();
            respuesta.put("mensaje", "Venta procesada con éxito");
            respuesta.put("idVenta", idVenta);
            respuesta.set("items", itemsNormalizados);
            respuesta.put("subtotal", subtotal);
            respuesta.put("descuento", descuento);
            respuesta.put("iva", iva);
            respuesta.put("total", total);

            return ApiResponse.json(201, respuesta.toString());
        } catch (Exception e) {
            context.getLogger().log("ERROR VentaHandler: " + e.getMessage());
            return ApiResponse.error(500, "Error al registrar la venta: " + e.getMessage());
        }
    }

    /** Acepta "items" (formato nuevo) o "articulos" (compatibilidad). */
    private JsonNode resolverItems(JsonNode payload) {
        if (payload.has("items") && payload.get("items").isArray()) {
            return payload.get("items");
        }
        if (payload.has("articulos") && payload.get("articulos").isArray()) {
            return payload.get("articulos");
        }
        return null;
    }
}
