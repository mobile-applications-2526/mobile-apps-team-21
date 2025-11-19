package be.ucll.EatUp_Team21.repository.seeds;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Random;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import be.ucll.EatUp_Team21.model.Group;
import be.ucll.EatUp_Team21.model.Message;
import be.ucll.EatUp_Team21.model.User;
import be.ucll.EatUp_Team21.repository.GroupRepository;
import be.ucll.EatUp_Team21.repository.MessageRepository;
import be.ucll.EatUp_Team21.repository.UserRepository;

@Component
public class DatabaseSeeder implements CommandLineRunner {

	private final UserRepository userRepository;
	private final GroupRepository groupRepository;
	private final MessageRepository messageRepository;

	public DatabaseSeeder(UserRepository userRepository, GroupRepository groupRepository,
			MessageRepository messageRepository) {
		this.userRepository = userRepository;
		this.groupRepository = groupRepository;
		this.messageRepository = messageRepository;
	}

	@Override
	public void run(String... args) throws Exception {
		if (userRepository.count() > 0) {
			return; // already seeded
		}

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

		// create groups
		List<Group> groups = new ArrayList<>();
		String[] groupNames = new String[] { "Avondeten", "Lunchclub", "Weekendplans", "Projectgroep" };
		for (String gname : groupNames) {
			Group g = new Group(gname);
			g.setMembers(new ArrayList<>());
			groups.add(g);
		}

		groups = groupRepository.saveAll(groups);

		// randomly assign users to groups
		Random rnd = new Random(42);
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
		userRepository.saveAll(users);

		// create some messages for each group
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
	}
}
