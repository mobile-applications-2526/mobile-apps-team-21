package be.ucll.EatUp_Team21.service;

import com.azure.storage.blob.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;
import java.io.ByteArrayInputStream;
import java.util.Base64;
import java.util.UUID;

/**
 * Azure Blob Storage implementation for image storage.
 * Only active in production profile when AZURE_STORAGE_CONNECTION_STRING is available.
 */
@Service
@Profile("prod")
public class BlobStorageService implements ImageStorageService {

    @Value("${AZURE_STORAGE_CONNECTION_STRING}")
    private String connectionString;

    private final String containerName = "receipts"; // Make sure to create this container in Azure portal

    @Override
    public String uploadBase64Image(String base64Content) {
        // 1. Remove data:image/jpeg;base64, prefix if present
        String pureBase64 = base64Content.substring(base64Content.indexOf(",") + 1);
        byte[] imageBytes = Base64.getDecoder().decode(pureBase64);

        // 2. Initialize Blob Client
        BlobContainerClient containerClient = new BlobContainerClientBuilder()
                .connectionString(connectionString)
                .containerName(containerName)
                .buildClient();

        // Ensure container exists
        if (!containerClient.exists()) containerClient.create();

        // 3. Generate a unique name
        String fileName = UUID.randomUUID().toString() + ".jpg";
        BlobClient blobClient = containerClient.getBlobClient(fileName);

        // 4. Upload
        blobClient.upload(new ByteArrayInputStream(imageBytes), imageBytes.length, true);

        // 5. Return the public URL
        return blobClient.getBlobUrl();
    }
}