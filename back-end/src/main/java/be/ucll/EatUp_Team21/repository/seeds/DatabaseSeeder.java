package be.ucll.EatUp_Team21.repository.seeds;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Random;
import java.time.LocalDateTime;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import be.ucll.EatUp_Team21.model.Group;
import be.ucll.EatUp_Team21.model.Message;
import be.ucll.EatUp_Team21.model.RestRel;
import be.ucll.EatUp_Team21.model.User;
import be.ucll.EatUp_Team21.repository.GroupRepository;
import be.ucll.EatUp_Team21.repository.MessageRepository;
import be.ucll.EatUp_Team21.repository.RestRelRepository;
import be.ucll.EatUp_Team21.repository.UserRepository;
import be.ucll.EatUp_Team21.repository.RestaurantRepository;
import be.ucll.EatUp_Team21.model.Restaurant;

@Component
public class DatabaseSeeder implements CommandLineRunner {

	private final UserRepository userRepository;
	private final GroupRepository groupRepository;
	private final MessageRepository messageRepository;
	private final RestaurantRepository restaurantRepository;
	private final RestRelRepository restRelRepository;

	private static final Logger logger = LoggerFactory.getLogger(DatabaseSeeder.class);

	public DatabaseSeeder(UserRepository userRepository, GroupRepository groupRepository,
			MessageRepository messageRepository, RestaurantRepository restaurantRepository,
			RestRelRepository restRelRepository) {
		this.userRepository = userRepository;
		this.groupRepository = groupRepository;
		this.messageRepository = messageRepository;
		this.restaurantRepository = restaurantRepository;
		this.restRelRepository = restRelRepository;
	}

	@Override
	public void run(String... args) throws Exception {

		BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(10);

		// seed users only when none exist
		if (userRepository.count() == 0) {
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
		} else {
			logger.info("Users already present, skipping user seeding");
		}

		// create groups only when none exist
		List<Group> groups = new ArrayList<>();
		if (groupRepository.count() == 0) {
			String[] groupNames = new String[] { "Avondeten", "Lunchclub", "Weekendplans", "Projectgroep" };
			for (String gname : groupNames) {
				Group g = new Group(gname);
				g.setMembers(new ArrayList<>());
				groups.add(g);
			}

			groups = groupRepository.saveAll(groups);

			// randomly assign users to groups
			Random rnd = new Random(42);
			List<User> users = userRepository.findAll();
			for (Group g : groups) {
				List<User> members = new ArrayList<>();
				int number = 1 + rnd.nextInt(users.size());
				for (int i = 0; i < number; i++) {
					User u = users.get(rnd.nextInt(users.size()));
					if (!members.contains(u)) {
						members.add(u);
						// ensure user's groups list is initialized
						if (u.getGroups() == null) {
							u.setGroups(new ArrayList<>());
						}
						u.getGroups().add(g);
					}
				}
				g.setMembers(members);
				groupRepository.save(g);
			}

			// save updated users (with their groups)
			userRepository.saveAll(userRepository.findAll());
		} else {
			logger.info("Groups already present, skipping group seeding");
		}

		// create some messages for each group if none exist
		if (messageRepository.count() == 0) {
			Random rnd = new Random(42);
			List<Message> messages = new ArrayList<>();
			for (Group g : groupRepository.findAll()) {
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
		} else {
			logger.info("Messages already present, skipping message seeding");
		}

		// seed some mock restaurants if none exist
		try {
			if (restaurantRepository.count() == 0) {
				List<Restaurant> restaurants = new ArrayList<>();
				restaurants.add(new Restaurant("De Gouden Lepel", "Kerkstraat 12, Leuven", "016-123456", "Cozy Belgian bistro with classic regional dishes."));
				restaurants.add(new Restaurant("Pasta Bella", "Stationsstraat 3, Leuven", "016-654321", "Authentic Italian pasta, fresh sauces and a curated wine list."));
				restaurants.add(new Restaurant("Sushi Hana", "Tiensestraat 45, Leuven", "016-987654", "Fresh sushi and sashimi with a modern interior and omakase options."));
				restaurants.add(new Restaurant("Le Marché", "Mechelsestraat 22, Leuven", "016-111222", "Market-style small plates focused on seasonal ingredients."));
				restaurants.add(new Restaurant("Curry Corner", "Bondgenotenlaan 8, Leuven", "016-333444", "Spicy Indian curries, vegetarian-friendly menu and house-made naan."));
				restaurantRepository.saveAll(restaurants);
				logger.info("Seeded {} restaurants", restaurants.size());
			} else {
				logger.info("Restaurants already present, skipping restaurant seeding");
			}
		} catch (Exception ex) {
			// don't fail seeding overall if restaurants can't be saved; log warning
			logger.warn("Failed to seed restaurants: {}", ex.getMessage());
		}

		// seed restaurant relations (visited and favorites) for each user
		try {
			if (restRelRepository.count() == 0) {
				List<User> users = userRepository.findAll();
				List<Restaurant> restaurants = restaurantRepository.findAll();
				
				if (!users.isEmpty() && !restaurants.isEmpty()) {
					Random rnd = new Random(42);
					
					for (User user : users) {
						List<RestRel> userRelations = new ArrayList<>();
						
						// Each user gets 1 visited restaurant and 1 favorite restaurant
						// Pick random restaurants for each
						Restaurant visitedRestaurant = restaurants.get(rnd.nextInt(restaurants.size()));
						Restaurant favoriteRestaurant = restaurants.get(rnd.nextInt(restaurants.size()));
						
						// Create visited relation
						RestRel visitedRel = new RestRel(user, visitedRestaurant);
						visitedRel.setHasVisited(true);
						// Random date in the past 30 days
						visitedRel.setVisitedDate(LocalDateTime.now().minusDays(rnd.nextInt(30) + 1));
						visitedRel.setRating(3.0f + rnd.nextFloat() * 2.0f); // Rating between 3.0 and 5.0
						visitedRel = restRelRepository.save(visitedRel);
						userRelations.add(visitedRel);
						
						// Create favorite relation (if different restaurant)
						if (!favoriteRestaurant.getId().equals(visitedRestaurant.getId())) {
							RestRel favoriteRel = new RestRel(user, favoriteRestaurant);
							favoriteRel.setFavorite(true);
							favoriteRel = restRelRepository.save(favoriteRel);
							userRelations.add(favoriteRel);
						} else {
							// If same restaurant, mark it as both visited and favorite
							visitedRel.setFavorite(true);
							restRelRepository.save(visitedRel);
						}
						
						user.setRestaurantRelations(userRelations);
						userRepository.save(user);
					}
					
					logger.info("Seeded restaurant relations for {} users", users.size());
				}
			} else {
				logger.info("Restaurant relations already present, skipping relation seeding");
			}
		} catch (Exception ex) {
			logger.warn("Failed to seed restaurant relations: {}", ex.getMessage());
		}
	}
}
