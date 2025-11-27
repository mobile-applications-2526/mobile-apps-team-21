package be.ucll.EatUp_Team21.controller;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

// constructor injection used; no field injection required
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import be.ucll.EatUp_Team21.controller.dto.MessageRequest;
import be.ucll.EatUp_Team21.controller.dto.MessageResponse;
import be.ucll.EatUp_Team21.model.Group;
import be.ucll.EatUp_Team21.model.Message;
import be.ucll.EatUp_Team21.model.User;

import be.ucll.EatUp_Team21.service.GroupService;
import be.ucll.EatUp_Team21.service.MessageService;
import be.ucll.EatUp_Team21.service.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import be.ucll.EatUp_Team21.security.JwtUtil;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.messaging.simp.user.SimpUserRegistry;
// using SimpUserRegistry only via its methods

@Controller
public class MessageWebSocketController {

    private static final Logger logger = LoggerFactory.getLogger(MessageWebSocketController.class);
    private final SimpMessagingTemplate messagingTemplate;
    private final GroupService groupService;
    private final MessageService messageService;
    private final UserService userService;
    private final JwtUtil jwtUtil;
    private final SimpUserRegistry simpUserRegistry;

    public MessageWebSocketController(SimpMessagingTemplate messagingTemplate, GroupService groupService, MessageService messageService, UserService userService, JwtUtil jwtUtil, SimpUserRegistry simpUserRegistry) {
        this.messagingTemplate = messagingTemplate;
        this.groupService = groupService;
        this.messageService = messageService;
        this.userService = userService;
        this.jwtUtil = jwtUtil;
        this.simpUserRegistry = simpUserRegistry;
    }

    // client sends to /app/groups/{groupName}/send
    @MessageMapping("/groups/{groupName}/send")
    public void sendMessage(@DestinationVariable String groupName, MessageRequest chatMessage, org.springframework.messaging.Message<?> stompMessage) {
        // extract Authentication from message headers (set earlier by ChannelInterceptor)
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(stompMessage);
        java.security.Principal principal = accessor.getUser();
        String username = null;
        if (principal instanceof Authentication a) {
            username = a.getName();
        } else if (principal != null) {
            username = principal.getName();
        } else {
            var sec = SecurityContextHolder.getContext().getAuthentication();
            if (sec != null) {
                username = sec.getName();
            }
            // fallback: check session attrs for token
            if (username == null) {
                var sessionAttrs = accessor.getSessionAttributes();
                if (sessionAttrs != null) {
                    Object t = sessionAttrs.get("token");
                    if (t != null) {
                        String tokenStr = t.toString();
                        if (tokenStr.startsWith("Bearer ")) tokenStr = tokenStr.substring(7);
                        try {
                            if (jwtUtil.validateToken(tokenStr)) {
                                username = jwtUtil.getUsernameFromToken(tokenStr);
                            }
                        } catch (Exception ex) {
                            logger.info("Failed to parse handshake token", ex);
                        }
                    }
                }
            }
        }
        // diagnostic logs: session id, whether accessor user is set, and security context
        logger.info("sendMessage called for group {} by authentication {} (session={})", groupName, username == null ? "null" : username, accessor.getSessionId());
        logger.info("  accessor.userPresent={} securityContextAuth={}", accessor.getUser() != null, SecurityContextHolder.getContext().getAuthentication());
        // build a fallback Authentication if we only have a username
        Authentication auth = null;
        if (accessor.getUser() instanceof Authentication a) auth = a;
        else {
            var sec = SecurityContextHolder.getContext().getAuthentication();
            if (sec != null) auth = sec;
        }
        if (auth == null && username != null) {
            auth = new UsernamePasswordAuthenticationToken(username, null);
        }
        be.ucll.EatUp_Team21.model.Message savedMessage = messageService.writeMessage(groupName, chatMessage, auth);

        MessageResponse resp = new MessageResponse(savedMessage.getId(), savedMessage.getContent(), savedMessage.getTimestamp(), savedMessage.getAuthor().getId(), savedMessage.getGroup().getId());
        logger.info("Broadcasting message {} to /topic/groups/{}", resp.id(), groupName);
        messagingTemplate.convertAndSend("/topic/groups/" + groupName, resp);
    }

