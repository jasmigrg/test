package org.example.ui.controller;

import com.example.pricing.service.MarginFundingBffService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class MarginFundingApiController {
  private final MarginFundingBffService bffService;

  public MarginFundingApiController(MarginFundingBffService bffService) {
    this.bffService = bffService;
  }

  @GetMapping("/api/margin-funding/paginated")
  public Map<String, Object> getPage(
      @RequestParam(required = false) Integer page,
      @RequestParam(required = false) Integer size,
      @RequestParam(required = false) Integer pageNum,
      @RequestParam(required = false) Integer pageLimit,
      @RequestParam(required = false) String sortBy,
      @RequestParam(required = false) String sortDirection,
      @RequestParam(required = false) String sort,
      @RequestParam(required = false) String direction,
      @RequestParam Map<String, String> params) {

    return bffService.search(page, size, pageNum, pageLimit, sortBy, sortDirection, sort, direction, params);
  }
}
