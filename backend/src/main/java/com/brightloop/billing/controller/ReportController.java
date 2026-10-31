package com.brightloop.billing.controller;

import com.brightloop.billing.dto.ReportDtos.Summary;
import com.brightloop.billing.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reports;

    @GetMapping("/summary")
    public Summary summary() {
        return reports.summary();
    }
}
