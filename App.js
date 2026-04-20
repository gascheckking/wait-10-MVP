// App.js
// KARMA GRAVEYARD V3 - with GOALS & AUTO TAX 💀🪦

import React, { useState, useEffect, useRef } from 'react';
import { 
  StyleSheet, Text, View, TextInput, TouchableOpacity, 
  ScrollView, Animated, Share, Dimensions, Vibration, Modal 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

// ============ SKATTETABELL SVERIGE (TOP 30 KOMMUNER) ============
const kommunData = {
  'Stockholm': { skatt: 29.98, region: 'Stockholm' },
  'Göteborg': { skatt: 31.47, region: 'Västra Götaland' },
  'Malmö': { skatt: 32.28, region: 'Skåne' },
  'Botkyrka': { skatt: 32.12, region: 'Stockholm' },
  'Uppsala': { skatt: 33.12, region: 'Uppsala' },
  'Linköping': { skatt: 32.85, region: 'Östergötland' },
  'Västerås': { skatt: 33.01, region: 'Västmanland' },
  'Örebro': { skatt: 32.94, region: 'Örebro' },
  'Helsingborg': { skatt: 32.41, region: 'Skåne' },
  'Norrköping': { skatt: 33.22, region: 'Östergötland' },
  'Jönköping': { skatt: 32.67, region: 'Jönköping' },
  'Umeå': { skatt: 33.45, region: 'Västerbotten' },
  'Luleå': { skatt: 33.18, region: 'Norrbotten' },
  'Lund': { skatt: 32.15, region: 'Skåne' },
  'Karlstad': { skatt: 33.31, region: 'Värmland' },
  'Halmstad': { skatt: 32.87, region: 'Halland' },
  'Sundsvall': { skatt: 33.54, region: 'Västernorrland' },
  'Karlskrona': { skatt: 33.28, region: 'Blekinge' },
  'Kristianstad': { skatt: 32.93, region: 'Skåne' },
  'Trollhättan': { skatt: 32.76, region: 'Västra Götaland' },
  'Borås': { skatt: 32.89, region: 'Västra Götaland' },
  'Eskilstuna': { skatt: 33.45, region: 'Södermanland' },
  'Nyköping': { skatt: 33.18, region: 'Södermanland' },
  'Falun': { skatt: 33.62, region: 'Dalarna' },
  'Gävle': { skatt: 33.41, region: 'Gävleborg' },
  'Skellefteå': { skatt: 33.29, region: 'Västerbotten' },
  'Östersund': { skatt: 33.84, region: 'Jämtland' },
  'Kalmar': { skatt: 33.53, region: 'Kalmar' },
  'Visby': { skatt: 33.15, region: 'Gotland' },
  'Växjö': { skatt: 33.37, region: 'Kronoberg' },
};

const calculateHourlyWage = (bruttoPerMonth, kommun) => {
  const skattesats = kommunData[kommun]?.skatt || 32;
  const skatt = (bruttoPerMonth * skattesats) / 100;
  const netto = bruttoPerMonth - skatt;
  const timmarPerManad = 160;
  return Math.round(netto / timmarPerManad);
};

const calculateNetPerHour = (bruttoPerMonth, kommun) => {
  const skattesats = kommunData[kommun]?.skatt || 32;
  const skatt = (bruttoPerMonth * skattesats) / 100;
  return Math.round((bruttoPerMonth - skatt) / 160);
};

export default function App() {
  // User settings
  const [bruttoLon, setBruttoLon] = useState('43000');
  const [selectedKommun, setSelectedKommun] = useState('Botkyrka');
  const [hourlyWage, setHourlyWage] = useState(196);
  const [showSettings, setShowSettings] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Stats
  const [lifeSavedMins, setLifeSavedMins] = useState(0);
  const [lifeLostMins, setLifeLostMins] = useState(0);
  const [graveyard, setGraveyard] = useState([]);
  const [result, setResult] = useState(null);
  
  // Goal
  const [goalName, setGoalName] = useState('Resa till Tokyo');
  const [goalAmount, setGoalAmount] = useState('25000');
  const [showGoalModal, setShowGoalModal] = useState(false);
  
  // Animations
  const [shakeAnim] = useState(new Animated.Value(0));
  const [fadeAnim] = useState(new Animated.Value(1));

  // Ladda data
  useEffect(() => {
    loadData();
  }, []);

  // Uppdatera timlön när lön/kommun ändras
  useEffect(() => {
    const nyTimlon = calculateNetPerHour(parseFloat(bruttoLon) || 0, selectedKommun);
    setHourlyWage(nyTimlon);
  }, [bruttoLon, selectedKommun]);

  const loadData = async () => {
    try {
      const saved = await AsyncStorage.getItem('@life_saved');
      const lost = await AsyncStorage.getItem('@life_lost');
      const grave = await AsyncStorage.getItem('@graveyard');
      const wage = await AsyncStorage.getItem('@hourly_wage');
      const brutto = await AsyncStorage.getItem('@brutto_lon');
      const kommun = await AsyncStorage.getItem('@kommun');
      const goalN = await AsyncStorage.getItem('@goal_name');
      const goalA = await AsyncStorage.getItem('@goal_amount');
      
      if (saved) setLifeSavedMins(parseInt(saved));
      if (lost) setLifeLostMins(parseInt(lost));
      if (grave) setGraveyard(JSON.parse(grave));
      if (wage) setHourlyWage(parseInt(wage));
      if (brutto) setBruttoLon(brutto);
      if (kommun) setSelectedKommun(kommun);
      if (goalN) setGoalName(goalN);
      if (goalA) setGoalAmount(goalA);
    } catch (e) {}
  };

  const saveData = async () => {
    try {
      await AsyncStorage.setItem('@life_saved', lifeSavedMins.toString());
      await AsyncStorage.setItem('@life_lost', lifeLostMins.toString());
      await AsyncStorage.setItem('@graveyard', JSON.stringify(graveyard));
      await AsyncStorage.setItem('@hourly_wage', hourlyWage.toString());
      await AsyncStorage.setItem('@brutto_lon', bruttoLon);
      await AsyncStorage.setItem('@kommun', selectedKommun);
      await AsyncStorage.setItem('@goal_name', goalName);
      await AsyncStorage.setItem('@goal_amount', goalAmount);
    } catch (e) {}
  };

  useEffect(() => {
    saveData();
  }, [lifeSavedMins, lifeLostMins, graveyard, hourlyWage, bruttoLon, selectedKommun, goalName, goalAmount]);

  // Beräkningar
  const savedKronor = Math.round((lifeSavedMins / 60) * hourlyWage);
  const lostKronor = Math.round((lifeLostMins / 60) * hourlyWage);
  const nettoKronor = savedKronor - lostKronor;
  const goalProgress = Math.min(100, (savedKronor / parseFloat(goalAmount)) * 100);

  const shake = () => {
    Vibration.vibrate(50);
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 1, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  const getRandomDeathMessage = (item, mins) => {
    const messages = [
      `💀 ${item} stal ${mins} minuter från ditt liv`,
      `🪦 Här vilar ${mins} minuter - offrade för ${item}`,
      `⚰️ Du dog lite inombords för ${item}`,
      `😭 ${mins} minuter. För ${item}. Varför?`,
      `📉 Din livskvalitet minskade med ${mins} minuter`,
      `🎰 Du gamblade bort ${mins} minuter på ${item}`,
      `🧠 Din framtida jag hatar dig för ${item}`,
      `💸 ${item} = ${mins} minuter närmare döden`
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
      }).start(() => fadeAnim.setValue(1));
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
  };

  const shareGraveyard = async () => {
    const shareMessage = `🪦 KARMA GRAVEYARD 🪦\n\nJag har FRÄLST ${savedKronor} kr (${Math.round(lifeSavedMins/60)} timmar)\nJag har BEGRAVT ${lostKronor} kr (${Math.round(lifeLostMins/60)} timmar)\n\n🎯 Mål: ${goalName} • ${Math.round(goalProgress)}% klart\n\nLadda ner Graveyard - sluta begrava din tid.`;
    
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
    if (minutes === 0) return `${hours} h`;
    return `${hours}h ${minutes}m`;
  };

  const filteredKommuner = Object.keys(kommunData).filter(k => 
    k.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.main}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        
        {/* HEADER */}
        <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
          <Text style={styles.logo}>🪦 KARMA</Text>
          <Text style={styles.logoSub}>GRAVEYARD</Text>
          <View style={styles.headerLine} />
        </Animated.View>

        {/* STATS - TIDENS DOMSTOL */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceTitle}>⚖️ TIDENS DOMSTOL ⚖️</Text>
          <View style={styles.balanceRow}>
            <View style={styles.balanceLeft}>
              <Text style={styles.balanceLabel}>FRÄLST</Text>
              <Text style={styles.balanceGreen}>{savedKronor} kr</Text>
              <Text style={styles.balanceSub}>{formatTime(lifeSavedMins)}</Text>
            </View>
            <View style={styles.balanceCenter}>
              <Text style={styles.balanceTotal}>
                {nettoKronor >= 0 ? '🔺' : '🔻'} {Math.abs(nettoKronor)} kr
              </Text>
              <Text style={styles.balanceTotalLabel}>NETTO</Text>
            </View>
            <View style={styles.balanceRight}>
              <Text style={styles.balanceLabel}>BEGRAVT</Text>
              <Text style={styles.balanceRed}>{lostKronor} kr</Text>
              <Text style={styles.balanceSub}>{formatTime(lifeLostMins)}</Text>
            </View>
          </View>
        </View>

        {/* GOAL PROGRESS */}
        <TouchableOpacity style={styles.goalCard} onPress={() => setShowGoalModal(true)}>
          <View style={styles.goalHeader}>
            <Text style={styles.goalTitle}>🎯 {goalName}</Text>
            <Text style={styles.goalEdit}>✏️</Text>
          </View>
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { width: `${goalProgress}%` }]} />
          </View>
          <View style={styles.goalStats}>
            <Text style={styles.goalSaved}>{savedKronor} kr / {parseInt(goalAmount).toLocaleString()} kr</Text>
            <Text style={styles.goalPercent}>{Math.round(goalProgress)}%</Text>
          </View>
          <Text style={styles.goalRemaining}>
            {goalProgress >= 100 ? '🎉 MÅL UPPNÅTT! 🎉' : `${(parseFloat(goalAmount) - savedKronor).toLocaleString()} kr kvar`}
          </Text>
        </TouchableOpacity>

        {/* CONFESSION */}
        {!result ? (
          <Animated.View style={[styles.confessionBox, { transform: [{ translateX: shakeAnim.interpolate({ inputRange: [0,1], outputRange: [0,10] }) }] }]}>
            <Text style={styles.confessionTitle}>⚰️ BEKÄNN DITT KÖP ⚰️</Text>
            <TextInput
              style={styles.itemInput}
              placeholder="Vad vill du köpa?"
              placeholderTextColor="#2a2a2a"
              value={result?.itemName || ''}
              onChangeText={(text) => setResult(prev => prev ? { ...prev, itemName: text } : null)}
            />
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
            <TouchableOpacity 
              style={[styles.judgmentBtn, !price && styles.judgmentBtnDisabled]} 
              onPress={() => {
                const p = parseFloat(price);
                if (p > 0) {
                  setResult({ 
                    mins: Math.round((p / hourlyWage) * 60), 
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
          /* VERDICT */
          <Animated.View style={[styles.verdictBox, { transform: [{ translateX: shakeAnim.interpolate({ inputRange: [0,1], outputRange: [0,10] }) }] }]}>
            <Text style={styles.verdictTitle}>⚡️ DOMSLUT ⚡️</Text>
            <View style={styles.sentenceCard}>
              <Text style={styles.sentenceTime}>{result.mins}</Text>
              <Text style={styles.sentenceUnit}>MINUTER AV DITT LIV</Text>
              <View style={styles.sentenceDivider} />
              <Text style={styles.sentenceValue}>{Math.round((result.mins / 60) * hourlyWage)} KR</Text>
              <Text style={styles.sentenceItem}>{result.itemName || result.price + ' kr'}</Text>
            </View>
            <View style={styles.verdictActions}>
              <TouchableOpacity style={styles.saveBtn} onPress={() => handleDecision(false)}>
                <Text style={styles.saveBtnText}>🙏 FRÄLS TIDEN</Text>
                <Text style={styles.saveSub}>+{result.mins} min • +{Math.round((result.mins/60)*hourlyWage)} kr till målet</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.loseBtn} onPress={() => handleDecision(true)}>
                <Text style={styles.loseBtnText}>💀 BEGRAV TIDEN</Text>
                <Text style={styles.loseSub}>-{result.mins} min • -{Math.round((result.mins/60)*hourlyWage)} kr till graven</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        )}

        {/* GRAVEYARD */}
        {graveyard.length > 0 && (
          <View style={styles.graveyardSection}>
            <View style={styles.graveyardHeader}>
              <Text style={styles.graveyardTitle}>🪦 GRAVEYARD 🪦</Text>
              <Text style={styles.graveyardCount}>{graveyard.length} DÖDA KÖP</Text>
            </View>
            {graveyard.map((item, index) => (
              <View key={item.id} style={[styles.tombstone, index === 0 && styles.freshTombstone]}>
                <Text style={styles.tombstoneIcon}>🪦</Text>
                <View style={styles.tombstoneContent}>
                  <Text style={styles.tombstoneItem}>{item.item}</Text>
                  <Text style={styles.tombstoneMessage}>{item.message}</Text>
                  <Text style={styles.tombstoneTime}>{item.timestamp}</Text>
                </View>
                <Text style={styles.tombstoneMins}>-{item.mins} min</Text>
              </View>
            ))}
          </View>
        )}

        {/* SHARE & SETTINGS */}
        {(lifeLostMins > 0 || lifeSavedMins > 0) && (
          <TouchableOpacity style={styles.shareBtn} onPress={shareGraveyard}>
            <Text style={styles.shareBtnText}>📤 DELA DIN GRAVEYARD</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.settingsBtn} onPress={() => setShowSettings(true)}>
          <Text style={styles.settingsBtnText}>⚙️ {hourlyWage} KR/H • {selectedKommun}</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* SETTINGS MODAL */}
      <Modal visible={showSettings} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>⚰️ DIN DOMSTOL ⚰️</Text>
            
            <Text style={styles.modalLabel}>MÅNADSLÖN (BRUTTO)</Text>
            <TextInput
              style={styles.modalInput}
              keyboardType="numeric"
              value={bruttoLon}
              onChangeText={setBruttoLon}
              placeholder="43000"
            />
            
            <Text style={styles.modalLabel}>KOMMUN</Text>
            <TextInput
              style={styles.modalSearch}
              placeholder="🔍 Sök kommun..."
              placeholderTextColor="#333"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            
            <ScrollView style={styles.kommunList} nestedScrollEnabled={true}>
              {filteredKommuner.map(kommun => (
                <TouchableOpacity
                  key={kommun}
                  style={[styles.kommunItem, selectedKommun === kommun && styles.kommunItemSelected]}
                  onPress={() => {
                    setSelectedKommun(kommun);
                    setSearchQuery('');
                  }}
                >
                  <Text style={[styles.kommunText, selectedKommun === kommun && styles.kommunTextSelected]}>
                    {kommun} • {kommunData[kommun]?.skatt}%
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            
            <View style={styles.timlonDisplay}>
              <Text style={styles.timlonLabel}>DIN TIMLÖN EFTER SKATT</Text>
              <Text style={styles.timlonValue}>{hourlyWage} KR/H</Text>
            </View>
            
            <TouchableOpacity style={styles.modalSave} onPress={() => setShowSettings(false)}>
              <Text style={styles.modalSaveText}>SPARA OCH DÖM MIG</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* GOAL MODAL */}
      <Modal visible={showGoalModal} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>🎯 DITT MÅL</Text>
            
            <Text style={styles.modalLabel}>VAD SPARAR DU TILL?</Text>
            <TextInput
              style={styles.modalInput}
              value={goalName}
              onChangeText={setGoalName}
              placeholder="Resa till Tokyo"
            />
            
            <Text style={styles.modalLabel}>HUR MYCKET BEHÖVS?</Text>
            <TextInput
              style={styles.modalInput}
              keyboardType="numeric"
              value={goalAmount}
              onChangeText={setGoalAmount}
              placeholder="25000"
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalSave} onPress={() => setShowGoalModal(false)}>
                <Text style={styles.modalSaveText}>SPARA MÅL</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  main: { flex: 1, backgroundColor: '#0a0a0a' },
  container: { paddingHorizontal: 20, paddingTop: 40, paddingBottom: 40 },
  
  header: { alignItems: 'center', marginBottom: 30 },
  logo: { color: '#39FF14', fontSize: 28, fontWeight: '900', letterSpacing: 8 },
  logoSub: { color: '#ff3333', fontSize: 12, letterSpacing: 6, marginTop: -5 },
  headerLine: { width: 60, height: 2, backgroundColor: '#39FF14', marginTop: 15, opacity: 0.5 },
  
  balanceCard: { backgroundColor: '#111', borderRadius: 20, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: '#222' },
  balanceTitle: { color: '#39FF14', fontSize: 10, letterSpacing: 2, textAlign: 'center', marginBottom: 20 },
  balanceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  balanceLeft: { alignItems: 'center', flex: 1 },
  balanceRight: { alignItems: 'center', flex: 1 },
  balanceCenter: { alignItems: 'center', flex: 1.5 },
  balanceLabel: { color: '#555', fontSize: 8, letterSpacing: 1, marginBottom: 5 },
  balanceGreen: { color: '#39FF14', fontSize: 18, fontWeight: '900' },
  balanceRed: { color: '#ff3333', fontSize: 18, fontWeight: '900' },
  balanceSub: { color: '#333', fontSize: 8, marginTop: 3 },
  balanceTotal: { color: '#fff', fontSize: 16, fontWeight: '900' },
  balanceTotalLabel: { color: '#555', fontSize: 8, marginTop: 2 },
  
  goalCard: { backgroundColor: '#111', borderRadius: 20, padding: 20, marginBottom: 30, borderWidth: 1, borderColor: '#39FF14' },
  goalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  goalTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  goalEdit: { color: '#555', fontSize: 14 },
  progressBarContainer: { height: 8, backgroundColor: '#1a1a1a', borderRadius: 4, overflow: 'hidden', marginBottom: 10 },
  progressBar: { height: '100%', backgroundColor: '#39FF14', borderRadius: 4 },
  goalStats: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 },
  goalSaved: { color: '#39FF14', fontSize: 12, fontWeight: 'bold' },
  goalPercent: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  goalRemaining: { color: '#555', fontSize: 10 },
  
  confessionBox: { width: '100%', backgroundColor: '#111', borderRadius: 30, padding: 25, borderWidth: 1, borderColor: '#222' },
  confessionTitle: { color: '#39FF14', fontSize: 10, letterSpacing: 2, textAlign: 'center', marginBottom: 20 },
  itemInput: { color: '#888', fontSize: 16, textAlign: 'center', borderBottomWidth: 1, borderBottomColor: '#222', paddingVertical: 10, marginBottom: 20 },
  priceContainer: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'center', marginBottom: 25, borderBottomWidth: 1, borderBottomColor: '#222', paddingBottom: 10 },
  priceInput: { color: '#fff', fontSize: 60, fontWeight: '900', textAlign: 'center', width: 180 },
  priceCurrency: { color: '#39FF14', fontSize: 24, fontWeight: '900', marginLeft: 5 },
  judgmentBtn: { backgroundColor: '#39FF14', padding: 20, borderRadius: 60, alignItems: 'center' },
  judgmentBtnDisabled: { backgroundColor: '#1a1a1a' },
  judgmentBtnText: { color: '#000', fontWeight: '900', fontSize: 14, letterSpacing: 1 },
  
  verdictBox: { width: '100%', backgroundColor: '#111', borderRadius: 30, padding: 25, borderWidth: 2, borderColor: '#ff3333' },
  verdictTitle: { color: '#ff3333', fontSize: 10, letterSpacing: 2, textAlign: 'center', marginBottom: 20 },
  sentenceCard: { alignItems: 'center', marginBottom: 25, padding: 20, backgroundColor: '#0a0a0a', borderRadius: 20 },
  sentenceTime: { color: '#ff3333', fontSize: 55, fontWeight: '900' },
  sentenceUnit: { color: '#555', fontSize: 10, letterSpacing: 2, marginTop: 5 },
  sentenceDivider: { width: 40, height: 1, backgroundColor: '#222', marginVertical: 12 },
  sentenceValue: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginBottom: 5 },
  sentenceItem: { color: '#888', fontSize: 14 },
  verdictActions: { gap: 12 },
  saveBtn: { backgroundColor: '#39FF14', padding: 16, borderRadius: 40, alignItems: 'center' },
  saveBtnText: { color: '#000', fontWeight: '900', fontSize: 14 },
  saveSub: { color: '#000', fontSize: 10, marginTop: 3, opacity: 0.7 },
  loseBtn: { backgroundColor: '#1a1a1a', padding: 16, borderRadius: 40, alignItems: 'center', borderWidth: 1, borderColor: '#ff3333' },
  loseBtnText: { color: '#ff3333', fontWeight: '900', fontSize: 14 },
  loseSub: { color: '#ff3333', fontSize: 10, marginTop: 3, opacity: 0.7 },
  
  graveyardSection: { marginTop: 30, borderTopWidth: 1, borderTopColor: '#222', paddingTop: 20 },
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
  
  shareBtn: { marginTop: 30, padding: 16, borderRadius: 30, borderWidth: 1, borderColor: '#222', alignItems: 'center' },
  shareBtnText: { color: '#fff', fontSize: 14 },
  settingsBtn: { marginTop: 15, padding: 10, alignItems: 'center' },
  settingsBtnText: { color: '#333', fontSize: 10 },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.95)', justifyContent: 'center', padding: 20 },
  modalCard: { backgroundColor: '#111', borderRadius: 30, padding: 25, borderWidth: 1, borderColor: '#222', maxHeight: '80%' },
  modalTitle: { color: '#39FF14', fontSize: 18, fontWeight: '900', textAlign: 'center', marginBottom: 20 },
  modalLabel: { color: '#555', fontSize: 10, marginBottom: 8, marginTop: 12 },
  modalInput: { backgroundColor: '#0a0a0a', color: '#fff', padding: 15, borderRadius: 15, fontSize: 18, textAlign: 'center' },
  modalSearch: { backgroundColor: '#0a0a0a', color: '#fff', padding: 12, borderRadius: 10, marginBottom: 10, fontSize: 14 },
  kommunList: { maxHeight: 150, marginBottom: 15 },
  kommunItem: { paddingVertical: 12, paddingHorizontal: 15, borderBottomWidth: 1, borderBottomColor: '#1a1a1a' },
  kommunItemSelected: { backgroundColor: '#39FF14', borderRadius: 10 },
  kommunText: { color: '#888', fontSize: 13 },
  kommunTextSelected: { color: '#000', fontWeight: '900' },
  timlonDisplay: { backgroundColor: '#0a0a0a', padding: 18, borderRadius: 15, alignItems: 'center', marginVertical: 15 },
  timlonLabel: { color: '#555', fontSize: 10, letterSpacing: 1 },
  timlonValue: { color: '#39FF14', fontSize: 28, fontWeight: '900', marginTop: 5 },
  modalSave: { backgroundColor: '#39FF14', padding: 18, borderRadius: 30, alignItems: 'center', marginTop: 10 },
  modalSaveText: { color: '#000', fontWeight: '900', fontSize: 14 },
  modalButtons: { marginTop: 10 }
});