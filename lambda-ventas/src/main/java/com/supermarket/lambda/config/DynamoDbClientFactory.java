package com.supermarket.lambda.config;

import com.amazonaws.auth.AWSStaticCredentialsProvider;
import com.amazonaws.auth.BasicAWSCredentials;
import com.amazonaws.auth.DefaultAWSCredentialsProviderChain;
import com.amazonaws.client.builder.AwsClientBuilder;
import com.amazonaws.services.dynamodbv2.AmazonDynamoDB;
import com.amazonaws.services.dynamodbv2.AmazonDynamoDBClientBuilder;
import com.amazonaws.services.dynamodbv2.document.DynamoDB;

public final class DynamoDbClientFactory {

    private static final String DEFAULT_REGION = "us-east-1";

    private static volatile DynamoDB instance;

    private DynamoDbClientFactory() {
    }

    public static DynamoDB getDynamoDb() {
        if (instance == null) {
            synchronized (DynamoDbClientFactory.class) {
                if (instance == null) {
                    String region = envOrDefault("AWS_REGION", DEFAULT_REGION);
                    String endpoint = System.getenv("DYNAMODB_ENDPOINT");

                    AmazonDynamoDBClientBuilder builder = AmazonDynamoDBClientBuilder.standard();

                    if (endpoint != null && !endpoint.isBlank()) {
                        // LocalStack / SAM local
                        builder
                                .withEndpointConfiguration(
                                        new AwsClientBuilder.EndpointConfiguration(endpoint, region))
                                .withCredentials(new AWSStaticCredentialsProvider(
                                        new BasicAWSCredentials("test", "test")));
                    } else {
                        // AWS real (SAM deploy sin endpoint)
                        builder
                                .withRegion(region)
                                .withCredentials(DefaultAWSCredentialsProviderChain.getInstance());
                    }

                    instance = new DynamoDB(builder.build());
                }
            }
        }
        return instance;
    }

    private static String envOrDefault(String key, String defaultValue) {
        String value = System.getenv(key);
        return (value == null || value.isBlank()) ? defaultValue : value;
    }
}
