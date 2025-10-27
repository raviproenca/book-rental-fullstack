package org.example.app.controllers;

import lombok.RequiredArgsConstructor;
import org.example.app.models.responses.BookResponseDTO;
import org.example.app.models.responses.RenterRentCountDTO;
import org.example.app.services.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/bookMoreRented")
    public ResponseEntity<List<BookResponseDTO>> bookMoreRented(int numberOfMonths) {
        List<BookResponseDTO> books = dashboardService.getMostRentedBooks(numberOfMonths);
        return ResponseEntity.ok(books);
    }

    @GetMapping("/deliveredInTimeQuantity")
    public ResponseEntity<Long> deliveredInTime(int numberOfMonths) {
        Long inTime = dashboardService.getDeliveredInTimeBooks(numberOfMonths);
        return ResponseEntity.ok(inTime);
    }

    @GetMapping("deliveredWithDelayQuantity")
    public ResponseEntity<Long> deliveredWithDelay(int numberOfMonths) {
        Long withDelay = dashboardService.getDeliveredWithDelayBooks(numberOfMonths);
        return ResponseEntity.ok(withDelay);
    }

    @GetMapping("rentsLateQuantity")
    public ResponseEntity<Long> lateBooks(int numberOfMonths) {
        Long late = dashboardService.getLateBooks(numberOfMonths);
        return ResponseEntity.ok(late);
    }

    @GetMapping("rentsPerRenter")
    public ResponseEntity<List<RenterRentCountDTO>> perRenter() {
        List<RenterRentCountDTO> rents = dashboardService.getRentsPerRenter();
        return ResponseEntity.ok(rents);
    }

    @GetMapping("rentsQuantity")
    public ResponseEntity<Long> allRents(int numberOfMonths) {
        Long allRents = dashboardService.getAllRentsQuantity(numberOfMonths);
        return ResponseEntity.ok(allRents);
    }
}
