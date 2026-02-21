package com.bharat.emitracker.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.bharat.emitracker.entity.EmiRecord;
import com.bharat.emitracker.dto.EmiDTO;
import com.bharat.emitracker.repository.EmiRepository;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class EmiService {

    @Autowired
    private EmiRepository emiRepository;

    /**
     * Retrieves all EMIs and converts them to DTOs with dynamic fields calculated.
     */
    public List<EmiDTO> getAllEmis() {
        return emiRepository.findAll().stream()
                .map(this::mapToDTOAndCalculate)
                .collect(Collectors.toList());
    }

    /**
     * Calculates the baseline EMI values, saves to the DB, and returns the calculated DTO.
     */
    public EmiDTO createEmi(EmiDTO dto) {
        EmiRecord entity = mapToEntity(dto);
        
        // Simple formula for EMI calculation
        // EMI = P * r * (1 + r)^n / ((1 + r)^n - 1)
        if (entity.getPrincipal() > 0 && entity.getInterestRate() > 0 && entity.getTenureMonths() > 0) {
            double r = (entity.getInterestRate() / 12) / 100;
            double p = entity.getPrincipal();
            int n = entity.getTenureMonths();
            
            double monthlyEmi = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
            entity.setMonthlyEmi(Math.round(monthlyEmi * 100.0) / 100.0);
        } else {
            entity.setMonthlyEmi(0);
        }
        
        EmiRecord savedEntity = emiRepository.save(entity);
        return mapToDTOAndCalculate(savedEntity);
    }

    /**
     * Deletes an EMI record by ID.
     */
    public void deleteEmi(Long id) {
        emiRepository.deleteById(id);
    }

    /**
     * Increments the completed months for a specific EMI.
     */
    public EmiDTO payEmi(Long id) {
        EmiRecord entity = emiRepository.findById(id).orElseThrow(() -> new RuntimeException("EMI not found"));
        EmiDTO dto = mapToDTOAndCalculate(entity);
        
        int currentCompleted = dto.getCalculatedCompletedMonths();
        if (currentCompleted < entity.getTenureMonths()) {
            entity.setExplicitCompletedMonths(currentCompleted + 1);
            entity = emiRepository.save(entity);
        }
        
        return mapToDTOAndCalculate(entity);
    }

    /**
     * Increments the completed months for multiple EMIs.
     */
    public void payBulk(List<Long> ids) {
        if (ids != null) {
            ids.forEach(this::payEmi);
        }
    }

    /**
     * Maps an EmiRecord entity to an EmiDTO and dynamically calculates real-time tracking fields.
     */
    private EmiDTO mapToDTOAndCalculate(EmiRecord entity) {
        EmiDTO dto = new EmiDTO();
        dto.setId(entity.getId());
        dto.setName(entity.getName());
        dto.setPrincipal(entity.getPrincipal());
        dto.setInterestRate(entity.getInterestRate());
        dto.setTenureMonths(entity.getTenureMonths());
        dto.setMonthlyEmi(entity.getMonthlyEmi());
        dto.setStartDate(entity.getStartDate());
        dto.setExplicitCompletedMonths(entity.getExplicitCompletedMonths());
        
        if (dto.getMonthlyEmi() <= 0) return dto;

        // Calculate completed months
        int completed = 0;
        if (dto.getExplicitCompletedMonths() != null) {
            completed = dto.getExplicitCompletedMonths();
        } else if (dto.getStartDate() != null) {
            LocalDate now = LocalDate.now();
            if (now.isAfter(dto.getStartDate())) {
                completed = (int) ChronoUnit.MONTHS.between(dto.getStartDate(), now);
            }
        }
        
        // Cap completed months at tenure
        if (completed > dto.getTenureMonths()) {
            completed = dto.getTenureMonths();
        }
        
        dto.setCalculatedCompletedMonths(completed);
        
        int remainingMonths = dto.getTenureMonths() - completed;
        dto.setRemainingMonths(remainingMonths);
        
        double totalPaid = completed * dto.getMonthlyEmi();
        dto.setTotalAmountPaid(Math.round(totalPaid * 100.0) / 100.0);
        
        // Calculate remaining principal using Amortization formula B = P * [(1+r)^n - (1+r)^p] / [(1+r)^n - 1]
        double p = dto.getPrincipal();
        double r = (dto.getInterestRate() / 12) / 100;
        int n = dto.getTenureMonths();
        
        if (r > 0 && n > 0) {
            double rn = Math.pow(1 + r, n);
            double rp = Math.pow(1 + r, completed);
            double remainingBal = p * (rn - rp) / (rn - 1);
            if (remainingBal < 0) remainingBal = 0;
            dto.setRemainingPrincipal(Math.round(remainingBal * 100.0) / 100.0);
        } else {
            dto.setRemainingPrincipal(0);
        }
        
        return dto;
    }

    /**
     * Maps an incoming EmiDTO back to an EmiRecord entity for saving to the DB.
     */
    private EmiRecord mapToEntity(EmiDTO dto) {
        EmiRecord entity = new EmiRecord();
        entity.setId(dto.getId());
        entity.setName(dto.getName());
        entity.setPrincipal(dto.getPrincipal());
        entity.setInterestRate(dto.getInterestRate());
        entity.setTenureMonths(dto.getTenureMonths());
        entity.setMonthlyEmi(dto.getMonthlyEmi());
        entity.setStartDate(dto.getStartDate());
        entity.setExplicitCompletedMonths(dto.getExplicitCompletedMonths());
        return entity;
    }
}
