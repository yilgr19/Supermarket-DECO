package com.supermarket.lambda;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.LambdaLogger;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

final class LambdaTestSupport {

    private LambdaTestSupport() {
    }

    static Context mockContext() {
        Context context = mock(Context.class);
        LambdaLogger logger = mock(LambdaLogger.class);
        org.mockito.Mockito.lenient().when(context.getLogger()).thenReturn(logger);
        return context;
    }
}
