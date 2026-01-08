package be.ucll.EatUp_Team21.service;

/**
 * Interface for image storage operations.
 * Different implementations are used for different environments:
 * - AzureBlobStorageService: Used in production (Azure)
 * - LocalImageStorageService: Used in dev/test (returns base64 as-is)
 */
public interface ImageStorageService {
    
    /**
     * Process and store an image.
     * 
     * @param base64Content The base64-encoded image content
     * @return The URL or data URI of the stored image
     */
    String uploadBase64Image(String base64Content);
}
