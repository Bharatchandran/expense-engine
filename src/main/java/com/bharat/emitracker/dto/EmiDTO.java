package com.bharat.emitracker.dto;

import java.time.LocalDate;

/**
 * Data Transfer Object for exchanging EmiRecord data with the frontend.
 * This ensures the API payload structure is independent of the DB entity structure.
 */
public class EmiDTO {
    
    private Long id;
    private String name;
    private double principal;
    private double interestRate;
    private int tenureMonths;
    private double monthlyEmi;

    // Tracking Fields
    private LocalDate startDate;
    private Integer explicitCompletedMonths;
    
    // Calculated dynamically
    private int calculatedCompletedMonths;
    private int remainingMonths;
    private double totalAmountPaid;
    private double remainingPrincipal;

    public EmiDTO() {}

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public double getPrincipal() {
        return principal;
    }

    public void setPrincipal(double principal) {
        this.principal = principal;
    }

    public double getInterestRate() {
        return interestRate;
    }

    public void setInterestRate(double interestRate) {
        this.interestRate = interestRate;
    }

    public int getTenureMonths() {
        return tenureMonths;
    }

    public void setTenureMonths(int tenureMonths) {
        this.tenureMonths = tenureMonths;
    }

    public double getMonthlyEmi() {
        return monthlyEmi;
    }

    public void setMonthlyEmi(double monthlyEmi) {
        this.monthlyEmi = monthlyEmi;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public Integer getExplicitCompletedMonths() {
        return explicitCompletedMonths;
    }

    public void setExplicitCompletedMonths(Integer explicitCompletedMonths) {
        this.explicitCompletedMonths = explicitCompletedMonths;
    }

    public int getCalculatedCompletedMonths() {
        return calculatedCompletedMonths;
    }

    public void setCalculatedCompletedMonths(int calculatedCompletedMonths) {
        this.calculatedCompletedMonths = calculatedCompletedMonths;
    }

    public int getRemainingMonths() {
        return remainingMonths;
    }

    public void setRemainingMonths(int remainingMonths) {
        this.remainingMonths = remainingMonths;
    }

    public double getTotalAmountPaid() {
        return totalAmountPaid;
    }

    public void setTotalAmountPaid(double totalAmountPaid) {
        this.totalAmountPaid = totalAmountPaid;
    }

    public double getRemainingPrincipal() {
        return remainingPrincipal;
    }

    public void setRemainingPrincipal(double remainingPrincipal) {
        this.remainingPrincipal = remainingPrincipal;
    }
}
