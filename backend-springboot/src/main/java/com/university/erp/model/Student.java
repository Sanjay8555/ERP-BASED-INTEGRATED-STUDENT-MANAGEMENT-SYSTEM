package com.university.erp.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "students")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Student {

    @Id
    @Column(length = 50)
    private String id;

    @OneToOne(fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @JoinColumn(name = "user_id", referencedColumnName = "id", nullable = false)
    private User user;

    @NotBlank(message = "Roll number is mandatory")
    @Column(name = "roll_no", unique = true, nullable = false, length = 30)
    private String rollNo;

    @NotBlank(message = "Batch is mandatory")
    @Column(nullable = false, length = 20)
    private String batch;

    @Min(value = 1, message = "Semester must be at least 1")
    @Max(value = 8, message = "Semester cannot exceed 8")
    @Column(name = "current_semester", nullable = false)
    private Integer currentSemester;

    @DecimalMin(value = "0.00")
    @DecimalMax(value = "10.00")
    private Double cgpa;

    @NotBlank(message = "Phone number is mandatory")
    @Column(nullable = false, length = 20)
    private String phone;

    @NotBlank(message = "Parent name is mandatory")
    @Column(name = "parent_name", nullable = false, length = 100)
    private String parentName;

    @NotBlank(message = "Parent contact phone is mandatory")
    @Column(name = "parent_phone", nullable = false, length = 20)
    private String parentPhone;

    @Email(message = "Invalid email format")
    @NotBlank(message = "Parent email is mandatory")
    @Column(name = "parent_email", nullable = false, length = 100)
    private String parentEmail;

    @Lob
    @Column(nullable = false)
    private String address;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id", nullable = false)
    private Department department;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