    // client sends to /app/groups/{groupName}/join to indicate they opened the group
    @MessageMapping("/groups/{groupName}/join")
    public void joinGroup(@DestinationVariable String groupName, org.springframework.messaging.Message<?> stompMessage) {
        // extract Authentication from message headers
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(stompMessage);
        java.security.Principal principal = accessor.getUser();
        String username = null;
        if (principal instanceof Authentication a) {
            username = a.getName();
        } else if (principal != null) {
            username = principal.getName();
        } else {
            var sec = SecurityContextHolder.getContext().getAuthentication();
            if (sec != null) {
                username = sec.getName();
            }
            // fallback: check session attrs for token
            if (username == null) {
                var sessionAttrs = accessor.getSessionAttributes();
                if (sessionAttrs != null) {
                    Object t = sessionAttrs.get("token");
                    if (t != null) {
                        String tokenStr = t.toString();
                        if (tokenStr.startsWith("Bearer ")) tokenStr = tokenStr.substring(7);
                        try {
                            if (jwtUtil.validateToken(tokenStr)) {
                                username = jwtUtil.getUsernameFromToken(tokenStr);
                            }
                        } catch (Exception ex) {
                            logger.info("Failed to parse handshake token", ex);
                        }
                    }
                }
            }
        }
        // diagnostic logs: session id, whether accessor user is set, and security context
        logger.info("joinGroup called for group {} authentication {} (session={})", groupName, username == null ? "null" : username, accessor.getSessionId());
        logger.info("  accessor.userPresent={} securityContextAuth={}", accessor.getUser() != null, SecurityContextHolder.getContext().getAuthentication());
        Group group = groupService.findByName(groupName);
        if (group == null) return;
        if (username == null) return;
        User user = userService.getUserByEmail(username);
        if (user == null) return;
        groupService.updateMemberLastVisited(group, user);

        // fetch existing messages for this user and send only to them
        java.util.List<MessageResponse> resp = null;
        String userDest = "/queue/groups/" + groupName + "/history";
        try {
            java.util.List<Message> messages = groupService.getMessagesForGroupAndUser(groupName, username);
            resp = new java.util.ArrayList<>();
            for (Message m : messages) {
                resp.add(new MessageResponse(m.getId(), m.getContent(), m.getTimestamp(), m.getAuthor().getId(), m.getGroup().getId()));
            }
            logger.info("Sending {} history messages to user {} for group {} -> userDest={}", resp.size(), username, groupName, userDest);
            boolean userPresent = false;
            try {
                var simpUser = simpUserRegistry.getUser(username);
                if (simpUser == null) {
                    var names = simpUserRegistry.getUsers().stream().map(org.springframework.messaging.simp.user.SimpUser::getName).toList();
                    logger.info("SimpUserRegistry returned no user for {}. Connected users: {}", username, names);
                } else {
                    var sessions = simpUser.getSessions().stream().map(s -> s.getId()).toList();
                    logger.info("SimpUser {} has sessions: {}", username, sessions);
                    userPresent = true;
                }
            } catch (Exception ex) {
                logger.info("Error querying SimpUserRegistry", ex);
            }

            // send via username route first
            try {
                messagingTemplate.convertAndSendToUser(username, userDest, resp);
            } catch (Exception e) {
                logger.warn("Failed sending history to user {} via username route (exception)", username, e);
            }

            if (!userPresent) {
                // attempt session-id specific delivery
                logger.info("Attempting session-header fallback for session {} (username was not registered)", accessor.getSessionId());
                try {
                    org.springframework.messaging.simp.SimpMessageHeaderAccessor headerAccessor = org.springframework.messaging.simp.SimpMessageHeaderAccessor.create(org.springframework.messaging.simp.SimpMessageType.MESSAGE);
                    headerAccessor.setSessionId(accessor.getSessionId());
                    headerAccessor.setLeaveMutable(true);
                    messagingTemplate.convertAndSendToUser(accessor.getSessionId(), userDest, resp, headerAccessor.getMessageHeaders());
                    logger.info("Sent history to session {} via session-header fallback", accessor.getSessionId());
                } catch (Exception ex2) {
                    logger.warn("Session-fallback failed for session {}", accessor.getSessionId(), ex2);
                }
            }
        } catch (Exception e) {
            // don't fail join if history can't be sent; log minimal info
            logger.warn("Failed preparing or sending history to user {}", username, e);
        }
    }
}
