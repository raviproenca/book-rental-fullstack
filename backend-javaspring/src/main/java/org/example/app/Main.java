package org.example.app;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class Main {
    public static void main(String[] args) {
        SpringApplication.run(Main.class, args);
    }

    @org.springframework.context.annotation.Bean
    org.springframework.boot.CommandLineRunner runCheckLateRents(org.example.app.services.RentService rentService) {
        return args -> {
            rentService.checkLateRents();
            System.out.println("Executed checkLateRents() on startup.");
        };
    }
}
