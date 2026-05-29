package com.supermarket.lambda.util;

import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyResponseEvent;

import java.util.HashMap;
import java.util.Map;

public final class ApiResponse {

    private ApiResponse() {
    }

    public static APIGatewayProxyResponseEvent json(int statusCode, String body) {
        Map<String, String> headers = new HashMap<>();
        headers.put("Content-Type", "application/json");
        headers.put("Access-Control-Allow-Origin", "*");
        headers.put("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
        headers.put("Access-Control-Allow-Headers", "Content-Type,Authorization");

        APIGatewayProxyResponseEvent response = new APIGatewayProxyResponseEvent();
        response.setStatusCode(statusCode);
        response.setHeaders(headers);
        response.setBody(body);
        return response;
    }

    public static APIGatewayProxyResponseEvent error(int statusCode, String message) {
        String body = "{\"error\":\"" + escapeJson(message) + "\"}";
        return json(statusCode, body);
    }

    public static APIGatewayProxyResponseEvent success(String message) {
        String body = "{\"mensaje\":\"" + escapeJson(message) + "\"}";
        return json(200, body);
    }

    private static String escapeJson(String value) {
        return value.replace("\\", "\\\\").replace("\"", "\\\"");
    }
}
