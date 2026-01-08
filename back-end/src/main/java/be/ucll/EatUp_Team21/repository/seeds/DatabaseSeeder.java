package be.ucll.EatUp_Team21.repository.seeds;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Random;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import be.ucll.EatUp_Team21.model.Group;
import be.ucll.EatUp_Team21.model.GroupVisit;
import be.ucll.EatUp_Team21.model.Message;
import be.ucll.EatUp_Team21.model.User;
import be.ucll.EatUp_Team21.model.SuggestedRestaurant;
import be.ucll.EatUp_Team21.repository.GroupRepository;
import be.ucll.EatUp_Team21.repository.GroupVisitRepository;
import be.ucll.EatUp_Team21.repository.MessageRepository;
import be.ucll.EatUp_Team21.repository.UserRepository;
import be.ucll.EatUp_Team21.repository.RestaurantRepository;
import be.ucll.EatUp_Team21.repository.RestRelRepository;
import be.ucll.EatUp_Team21.repository.SuggestedRestaurantRepository;
import be.ucll.EatUp_Team21.model.Restaurant;
import be.ucll.EatUp_Team21.model.RestRel;
import java.time.LocalDate;

@Component
public class DatabaseSeeder implements CommandLineRunner {

	private final UserRepository userRepository;
	private final GroupRepository groupRepository;
	private final MessageRepository messageRepository;
	private final RestaurantRepository restaurantRepository;
	private final RestRelRepository restRelRepository;
	private final GroupVisitRepository groupVisitRepository;
	private final SuggestedRestaurantRepository suggestedRestaurantRepository;

	private static final Logger logger = LoggerFactory.getLogger(DatabaseSeeder.class);

	public DatabaseSeeder(UserRepository userRepository, GroupRepository groupRepository,
			MessageRepository messageRepository, RestaurantRepository restaurantRepository, 
			RestRelRepository restRelRepository, GroupVisitRepository groupVisitRepository,
			SuggestedRestaurantRepository suggestedRestaurantRepository) {
		this.userRepository = userRepository;
		this.groupRepository = groupRepository;
		this.messageRepository = messageRepository;
		this.restaurantRepository = restaurantRepository;
		this.restRelRepository = restRelRepository;
		this.groupVisitRepository = groupVisitRepository;
		this.suggestedRestaurantRepository = suggestedRestaurantRepository;
	}

	/**
	 * Clear all data from the database
	 */
	public void clearAll() {
		logger.info("Clearing all data from database...");
		groupVisitRepository.deleteAll();
		restRelRepository.deleteAll();
		messageRepository.deleteAll();
		suggestedRestaurantRepository.deleteAll();
		groupRepository.deleteAll();
		restaurantRepository.deleteAll();
		userRepository.deleteAll();
		logger.info("All data cleared.");
	}

	/**
	 * Seed all data - can be called from TestController or at startup
	 */
	public void seedAll() {
		logger.info("Seeding database with initial data...");

		List<User> users = seedUsers();
		List<Group> groups = seedGroups();
		assignUsersToGroups(users, groups);
		seedMessages(groups);
		List<Restaurant> restaurants = seedRestaurants();
		seedRestRels(users, restaurants);
		seedGroupVisits(groups, restaurants);
		seedSuggestedRestaurants(groups, restaurants, users);

		logger.info("Database seeding completed successfully!");
	}

	@Override
	public void run(String... args) throws Exception {
		clearAll();
		seedAll();
	}

	// ==================== Public Seeding Methods ====================

	public List<User> seedUsers() {
		BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(10);

		List<User> users = new ArrayList<>();
		String[][] sample = new String[][] {
				{ "Smith", "John" },
				{ "Doe", "Jane" },
				{ "Brown", "Charlie" },
				{ "Johnson", "Emma" },
				{ "Miller", "Liam" },
				{ "Davis", "Olivia" }
		};
		for (String[] s : sample) {
			String name = s[0];
			String firstName = s[1];
			String email = String.format("%s.%s@example.com", firstName, name).toLowerCase(Locale.ROOT);
			String rawPassword = "password123";
			String hashed = encoder.encode(rawPassword);
			User u = new User(name, firstName, null, email, hashed);
			u.setGroups(new ArrayList<>());
			users.add(u);
		}
		users = userRepository.saveAll(users);
		logger.info("Seeded {} users", users.size());
		return users;
	}

	public List<Group> seedGroups() {
		List<Group> groups = new ArrayList<>();
		String[] groupNames = new String[] { "Avondeten", "Lunchclub", "Weekendplans", "Projectgroep" };
		for (String gname : groupNames) {
			Group g = new Group(gname);
			g.setMembers(new ArrayList<>());
			groups.add(g);
		}
		groups = groupRepository.saveAll(groups);
		logger.info("Seeded {} groups", groups.size());
		return groups;
	}

