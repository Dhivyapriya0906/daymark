package com.taskmanager.dto; import com.taskmanager.enums.*; import jakarta.validation.constraints.*; import java.time.LocalDate;
public record TaskRequest(@NotBlank @Size(max=160) String title,@Size(max=4000) String description,@FutureOrPresent LocalDate dueDate,@NotNull TaskStatus status,@NotNull TaskPriority priority){}
