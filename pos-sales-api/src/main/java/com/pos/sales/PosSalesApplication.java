package com.pos.sales;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class PosSalesApplication {

    public static void main(String[] args) {
        SpringApplication.run(PosSalesApplication.class, args);
    }
}
