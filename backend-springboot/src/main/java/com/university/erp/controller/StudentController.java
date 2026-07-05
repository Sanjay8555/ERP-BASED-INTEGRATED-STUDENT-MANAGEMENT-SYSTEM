package com.university.erp.controller;

import com.university.erp.dto.StudentDto;
import com.university.erp.model.Student;
import com.university.erp.service.StudentService;
import com.university.erp.dto.ResponseEnvelope;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/students")
@RequiredArgsConstructor
@Slf4j
public class StudentController {

    private final StudentService studentService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY', 'ACCOUNTANT', 'LIBRARIAN')")
    public ResponseEntity<ResponseEnvelope<List<StudentDto>>> getAllStudents(
            @RequestParam(required = false) String departmentId) {
        log.info("Fetching all students with departmentId: {}", departmentId);
        List<StudentDto> students = studentService.getAllStudents(departmentId);
        return ResponseEntity.ok(ResponseEnvelope.success(students, "Student profiles retrieved."));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY', 'STUDENT', 'PARENT')")
    public ResponseEntity<ResponseEnvelope<StudentDto>> getStudentById(@PathVariable String id) {
        log.info("Request to fetch student by ID: {}", id);
        StudentDto student = studentService.getStudentById(id);
        return ResponseEntity.ok(ResponseEnvelope.success(student, "Profile successfully loaded."));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ResponseEnvelope<StudentDto>> registerStudent(@Valid @RequestBody StudentDto studentDto) {
        log.info("Registering new student: {}", studentDto.getRollNo());
        StudentDto created = studentService.registerStudent(studentDto);
        return new ResponseEntity<>(
                ResponseEnvelope.success(created, "Student account created successfully."),
                HttpStatus.CREATED
        );
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ResponseEnvelope<StudentDto>> updateStudent(
            @PathVariable String id,
            @Valid @RequestBody StudentDto studentDto) {
        log.info("Updating student ID: {}", id);
        StudentDto updated = studentService.updateStudent(id, studentDto);
        return ResponseEntity.ok(ResponseEnvelope.success(updated, "Profile successfully modified."));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ResponseEnvelope<Void>> deleteStudent(@PathVariable String id) {
        log.warn("Deleting student profile with ID: {}", id);
        studentService.deleteStudent(id);
        return ResponseEntity.ok(ResponseEnvelope.emptySuccess("Student record permanently erased."));
    }
}
