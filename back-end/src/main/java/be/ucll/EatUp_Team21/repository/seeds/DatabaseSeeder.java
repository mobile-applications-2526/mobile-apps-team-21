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
import be.ucll.EatUp_Team21.repository.GroupRepository;
import be.ucll.EatUp_Team21.repository.GroupVisitRepository;
import be.ucll.EatUp_Team21.repository.MessageRepository;
import be.ucll.EatUp_Team21.repository.UserRepository;
import be.ucll.EatUp_Team21.repository.RestaurantRepository;
import be.ucll.EatUp_Team21.repository.RestRelRepository;
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

	private static final Logger logger = LoggerFactory.getLogger(DatabaseSeeder.class);

	public DatabaseSeeder(UserRepository userRepository, GroupRepository groupRepository,
			MessageRepository messageRepository, RestaurantRepository restaurantRepository, 
			RestRelRepository restRelRepository, GroupVisitRepository groupVisitRepository) {
		this.userRepository = userRepository;
		this.groupRepository = groupRepository;
		this.messageRepository = messageRepository;
		this.restaurantRepository = restaurantRepository;
		this.restRelRepository = restRelRepository;
		this.groupVisitRepository = groupVisitRepository;
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
				restaurants.add(new Restaurant("Sushi Bar Osaka", "Naamsestraat 45, Ghent", "09-123456", "Fresh sushi and sashimi with a modern interior and omakase options."));
				restaurants.add(new Restaurant("La Piazza Italiana", "Grote Markt 12, Antwerp", "03-654321", "Authentic Italian pasta, fresh sauces and a curated wine list."));
				restaurants.add(new Restaurant("Thai Garden", "Bondgenotenlaan 8, Leuven", "016-987654", "Spicy Thai curries, pad thai and traditional dishes."));
				restaurants.add(new Restaurant("De Gouden Lepel", "Kerkstraat 12, Leuven", "016-123456", "Cozy Belgian bistro with classic regional dishes."));
				restaurants.add(new Restaurant("Le Marché", "Mechelsestraat 22, Leuven", "016-111222", "Market-style small plates focused on seasonal ingredients."));
				restaurants.add(new Restaurant("Curry Corner", "Tiensestraat 3, Leuven", "016-333444", "Spicy Indian curries, vegetarian-friendly menu and house-made naan."));
				restaurants.add(new Restaurant("El Toro Loco", "Diestsestraat 15, Leuven", "016-555666", "Mexican tacos, burritos and margaritas in a vibrant setting."));
				restaurants.add(new Restaurant("Chez Pierre", "Vismarkt 8, Brussels", "02-777888", "Classic French cuisine with seasonal tasting menus."));
				restaurantRepository.saveAll(restaurants);
				logger.info("Seeded {} restaurants", restaurants.size());
			} else {
				logger.info("Restaurants already present, skipping restaurant seeding");
			}
		} catch (Exception ex) {
			// don't fail seeding overall if restaurants can't be saved; log warning
			logger.warn("Failed to seed restaurants: {}", ex.getMessage());
		}

		// seed RestRels (visited/favorite)
		if (restRelRepository.count() == 0) {
			List<User> users = userRepository.findAll();
			List<Restaurant> restaurants = restaurantRepository.findAll();
			List<RestRel> restRels = new ArrayList<>();
			Random rnd = new Random(42);

			if (!users.isEmpty() && !restaurants.isEmpty()) {
				for (User u : users) {
					// Add 1-3 visited restaurants
					int visitedCount = 1 + rnd.nextInt(3);
					for (int i = 0; i < visitedCount; i++) {
						Restaurant r = restaurants.get(rnd.nextInt(restaurants.size()));
						RestRel rr = new RestRel(u, r);
						rr.setVisitDate(LocalDate.now().minusDays(rnd.nextInt(365)));
						// Randomly add a rating (70% chance)
						if (rnd.nextDouble() < 0.7) {
							rr.setRating((float) (3 + rnd.nextInt(3))); // Rating between 3-5
						}
						// Randomly make it favorite
						if (rnd.nextBoolean()) {
							rr.setFavorite(true);
						}
						restRels.add(rr);
					}
				}
				restRelRepository.saveAll(restRels);
				
				// Update users with relations
				for (User u : users) {
					List<RestRel> userRels = restRels.stream().filter(rr -> rr.getUser().getId().equals(u.getId())).toList();
					u.setRestaurantRelations(userRels);
					userRepository.save(u);
				}
				logger.info("Seeded {} restaurant relations", restRels.size());
			}
		} else {
			logger.info("RestRels already present, skipping seeding");
		}

		// seed GroupVisits for the revisit page
		if (groupVisitRepository.count() == 0) {
			List<Group> allGroups = groupRepository.findAll();
			List<Restaurant> restaurants = restaurantRepository.findAll();
			List<GroupVisit> groupVisits = new ArrayList<>();
			Random rnd = new Random(42);

			// Cuisine types to assign
			String[] cuisines = { "Japanese", "Italian", "Thai", "Belgian", "French", "Indian", "Mexican" };
			// Payer names
			String[] payerNames = { "John", "Jane", "Charlie", "Emma", "Liam", "Olivia", "Lisa", "Tom" };

			if (!allGroups.isEmpty() && !restaurants.isEmpty()) {
				for (Group group : allGroups) {
					// Each group has 1-3 past visits
					int visitCount = 1 + rnd.nextInt(3);
					for (int i = 0; i < visitCount; i++) {
						Restaurant restaurant = restaurants.get(rnd.nextInt(restaurants.size()));
						
						// Visit date is in the past (5-180 days ago)
						LocalDate visitDate = LocalDate.now().minusDays(5 + rnd.nextInt(175));
						
						GroupVisit visit = new GroupVisit(group, restaurant, visitDate);
						
						// Assign a cuisine type based on restaurant name or random
						String cuisine = cuisines[rnd.nextInt(cuisines.length)];
						if (restaurant.getName().toLowerCase().contains("sushi")) cuisine = "Japanese";
						else if (restaurant.getName().toLowerCase().contains("italian") || restaurant.getName().toLowerCase().contains("piazza")) cuisine = "Italian";
						else if (restaurant.getName().toLowerCase().contains("thai")) cuisine = "Thai";
						else if (restaurant.getName().toLowerCase().contains("curry") || restaurant.getName().toLowerCase().contains("indian")) cuisine = "Indian";
						else if (restaurant.getName().toLowerCase().contains("mexican") || restaurant.getName().toLowerCase().contains("toro")) cuisine = "Mexican";
						else if (restaurant.getName().toLowerCase().contains("pierre") || restaurant.getName().toLowerCase().contains("marché")) cuisine = "French";
						else if (restaurant.getName().toLowerCase().contains("gouden") || restaurant.getName().toLowerCase().contains("belgian")) cuisine = "Belgian";
						visit.setCuisine(cuisine);
						
						// 70% chance to have price and payer info
						if (rnd.nextDouble() < 0.7) {
							double price = 50 + rnd.nextDouble() * 150; // Between 50 and 200 euros
							price = Math.round(price * 100.0) / 100.0; // Round to 2 decimals
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
		} else {
			logger.info("GroupVisits already present, skipping seeding");
		}
	}
}
