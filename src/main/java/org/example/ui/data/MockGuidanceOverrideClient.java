package org.example.ui.data;

import org.example.ui.model.LayoutPreference;
import org.example.ui.model.OverrideRule;
import org.example.ui.model.PageResponse;
import org.example.ui.model.SortSpec;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;
import org.apache.commons.lang3.StringUtils;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Stream;

@Service
@Profile({"default", "dev"})
public class MockGuidanceOverrideClient implements GuidanceOverrideClient {
    private final List<OverrideRule> data;
    private final Map<String, LayoutPreference> layoutStore = new HashMap<>();

    public MockGuidanceOverrideClient() {
        List<OverrideRule> tmp = new ArrayList<>();
        for (int i = 1; i <= 300; i++) {
            tmp.add(OverrideRule.builder()
                    .id((long) i)
                    .overrideLevel(((i % 9) + 1) * 10)
                    .effectiveDate(LocalDate.now().minusDays(i % 45))
                    .terminationDate(LocalDate.now().plusDays((i % 120) + 1))
                    .customerMarket((i % 2 == 0) ? "North" : "South")
                    .customerCluster((i % 3 == 0) ? "Enterprise" : "SMB")
                    .itemNumber("ITEM-" + (1000 + i))
                    .basePrice(10.0 + (i % 60))
                    .targetMargin(0.10 + ((i % 20) / 100.0))
                    .status((i % 7 == 0) ? "Inactive" : "Active")
                    .build());
        }
        data = List.copyOf(tmp);

//        List<String> defaultCols = List.of("uniqueId", "overrideLevel", "effectiveDate", "terminationDate", "customerSegment", "customerMarket", "customerCluster", "itemNumber", "productSubCategory", "baseMargin", "targetMargin", "premiumMargin", "baseCost", "targetCost", "basePrice", "targetPrice", "premiumPrice", "uom", "reasonCode", "notes", "programId", "dateUpdated", "timeUpdated");
//        layoutStore.put("demo-user", new LayoutPreference(defaultCols, defaultCols));
    }

    private LocalDate parseDate(String s) {
        return LocalDate.parse(s);
    }

    @Override
    public PageResponse<OverrideRule> search(Map<String, String> qbe, List<SortSpec> sorts, int page, int size) {
        Stream<OverrideRule> s = data.stream().filter(r -> {
            boolean ok = true;
            ok &= like(qbe, "customerMarket", r.getCustomerMarket());
            ok &= like(qbe, "customerCluster", r.getCustomerCluster());
            ok &= like(qbe, "customerSegment", r.getCustomerSegment());
            ok &= like(qbe, "itemNumber", r.getItemNumber());
            if (qbe.containsKey("overrideLevel")) try {
                var override = qbe.get("overrideLevel");
                if (StringUtils.startsWith(override, "=")) {
                    var intValue = Integer.parseInt(StringUtils.substring(override, 1));
                    ok &= intValue == r.getOverrideLevel();
                } else if (StringUtils.startsWith(override, "<=")) {
                    var intValue = Integer.parseInt(StringUtils.substring(override, 2));
                    ok &= r.getOverrideLevel() <= intValue;
                } else if (StringUtils.startsWith(override, ">=")) {
                    var intValue = Integer.parseInt(StringUtils.substring(override, 2));
                    ok &= r.getOverrideLevel() >= intValue;
                } else if (StringUtils.startsWith(override, "<")) {
                    var intValue = Integer.parseInt(StringUtils.substring(override, 1));
                    ok &= r.getOverrideLevel() < intValue;
                } else if (StringUtils.startsWith(override, ">")) {
                    var intValue = Integer.parseInt(StringUtils.substring(override, 1));
                    ok &= r.getOverrideLevel() > intValue;
                } else {
                    ok &= Integer.parseInt(qbe.get("overrideLevel")) == r.getOverrideLevel();
                }
            } catch (Exception ignored) {
            }
            if (qbe.containsKey("effectiveDate")) try {
                var input = qbe.get("effectiveDate");
                LocalDate date = r.getEffectiveDate();
                if (input.startsWith(">=")) {
                    LocalDate d = LocalDate.parse(input.substring(2));
                    ok &= date.compareTo(d) >= 0;
                } else if (input.startsWith("<=")) {
                    LocalDate d = LocalDate.parse(input.substring(2));
                    ok &= date.compareTo(d) <= 0;
                } else if (input.startsWith(">")) {
                    LocalDate d = LocalDate.parse(input.substring(1));
                    ok &= date.compareTo(d) > 0;
                } else if (input.startsWith("<")) {
                    LocalDate d = LocalDate.parse(input.substring(1));
                    ok &= date.compareTo(d) < 0;
                } else {
                    LocalDate d = LocalDate.parse(input);
                    ok &= date.compareTo(d) == 0;
                }
            } catch (Exception ignored) {
            }
            return ok;
        });

        Comparator<OverrideRule> cmp = Comparator.comparing(OverrideRule::getId);
        for (SortSpec spec : sorts) {
            Comparator<OverrideRule> c = switch (spec.field()) {
                case "customerMarket" -> Comparator.comparing(OverrideRule::getCustomerMarket, Comparator.nullsLast(String::compareTo));
                case "customerCluster" -> Comparator.comparing(OverrideRule::getCustomerCluster, Comparator.nullsLast(String::compareTo));
                case "itemNumber" -> Comparator.comparing(OverrideRule::getItemNumber, Comparator.nullsLast(String::compareTo));
                case "overrideLevel" -> Comparator.comparing(OverrideRule::getOverrideLevel, Comparator.nullsLast(Integer::compareTo));
                case "effectiveDate" -> Comparator.comparing(OverrideRule::getEffectiveDate, Comparator.naturalOrder());
                case "terminationDate" -> Comparator.comparing(OverrideRule::getTerminationDate, Comparator.naturalOrder());
                case "basePrice" -> Comparator.comparing(OverrideRule::getBasePrice, Comparator.nullsLast(Double::compareTo));
                case "targetMargin" -> Comparator.comparing(OverrideRule::getTargetMargin, Comparator.nullsLast(Double::compareTo));
                case "status" -> Comparator.comparing(OverrideRule::getStatus, Comparator.nullsLast(String::compareTo));
                default -> Comparator.comparing(OverrideRule::getId);
            };
            if ("desc".equalsIgnoreCase(spec.dir())) {
                c = c.reversed();
            }
            cmp = cmp.thenComparing(c);
        }
        List<OverrideRule> sorted = s.sorted(cmp).toList();
        int from = Math.max(page * size, 0), to = Math.min(from + size, sorted.size());
        List<OverrideRule> slice = from >= sorted.size() ? List.of() : sorted.subList(from, to);
        return new PageResponse<>(slice, sorted.size(), page, size);
    }

    @Override
    public OverrideRule getById(Long id) {
        return data.stream().filter(d -> Objects.equals(d.getId(), id)).findFirst().orElse(null);
    }

    @Override
    public OverrideRule save(OverrideRule rule) {
        return rule;
    }

    @Override
    public void saveLayout(String userId, LayoutPreference pref) {
        if (userId == null)
            userId = "demo-user";
        layoutStore.put(userId, pref);
    }

    @Override
    public LayoutPreference getLayout(String userId) {
        if (userId == null)
            userId = "demo-user";
        return layoutStore.get(userId);
    }

    private boolean like(Map<String, String> qbe, String k, String val) {
        if (!qbe.containsKey(k))
            return true;
        return val != null && val.toLowerCase().contains(qbe.get(k).toLowerCase());
    }
}