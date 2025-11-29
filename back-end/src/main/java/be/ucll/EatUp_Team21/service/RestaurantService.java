package be.ucll.EatUp_Team21.service;

import java.util.List;
import java.util.Optional;

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

    public boolean restaurantexistsById(String restId) {
        return restaurantRepository.findById(restId).isPresent();
    }

    public Restaurant getRestaurantById(String restId) {
        Optional<Restaurant> res = restaurantRepository.findById(restId);
        if(res.isPresent())
            return res.get();
        throw new IllegalArgumentException("Error retrieving optional restaurant.");
    }
}
