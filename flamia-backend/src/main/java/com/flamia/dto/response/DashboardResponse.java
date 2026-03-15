package com.flamia.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardResponse {
    private long totalOrders;
    private Map<String, Long> ordersByStatus;
    private BigDecimal revenueToday;
    private BigDecimal revenueThisWeek;
    private BigDecimal revenueThisMonth;
    private long pendingUpiVerifications;
    private long totalCustomers;
    private long totalProducts;
    private List<OrderResponse> recentOrders;
}
