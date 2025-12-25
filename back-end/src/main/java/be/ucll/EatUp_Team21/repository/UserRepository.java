package be.ucll.EatUp_Team21.repository;


import org.springframework.data.mongodb.repository.MongoRepository;
import be.ucll.EatUp_Team21.model.User;

public interface UserRepository extends MongoRepository<User, String> {
    User findUserByEmail(String email);
}
