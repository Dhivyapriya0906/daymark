package com.taskmanager.service;

import com.taskmanager.entity.User;
import com.taskmanager.repository.TaskRepository;
import com.taskmanager.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.Test;
import java.util.Optional;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class TaskServiceTest {
    @Test void lookupUsesAuthenticatedOwnersIdAndReturnsNotFoundForUnownedTask() {
        TaskRepository tasks = mock(TaskRepository.class);
        UserRepository users = mock(UserRepository.class);
        User owner = mock(User.class);
        when(owner.getId()).thenReturn(42L);
        when(users.findByEmail("person@example.com")).thenReturn(Optional.of(owner));
        when(tasks.findByIdAndOwnerId(9L, 42L)).thenReturn(Optional.empty());

        TaskService service = new TaskService(tasks, users);
        assertThrows(EntityNotFoundException.class, () -> service.get("person@example.com", 9L));
        verify(tasks).findByIdAndOwnerId(9L, 42L);
        verify(tasks, never()).findById(9L);
    }
}
