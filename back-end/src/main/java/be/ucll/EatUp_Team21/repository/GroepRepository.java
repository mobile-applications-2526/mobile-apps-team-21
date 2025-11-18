package be.ucll.EatUp_Team21.repository;

import org.springframework.data.mongodb.repository.MongoRepository;

import be.ucll.EatUp_Team21.model.Groep;

public interface GroepRepository extends MongoRepository<Groep, String> { 
}
