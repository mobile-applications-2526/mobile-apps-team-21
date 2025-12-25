package be.ucll.EatUp_Team21.controller;

import org.springframework.web.bind.annotation.RestController;

import be.ucll.EatUp_Team21.model.Restaurant;
import be.ucll.EatUp_Team21.service.RestaurantService;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.GetMapping;



@RestController
@RequestMapping("/restaurants")
public class RestaurantController {
    
    @Autowired
    private RestaurantService restaurantService;

    @GetMapping()
    public List<Restaurant> getAllRestaurants(Authentication auth) {
        return restaurantService.getAllRestaurants(auth.getName());
    }
    
}
