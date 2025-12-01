package org.example.ui.controller;

import org.example.ui.data.GuidanceOverrideClient;
import org.example.ui.model.OverrideRule;
import org.example.ui.model.PageResponse;
import org.example.ui.model.SortSpec;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/v1/guidance-engine")
@CrossOrigin(origins = "*")
public class OverrideController {

    @Autowired
    private GuidanceOverrideClient guidanceOverrideClient;

    /**
     * GET /api/v1/guidance-engine/override
     * Query params: size, page, sort, direction, and any QBE filters (e.g., overrideLevel, effectiveDate)
     */
    @GetMapping("/override")
    public Map<String, Object> getOverrides(
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "uniqueId") String sort,
            @RequestParam(defaultValue = "ASC") String direction,
            @RequestParam Map<String, String> allParams) {
        
        try {
            // Build sort specification
            List<SortSpec> sorts = new ArrayList<>();
            sorts.add(new SortSpec(sort, direction));
            
            // Collect QBE filters - exclude known paging/sort keys
            Map<String, String> qbe = new HashMap<>();
            Set<String> excludedKeys = Set.of("size", "page", "sort", "direction");
            allParams.forEach((key, value) -> {
                if (!excludedKeys.contains(key) && value != null && !value.isEmpty()) {
                    qbe.put(key, value);
                }
            });
            
            System.out.println("QBE Filters: " + qbe);
            
            // Call the client method with QBE filters
            PageResponse<OverrideRule> response = guidanceOverrideClient.search(
                    qbe,
                    sorts,
                    page,
                    size
            );
            
            // Build response
            Map<String, Object> result = new HashMap<>();
            result.put("status", "true");
            result.put("message", "Successfully fetched the response");
            
            Map<String, Object> data = new HashMap<>();
            data.put("totalItems", response.total());
            data.put("totalPages", (int) Math.ceil((double) response.total() / size));
            data.put("pageSize", size);
            data.put("currentPage", page);
            data.put("hasPrevious", page > 0);
            data.put("hasNext", page < Math.ceil((double) response.total() / size) - 1);
            data.put("overrideList", response.items());
            
            result.put("data", data);
            return result;
            
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("status", "false");
            errorResponse.put("message", "Error fetching data: " + e.getMessage());
            return errorResponse;
        }
    }
}