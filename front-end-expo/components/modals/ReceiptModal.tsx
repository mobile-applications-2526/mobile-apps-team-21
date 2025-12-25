import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  Image,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  visible: boolean;
  onClose: () => void;
  receiptImage: string | null;
  loading: boolean;
  restaurantName: string;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const ReceiptModal: React.FC<Props> = ({
  visible,
  onClose,
  receiptImage,
  loading,
  restaurantName,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const backgroundColor = isDark ? '#1f2933' : '#ffffff';
  const textColor = isDark ? '#ffffff' : '#1f2933';

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.modalContainer, { backgroundColor }]}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: textColor }]} numberOfLines={1}>
              Receipt - {restaurantName}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={textColor} />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <View style={styles.content}>
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={isDark ? '#ffffff' : '#1f2933'} />
                <Text style={[styles.loadingText, { color: textColor }]}>Loading receipt...</Text>
              </View>
            ) : receiptImage ? (
              <Image
                source={{ uri: receiptImage }}
                style={styles.receiptImage}
                resizeMode="contain"
              />
            ) : (
              <View style={styles.noReceiptContainer}>
                <Ionicons name="receipt-outline" size={48} color={isDark ? '#4a5568' : '#cbd5e0'} />
                <Text style={[styles.noReceiptText, { color: textColor, opacity: 0.6 }]}>
                  No receipt available
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 400,
    maxHeight: screenHeight * 0.8,
    borderRadius: 16,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    padding: 16,
    minHeight: 200,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  receiptImage: {
    width: '100%',
    height: screenHeight * 0.5,
    borderRadius: 8,
  },
  noReceiptContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
  },
  noReceiptText: {
    marginTop: 12,
    fontSize: 16,
  },
});

export default ReceiptModal;