	public void assignUsersToGroups(List<User> users, List<Group> groups) {
		Random rnd = new Random(42);
		
		// Find the test user (john.smith@example.com) - always should be in groups for Cypress tests
		User testUser = users.stream()
			.filter(u -> "john.smith@example.com".equals(u.getEmail()))
			.findFirst()
			.orElse(users.get(0));
		
		for (int gi = 0; gi < groups.size(); gi++) {
			Group g = groups.get(gi);
			List<User> members = new ArrayList<>();
			
			// Always add test user to the first two groups for reliable testing
			if (gi < 2) {
				members.add(testUser);
			}
			
			int number = 2 + rnd.nextInt(users.size() - 1);
			for (int i = 0; i < number; i++) {
				User u = users.get(rnd.nextInt(users.size()));
				if (!members.contains(u)) {
					members.add(u);
				}
			}
			g.setMembers(members);
			groupRepository.save(g);
		}
		
		// Update users' group lists
		for (User u : users) {
			List<Group> userGroups = new ArrayList<>();
			for (Group g : groups) {
				if (g.getMembers().contains(u)) {
					userGroups.add(g);
				}
			}
			u.setGroups(userGroups);
			userRepository.save(u);
		}
	}

	public void seedMessages(List<Group> groups) {
		Random rnd = new Random(42);
		List<Message> messages = new ArrayList<>();
		for (Group g : groups) {
			List<User> members = g.getMembers();
			if (members == null || members.isEmpty()) {
				continue;
			}
			int msgCount = 3 + rnd.nextInt(5);
			for (int i = 0; i < msgCount; i++) {
				User author = members.get(rnd.nextInt(members.size()));
				String content = String.format("Message %d in %s from %s %s", i + 1, g.getName(),
						author.getFirstName(), author.getName());
				Message m = new Message(content, author, g);
				messages.add(m);
			}
		}
		messageRepository.saveAll(messages);
		logger.info("Seeded {} messages", messages.size());
	}

	public List<Restaurant> seedRestaurants() {
		List<Restaurant> restaurants = new ArrayList<>();
		restaurants.add(new Restaurant("Sushi Bar Osaka", "Naamsestraat 45, Ghent", "09-123456", "Fresh sushi and sashimi with a modern interior and omakase options."));
		restaurants.add(new Restaurant("La Piazza Italiana", "Grote Markt 12, Antwerp", "03-654321", "Authentic Italian pasta, fresh sauces and a curated wine list."));
		restaurants.add(new Restaurant("Thai Garden", "Bondgenotenlaan 8, Leuven", "016-987654", "Spicy Thai curries, pad thai and traditional dishes."));
		restaurants.add(new Restaurant("De Gouden Lepel", "Kerkstraat 12, Leuven", "016-123456", "Cozy Belgian bistro with classic regional dishes."));
		restaurants.add(new Restaurant("Le Marché", "Mechelsestraat 22, Leuven", "016-111222", "Market-style small plates focused on seasonal ingredients."));
		restaurants.add(new Restaurant("Curry Corner", "Tiensestraat 3, Leuven", "016-333444", "Spicy Indian curries, vegetarian-friendly menu and house-made naan."));
		restaurants.add(new Restaurant("El Toro Loco", "Diestsestraat 15, Leuven", "016-555666", "Mexican tacos, burritos and margaritas in a vibrant setting."));
		restaurants.add(new Restaurant("Chez Pierre", "Vismarkt 8, Brussels", "02-777888", "Classic French cuisine with seasonal tasting menus."));
		restaurants = restaurantRepository.saveAll(restaurants);
		logger.info("Seeded {} restaurants", restaurants.size());
		return restaurants;
	}

	public void seedRestRels(List<User> users, List<Restaurant> restaurants) {
		Random rnd = new Random(42);
		List<RestRel> restRels = new ArrayList<>();
		
		if (users.isEmpty() || restaurants.isEmpty()) return;
		
		for (User u : users) {
			int visitedCount = 1 + rnd.nextInt(3);
			for (int i = 0; i < visitedCount; i++) {
				Restaurant r = restaurants.get(rnd.nextInt(restaurants.size()));
				RestRel rr = new RestRel(u, r);
				rr.setVisitDate(LocalDate.now().minusDays(rnd.nextInt(365)));
				if (rnd.nextDouble() < 0.7) {
					rr.setRating((float) (3 + rnd.nextInt(3)));
				}
				if (rnd.nextBoolean()) {
					rr.setFavorite(true);
				}
				restRels.add(rr);
			}
		}
		List<RestRel> savedRestRels = restRelRepository.saveAll(restRels);

		for (User u : users) {
			List<RestRel> userRels = new ArrayList<>();
			for (RestRel rr : savedRestRels) {
				if (rr.getUser().getId().equals(u.getId())) {
					userRels.add(rr);
				}
			}
			u.setRestaurantRelations(userRels);
			userRepository.save(u);
		}
		logger.info("Seeded {} restaurant relations", savedRestRels.size());
	}

