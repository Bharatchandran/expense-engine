package com.bharat.emitracker.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import com.bharat.emitracker.dto.EmiDTO;
import com.bharat.emitracker.service.EmiService;
import java.util.List;

@RestController
@RequestMapping("/api/emis")
public class EmiController {

    @Autowired
    private EmiService emiService;

    @GetMapping
    public List<EmiDTO> getAllEmis() {
        return emiService.getAllEmis();
    }
    
    @PostMapping
    public EmiDTO createEmi(@RequestBody EmiDTO emiDTO) {
        return emiService.createEmi(emiDTO);
    }
    
    @DeleteMapping("/{id}")
    public void deleteEmi(@PathVariable Long id) {
        emiService.deleteEmi(id);
    }

    @PostMapping("/{id}/pay")
    public EmiDTO payEmi(@PathVariable Long id) {
        return emiService.payEmi(id);
    }

    @PostMapping("/pay-bulk")
    public void payBulk(@RequestBody List<Long> ids) {
        emiService.payBulk(ids);
    }
}
