import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  ScrollView,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/Colors';
import { FilterOptions } from '@/types';

interface Props {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: FilterOptions) => void;
  currentFilters: FilterOptions;
  availableLocations: string[];
  availableCuisines: string[];
}

const FilterModal: React.FC<Props> = ({
  visible,
  onClose,
  onApply,
  currentFilters,
  availableLocations,
  availableCuisines,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const tintColor = Colors[colorScheme ?? 'light'].tint;

  const [minRating, setMinRating] = useState<number | null>(currentFilters.minRating);
  const [location, setLocation] = useState(currentFilters.location);
  const [cuisine, setCuisine] = useState(currentFilters.cuisine);
  const [dateFrom, setDateFrom] = useState<string | null>(currentFilters.dateFrom);
  const [dateTo, setDateTo] = useState<string | null>(currentFilters.dateTo);

  const backgroundColor = isDark ? '#1f2933' : '#ffffff';
  const textColor = isDark ? '#ffffff' : '#1f2933';
  const secondaryTextColor = isDark ? '#8894a0' : '#6a7282';
  const borderColor = isDark ? '#2d3a47' : '#e5e7eb';
  const chipBgInactive = isDark ? '#2d3a47' : '#f3f4f6';
  const inputBgColor = isDark ? '#2d3a47' : '#f3f4f6';

  useEffect(() => {
    setMinRating(currentFilters.minRating);
    setLocation(currentFilters.location);
    setCuisine(currentFilters.cuisine);
    setDateFrom(currentFilters.dateFrom);
    setDateTo(currentFilters.dateTo);
  }, [currentFilters, visible]);

  const handleApply = () => {
    onApply({ minRating, location, cuisine, dateFrom, dateTo });
    onClose();
  };

  const handleReset = () => {
    setMinRating(null);
    setLocation('');
    setCuisine('');
    setDateFrom(null);
    setDateTo(null);
  };

  const renderRatingFilter = () => {
    const ratings = [1, 2, 3, 4, 5];
    return (
      <View style={styles.filterSection}>
        <Text style={[styles.filterLabel, { color: textColor }]}>Minimum Rating</Text>
        <View style={styles.chipsContainer}>
          <TouchableOpacity
            style={[
              styles.chip,
              { backgroundColor: chipBgInactive, borderColor: borderColor },
              minRating === null && { backgroundColor: tintColor, borderColor: tintColor },
            ]}
            onPress={() => setMinRating(null)}
          >
            <Text style={[styles.chipText, minRating === null && styles.chipTextActive]}>
              Any
            </Text>
          </TouchableOpacity>
          {ratings.map((r) => (
            <TouchableOpacity
              key={r}
              style={[
                styles.chip,
                { backgroundColor: chipBgInactive, borderColor: borderColor },
                minRating === r && { backgroundColor: tintColor, borderColor: tintColor },
              ]}
              onPress={() => setMinRating(r)}
            >
              <Ionicons
                name="star"
                size={12}
                color={minRating === r ? '#ffffff' : '#FFD700'}
              />
              <Text style={[styles.chipText, { color: textColor }, minRating === r && styles.chipTextActive]}>
                {r}+
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  const renderLocationFilter = () => {
    const locations = ['', ...availableLocations];
    return (
      <View style={styles.filterSection}>
        <Text style={[styles.filterLabel, { color: textColor }]}>Location</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.chipsContainer}>
            {locations.map((loc, idx) => (
              <TouchableOpacity
                key={idx}
                style={[
                  styles.chip,
                  { backgroundColor: chipBgInactive, borderColor: borderColor },
                  location === loc && { backgroundColor: tintColor, borderColor: tintColor },
                ]}
                onPress={() => setLocation(loc)}
              >
                <Text style={[styles.chipText, { color: textColor }, location === loc && styles.chipTextActive]}>
                  {loc || 'All'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>
    );
  };

  const renderCuisineFilter = () => {
    const cuisines = ['', ...availableCuisines];
    return (
      <View style={styles.filterSection}>
        <Text style={[styles.filterLabel, { color: textColor }]}>Cuisine</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.chipsContainer}>
            {cuisines.map((c, idx) => (
              <TouchableOpacity
                key={idx}
                style={[
                  styles.chip,
                  { backgroundColor: chipBgInactive, borderColor: borderColor },
                  cuisine === c && { backgroundColor: tintColor, borderColor: tintColor },
                ]}
                onPress={() => setCuisine(c)}
              >
                <Text style={[styles.chipText, { color: textColor }, cuisine === c && styles.chipTextActive]}>
                  {c || 'All'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>
    );
  };

  // Generate date filter options based on recent periods
  const renderDateFilter = () => {
    const formatDisplayDate = (dateStr: string | null) => {
      if (!dateStr) return '';
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    const getDateOptions = () => {
      const today = new Date();
      const options = [
        { label: 'All time', from: null, to: null },
        { 
          label: 'Last 7 days', 
          from: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], 
          to: today.toISOString().split('T')[0] 
        },
        { 
          label: 'Last 30 days', 
          from: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], 
          to: today.toISOString().split('T')[0] 
        },
        { 
          label: 'Last 3 months', 
          from: new Date(today.getFullYear(), today.getMonth() - 3, today.getDate()).toISOString().split('T')[0], 
          to: today.toISOString().split('T')[0] 
        },
        { 
          label: 'Last 6 months', 
          from: new Date(today.getFullYear(), today.getMonth() - 6, today.getDate()).toISOString().split('T')[0], 
          to: today.toISOString().split('T')[0] 
        },
        { 
          label: 'This year', 
          from: new Date(today.getFullYear(), 0, 1).toISOString().split('T')[0], 
          to: today.toISOString().split('T')[0] 
        },
      ];
      return options;
    };

    const dateOptions = getDateOptions();
    const isDateSelected = (from: string | null, to: string | null) => {
      return dateFrom === from && dateTo === to;
    };

    return (
      <View style={styles.filterSection}>
        <Text style={[styles.filterLabel, { color: textColor }]}>Date Range</Text>
        <View style={styles.chipsContainer}>
          {dateOptions.map((option, idx) => (
            <TouchableOpacity
              key={idx}
              style={[
                styles.chip,
                { backgroundColor: chipBgInactive, borderColor: borderColor },
                isDateSelected(option.from, option.to) && { backgroundColor: tintColor, borderColor: tintColor },
              ]}
              onPress={() => {
                setDateFrom(option.from);
                setDateTo(option.to);
              }}
            >
              <Ionicons
                name="calendar-outline"
                size={12}
                color={isDateSelected(option.from, option.to) ? '#ffffff' : secondaryTextColor}
              />
              <Text style={[styles.chipText, { color: textColor }, isDateSelected(option.from, option.to) && styles.chipTextActive]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  const hasActiveFilters = minRating !== null || location !== '' || cuisine !== '' || dateFrom !== null || dateTo !== null;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.modalContainer, { backgroundColor }]}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: textColor }]}>Filters</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={textColor} />
            </TouchableOpacity>
          </View>

          {/* Filters */}
          <ScrollView style={styles.filtersContainer}>
            {renderRatingFilter()}
            {renderDateFilter()}
            {availableLocations.length > 0 && renderLocationFilter()}
            {availableCuisines.length > 0 && renderCuisineFilter()}
          </ScrollView>

          {/* Actions */}
          <View style={styles.actionsContainer}>
            {hasActiveFilters && (
              <TouchableOpacity
                style={[styles.resetButton, { borderColor: borderColor }]}
                onPress={handleReset}
              >
                <Text style={[styles.resetButtonText, { color: secondaryTextColor }]}>Reset</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.applyButton, { backgroundColor: tintColor }, !hasActiveFilters && styles.applyButtonFull]}
              onPress={handleApply}
            >
              <Text style={styles.applyButtonText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
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
    paddingTop: 16,
    paddingBottom: 34,
    maxHeight: '70%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  closeButton: {
    padding: 4,
  },
  filtersContainer: {
    paddingHorizontal: 20,
  },
  filterSection: {
    marginBottom: 24,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#ffffff',
  },
  chipTextActive: {
    color: '#ffffff',
  },
  actionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 12,
  },
  resetButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  applyButton: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  applyButtonFull: {
    flex: 1,
  },
  applyButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default FilterModal;
