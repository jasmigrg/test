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

  @GetMapping("/margin-funding-customer-maintenance")
  public String marginFundingCustomerMaintenance() {
    return "pricing/margin-funding-customer-maintenance";
  }

  @GetMapping("/cams-eligibility")
  public String camsEligibility() {
    return "pricing/cams-eligibility";
  }

  @GetMapping("/manage-kvi-recommendation-logic-view-output-data")
  public String manageKviRecommendationLogicViewOutputData() {
    return "pricing/manage-kvi-recommendation-logic-view-output-data";
  }

  @GetMapping("/")
  public String home() {
    return "home";
  }
}