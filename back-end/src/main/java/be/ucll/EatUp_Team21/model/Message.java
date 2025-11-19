package be.ucll.EatUp_Team21.model;

import java.time.LocalDateTime;

import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;

@Document(collection = "messages")
public class Message {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private String id;

    @NotNull
    private String content;

    private LocalDateTime timestamp;

    @NotNull
    private User author;

    @NotNull
    private Group group;

    private boolean isEdited = false;

    public Message() {
    }

    public Message(@NotNull String content, @NotNull User author, Group group) {
        this.content = content;
        this.timestamp = LocalDateTime.now();
        this.author = author;
        this.group = group;
    }

    public String getId() {
        return id;
    }

    public String getContent() {
        return content;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setContent(String content) {
        this.content = content;
        this.timestamp = LocalDateTime.now();
        this.isEdited = true;
    }
}
