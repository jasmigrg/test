package org.example.ui.data;

import org.example.ui.model.LayoutPreference;
import org.example.ui.model.OverrideRule;
import org.example.ui.model.PageResponse;
import org.example.ui.model.SortSpec;

import java.util.List;
import java.util.Map;

public interface GuidanceOverrideClient {

    PageResponse<OverrideRule> search(Map<String, String> qbe, List<SortSpec> sorts, int page, int size);
    OverrideRule getById(Long id);;
    OverrideRule save(OverrideRule rule);
    void saveLayout(String userId, LayoutPreference pref);

    LayoutPreference getLayout(String userId);
    
}
