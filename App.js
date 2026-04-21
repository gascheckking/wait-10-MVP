// App.js
// THE PACT - Gör pakter med kompisar, bygg streaks tillsammans 🔥🤝

import React, { useState, useEffect } from 'react';
import {
  StyleSheet, Text, View, TextInput, TouchableOpacity,
  ScrollView, Modal, Alert, Switch, FlatList
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function App() {
  // Pakter
  const [pacts, setPacts] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // Ny pact
  const [newPactName, setNewPactName] = useState('');
  const [newPactDays, setNewPactDays] = useState('7');
  const [newPactMembers, setNewPactMembers] = useState('');
  const [newPactPenalty, setNewPactPenalty] = useState('');
  
  // Aktuell pact (för att visa detaljer)
  const [selectedPact, setSelectedPact] = useState(null);
  
  // Streak-notiser
  const [lastCheckDate, setLastCheckDate] = useState(null);

  // Ladda data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const savedPacts = await AsyncStorage.getItem('@pacts');
      const lastDate = await AsyncStorage.getItem('@last_check');
      
      if (savedPacts) setPacts(JSON.parse(savedPacts));
      if (lastDate) setLastCheckDate(lastDate);
    } catch (e) {}
  };

  const saveData = async () => {
    try {
      await AsyncStorage.setItem('@pacts', JSON.stringify(pacts));
      await AsyncStorage.setItem('@last_check', lastCheckDate || '');
    } catch (e) {}
  };

  useEffect(() => {
    saveData();
  }, [pacts, lastCheckDate]);

  // Skapa ny pact
  const createPact = () => {
    if (!newPactName || !newPactMembers) {
      Alert.alert('❌', 'Fyll i namn och minst en kompis');
      return;
    }
    
    const membersList = newPactMembers.split(',').map(m => m.trim());
    const newPact = {
      id: Date.now().toString(),
      name: newPactName,
      totalDays: parseInt(newPactDays),
      completedDays: 0,
      members: membersList,
      penalty: newPactPenalty || 'Skäms',
      status: 'active', // active, completed, failed
      currentStreak: 0,
      lastConfirmed: null
    };
    
    setPacts([newPact, ...pacts]);
    setShowCreateModal(false);
    resetForm();
  };

  const resetForm = () => {
    setNewPactName('');
    setNewPactDays('7');
    setNewPactMembers('');
    setNewPactPenalty('');
  };

  // Bekräfta dagens framsteg
  const confirmDay = (pactId) => {
    Alert.alert(
      '✅ Bekräfta dagens framsteg',
      'Har du och alla andra i pacten klarat utmaningen idag?',
      [
        { text: 'Nej, inte än', style: 'cancel' },
        { 
          text: 'Ja! 🔥', 
          onPress: () => {
            setPacts(prevPacts => 
              prevPacts.map(pact => {
                if (pact.id === pactId && pact.completedDays < pact.totalDays) {
                  const newCompleted = pact.completedDays + 1;
                  const newStreak = pact.currentStreak + 1;
                  const newStatus = newCompleted >= pact.totalDays ? 'completed' : 'active';
                  
                  return {
                    ...pact,
                    completedDays: newCompleted,
                    currentStreak: newStreak,
                    status: newStatus,
                    lastConfirmed: new Date().toISOString()
                  };
                }
                return pact;
              })
            );
          }
        }
      ]
    );
  };

  // Misslyckades (bryt streak)
  const failDay = (pactId) => {
    Alert.alert(
      '💀 Misslyckades?',
      'Om du eller någon i pacten misslyckades, bryts streaket och straff utdelas.',
      [
        { text: 'Vi klarade det!', style: 'cancel' },
        { 
          text: 'Ja, vi misslyckades 😭', 
          onPress: () => {
            setPacts(prevPacts => 
              prevPacts.map(pact => {
                if (pact.id === pactId) {
                  let penaltyMessage = `Straff: ${pact.penalty}`;
                  if (pact.penalty.includes('kr') || pact.penalty.includes('Swish')) {
                    penaltyMessage = `💸 Straff: ${pact.penalty}`;
                  }
                  Alert.alert('⚡️ STRAFF ⚡️', penaltyMessage);
                  
                  return {
                    ...pact,
                    currentStreak: 0,
                    lastConfirmed: new Date().toISOString()
                  };
                }
                return pact;
              })
            );
          }
        }
      ]
    );
  };

  // Ta bort pact
  const deletePact = (pactId) => {
    Alert.alert(
      '🗑️ Ta bort pact?',
      'Alla framsteg försvinner.',
      [
        { text: 'Avbryt', style: 'cancel' },
        { 
          text: 'Ta bort', 
          style: 'destructive',
          onPress: () => setPacts(prevPacts => prevPacts.filter(p => p.id !== pactId))
        }
      ]
    );
  };

  const getProgressPercentage = (completed, total) => {
    return (completed / total) * 100;
  };

  const getStreakEmoji = (streak) => {
    if (streak >= 30) return '👑';
    if (streak >= 7) return '🔥🔥';
    if (streak >= 3) return '🔥';
    if (streak > 0) return '🌱';
    return '💀';
  };

  return (
    <View style={styles.main}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.logo}>🤝 THE PACT</Text>
          <Text style={styles.logoSub}>GÖR PAKTER MED KOMPISAR</Text>
        </View>

        {/* STATS SUMMARY */}
        <View style={styles.statsCard}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>AKTIVA PAKTER</Text>
              <Text style={styles.statValue}>{pacts.filter(p => p.status === 'active').length}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>GENOMFÖRDA</Text>
              <Text style={styles.statValue}>{pacts.filter(p => p.status === 'completed').length}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>TOTAL STREAK</Text>
              <Text style={styles.statValue}>{pacts.reduce((sum, p) => sum + p.currentStreak, 0)}</Text>
            </View>
          </View>
        </View>

        {/* SKAPA NY PACT */}
        <TouchableOpacity style={styles.createBtn} onPress={() => setShowCreateModal(true)}>
          <Text style={styles.createBtnText}>+ SKAPA NY PACT</Text>
        </TouchableOpacity>

        {/* LISTA ÖVER PAKTER */}
        {pacts.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyEmoji}>🤝</Text>
            <Text style={styles.emptyTitle}>Inga pakter än</Text>
            <Text style={styles.emptyText}>Skapa en pact med dina kompisar och börja bygga streaks tillsammans!</Text>
          </View>
        ) : (
          pacts.map(pact => (
            <View key={pact.id} style={styles.pactCard}>
              <View style={styles.pactHeader}>
                <View style={styles.pactTitleRow}>
                  <Text style={styles.pactEmoji}>{getStreakEmoji(pact.currentStreak)}</Text>
                  <Text style={styles.pactName}>{pact.name}</Text>
                </View>
                <TouchableOpacity onPress={() => deletePact(pact.id)}>
                  <Text style={styles.deleteIcon}>🗑️</Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.membersRow}>
                <Text style={styles.membersLabel}>Medlemmar:</Text>
                <Text style={styles.membersList}>{pact.members.join(', ')}</Text>
              </View>
              
              <View style={styles.progressContainer}>
                <View style={styles.progressBarBg}>
                  <View style={[styles.progressBar, { width: `${getProgressPercentage(pact.completedDays, pact.totalDays)}%` }]} />
                </View>
                <Text style={styles.progressText}>{pact.completedDays}/{pact.totalDays} dagar</Text>
              </View>
              
              <View style={styles.streakRow}>
                <Text style={styles.streakLabel}>🔥 Streak:</Text>
                <Text style={styles.streakValue}>{pact.currentStreak} dagar</Text>
              </View>
              
              <View style={styles.penaltyRow}>
                <Text style={styles.penaltyLabel}>⚡️ Straff:</Text>
                <Text style={styles.penaltyValue}>{pact.penalty}</Text>
              </View>
              
              {pact.status === 'completed' ? (
                <View style={styles.completedBadge}>
                  <Text style={styles.completedText}>🎉 GENOMFÖRD! 🎉</Text>
                </View>
              ) : (
                <View style={styles.actionButtons}>
                  <TouchableOpacity style={styles.confirmBtn} onPress={() => confirmDay(pact.id)}>
                    <Text style={styles.confirmBtnText}>✅ KLARADE DAGEN</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.failBtn} onPress={() => failDay(pact.id)}>
                    <Text style={styles.failBtnText}>💀 MISSLYCKADES</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ))
        )}
      </ScrollView>

      {/* SKAPA PACT MODAL */}
      <Modal visible={showCreateModal} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>🤝 SKAPA NY PACT</Text>
            
            <Text style={styles.modalLabel}>VAD ÄR UTMANINGEN?</Text>
            <TextInput
              style={styles.modalInput}
              value={newPactName}
              onChangeText={setNewPactName}
              placeholder="t.ex. Ingen skräpmat, Träna varje dag"
              placeholderTextColor="#444"
            />
            
            <Text style={styles.modalLabel}>HUR MÅNGA DAGAR?</Text>
            <View style={styles.daysSelector}>
              {[3, 7, 14, 30, 60].map(days => (
                <TouchableOpacity
                  key={days}
                  style={[styles.dayOption, newPactDays === days.toString() && styles.dayOptionSelected]}
                  onPress={() => setNewPactDays(days.toString())}
                >
                  <Text style={[styles.dayOptionText, newPactDays === days.toString() && styles.dayOptionTextSelected]}>{days}</Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <Text style={styles.modalLabel}>KOMPISAR (separera med kommatecken)</Text>
            <TextInput
              style={styles.modalInput}
              value={newPactMembers}
              onChangeText={setNewPactMembers}
              placeholder="t.ex. Ella, Max, Clara"
              placeholderTextColor="#444"
            />
            
            <Text style={styles.modalLabel}>STRAFF VID MISS (vad händer?)</Text>
            <TextInput
              style={styles.modalInput}
              value={newPactPenalty}
              onChangeText={setNewPactPenalty}
              placeholder="t.ex. Bjuder på fika, Swishar 100 kr"
              placeholderTextColor="#444"
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelModalBtn} onPress={() => setShowCreateModal(false)}>
                <Text style={styles.cancelModalText}>AVBRYT</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.createModalBtn} onPress={createPact}>
                <Text style={styles.createModalText}>SKAPA</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  main: { flex: 1, backgroundColor: '#000000' },
  container: { paddingHorizontal: 20, paddingTop: 50, paddingBottom: 40 },
  
  header: { alignItems: 'center', marginBottom: 30 },
  logo: { color: '#39FF14', fontSize: 28, fontWeight: '900', letterSpacing: 2 },
  logoSub: { color: '#39FF14', fontSize: 10, letterSpacing: 2, marginTop: 3, opacity: 0.7 },
  
  statsCard: { backgroundColor: '#111', borderRadius: 20, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: '#222' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around' },
  statItem: { alignItems: 'center' },
  statLabel: { color: '#555', fontSize: 10, marginBottom: 8 },
  statValue: { color: '#39FF14', fontSize: 28, fontWeight: '900' },
  
  createBtn: { backgroundColor: '#39FF14', padding: 18, borderRadius: 40, alignItems: 'center', marginBottom: 25 },
  createBtnText: { color: '#000', fontWeight: '900', fontSize: 16 },
  
  emptyCard: { backgroundColor: '#111', borderRadius: 30, padding: 40, alignItems: 'center', borderWidth: 1, borderColor: '#222' },
  emptyEmoji: { fontSize: 50, marginBottom: 15 },
  emptyTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  emptyText: { color: '#555', fontSize: 14, textAlign: 'center' },
  
  pactCard: { backgroundColor: '#111', borderRadius: 20, padding: 18, marginBottom: 15, borderWidth: 1, borderColor: '#222' },
  pactHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  pactTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  pactEmoji: { fontSize: 20 },
  pactName: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  deleteIcon: { fontSize: 18, color: '#555' },
  
  membersRow: { flexDirection: 'row', marginBottom: 12, flexWrap: 'wrap' },
  membersLabel: { color: '#555', fontSize: 12, marginRight: 5 },
  membersList: { color: '#888', fontSize: 12 },
  
  progressContainer: { marginBottom: 12 },
  progressBarBg: { height: 8, backgroundColor: '#1a1a1a', borderRadius: 4, overflow: 'hidden', marginBottom: 5 },
  progressBar: { height: '100%', backgroundColor: '#39FF14', borderRadius: 4 },
  progressText: { color: '#555', fontSize: 10, textAlign: 'right' },
  
  streakRow: { flexDirection: 'row', marginBottom: 8 },
  streakLabel: { color: '#555', fontSize: 12, marginRight: 8 },
  streakValue: { color: '#39FF14', fontSize: 12, fontWeight: 'bold' },
  
  penaltyRow: { flexDirection: 'row', marginBottom: 15 },
  penaltyLabel: { color: '#555', fontSize: 12, marginRight: 8 },
  penaltyValue: { color: '#ff3333', fontSize: 12 },
  
  actionButtons: { flexDirection: 'row', gap: 10 },
  confirmBtn: { flex: 1, backgroundColor: '#39FF14', padding: 12, borderRadius: 25, alignItems: 'center' },
  confirmBtnText: { color: '#000', fontWeight: '900', fontSize: 12 },
  failBtn: { flex: 1, backgroundColor: '#1a1a1a', padding: 12, borderRadius: 25, alignItems: 'center', borderWidth: 1, borderColor: '#ff3333' },
  failBtnText: { color: '#ff3333', fontWeight: '900', fontSize: 12 },
  
  completedBadge: { backgroundColor: '#0a1a0a', padding: 12, borderRadius: 25, alignItems: 'center', borderWidth: 1, borderColor: '#39FF14' },
  completedText: { color: '#39FF14', fontWeight: '900', fontSize: 12 },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.95)', justifyContent: 'center', padding: 20 },
  modalCard: { backgroundColor: '#111', borderRadius: 30, padding: 25, borderWidth: 1, borderColor: '#222' },
  modalTitle: { color: '#39FF14', fontSize: 20, fontWeight: '900', textAlign: 'center', marginBottom: 20 },
  modalLabel: { color: '#555', fontSize: 10, marginBottom: 8, marginTop: 12 },
  modalInput: { backgroundColor: '#0a0a0a', color: '#fff', padding: 15, borderRadius: 15, fontSize: 14, borderWidth: 1, borderColor: '#222' },
  
  daysSelector: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 5 },
  dayOption: { backgroundColor: '#0a0a0a', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 30, borderWidth: 1, borderColor: '#222' },
  dayOptionSelected: { backgroundColor: '#39FF14', borderColor: '#39FF14' },
  dayOptionText: { color: '#888', fontSize: 14, fontWeight: 'bold' },
  dayOptionTextSelected: { color: '#000' },
  
  modalButtons: { flexDirection: 'row', gap: 12, marginTop: 25 },
  cancelModalBtn: { flex: 1, backgroundColor: '#1a1a1a', padding: 15, borderRadius: 30, alignItems: 'center', borderWidth: 1, borderColor: '#222' },
  cancelModalText: { color: '#888', fontWeight: 'bold' },
  createModalBtn: { flex: 1, backgroundColor: '#39FF14', padding: 15, borderRadius: 30, alignItems: 'center' },
  createModalText: { color: '#000', fontWeight: '900' }
});