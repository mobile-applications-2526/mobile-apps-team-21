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
        if (onDone) onDone(res ?? 'Recommendation sent.');
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
            <View style={styles.emptyContainer}>
              <Text style={[styles.empty, dark && styles.emptyDark]}>You are not a member of any groups.</Text>
            </View>
          ) : (
            <View style={styles.listWrap}>
              {groups.map((g) => (
                <TouchableOpacity 
                  key={g.id} 
                  style={[styles.groupCard, dark && styles.groupCardDark]} 
                  onPress={() => onPressGroup(g)} 
                  disabled={busy}
                  activeOpacity={0.7}
                >
                  <View style={styles.groupContent}>
                    <Text style={[styles.groupName, dark && styles.groupNameDark]}>{g.name}</Text>
                    <Text style={[styles.groupMeta, dark && styles.groupMetaDark]}>{g.memberNames?.length || 0} {(g.memberNames?.length || 0) === 1 ? 'member' : 'members'}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <TouchableOpacity style={[styles.cancelBtn, dark && styles.cancelBtnDark]} onPress={handleClose} disabled={busy}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  backdropDark: { backgroundColor: 'rgba(0,0,0,0.7)' },
  card: {
    width: '100%',
    maxHeight: '80%',
    backgroundColor: '#f5f7fa',
    borderRadius: 16,
    padding: 20,
  },
  cardDark: { backgroundColor: '#12181f' },
  title: { 
    fontSize: 20, 
    fontWeight: '700', 
    marginBottom: 16,
    color: '#1f2933',
  },
  titleDark: { color: '#ffffff' },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  empty: { 
    color: '#6b7280',
    fontSize: 15,
  },
  emptyDark: { color: '#94a3b8' },
  listWrap: { 
    gap: 12,
    marginBottom: 8,
  },
  groupCard: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  groupCardDark: {
    backgroundColor: '#1f2933',
  },
  groupContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  groupName: { 
    fontSize: 17, 
    fontWeight: '600',
    color: '#1f2933',
  },
  groupNameDark: { color: '#ffffff' },
  groupMeta: { 
    fontSize: 14, 
    color: '#6b7280',
  },
  groupMetaDark: { color: '#94a3b8' },
  cancelBtn: { 
    marginTop: 16, 
    paddingVertical: 14, 
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 12,
  },
  cancelBtnDark: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
  },
  cancelText: { 
    color: '#ef4444', 
    fontWeight: '700',
    fontSize: 16,
  },
});