package be.ucll.EatUp_Team21.repository;

import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import be.ucll.EatUp_Team21.model.GroupVisit;

@Repository
public interface GroupVisitRepository extends MongoRepository<GroupVisit, String> {
    
    // Find all visits for a specific group
    List<GroupVisit> findByGroup_Id(String groupId);
    
    // Find all visits for a specific restaurant
    List<GroupVisit> findByRestaurant_Id(String restaurantId);
    
    // Find visit by group and restaurant
    GroupVisit findByGroup_IdAndRestaurant_Id(String groupId, String restaurantId);
}
