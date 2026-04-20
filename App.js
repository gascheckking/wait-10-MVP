// App.js
// KARMA GRAVEYARD V2 - THE DARK EDITION 💀🪦

import React, { useState, useEffect, useRef } from 'react';
import { 
  StyleSheet, Text, View, TextInput, TouchableOpacity, 
  ScrollView, Animated, Share, Dimensions, Vibration 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

export default function App() {
  const [price, setPrice] = useState('');
  const [hourlyWage, setHourlyWage] = useState('196');
  const [lifeSavedMins, setLifeSavedMins] = useState(0);
  const [lifeLostMins, setLifeLostMins] = useState(0);
  const [graveyard, setGraveyard] = useState([]);
  const [result, setResult] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [shakeAnim] = useState(new Animated.Value(0));
  const [fadeAnim] = useState(new Animated.Value(1));

  // Ladda sparad data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const saved = await AsyncStorage.getItem('@life_saved');
      const lost = await AsyncStorage.getItem('@life_lost');
      const grave = await AsyncStorage.getItem('@graveyard');
      const wage = await AsyncStorage.getItem('@hourly_wage');
      if (saved) setLifeSavedMins(parseInt(saved));
      if (lost) setLifeLostMins(parseInt(lost));
      if (grave) setGraveyard(JSON.parse(grave));
      if (wage) setHourlyWage(wage);
    } catch (e) {}
  };

  const saveData = async () => {
    try {
      await AsyncStorage.setItem('@life_saved', lifeSavedMins.toString());
      await AsyncStorage.setItem('@life_lost', lifeLostMins.toString());
      await AsyncStorage.setItem('@graveyard', JSON.stringify(graveyard));
      await AsyncStorage.setItem('@hourly_wage', hourlyWage);
    } catch (e) {}
  };

  useEffect(() => {
    saveData();
  }, [lifeSavedMins, lifeLostMins, graveyard, hourlyWage]);

  const shake = () => {
    Vibration.vibrate(100);
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 1, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 1, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  const getRandomDeathMessage = (item, mins) => {
    const messages = [
      `💀 ${item} stal ${mins} minuter från din livslinje`,
      `🪦 Här vilar ${mins} minuter - offrade för ${item}`,
      `⚰️ Du dog lite inombords för ${item}`,
      `😭 ${mins} minuter. För ${item}. Varför?`,
      `📉 Din livskvalitet minskade med ${mins} minuter`,
      `🎰 Du gamblade bort ${mins} minuter på ${item}`,
      `🧠 Din framtida jag hatar dig för ${item}`
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  };

  const handleDecision = (bought) => {
    const mins = result.mins;
    if (!bought) {
      setLifeSavedMins(prev => prev + mins);
      Animated.timing(fadeAnim, {
        toValue: 0.5,
        duration: 100,
        useNativeDriver: true,
      }).start(() => {
        fadeAnim.setValue(1);
      });
    } else {
      setLifeLostMins(prev => prev + mins);
      const deathMessage = getRandomDeathMessage(result.itemName || result.price + ' kr', mins);
      setGraveyard([{ 
        id: Date.now().toString(), 
        item: result.itemName || result.price + ' kr', 
        mins, 
        message: deathMessage,
        timestamp: new Date().toLocaleTimeString()
      }, ...graveyard]);
      shake();
    }
    setResult(null);
    setPrice('');
  };

  const shareGraveyard = async () => {
    const totalHoursLost = Math.round(lifeLostMins / 60);
    const totalHoursSaved = Math.round(lifeSavedMins / 60);
    const shareMessage = `🪦 KARMA GRAVEYARD 🪦\n\nJag har begravt ${totalHoursLost} timmar av mitt liv i onödiga köp.\nJag har räddat ${totalHoursSaved} timmar.\n\n💀 ${graveyard.length} döda köp i min graveyard.\n\nLadda ner Graveyard - sluta begrava din tid.`;
    
    try {
      await Share.share({
        message: shareMessage,
        title: 'Karma Graveyard'
      });
    } catch (error) {}
  };

  const formatTime = (mins) => {
    const hours = Math.floor(mins / 60);
    const minutes = mins % 60;
    if (hours === 0) return `${minutes} min`;
    if (minutes === 0) return `${hours} tim`;
    return `${hours}h ${minutes}m`;
  };

  const totalBalance = lifeSavedMins - lifeLostMins;
  const isInDebt = totalBalance < 0;

  const shakeStyle = {
    transform: [{
      translateX: shakeAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 10]
      })
    }]
  };

  return (
    <View style={styles.main}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        
        {/* HUVUDET - Dark Gothic Style */}
        <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
          <Text style={styles.logo}>🪦 KARMA</Text>
          <Text style={styles.logoSub}>GRAVEYARD</Text>
          <View style={styles.headerLine} />
        </Animated.View>

        {/* STATISTIK - The Balance of Fate */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceTitle}>⚖️ TIDENS DOMSTOL ⚖️</Text>
          <View style={styles.balanceRow}>
            <View style={styles.balanceLeft}>
              <Text style={styles.balanceLabel}>ÅTERUPPTÄCKT</Text>
              <Text style={styles.balanceGreen}>{formatTime(lifeSavedMins)}</Text>
              <Text style={styles.balanceSub}>FRÄLST</Text>
            </View>
            <View style={styles.balanceCenter}>
              <Text style={styles.balanceTotal}>
                {isInDebt ? '🔻' : '🔺'} {formatTime(Math.abs(totalBalance))}
              </Text>
              <Text style={styles.balanceTotalLabel}>NETTO</Text>
            </View>
            <View style={styles.balanceRight}>
              <Text style={styles.balanceLabel}>BEGRAVT</Text>
              <Text style={styles.balanceRed}>{formatTime(lifeLostMins)}</Text>
              <Text style={styles.balanceSub}>FÖRLORAT</Text>
            </View>
          </View>
        </View>

        {/* HUVUDINPUT - The Confession Booth */}
        {!result ? (
          <Animated.View style={[styles.confessionBox, shakeStyle]}>
            <Text style={styles.confessionTitle}>⚰️ BEKÄNN DITT KÖP ⚰️</Text>
            <View style={styles.priceContainer}>
              <TextInput
                style={styles.priceInput}
                keyboardType="numeric"
                value={price}
                onChangeText={setPrice}
                placeholder="0"
                placeholderTextColor="#2a2a2a"
                maxLength={7}
              />
              <Text style={styles.priceCurrency}>KR</Text>
            </View>
            <View style={styles.itemContainer}>
              <TextInput
                style={styles.itemInput}
                value={result?.itemName || ''}
                onChangeText={(text) => setResult(prev => prev ? { ...prev, itemName: text } : null)}
                placeholder="vad ville du köpa?"
                placeholderTextColor="#2a2a2a"
              />
            </View>
            <TouchableOpacity 
              style={[styles.judgmentBtn, !price && styles.judgmentBtnDisabled]} 
              onPress={() => {
                const p = parseFloat(price);
                if (p > 0) {
                  setResult({ 
                    mins: Math.round((p / parseFloat(hourlyWage)) * 60), 
                    price: p,
                    itemName: ''
                  });
                }
              }}
              disabled={!price}
            >
              <Text style={styles.judgmentBtnText}>
                {price ? '📜 DÖM MITT KÖP 📜' : 'SKRIV ETT PRIS'}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        ) : (
          /* DOMSLUTET - The Verdict */
          <Animated.View style={[styles.verdictBox, shakeStyle]}>
            <Text style={styles.verdictTitle}>⚡️ DOMSLUT ⚡️</Text>
            <View style={styles.sentenceCard}>
              <Text style={styles.sentenceTime}>{result.mins}</Text>
              <Text style={styles.sentenceUnit}>MINUTER AV DITT LIV</Text>
              <View style={styles.sentenceDivider} />
              <Text style={styles.sentenceItem}>
                {result.itemName || result.price + ' kr'}
              </Text>
            </View>
            <View style={styles.verdictActions}>
              <TouchableOpacity style={styles.saveBtn} onPress={() => handleDecision(false)}>
                <Text style={styles.saveBtnText}>🙏 ÅNGRA • FRÄLS TIDEN</Text>
                <Text style={styles.saveSub}>+{result.mins} min frihet</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.loseBtn} onPress={() => handleDecision(true)}>
                <Text style={styles.loseBtnText}>💀 BEGRAV • KÖP ÄNDÅ</Text>
                <Text style={styles.loseSub}>-{result.mins} min till graven</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        )}

        {/* GRAVEYARD - The Wall of Shame */}
        {graveyard.length > 0 && (
          <View style={styles.graveyardSection}>
            <View style={styles.graveyardHeader}>
              <Text style={styles.graveyardTitle}>🪦 GRAVEYARD 🪦</Text>
              <Text style={styles.graveyardCount}>{graveyard.length} BEGRAVDA KÖP</Text>
            </View>
            {graveyard.map((item, index) => (
              <Animated.View key={item.id} style={[styles.tombstone, index === 0 && styles.freshTombstone]}>
                <Text style={styles.tombstoneIcon}>🪦</Text>
                <View style={styles.tombstoneContent}>
                  <Text style={styles.tombstoneItem}>{item.item}</Text>
                  <Text style={styles.tombstoneMessage}>{item.message}</Text>
                  <Text style={styles.tombstoneTime}>{item.timestamp}</Text>
                </View>
                <Text style={styles.tombstoneMins}>-{item.mins} min</Text>
              </Animated.View>
            ))}
          </View>
        )}

        {/* DELA KNAPP */}
        {(lifeLostMins > 0 || lifeSavedMins > 0) && (
          <TouchableOpacity style={styles.shareBtn} onPress={shareGraveyard}>
            <Text style={styles.shareBtnText}>📤 DELA DIN GRAVEYARD</Text>
          </TouchableOpacity>
        )}

        {/* INSTÄLLNINGAR */}
        <TouchableOpacity style={styles.settingsBtn} onPress={() => setShowSettings(true)}>
          <Text style={styles.settingsBtnText}>⚙️ TIMLÖN: {hourlyWage} KR/H</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* SETTINGS MODAL */}
      {showSettings && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>⚰️ DIN DOMSTOL ⚰️</Text>
            <Text style={styles.modalLabel}>TIMLÖN EFTER SKATT</Text>
            <TextInput
              style={styles.modalInput}
              keyboardType="numeric"
              value={hourlyWage}
              onChangeText={setHourlyWage}
            />
            <Text style={styles.modalHint}>Botkyrka-snitt: 196 kr/h</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalSave} onPress={() => setShowSettings(false)}>
                <Text style={styles.modalSaveText}>SPARA</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  main: { flex: 1, backgroundColor: '#0a0a0a' },
  container: { paddingHorizontal: 20, paddingTop: 40, paddingBottom: 40 },
  
  // Header
  header: { alignItems: 'center', marginBottom: 30 },
  logo: { color: '#39FF14', fontSize: 28, fontWeight: '900', letterSpacing: 8, textAlign: 'center' },
  logoSub: { color: '#ff3333', fontSize: 12, letterSpacing: 6, marginTop: -5 },
  headerLine: { width: 60, height: 2, backgroundColor: '#39FF14', marginTop: 15, opacity: 0.5 },
  
  // Balance Card
  balanceCard: { backgroundColor: '#111', borderRadius: 20, padding: 20, marginBottom: 30, borderWidth: 1, borderColor: '#222' },
  balanceTitle: { color: '#39FF14', fontSize: 10, letterSpacing: 2, textAlign: 'center', marginBottom: 20 },
  balanceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  balanceLeft: { alignItems: 'center', flex: 1 },
  balanceRight: { alignItems: 'center', flex: 1 },
  balanceCenter: { alignItems: 'center', flex: 1.5 },
  balanceLabel: { color: '#555', fontSize: 8, letterSpacing: 1, marginBottom: 5 },
  balanceGreen: { color: '#39FF14', fontSize: 22, fontWeight: '900' },
  balanceRed: { color: '#ff3333', fontSize: 22, fontWeight: '900' },
  balanceSub: { color: '#333', fontSize: 8, marginTop: 3 },
  balanceTotal: { color: '#fff', fontSize: 18, fontWeight: '900' },
  balanceTotalLabel: { color: '#555', fontSize: 8, marginTop: 2 },
  
  // Confession Box
  confessionBox: { width: '100%', backgroundColor: '#111', borderRadius: 30, padding: 25, borderWidth: 1, borderColor: '#222' },
  confessionTitle: { color: '#39FF14', fontSize: 10, letterSpacing: 2, textAlign: 'center', marginBottom: 25 },
  priceContainer: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'center', marginBottom: 20, borderBottomWidth: 1, borderBottomColor: '#222', paddingBottom: 10 },
  priceInput: { color: '#fff', fontSize: 70, fontWeight: '900', textAlign: 'center', width: 200 },
  priceCurrency: { color: '#39FF14', fontSize: 30, fontWeight: '900', marginLeft: 5 },
  itemContainer: { marginBottom: 25 },
  itemInput: { color: '#888', fontSize: 16, textAlign: 'center', borderBottomWidth: 1, borderBottomColor: '#222', paddingVertical: 10 },
  judgmentBtn: { backgroundColor: '#39FF14', padding: 22, borderRadius: 60, alignItems: 'center', shadowColor: '#39FF14', shadowOpacity: 0.2, shadowRadius: 10 },
  judgmentBtnDisabled: { backgroundColor: '#1a1a1a', shadowOpacity: 0 },
  judgmentBtnText: { color: '#000', fontWeight: '900', fontSize: 16, letterSpacing: 1 },
  
  // Verdict
  verdictBox: { width: '100%', backgroundColor: '#111', borderRadius: 30, padding: 25, borderWidth: 2, borderColor: '#ff3333' },
  verdictTitle: { color: '#ff3333', fontSize: 10, letterSpacing: 2, textAlign: 'center', marginBottom: 20 },
  sentenceCard: { alignItems: 'center', marginBottom: 30, padding: 20, backgroundColor: '#0a0a0a', borderRadius: 20 },
  sentenceTime: { color: '#ff3333', fontSize: 60, fontWeight: '900' },
  sentenceUnit: { color: '#555', fontSize: 10, letterSpacing: 2, marginTop: 5 },
  sentenceDivider: { width: 40, height: 1, backgroundColor: '#222', marginVertical: 15 },
  sentenceItem: { color: '#fff', fontSize: 18, fontWeight: '600' },
  verdictActions: { gap: 12 },
  saveBtn: { backgroundColor: '#39FF14', padding: 18, borderRadius: 40, alignItems: 'center' },
  saveBtnText: { color: '#000', fontWeight: '900', fontSize: 14 },
  saveSub: { color: '#000', fontSize: 10, marginTop: 3, opacity: 0.7 },
  loseBtn: { backgroundColor: '#1a1a1a', padding: 18, borderRadius: 40, alignItems: 'center', borderWidth: 1, borderColor: '#ff3333' },
  loseBtnText: { color: '#ff3333', fontWeight: '900', fontSize: 14 },
  loseSub: { color: '#ff3333', fontSize: 10, marginTop: 3, opacity: 0.7 },
  
  // Graveyard
  graveyardSection: { marginTop: 40, borderTopWidth: 1, borderTopColor: '#222', paddingTop: 20 },
  graveyardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 15 },
  graveyardTitle: { color: '#ff3333', fontSize: 12, letterSpacing: 2, fontWeight: 'bold' },
  graveyardCount: { color: '#444', fontSize: 10 },
  tombstone: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0d0d0d', borderRadius: 15, padding: 12, marginBottom: 8, borderLeftWidth: 3, borderLeftColor: '#ff3333' },
  freshTombstone: { borderLeftColor: '#39FF14', backgroundColor: '#111' },
  tombstoneIcon: { fontSize: 24, marginRight: 12 },
  tombstoneContent: { flex: 1 },
  tombstoneItem: { color: '#fff', fontSize: 14, fontWeight: '600' },
  tombstoneMessage: { color: '#555', fontSize: 10, marginTop: 2 },
  tombstoneTime: { color: '#333', fontSize: 8, marginTop: 2 },
  tombstoneMins: { color: '#ff3333', fontSize: 12, fontWeight: 'bold' },
  
  // Buttons
  shareBtn: { marginTop: 30, padding: 16, borderRadius: 30, borderWidth: 1, borderColor: '#222', alignItems: 'center' },
  shareBtnText: { color: '#fff', fontSize: 14 },
  settingsBtn: { marginTop: 15, padding: 10, alignItems: 'center' },
  settingsBtnText: { color: '#333', fontSize: 10 },
  
  // Modal
  modalOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.95)', justifyContent: 'center', padding: 20 },
  modalCard: { backgroundColor: '#111', borderRadius: 30, padding: 30, borderWidth: 1, borderColor: '#222' },
  modalTitle: { color: '#39FF14', fontSize: 18, fontWeight: '900', textAlign: 'center', marginBottom: 20 },
  modalLabel: { color: '#555', fontSize: 10, marginBottom: 10 },
  modalInput: { backgroundColor: '#0a0a0a', color: '#fff', padding: 18, borderRadius: 20, fontSize: 24, textAlign: 'center', marginBottom: 10 },
  modalHint: { color: '#333', fontSize: 10, textAlign: 'center', marginBottom: 20 },
  modalButtons: { alignItems: 'center' },
  modalSave: { backgroundColor: '#39FF14', padding: 18, borderRadius: 30, width: '100%', alignItems: 'center' },
  modalSaveText: { color: '#000', fontWeight: '900' }
});