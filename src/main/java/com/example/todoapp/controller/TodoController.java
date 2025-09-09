package com.example.todoapp.controller;

import com.example.todoapp.dto.TodoDto;
import com.example.todoapp.entity.Todo;
import com.example.todoapp.entity.User;
import com.example.todoapp.repository.TodoRepository;
import com.example.todoapp.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/todos")
@CrossOrigin(origins = "*")
public class TodoController {

    @Autowired
    private TodoRepository todoRepository;

    @Autowired
    private UserRepository userRepository;

    // ✅ Get all todos for logged-in user
    @GetMapping
    public ResponseEntity<List<TodoDto>> getAllTodos(Authentication authentication) {
        String username = authentication.getName();
        Optional<User> user = userRepository.findByUsername(username);

        if (user.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        List<TodoDto> todos = todoRepository.findByUser(user.get())
                .stream()
                .map(todo -> new TodoDto(todo.getId(), todo.getTitle(), todo.isCompleted()))
                .toList();

        return ResponseEntity.ok(todos);
    }
    @GetMapping("/{id}")
    public ResponseEntity<?> getTodoById(@PathVariable Long id, Authentication authentication) {
        String username = authentication.getName();
        Optional<User> user = userRepository.findByUsername(username);

        if (user.isEmpty()) {
            return ResponseEntity.badRequest().body("User not found!");
        }

        Optional<Todo> todoOptional = todoRepository.findById(id);

        if (todoOptional.isEmpty() || !todoOptional.get().getUser().equals(user.get())) {
            return ResponseEntity.status(403).body("Not allowed to access this todo!");
        }

        Todo todo = todoOptional.get();
        TodoDto todoDto = new TodoDto(todo.getId(), todo.getTitle(), todo.isCompleted());
        return ResponseEntity.ok(todoDto);
    }
    // ✅ Create a todo
    @PostMapping
    public ResponseEntity<TodoDto> createTodo(@RequestBody TodoDto todoDto, Authentication authentication) {
        String username = authentication.getName();
        Optional<User> user = userRepository.findByUsername(username);

        if (user.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        Todo todo = new Todo();
        todo.setTitle(todoDto.getTitle());
        todo.setCompleted(todoDto.isCompleted());
        todo.setUser(user.get());

        Todo savedTodo = todoRepository.save(todo);
        return ResponseEntity.ok(new TodoDto(savedTodo.getId(), savedTodo.getTitle(), savedTodo.isCompleted()));
    }

    // ✅ Update a todo
    @PutMapping("/{id}")
    public ResponseEntity<?> updateTodo(@PathVariable Long id,
                                        @RequestBody TodoDto todoRequest,
                                        Authentication authentication) {
        String username = authentication.getName();
        Optional<User> user = userRepository.findByUsername(username);

        if (user.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        Optional<Todo> todoOptional = todoRepository.findById(id);

        if (todoOptional.isEmpty() || !todoOptional.get().getUser().equals(user.get())) {
            return ResponseEntity.status(403).body("Not allowed to update this todo!");
        }

        Todo todo = todoOptional.get();
        todo.setTitle(todoRequest.getTitle());
        todo.setCompleted(todoRequest.isCompleted());
        todoRepository.save(todo);

        return ResponseEntity.ok(new TodoDto(todo.getId(), todo.getTitle(), todo.isCompleted()));
    }

    // ✅ Delete a todo
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTodo(@PathVariable Long id, Authentication authentication) {
        String username = authentication.getName();
        Optional<User> user = userRepository.findByUsername(username);

        if (user.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        Optional<Todo> todoOptional = todoRepository.findById(id);

        if (todoOptional.isEmpty() || !todoOptional.get().getUser().equals(user.get())) {
            return ResponseEntity.status(403).body("Not allowed to delete this todo!");
        }

        todoRepository.delete(todoOptional.get());
        return ResponseEntity.ok("Todo deleted successfully!");
    }
}
