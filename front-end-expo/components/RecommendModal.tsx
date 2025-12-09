import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Group } from '@/types';

type Props = {
  visible: boolean;
  groups: Group[];
  dark?: boolean;
  title?: string;
  onSelect: (group: Group) => Promise<string | undefined>;
  onRequestClose?: () => void;
  onDone?: (message: string) => void;
};

export default function RecommendModal({ visible, groups, dark = false, title = 'Recommend to group', onSelect, onRequestClose, onDone }: Props) {
  const backdrop = useRef(new Animated.Value(0)).current;
  const content = useRef(new Animated.Value(40)).current;
  const [localVisible, setLocalVisible] = useState(visible);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (visible) {
      setLocalVisible(true);
      Animated.parallel([
        Animated.timing(backdrop, { toValue: 1, duration: 180, easing: Easing.out(Easing.ease), useNativeDriver: true }),
        Animated.spring(content, { toValue: 0, friction: 12, tension: 80, useNativeDriver: true }),
      ]).start();
    } else if (localVisible) {
      // if parent hides, run hide animation then unmount
      Animated.parallel([
        Animated.timing(backdrop, { toValue: 0, duration: 140, easing: Easing.in(Easing.ease), useNativeDriver: true }),
        Animated.timing(content, { toValue: 40, duration: 160, easing: Easing.in(Easing.ease), useNativeDriver: true }),
      ]).start(() => setLocalVisible(false));
    }
  }, [visible]);

  if (!localVisible) return null;

  const handleClose = () => {
    // animate out then call onRequestClose
    Animated.parallel([
      Animated.timing(backdrop, { toValue: 0, duration: 140, easing: Easing.in(Easing.ease), useNativeDriver: true }),
      Animated.timing(content, { toValue: 40, duration: 160, easing: Easing.in(Easing.ease), useNativeDriver: true }),
    ]).start(() => {
      setLocalVisible(false);
      if (onRequestClose) onRequestClose();
    });
  };

  const onPressGroup = async (group: Group) => {
    if (busy) return;
    setBusy(true);
    try {
      const res = await onSelect(group);
      // hide modal with animation then call onDone with message
      Animated.parallel([
        Animated.timing(backdrop, { toValue: 0, duration: 140, easing: Easing.in(Easing.ease), useNativeDriver: true }),
        Animated.timing(content, { toValue: 40, duration: 160, easing: Easing.in(Easing.ease), useNativeDriver: true }),
      ]).start(() => {
        setLocalVisible(false);
        if (onRequestClose) onRequestClose();
        if (onDone) onDone(res ?? 'Aanbeveling verzonden.');
        setBusy(false);
      });
    } catch (e) {
      setBusy(false);
      if (onDone) onDone(String(e));
    }
  };

  return (
    <Modal transparent animationType="none" visible={true} onRequestClose={handleClose}>
      <Animated.View style={[styles.backdrop, dark && styles.backdropDark, { opacity: backdrop }]}>
        <Animated.View style={[styles.card, dark && styles.cardDark, { transform: [{ translateY: content }] }]}>
          <Text style={[styles.title, dark && styles.titleDark]}>{title}</Text>

          {groups.length === 0 ? (
            <Text style={[styles.empty, dark && styles.emptyDark]}>Je zit nog in geen groepen.</Text>
          ) : (
            <View style={styles.listWrap}>
              {groups.map((g) => (
                <TouchableOpacity key={g.id} style={styles.groupRow} onPress={() => onPressGroup(g)} disabled={busy}>
                  <Text style={[styles.groupName, dark && styles.groupNameDark]}>{g.name}</Text>
                  <Text style={[styles.groupMeta, dark && styles.groupMetaDark]}>{g.memberNames?.length || 0} leden</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <TouchableOpacity style={styles.cancel} onPress={handleClose} disabled={busy}>
            <Text style={[styles.cancelText, dark && styles.cancelTextDark]}>Annuleren</Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  backdropDark: { backgroundColor: 'rgba(0,0,0,0.6)' },
  card: {
    width: '100%',
    maxHeight: '80%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  cardDark: { backgroundColor: '#0b1114' },
  title: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
  titleDark: { color: '#eef2f7' },
  empty: { color: '#6b7280' },
  emptyDark: { color: '#94a3b8' },
  listWrap: { marginBottom: 8 },
  groupRow: { paddingVertical: 12, paddingHorizontal: 6, borderBottomWidth: 1, borderBottomColor: '#eceff1', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  groupName: { fontSize: 16, color: '#111827' },
  groupNameDark: { color: '#e6eef6' },
  groupMeta: { fontSize: 12, color: '#6b7280' },
  groupMetaDark: { color: '#94a3b8' },
  cancel: { marginTop: 12, paddingVertical: 10, alignItems: 'center' },
  cancelText: { color: '#ef4444', fontWeight: '700' },
  cancelTextDark: { color: '#ff9b9b' },
});
