package com.example.todoapp.service;



import com.example.todoapp.entity.Todo;
import com.example.todoapp.entity.User;
import com.example.todoapp.repository.TodoRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class TodoService {

    private final TodoRepository todoRepository;

    public TodoService(TodoRepository todoRepository) {
        this.todoRepository = todoRepository;
    }

    // Create todo
    public Todo createTodo(Todo todo) {
        return todoRepository.save(todo);
    }

    // Get all todos for a user
    public List<Todo> getTodosByUser(User user) {
        return todoRepository.findByUser(user);
    }

    // Update todo
    public Optional<Todo> updateTodo(Long id, String title, boolean completed, User user) {
        return todoRepository.findById(id).map(todo -> {
            if (!todo.getUser().getId().equals(user.getId())) {
                return null; // not the owner
            }
            todo.setTitle(title);
            todo.setCompleted(completed);
            return todoRepository.save(todo);
        });
    }

    // Delete todo
    public boolean deleteTodo(Long id, User user) {
        return todoRepository.findById(id).map(todo -> {
            if (!todo.getUser().getId().equals(user.getId())) {
                return false; // not the owner
            }
            todoRepository.delete(todo);
            return true;
        }).orElse(false);
    }
}
