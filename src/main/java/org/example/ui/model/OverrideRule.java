package org.example.ui.model;

import lombok.Builder;
import lombok.Value;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@Value
@Builder
public class OverrideRule {
    Long id;
    Integer overrideLevel;
    LocalDate effectiveDate;
    LocalDate terminationDate;
    String customerSegment;
    String customerMarket;
    String customerCluster;
    String itemNumber;
    String productSubCategory;
    Double baseMargin;
    Double targetMargin;
    Double premiumMargin;
    Double baseCost;
    Double targetCost;
    Double basePrice;
    Double targetPrice;
    Double premiumPrice;
    String uom;
    String reasonCode;
    String notes;
    String programId;
    String userId;
    LocalDate dateUpdated;
    String timeUpdated;
    String status;

    private static final DateTimeFormatter UI_DATE_FMT =
            DateTimeFormatter.ofPattern("MM/dd/yyyy");

    public String getEffectiveDateFormatted(){
        return effectiveDate != null ? effectiveDate.format(UI_DATE_FMT) : "";
    }

    public String getTerminationDateFormatted(){
        return terminationDate != null ? terminationDate.format(UI_DATE_FMT) : "";
    }
}
