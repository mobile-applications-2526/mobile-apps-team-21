package be.ucll.EatUp_Team21.repository;

import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;

import be.ucll.EatUp_Team21.model.Group;

public interface GroupRepository extends MongoRepository<Group, String> {
    Group findByName(String name);

    Optional<Group> findById(String groupId); 
}
