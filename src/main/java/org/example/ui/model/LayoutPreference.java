package org.example.ui.model;

import java.util.List;
import java.util.stream.Collectors;

public record LayoutPreference(
    String name,
    List<String> visibleColumns,
    List<String> order
) {
    public static final LayoutPreference EMPTY = new LayoutPreference("empty", List.of(), List.of());

    public static LayoutPreference defaultPreference() {
        return new LayoutPreference(
            "default",
            List.of(
                "uniqueId","overrideLevel","effectiveDate","terminationDate","customerSegment",
                "customerMarket","customerCluster","itemNumber","productSubCategory","baseMargin",
                "targetMargin","premiumMargin","baseCost","targetCost","basePrice","targetPrice",
                "premiumPrice","uom","reasonCode","notes","programId","userId","dateUpdated","timeUpdated"
            ),
            List.of()
        );
    }

    public static LayoutPreference fromAny(String name, List<?> visibleColumns, List<?> order) {
        List<String> vc = visibleColumns.stream().map(String::valueOf).collect(Collectors.toList());
        List<String> ord = order.stream().map(String::valueOf).collect(Collectors.toList());
        return new LayoutPreference(name, vc, ord);
    }

    public static LayoutPreference unnamed(List<?> visibleColumns, List<?> order) {
        return fromAny("unnamed", visibleColumns, order);
    }
}
