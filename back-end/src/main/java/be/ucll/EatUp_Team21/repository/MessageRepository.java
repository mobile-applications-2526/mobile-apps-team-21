package be.ucll.EatUp_Team21.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

import be.ucll.EatUp_Team21.model.Message;

public interface MessageRepository extends MongoRepository<Message, String> {
	long countByGroup_IdAndTimestampAfter(String groupId, java.time.LocalDateTime timestamp);
    long countByGroup_IdAndTimestampAfterAndAuthor_IdNot(String groupId, java.time.LocalDateTime timestamp, String authorId);
    List<Message> findByGroupId(String id);
}
