package com.bharat.emitracker.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.bharat.emitracker.entity.EmiRecord;

@Repository
public interface EmiRepository extends JpaRepository<EmiRecord, Long> {
}