	public void seedGroupVisits(List<Group> groups, List<Restaurant> restaurants) {
		Random rnd = new Random(42);
		String[] cuisines = { "Japanese", "Italian", "Thai", "Belgian", "French", "Indian", "Mexican" };
		String[] payerNames = { "John", "Jane", "Charlie", "Emma", "Liam", "Olivia", "Lisa", "Tom" };
		List<GroupVisit> groupVisits = new ArrayList<>();
		
		if (groups.isEmpty() || restaurants.isEmpty()) return;
		
		for (Group group : groups) {
			int visitCount = 1 + rnd.nextInt(3);
			for (int i = 0; i < visitCount; i++) {
				Restaurant restaurant = restaurants.get(rnd.nextInt(restaurants.size()));
				LocalDate visitDate = LocalDate.now().minusDays(5 + rnd.nextInt(175));
				GroupVisit visit = new GroupVisit(group, restaurant, visitDate);
				String cuisine = cuisines[rnd.nextInt(cuisines.length)];
				if (restaurant.getName().toLowerCase().contains("sushi")) cuisine = "Japanese";
				else if (restaurant.getName().toLowerCase().contains("italian") || restaurant.getName().toLowerCase().contains("piazza")) cuisine = "Italian";
				else if (restaurant.getName().toLowerCase().contains("thai")) cuisine = "Thai";
				else if (restaurant.getName().toLowerCase().contains("curry") || restaurant.getName().toLowerCase().contains("indian")) cuisine = "Indian";
				else if (restaurant.getName().toLowerCase().contains("mexican") || restaurant.getName().toLowerCase().contains("toro")) cuisine = "Mexican";
				else if (restaurant.getName().toLowerCase().contains("pierre") || restaurant.getName().toLowerCase().contains("marché")) cuisine = "French";
				else if (restaurant.getName().toLowerCase().contains("gouden") || restaurant.getName().toLowerCase().contains("belgian")) cuisine = "Belgian";
				visit.setCuisine(cuisine);
				if (rnd.nextDouble() < 0.7) {
					double price = 50 + rnd.nextDouble() * 150;
					price = Math.round(price * 100.0) / 100.0;
					visit.setTotalPrice(price);
					String payerName = payerNames[rnd.nextInt(payerNames.length)];
					visit.setPaidByName(payerName);
					visit.setPaidByEmail(payerName.toLowerCase() + "@example.com");
				}
				groupVisits.add(visit);
			}
		}
		groupVisitRepository.saveAll(groupVisits);
		logger.info("Seeded {} group visits", groupVisits.size());
	}

	/**
	 * Seed suggested restaurants for groups
	 * Creates restaurant recommendations with various states:
	 * - Regular suggestion (can be voted on)
	 * - Suggestion with votes from multiple members
	 * - Closed suggestion (ready for availability picking)
	 * - Suggestion recommended by the test user (john.smith@example.com)
	 */
	public void seedSuggestedRestaurants(List<Group> groups, List<Restaurant> restaurants, List<User> users) {
		if (groups.isEmpty() || restaurants.isEmpty() || users.isEmpty()) return;

		// Find the test user (john.smith@example.com) - this is the user used in Cypress tests
		User testUser = users.stream()
			.filter(u -> "john.smith@example.com".equals(u.getEmail()))
			.findFirst()
			.orElse(users.get(0));

		int suggestionCount = 0;

		for (Group group : groups) {
			List<User> members = group.getMembers();
			if (members == null || members.isEmpty()) continue;

			// Check if test user is a member of this group
			boolean testUserInGroup = members.stream()
				.anyMatch(m -> m.getEmail().equals(testUser.getEmail()));

			List<SuggestedRestaurant> groupSuggestions = new ArrayList<>();

			// Add 1-2 suggestions per group
			int suggestionsForGroup = 1 + (suggestionCount % 2);
			
			for (int i = 0; i < suggestionsForGroup && i < restaurants.size(); i++) {
				Restaurant restaurant = restaurants.get((suggestionCount + i) % restaurants.size());
				
				// Determine recommender - make sure test user recommends at least one
				User recommender;
				if (testUserInGroup && i == 0) {
					// First suggestion in groups where test user is member - recommended by test user
					recommender = testUser;
				} else {
					// Other suggestions - recommended by a random member
					recommender = members.get(i % members.size());
				}

				SuggestedRestaurant suggestion = new SuggestedRestaurant(restaurant, recommender.getEmail());
				
				// Add votes - make sure some suggestions have enough votes to be "closed"
				int voteCount = i == 0 ? Math.max(2, (members.size() / 2) + 1) : 1;
				for (int v = 0; v < Math.min(voteCount, members.size()); v++) {
					suggestion.addVoter(members.get(v).getEmail());
				}

				// If more than half voted, mark as closed (for availability picking)
				if (suggestion.getVoters().size() > members.size() / 2) {
					suggestion.setClosed(true);
				}

				// Save the suggestion first to get an ID
				suggestion = suggestedRestaurantRepository.save(suggestion);
				groupSuggestions.add(suggestion);
				suggestionCount++;
			}

			// Update the group with its suggestions
			group.setSuggestedRestaurants(groupSuggestions);
			groupRepository.save(group);
		}

		logger.info("Seeded {} suggested restaurants across groups", suggestionCount);
	}
}