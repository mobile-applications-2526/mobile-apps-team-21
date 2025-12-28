import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  TextInput,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import Colors from '@/constants/Colors';
import { GroupVisitResponse, UpdateGroupVisitRequest } from '@/types';

interface Props {
  visible: boolean;
  onClose: () => void;
  visit: GroupVisitResponse | null;
  onSave: (data: UpdateGroupVisitRequest) => Promise<void>;
  onRate: () => void;
}

const VisitDetailsModal: React.FC<Props> = ({
  visible,
  onClose,
  visit,
  onSave,
  onRate,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const tintColor = Colors[colorScheme ?? 'light'].tint;

  const [totalPrice, setTotalPrice] = useState('');
  const [paidByName, setPaidByName] = useState('');
  const [receiptImage, setReceiptImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const backgroundColor = isDark ? '#1f2933' : '#ffffff';
  const textColor = isDark ? '#ffffff' : '#1f2933';
  const secondaryTextColor = isDark ? '#8894a0' : '#6a7282';
  const inputBgColor = isDark ? '#2d3a47' : '#f3f4f6';
  const borderColor = isDark ? '#3d4a57' : '#e5e7eb';

  useEffect(() => {
    if (visit) {
      setTotalPrice(visit.totalPrice?.toString() || '');
      setPaidByName(visit.paidByName || '');
      setReceiptImage(null); // Don't pre-load receipt image, only show if user wants to change
    }
  }, [visit, visible]);

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (!permissionResult.granted) {
      Alert.alert('Permission Required', 'Please allow access to your photo library to upload a receipt.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.7,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      const base64Image = `data:image/jpeg;base64,${result.assets[0].base64}`;
      setReceiptImage(base64Image);
    }
  };

  const takePhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    
    if (!permissionResult.granted) {
      Alert.alert('Permission Required', 'Please allow access to your camera to take a photo.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      quality: 0.7,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      const base64Image = `data:image/jpeg;base64,${result.assets[0].base64}`;
      setReceiptImage(base64Image);
    }
  };

  const handleSave = async () => {
    if (!visit) return;
    
    setLoading(true);
    try {
      const data: UpdateGroupVisitRequest = {};
      
      if (totalPrice) {
        const price = parseFloat(totalPrice);
        if (!isNaN(price)) {
          data.totalPrice = price;
        }
      }
      
      if (paidByName.trim()) {
        data.paidByName = paidByName.trim();
      }
      
      if (receiptImage) {
        data.receiptImage = receiptImage;
      }

      await onSave(data);
      onClose();
    } catch (error) {
      Alert.alert('Error', 'Failed to save visit details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Unknown date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const renderStars = (rating: number | null) => {
    if (rating === null) return null;
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Ionicons
          key={i}
          name={i <= rating ? 'star' : 'star-outline'}
          size={18}
          color={i <= rating ? '#FFD700' : (isDark ? '#4a5568' : '#cbd5e0')}
        />
      );
    }
    return <View style={styles.starsContainer}>{stars}</View>;
  };

  if (!visit) return null;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.modalContainer, { backgroundColor }]}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={textColor} />
            </TouchableOpacity>
            <Text style={[styles.title, { color: textColor }]}>Visit Details</Text>
            <View style={{ width: 32 }} />
          </View>

          <KeyboardAwareScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
            enableOnAndroid={true}
            extraScrollHeight={20}
            enableAutomaticScroll={true}
            keyboardShouldPersistTaps="handled"
            enableResetScrollToCoords={false}
            keyboardOpeningTime={0}
          >
            {/* Restaurant Info */}
            <View style={styles.restaurantSection}>
              <Text style={[styles.restaurantName, { color: textColor }]}>
                {visit.restaurantName}
              </Text>
              <Text style={[styles.restaurantAddress, { color: secondaryTextColor }]}>
                {visit.restaurantAddress}
              </Text>
              <Text style={[styles.visitDate, { color: secondaryTextColor }]}>
                {formatDate(visit.visitDate)}
              </Text>
              <View style={styles.groupBadge}>
                <Ionicons name="people" size={14} color={tintColor} />
                <Text style={[styles.groupName, { color: tintColor }]}>{visit.groupName}</Text>
              </View>
            </View>

            {/* Rating Section */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: textColor }]}>Your Rating</Text>
              <TouchableOpacity style={styles.ratingButton} onPress={onRate}>
                {visit.userRating !== null ? (
                  <View style={styles.ratingDisplay}>
                    {renderStars(visit.userRating)}
                    <Text style={[styles.ratingValue, { color: textColor }]}>
                      {visit.userRating.toFixed(1)}/5
                    </Text>
                    <Text style={[styles.tapToChange, { color: tintColor }]}>Tap to change</Text>
                  </View>
                ) : (
                  <View style={styles.noRating}>
                    <Ionicons name="star-outline" size={24} color={tintColor} />
                    <Text style={[styles.noRatingText, { color: tintColor }]}>Tap to rate</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            {/* Price Section */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: textColor }]}>Total Bill</Text>
              <View style={[styles.inputContainer, { backgroundColor: inputBgColor, borderColor }]}>
                <Text style={[styles.currencySymbol, { color: secondaryTextColor }]}>€</Text>
                <TextInput
                  style={[styles.input, { color: textColor }]}
                  value={totalPrice}
                  onChangeText={setTotalPrice}
                  placeholder="0.00"
                  placeholderTextColor={secondaryTextColor}
                  keyboardType="decimal-pad"
                />
              </View>
            </View>

            {/* Paid By Section */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: textColor }]}>Paid By</Text>
              <View style={[styles.inputContainer, { backgroundColor: inputBgColor, borderColor }]}>
                <Ionicons name="person-outline" size={20} color={secondaryTextColor} />
                <TextInput
                  style={[styles.input, { color: textColor }]}
                  value={paidByName}
                  onChangeText={setPaidByName}
                  placeholder="Who paid?"
                  placeholderTextColor={secondaryTextColor}
                />
              </View>
            </View>

            {/* Receipt Section */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: textColor }]}>Receipt</Text>
              {receiptImage ? (
                <View style={styles.receiptPreviewContainer}>
                  <Image source={{ uri: receiptImage }} style={styles.receiptPreview} />
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={() => setReceiptImage(null)}
                  >
                    <Ionicons name="close-circle" size={24} color="#ef5350" />
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.receiptButtons}>
                  <TouchableOpacity
                    style={[styles.receiptButton, { backgroundColor: inputBgColor, borderColor }]}
                    onPress={takePhoto}
                  >
                    <Ionicons name="camera-outline" size={24} color={tintColor} />
                    <Text style={[styles.receiptButtonText, { color: textColor }]}>Take Photo</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.receiptButton, { backgroundColor: inputBgColor, borderColor }]}
                    onPress={pickImage}
                  >
                    <Ionicons name="image-outline" size={24} color={tintColor} />
                    <Text style={[styles.receiptButtonText, { color: textColor }]}>Gallery</Text>
                  </TouchableOpacity>
                </View>
              )}
              {visit.hasReceipt && !receiptImage && (
                <Text style={[styles.existingReceipt, { color: secondaryTextColor }]}>
                  ✓ Receipt already uploaded
                </Text>
              )}
            </View>

            {/* Save Button - inside scroll view so it moves with keyboard */}
            <View style={styles.footer}>
              <TouchableOpacity
                style={[styles.saveButton, { backgroundColor: tintColor }]}
                onPress={handleSave}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={styles.saveButtonText}>Save Changes</Text>
                )}
              </TouchableOpacity>
            </View>
          </KeyboardAwareScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  closeButton: {
    padding: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  content: {
    padding: 20,
  },
  restaurantSection: {
    marginBottom: 24,
  },
  restaurantName: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 4,
  },
  restaurantAddress: {
    fontSize: 14,
    marginBottom: 4,
  },
  visitDate: {
    fontSize: 14,
    marginBottom: 8,
  },
  groupBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  groupName: {
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  ratingButton: {
    padding: 12,
  },
  ratingDisplay: {
    alignItems: 'center',
    gap: 6,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 4,
  },
  ratingValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  tapToChange: {
    fontSize: 12,
  },
  noRating: {
    alignItems: 'center',
    gap: 8,
  },
  noRatingText: {
    fontSize: 14,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    gap: 10,
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: '600',
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
  },
  receiptButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  receiptButton: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  receiptButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  receiptPreviewContainer: {
    position: 'relative',
  },
  receiptPreview: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'white',
    borderRadius: 12,
  },
  existingReceipt: {
    marginTop: 8,
    fontSize: 13,
    textAlign: 'center',
  },
  footer: {
    padding: 20,
    paddingBottom: 34,
  },
  saveButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default VisitDetailsModal;