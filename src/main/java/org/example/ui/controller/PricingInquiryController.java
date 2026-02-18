package com.example.pricing.controller.ui;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class PricingInquiryController {
  @GetMapping("/pricing-inquiry")
  public String pricingInquiry() {
    return "pricing/pricing-inquiry";
  }

  @GetMapping("/margin-funding-maintenance")
  public String marginFundingMaintenance() {
    return "pricing/margin-funding-maintenance";
  }

  @GetMapping("/")
  public String home() {
    return "home";
  }
}