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
    String customerMarket;
    String customerCluster;
    String customerSegment;
    String itemNumber;
    Double basePrice;
    Double targetMargin;
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
