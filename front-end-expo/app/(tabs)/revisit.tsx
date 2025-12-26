import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TextInput,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/components/AuthContext';
import { UserService } from '@/services/userService';
import { GroupVisitResponse, FilterOptions, UpdateGroupVisitRequest } from '@/types';
import RevisitCard from '@/components/revisit/RevisitCard';
import FilterModal from '@/components/modals/FilterModal';
import ReceiptModal from '@/components/modals/ReceiptModal';
import VisitDetailsModal from '@/components/modals/VisitDetailsModal';
import { RatingModal } from '@/components/modals/RatingModal';
import LoadingScreen from '@/components/LoadingScreen';
import Colors from '@/constants/Colors';

export default function RevisitScreen() {
  const { token } = useAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Data state
  const [visits, setVisits] = useState<GroupVisitResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    minRating: null,
    location: '',
    cuisine: '',
    dateFrom: null,
    dateTo: null,
  });

  // Modal states
  const [selectedVisit, setSelectedVisit] = useState<GroupVisitResponse | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [receiptImage, setReceiptImage] = useState<string | null>(null);
  const [loadingReceipt, setLoadingReceipt] = useState(false);

  // Colors
  const backgroundColor = isDark ? '#12181f' : '#f5f7fa';
  const textColor = isDark ? '#ffffff' : '#1f2933';
  const secondaryTextColor = isDark ? '#8894a0' : '#6a7282';
  const inputBgColor = isDark ? '#1f2933' : '#ffffff';
  const borderColor = isDark ? '#2d3a47' : '#e5e7eb';
  const tintColor = Colors[colorScheme ?? 'light'].tint;

  // Load visits from API
  const loadVisits = async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const data = await UserService.getGroupVisits(token);
      setVisits(data);
    } catch (e) {
      console.warn('Failed to load visits:', e);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadVisits();
    }, [token])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadVisits();
    setRefreshing(false);
  }, [token]);

  // Extract unique locations and cuisines for filters
  const { availableLocations, availableCuisines } = useMemo(() => {
    const locationsSet = new Set<string>();
    const cuisinesSet = new Set<string>();

    visits.forEach((visit) => {
      // Extract city from address
      if (visit.restaurantAddress) {
        const parts = visit.restaurantAddress.split(',');
        if (parts.length >= 2) {
          const city = parts[parts.length - 1].trim().split(' ').pop();
          if (city) locationsSet.add(city);
        }
      }
      if (visit.cuisine) {
        cuisinesSet.add(visit.cuisine);
      }
    });

    return {
      availableLocations: Array.from(locationsSet).sort(),
      availableCuisines: Array.from(cuisinesSet).sort(),
    };
  }, [visits]);

  // Filter and search visits
  const filteredVisits = useMemo(() => {
    return visits.filter((visit) => {
      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = visit.restaurantName.toLowerCase().includes(query);
        const matchesGroup = visit.groupName.toLowerCase().includes(query);
        const matchesAddress = visit.restaurantAddress?.toLowerCase().includes(query);
        if (!matchesName && !matchesGroup && !matchesAddress) {
          return false;
        }
      }

      // Rating filter
      if (filters.minRating !== null) {
        if (visit.userRating === null || visit.userRating < filters.minRating) {
          return false;
        }
      }

      // Location filter
      if (filters.location) {
        if (!visit.restaurantAddress?.toLowerCase().includes(filters.location.toLowerCase())) {
          return false;
        }
      }

      // Cuisine filter
      if (filters.cuisine) {
        if (visit.cuisine?.toLowerCase() !== filters.cuisine.toLowerCase()) {
          return false;
        }
      }

      // Date From filter
      if (filters.dateFrom) {
        const visitDate = new Date(visit.visitDate);
        const fromDate = new Date(filters.dateFrom);
        if (visitDate < fromDate) {
          return false;
        }
      }

      // Date To filter
      if (filters.dateTo) {
        const visitDate = new Date(visit.visitDate);
        const toDate = new Date(filters.dateTo);
        // Add 1 day to include the end date
        toDate.setDate(toDate.getDate() + 1);
        if (visitDate > toDate) {
          return false;
        }
      }

      return true;
    });
  }, [visits, searchQuery, filters]);

  // Check if any filters are active
  const hasActiveFilters = filters.minRating !== null || filters.location !== '' || filters.cuisine !== '' || filters.dateFrom !== null || filters.dateTo !== null;

  // Handle card press - open details modal
  const handleCardPress = (visit: GroupVisitResponse) => {
    setSelectedVisit(visit);
    setShowDetailsModal(true);
  };

  // Handle view receipt
  const handleViewReceipt = async (visit: GroupVisitResponse) => {
    setSelectedVisit(visit);
    setShowReceiptModal(true);
    setLoadingReceipt(true);
    setReceiptImage(null);

    if (token && visit.hasReceipt) {
      try {
        const image = await UserService.getReceiptImage(visit.id, token);
        setReceiptImage(image);
      } catch (e) {
        console.warn('Failed to load receipt:', e);
      }
    }
    setLoadingReceipt(false);
  };

  // Handle save visit details
  const handleSaveDetails = async (data: UpdateGroupVisitRequest) => {
    if (!token || !selectedVisit) return;
    
    const updated = await UserService.updateGroupVisit(selectedVisit.id, data, token);
    
    // Update local state
    setVisits((prev) =>
      prev.map((v) => (v.id === updated.id ? updated : v))
    );
    setSelectedVisit(updated);
  };

  // Handle rating
  const handleOpenRating = () => {
    setShowDetailsModal(false);
    setShowRatingModal(true);
  };

  const handleSubmitRating = async (rating: number) => {
    if (!token || !selectedVisit) return;
    
    await UserService.setRating(selectedVisit.restaurantId, rating, token);
    
    // Update local state with new rating
    setVisits((prev) =>
      prev.map((v) =>
        v.restaurantId === selectedVisit.restaurantId ? { ...v, userRating: rating } : v
      )
    );
    
    // Update selected visit
    setSelectedVisit((prev) => (prev ? { ...prev, userRating: rating } : null));
    setShowRatingModal(false);
    
    // Re-open details modal with updated rating
    setShowDetailsModal(true);
  };

  const handleCloseRating = () => {
    setShowRatingModal(false);
    // Re-open details modal after closing rating
    if (selectedVisit) {
      setShowDetailsModal(true);
    }
  };

  // Render visit card
  const renderVisit = ({ item }: { item: GroupVisitResponse }) => (
    <RevisitCard
      visit={item}
      onPress={() => handleCardPress(item)}
      onViewReceipt={item.hasReceipt ? () => handleViewReceipt(item) : undefined}
    />
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: textColor }]}>Visit History</Text>

      </View>

      {/* Search & Filter Bar */}
      <View style={styles.searchContainer}>
        <View style={[styles.searchInputContainer, { backgroundColor: inputBgColor, borderColor }]}>
          <Ionicons name="search-outline" size={20} color={secondaryTextColor} />
          <TextInput
            style={[styles.searchInput, { color: textColor }]}
            placeholder="Search restaurants..."
            placeholderTextColor={secondaryTextColor}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={secondaryTextColor} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={[
            styles.filterButton,
            { backgroundColor: inputBgColor, borderColor },
            hasActiveFilters && { backgroundColor: tintColor, borderColor: tintColor },
          ]}
          onPress={() => setShowFilterModal(true)}
        >
          <Ionicons
            name="options-outline"
            size={20}
            color={hasActiveFilters ? '#ffffff' : secondaryTextColor}
          />
        </TouchableOpacity>
      </View>

      {/* Content */}
      {loading ? (
        <LoadingScreen style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={filteredVisits}
          keyExtractor={(item) => item.id}
          renderItem={renderVisit}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons
                name="time-outline"
                size={48}
                color={isDark ? '#4a5568' : '#cbd5e0'}
              />
              <Text style={[styles.emptyText, { color: secondaryTextColor }]}>
                {searchQuery || hasActiveFilters
                  ? 'No visits match your search or filters'
                  : 'No visits yet'}
              </Text>
              {(searchQuery || hasActiveFilters) && (
                <TouchableOpacity
                  style={[styles.clearFiltersButton, { borderColor: tintColor }]}
                  onPress={() => {
                    setSearchQuery('');
                    setFilters({ minRating: null, location: '', cuisine: '', dateFrom: null, dateTo: null });
                  }}
                >
                  <Text style={[styles.clearFiltersText, { color: tintColor }]}>
                    Clear filters
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          }
        />
      )}

      {/* Filter Modal */}
      <FilterModal
        visible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        onApply={setFilters}
        currentFilters={filters}
        availableLocations={availableLocations}
        availableCuisines={availableCuisines}
      />

      {/* Receipt Modal */}
      <ReceiptModal
        visible={showReceiptModal}
        onClose={() => {
          setShowReceiptModal(false);
          setReceiptImage(null);
        }}
        receiptImage={receiptImage}
        loading={loadingReceipt}
        restaurantName={selectedVisit?.restaurantName || ''}
      />

      {/* Visit Details Modal */}
      <VisitDetailsModal
        visible={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        visit={selectedVisit}
        onSave={handleSaveDetails}
        onRate={handleOpenRating}
      />

      {/* Rating Modal */}
      <RatingModal
        visible={showRatingModal}
        restaurantName={selectedVisit?.restaurantName || ''}
        onSubmit={handleSubmitRating}
        onSkip={handleCloseRating}
        onClose={handleCloseRating}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 18,
    paddingVertical: 12,
    gap: 10,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 18,
    paddingTop: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
  clearFiltersButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginTop: 8,
  },
  clearFiltersText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
