package be.ucll.EatUp_Team21.repository;

import org.springframework.data.mongodb.repository.MongoRepository;

import be.ucll.EatUp_Team21.model.Bericht;

public interface BerichtRepository extends MongoRepository<Bericht, String> {
}
