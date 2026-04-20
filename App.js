// App.js
// KARMA GRAVEYARD - FUNGERANDE VERSION 💀🪦

import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, Text, View, TextInput, TouchableOpacity, 
  ScrollView, Share, Vibration 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function App() {
  // Grundinställningar
  const [hourlyWage, setHourlyWage] = useState('196');
  const [price, setPrice] = useState('');
  const [itemName, setItemName] = useState('');
  
  // Statistik
  const [lifeSavedMins, setLifeSavedMins] = useState(0);
  const [lifeLostMins, setLifeLostMins] = useState(0);
  const [graveyard, setGraveyard] = useState([]);
  const [result, setResult] = useState(null);
  
  // Mål
  const [goalName, setGoalName] = useState('Resa till Tokyo');
  const [goalAmount, setGoalAmount] = useState('25000');
  const [showSettings, setShowSettings] = useState(false);

  // Ladda data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const saved = await AsyncStorage.getItem('@life_saved');
      const lost = await AsyncStorage.getItem('@life_lost');
      const grave = await AsyncStorage.getItem('@graveyard');
      const wage = await AsyncStorage.getItem('@hourly_wage');
      const goalN = await AsyncStorage.getItem('@goal_name');
      const goalA = await AsyncStorage.getItem('@goal_amount');
      
      if (saved) setLifeSavedMins(parseInt(saved));
      if (lost) setLifeLostMins(parseInt(lost));
      if (grave) setGraveyard(JSON.parse(grave));
      if (wage) setHourlyWage(wage);
      if (goalN) setGoalName(goalN);
      if (goalA) setGoalAmount(goalA);
    } catch (e) { console.log("Load error:", e); }
  };

  const saveData = async () => {
    try {
      await AsyncStorage.setItem('@life_saved', lifeSavedMins.toString());
      await AsyncStorage.setItem('@life_lost', lifeLostMins.toString());
      await AsyncStorage.setItem('@graveyard', JSON.stringify(graveyard));
      await AsyncStorage.setItem('@hourly_wage', hourlyWage);
      await AsyncStorage.setItem('@goal_name', goalName);
      await AsyncStorage.setItem('@goal_amount', goalAmount);
    } catch (e) { console.log("Save error:", e); }
  };

  useEffect(() => {
    saveData();
  }, [lifeSavedMins, lifeLostMins, graveyard, hourlyWage, goalName, goalAmount]);

  // Beräkningar
  const savedKronor = Math.round((lifeSavedMins / 60) * parseFloat(hourlyWage));
  const lostKronor = Math.round((lifeLostMins / 60) * parseFloat(hourlyWage));
  const nettoKronor = savedKronor - lostKronor;
  const goalProgress = Math.min(100, (savedKronor / parseFloat(goalAmount)) * 100);

  const getRandomDeathMessage = (item, mins) => {
    const messages = [
      `💀 ${item} stal ${mins} minuter från ditt liv`,
      `🪦 Här vilar ${mins} minuter - offrade för ${item}`,
      `⚰️ Du dog lite inombords för ${item}`,
      `😭 ${mins} minuter. För ${item}. Varför?`,
      `📉 Din livskvalitet minskade med ${mins} minuter`
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  };

  const handleDecision = (bought) => {
    const mins = result.mins;
    const priceValue = result.price;
    
    if (!bought) {
      setLifeSavedMins(prev => prev + mins);
    } else {
      setLifeLostMins(prev => prev + mins);
      const deathMessage = getRandomDeathMessage(itemName || priceValue + ' kr', mins);
      setGraveyard([{ 
        id: Date.now().toString(), 
        item: itemName || priceValue + ' kr', 
        mins, 
        message: deathMessage,
        timestamp: new Date().toLocaleTimeString()
      }, ...graveyard]);
      Vibration.vibrate(100);
    }
    setResult(null);
    setPrice('');
    setItemName('');
  };

  const shareGraveyard = async () => {
    const shareMessage = `🪦 KARMA GRAVEYARD 🪦\n\nFrälst: ${savedKronor} kr (${Math.round(lifeSavedMins/60)} timmar)\nBegravt: ${lostKronor} kr (${Math.round(lifeLostMins/60)} timmar)\n\n🎯 ${goalName}: ${Math.round(goalProgress)}% klart\n\nSluta begrava din tid.`;
    
    try {
      await Share.share({ message: shareMessage });
    } catch (e) { console.log(e); }
  };

  const formatTime = (mins) => {
    const hours = Math.floor(mins / 60);
    const minutes = mins % 60;
    if (hours === 0) return `${minutes} min`;
    if (minutes === 0) return `${hours} h`;
    return `${hours}h ${minutes}m`;
  };

  return (
    <View style={styles.main}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.logo}>🪦 KARMA</Text>
          <Text style={styles.logoSub}>GRAVEYARD</Text>
        </View>

        {/* STATS */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceTitle}>⚖️ TIDENS DOMSTOL ⚖️</Text>
          <View style={styles.balanceRow}>
            <View style={styles.balanceItem}>
              <Text style={styles.balanceLabel}>FRÄLST</Text>
              <Text style={styles.balanceGreen}>{savedKronor} kr</Text>
              <Text style={styles.balanceSmall}>{formatTime(lifeSavedMins)}</Text>
            </View>
            <View style={styles.balanceItem}>
              <Text style={styles.balanceLabel}>BEGRAVT</Text>
              <Text style={styles.balanceRed}>{lostKronor} kr</Text>
              <Text style={styles.balanceSmall}>{formatTime(lifeLostMins)}</Text>
            </View>
          </View>
          <View style={styles.nettoRow}>
            <Text style={styles.nettoText}>NETTO: {nettoKronor >= 0 ? '🔺' : '🔻'} {Math.abs(nettoKronor)} kr</Text>
          </View>
        </View>

        {/* GOAL */}
        <TouchableOpacity style={styles.goalCard} onPress={() => setShowSettings(true)}>
          <Text style={styles.goalTitle}>🎯 {goalName}</Text>
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { width: `${goalProgress}%` }]} />
          </View>
          <View style={styles.goalRow}>
            <Text style={styles.goalSaved}>{savedKronor} kr / {parseInt(goalAmount).toLocaleString()} kr</Text>
            <Text style={styles.goalPercent}>{Math.round(goalProgress)}%</Text>
          </View>
        </TouchableOpacity>

        {/* INPUT */}
        {!result ? (
          <View style={styles.inputBox}>
            <Text style={styles.inputTitle}>⚰️ BEKÄNN DITT KÖP ⚰️</Text>
            
            <TextInput
              style={styles.itemInput}
              placeholder="Vad vill du köpa?"
              placeholderTextColor="#444"
              value={itemName}
              onChangeText={setItemName}
            />
            
            <View style={styles.priceRow}>
              <TextInput
                style={styles.priceInput}
                keyboardType="numeric"
                value={price}
                onChangeText={setPrice}
                placeholder="0"
                placeholderTextColor="#444"
              />
              <Text style={styles.krText}>KR</Text>
            </View>
            
            <TouchableOpacity 
              style={[styles.judgmentBtn, !price && styles.disabledBtn]} 
              onPress={() => {
                const p = parseFloat(price);
                if (p > 0) {
                  const mins = Math.round((p / parseFloat(hourlyWage)) * 60);
                  setResult({ mins, price: p });
                }
              }}
              disabled={!price}
            >
              <Text style={styles.judgmentBtnText}>
                {price ? '📜 DÖM MITT KÖP' : 'SKRIV ETT PRIS'}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* RESULT */
          <View style={styles.verdictBox}>
            <Text style={styles.verdictTitle}>⚡️ DOMSLUT ⚡️</Text>
            
            <Text style={styles.verdictTime}>{result.mins}</Text>
            <Text style={styles.verdictUnit}>MINUTER AV DITT LIV</Text>
            
            <View style={styles.verdictDivider} />
            
            <Text style={styles.verdictPrice}>{Math.round((result.mins / 60) * parseFloat(hourlyWage))} KR</Text>
            <Text style={styles.verdictItem}>{itemName || result.price + ' kr'}</Text>
            
            <View style={styles.verdictButtons}>
              <TouchableOpacity style={styles.saveBtn} onPress={() => handleDecision(false)}>
                <Text style={styles.saveBtnText}>🙏 FRÄLS TIDEN</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.loseBtn} onPress={() => handleDecision(true)}>
                <Text style={styles.loseBtnText}>💀 BEGRAV TIDEN</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* GRAVEYARD */}
        {graveyard.length > 0 && (
          <View style={styles.graveyardSection}>
            <Text style={styles.graveyardTitle}>🪦 GRAVEYARD ({graveyard.length})</Text>
            {graveyard.slice(0, 5).map((item) => (
              <View key={item.id} style={styles.tombstone}>
                <Text style={styles.tombstoneIcon}>🪦</Text>
                <View style={styles.tombstoneContent}>
                  <Text style={styles.tombstoneItem}>{item.item}</Text>
                  <Text style={styles.tombstoneMsg}>{item.message}</Text>
                </View>
                <Text style={styles.tombstoneMins}>-{item.mins}m</Text>
              </View>
            ))}
          </View>
        )}

        {/* BUTTONS */}
        {(lifeLostMins > 0 || lifeSavedMins > 0) && (
          <TouchableOpacity style={styles.shareBtn} onPress={shareGraveyard}>
            <Text style={styles.shareBtnText}>📤 DELA GRAVEYARD</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.settingsBtn} onPress={() => setShowSettings(true)}>
          <Text style={styles.settingsBtnText}>⚙️ {hourlyWage} KR/H • Ändra mål</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* SETTINGS MODAL */}
      {showSettings && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>⚰️ INSTÄLLNINGAR</Text>
            
            <Text style={styles.modalLabel}>TIMLÖN (KR/H)</Text>
            <TextInput
              style={styles.modalInput}
              keyboardType="numeric"
              value={hourlyWage}
              onChangeText={setHourlyWage}
            />
            
            <Text style={styles.modalLabel}>SPARMÅL (VAD?)}</Text>
            <TextInput
              style={styles.modalInput}
              value={goalName}
              onChangeText={setGoalName}
              placeholder="Resa till Tokyo"
            />
            
            <Text style={styles.modalLabel}>HUR MYCKET?</Text>
            <TextInput
              style={styles.modalInput}
              keyboardType="numeric"
              value={goalAmount}
              onChangeText={setGoalAmount}
              placeholder="25000"
            />
            
            <TouchableOpacity style={styles.modalClose} onPress={() => setShowSettings(false)}>
              <Text style={styles.modalCloseText}>SPARA</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  main: { flex: 1, backgroundColor: '#000000' },
  container: { paddingHorizontal: 20, paddingTop: 50, paddingBottom: 40 },
  
  header: { alignItems: 'center', marginBottom: 30 },
  logo: { color: '#39FF14', fontSize: 32, fontWeight: '900', letterSpacing: 4 },
  logoSub: { color: '#ff3333', fontSize: 12, letterSpacing: 4, marginTop: -5 },
  
  balanceCard: { backgroundColor: '#111', borderRadius: 20, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: '#222' },
  balanceTitle: { color: '#39FF14', fontSize: 10, textAlign: 'center', marginBottom: 15 },
  balanceRow: { flexDirection: 'row', justifyContent: 'space-around' },
  balanceItem: { alignItems: 'center' },
  balanceLabel: { color: '#555', fontSize: 10, marginBottom: 5 },
  balanceGreen: { color: '#39FF14', fontSize: 20, fontWeight: '900' },
  balanceRed: { color: '#ff3333', fontSize: 20, fontWeight: '900' },
  balanceSmall: { color: '#333', fontSize: 10, marginTop: 3 },
  nettoRow: { alignItems: 'center', marginTop: 15, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#222' },
  nettoText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  
  goalCard: { backgroundColor: '#111', borderRadius: 20, padding: 20, marginBottom: 30, borderWidth: 1, borderColor: '#39FF14' },
  goalTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginBottom: 12 },
  progressBarContainer: { height: 8, backgroundColor: '#1a1a1a', borderRadius: 4, overflow: 'hidden', marginBottom: 10 },
  progressBar: { height: '100%', backgroundColor: '#39FF14', borderRadius: 4 },
  goalRow: { flexDirection: 'row', justifyContent: 'space-between' },
  goalSaved: { color: '#39FF14', fontSize: 12 },
  goalPercent: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  
  inputBox: { backgroundColor: '#111', borderRadius: 30, padding: 25, borderWidth: 1, borderColor: '#222' },
  inputTitle: { color: '#39FF14', fontSize: 10, textAlign: 'center', marginBottom: 20 },
  itemInput: { color: '#fff', fontSize: 16, textAlign: 'center', borderBottomWidth: 1, borderBottomColor: '#222', paddingVertical: 10, marginBottom: 20 },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'center', marginBottom: 25, borderBottomWidth: 1, borderBottomColor: '#222', paddingBottom: 10 },
  priceInput: { color: '#fff', fontSize: 50, fontWeight: '900', textAlign: 'center', width: 150 },
  krText: { color: '#39FF14', fontSize: 24, fontWeight: '900', marginLeft: 5 },
  judgmentBtn: { backgroundColor: '#39FF14', padding: 18, borderRadius: 40, alignItems: 'center' },
  disabledBtn: { backgroundColor: '#1a1a1a' },
  judgmentBtnText: { color: '#000', fontWeight: '900', fontSize: 14 },
  
  verdictBox: { backgroundColor: '#111', borderRadius: 30, padding: 25, borderWidth: 2, borderColor: '#ff3333', alignItems: 'center' },
  verdictTitle: { color: '#ff3333', fontSize: 10, marginBottom: 20 },
  verdictTime: { color: '#ff3333', fontSize: 60, fontWeight: '900' },
  verdictUnit: { color: '#555', fontSize: 10, marginTop: 5 },
  verdictDivider: { width: 40, height: 1, backgroundColor: '#222', marginVertical: 15 },
  verdictPrice: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginBottom: 5 },
  verdictItem: { color: '#888', fontSize: 14, marginBottom: 20 },
  verdictButtons: { width: '100%', gap: 12 },
  saveBtn: { backgroundColor: '#39FF14', padding: 16, borderRadius: 40, alignItems: 'center' },
  saveBtnText: { color: '#000', fontWeight: '900', fontSize: 14 },
  loseBtn: { backgroundColor: '#1a1a1a', padding: 16, borderRadius: 40, alignItems: 'center', borderWidth: 1, borderColor: '#ff3333' },
  loseBtnText: { color: '#ff3333', fontWeight: '900', fontSize: 14 },
  
  graveyardSection: { marginTop: 30, borderTopWidth: 1, borderTopColor: '#222', paddingTop: 20 },
  graveyardTitle: { color: '#ff3333', fontSize: 12, marginBottom: 15 },
  tombstone: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0d0d0d', borderRadius: 12, padding: 12, marginBottom: 8, borderLeftWidth: 3, borderLeftColor: '#ff3333' },
  tombstoneIcon: { fontSize: 20, marginRight: 10 },
  tombstoneContent: { flex: 1 },
  tombstoneItem: { color: '#fff', fontSize: 13, fontWeight: '600' },
  tombstoneMsg: { color: '#555', fontSize: 10, marginTop: 2 },
  tombstoneMins: { color: '#ff3333', fontSize: 12, fontWeight: 'bold' },
  
  shareBtn: { marginTop: 30, padding: 16, borderRadius: 30, borderWidth: 1, borderColor: '#222', alignItems: 'center' },
  shareBtnText: { color: '#fff', fontSize: 14 },
  settingsBtn: { marginTop: 15, padding: 10, alignItems: 'center' },
  settingsBtnText: { color: '#333', fontSize: 12 },
  
  modalOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.95)', justifyContent: 'center', padding: 20 },
  modalCard: { backgroundColor: '#111', borderRadius: 30, padding: 25, borderWidth: 1, borderColor: '#222' },
  modalTitle: { color: '#39FF14', fontSize: 18, fontWeight: '900', textAlign: 'center', marginBottom: 20 },
  modalLabel: { color: '#555', fontSize: 10, marginBottom: 8, marginTop: 12 },
  modalInput: { backgroundColor: '#0a0a0a', color: '#fff', padding: 15, borderRadius: 15, fontSize: 16, textAlign: 'center' },
  modalClose: { backgroundColor: '#39FF14', padding: 16, borderRadius: 30, alignItems: 'center', marginTop: 20 },
  modalCloseText: { color: '#000', fontWeight: '900', fontSize: 14 }
});