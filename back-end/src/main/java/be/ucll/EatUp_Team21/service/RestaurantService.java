package be.ucll.EatUp_Team21.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import be.ucll.EatUp_Team21.model.Restaurant;
import be.ucll.EatUp_Team21.repository.RestaurantRepository;

@Service
public class RestaurantService {
    
    @Autowired
    private RestaurantRepository restaurantRepository;

    @Autowired
    private UserService userService;

    public List<Restaurant> getAllRestaurants(String email) {
        if(!userService.userExists(email)){
            throw new IllegalArgumentException("Authenticate before sending requests.");
        }
        return restaurantRepository.findAll();
    }
}
