package be.ucll.EatUp_Team21.service;

import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

/**
 * Local implementation for image storage.
 * Used in dev/test profiles - simply returns the base64 data as-is.
 * No Azure connection required.
 */
@Service
@Profile({"dev", "test", "default"})
public class LocalImageStorageService implements ImageStorageService {

    @Override
    public String uploadBase64Image(String base64Content) {
        // In local/dev mode, just return the base64 as-is
        // The frontend can display base64 images directly
        return base64Content;
    }
}
