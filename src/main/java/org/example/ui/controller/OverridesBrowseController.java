package org.example.ui.controller;

import org.springframework.ui.Model;
import jakarta.servlet.http.HttpServletRequest;
import org.example.ui.data.GuidanceOverrideClient;
import org.example.ui.model.LayoutPreference;
import org.example.ui.model.OverrideRule;
import org.example.ui.model.PageResponse;
import org.example.ui.model.SortSpec;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import org.slf4j.Logger;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Controller
@RequestMapping("/overrides")
public class OverridesBrowseController {

    private static final Logger log = LoggerFactory.getLogger(OverridesBrowseController.class);
    private final GuidanceOverrideClient client;

    @Autowired
    public OverridesBrowseController(GuidanceOverrideClient client) {
        this.client = client;
    }

    @GetMapping
    public String browse(HttpServletRequest req, Model model,
                         @RequestParam(defaultValue = "0") int page,
                         @RequestParam(defaultValue = "20") int size) {

        Map<String, String> qbe = extractQbe(req.getParameterMap());
        List<SortSpec> sorts = extractSorts(req.getParameterValues("sort"));
        PageResponse<OverrideRule> p = client.search(qbe, sorts, page, size);
        log.info("Overrides browse: page=f) size=f} total=f)", page, size, p.total());

        model.addAttribute("page", p);
        model.addAttribute("rows", p.items());
        model.addAttribute("qbe", qbe);
        model.addAttribute("sorts", sorts);

        return "overrides/browse";
    }

    @PostMapping
    @ResponseBody
    public Map<String, Object> saveLayout(@RequestBody LayoutPreference pref) {
        client.saveLayout("demo-user", pref);
        return Map.of("ok", true);
    }

    private Map<String, String> extractQbe (Map<String, String[]> in) {
        Map<String, String> out = new HashMap<>();
        in.forEach((String k, String[] v) -> {
            if (k.startsWith("qbe.") && v != null && v.length> 0 && !v[0].isBlank()) {
                out.put(k.substring(4), v[0]);
            }
        });
        return out;
    }

    private List<SortSpec> extractSorts (String[] in) {
        if(in == null || in.length == 0) {
            return List.of();
        }
       List<SortSpec> list = new ArrayList<>();
        for (String s : in) {
            String[] p = s.split("," ,2);
                list.add(new SortSpec(p[0], p.length>1? p[1]:"asc"));
        }
        return list;
    }
}

