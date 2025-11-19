package be.ucll.EatUp_Team21.repository;

import org.springframework.data.mongodb.repository.MongoRepository;

import be.ucll.EatUp_Team21.model.RestRel;

public interface RestRelRepository extends MongoRepository<RestRel, String> {
    
}
