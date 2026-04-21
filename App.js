// App.js
// PRISDOMAREN - Fota, Jämför, Spara eller Slösa 💀📸

import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity,
  ScrollView, Share, Vibration, Modal, Image, ActivityIndicator,
  FlatList, Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Camera } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';

export default function App() {
  // Kamera
  const [hasPermission, setHasPermission] = useState(null);
  const [cameraVisible, setCameraVisible] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const cameraRef = useRef(null);

  // App state
  const [hourlyWage, setHourlyWage] = useState('100');
  const [manualProduct, setManualProduct] = useState('');
  const [manualPrice, setManualPrice] = useState('');
  const [scannedPrice, setScannedPrice] = useState(null);
  const [scannedProduct, setScannedProduct] = useState('');
  
  // Sparade pengar
  const [totalSaved, setTotalSaved] = useState(0);
  const [streak, setStreak] = useState(0);
  const [graveyard, setGraveyard] = useState([]);
  const [currentComparison, setCurrentComparison] = useState(null);
  
  // Mål
  const [goalName, setGoalName] = useState('Sparmål');
  const [goalAmount, setGoalAmount] = useState('5000');
  const [showSettings, setShowSettings] = useState(false);
  
  // Loading
  const [loading, setLoading] = useState(false);
  const [foundOffers, setFoundOffers] = useState([]);

  // Kamera tillstånd
  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  // Ladda data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const saved = await AsyncStorage.getItem('@total_saved');
      const str = await AsyncStorage.getItem('@streak');
      const grave = await AsyncStorage.getItem('@graveyard');
      const wage = await AsyncStorage.getItem('@hourly_wage');
      const goalN = await AsyncStorage.getItem('@goal_name');
      const goalA = await AsyncStorage.getItem('@goal_amount');
      
      if (saved) setTotalSaved(parseInt(saved));
      if (str) setStreak(parseInt(str));
      if (grave) setGraveyard(JSON.parse(grave));
      if (wage) setHourlyWage(wage);
      if (goalN) setGoalName(goalN);
      if (goalA) setGoalAmount(goalA);
    } catch (e) {}
  };

  const saveData = async () => {
    try {
      await AsyncStorage.setItem('@total_saved', totalSaved.toString());
      await AsyncStorage.setItem('@streak', streak.toString());
      await AsyncStorage.setItem('@graveyard', JSON.stringify(graveyard));
      await AsyncStorage.setItem('@hourly_wage', hourlyWage);
      await AsyncStorage.setItem('@goal_name', goalName);
      await AsyncStorage.setItem('@goal_amount', goalAmount);
    } catch (e) {}
  };

  useEffect(() => {
    saveData();
  }, [totalSaved, streak, graveyard, hourlyWage, goalName, goalAmount]);

  // Simulera prissökning (mock API)
  const searchPrices = async (productName, originalPrice) => {
    setLoading(true);
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mockade priser från olika plattformar
    const mockOffers = [
      { platform: 'Vinted', price: Math.round(originalPrice * 0.4), condition: 'Begagnad - Bra skick', savings: originalPrice - Math.round(originalPrice * 0.4) },
      { platform: 'Tradera', price: Math.round(originalPrice * 0.55), condition: 'Auktion - 2 dagar kvar', savings: originalPrice - Math.round(originalPrice * 0.55) },
      { platform: 'Prisjakt', price: Math.round(originalPrice * 0.7), condition: 'Ny - Annan butik', savings: originalPrice - Math.round(originalPrice * 0.7) },
      { platform: 'Amazon', price: Math.round(originalPrice * 0.85), condition: 'Ny - Prime', savings: originalPrice - Math.round(originalPrice * 0.85) },
      { platform: 'Blocket', price: Math.round(originalPrice * 0.5), condition: 'Begagnad - Som ny', savings: originalPrice - Math.round(originalPrice * 0.5) },
    ];
    
    mockOffers.sort((a, b) => a.price - b.price);
    setFoundOffers(mockOffers);
    setLoading(false);
  };

  // Ta bild
  const takePicture = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync();
      setCapturedImage(photo.uri);
      setCameraVisible(false);
      
      Alert.alert(
        "📸 Vad kostar produkten?",
        "",
        [
          { text: "Avbryt", style: "cancel" },
          { 
            text: "Ange pris", 
            onPress: () => {
              Alert.prompt("Pris", "Ange priset i kronor", [
                { text: "Avbryt" },
                { text: "OK", onPress: (price) => {
                  if (price) {
                    setScannedPrice(parseInt(price));
                    Alert.prompt("Produkt", "Vad heter produkten?", [
                      { text: "Avbryt" },
                      { text: "OK", onPress: (product) => {
                        if (product) {
                          setScannedProduct(product);
                          searchPrices(product, parseInt(price));
                        }
                      }}
                    ]);
                  }
                }}
              ]);
            }
          }
        ]
      );
    }
  };

  // Manuell sökning (fallback)
  const handleManualSearch = () => {
    if (manualProduct && manualPrice) {
      setScannedProduct(manualProduct);
      setScannedPrice(parseInt(manualPrice));
      searchPrices(manualProduct, parseInt(manualPrice));
    }
  };

  // Beräkna timmar
  const calculateHours = (price) => {
    return (price / parseFloat(hourlyWage)).toFixed(1);
  };

  // Fräls pengar
  const fralsBelopp = (sparatBelopp) => {
    const newTotal = totalSaved + sparatBelopp;
    const newStreak = streak + 1;
    
    setTotalSaved(newTotal);
    setStreak(newStreak);
    
    Vibration.vibrate(100);
    
    Alert.alert(
      "🙏 FRÄLST!",
      `Du sparade ${sparatBelopp} kr!\nStreak: ${newStreak} dagar`,
      [{ text: "🔥 Grymt!" }]
    );
    
    setCurrentComparison(null);
    setScannedProduct('');
    setScannedPrice(null);
    setFoundOffers([]);
    setManualProduct('');
    setManualPrice('');
  };

  // Begrav pengar
  const begravBelopp = (slosatBelopp, productName) => {
    const newStreak = 0;
    setStreak(newStreak);
    
    const deathMessage = `💀 Du slösade ${slosatBelopp} kr på ${productName} - kunde sparat genom att jämföra priser`;
    
    setGraveyard([{
      id: Date.now().toString(),
      item: productName,
      amount: slosatBelopp,
      message: deathMessage,
      timestamp: new Date().toLocaleTimeString()
    }, ...graveyard]);
    
    Vibration.vibrate(200);
    
    Alert.alert(
      "💀 BEGRAVT!",
      `Du förlorade ${slosatBelopp} kr.\nStreak bruten. Börja om imorgon.`,
      [{ text: "😭" }]
    );
    
    setCurrentComparison(null);
    setScannedProduct('');
    setScannedPrice(null);
    setFoundOffers([]);
    setManualProduct('');
    setManualPrice('');
  };

  const goalProgress = Math.min(100, (totalSaved / parseFloat(goalAmount)) * 100);

  return (
    <View style={styles.main}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.logo}>📸 PRISDOMAREN</Text>
          <Text style={styles.logoSub}>SPARA ELLER SLÖSA</Text>
        </View>

        {/* STATS */}
        <View style={styles.statsCard}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>SPARAT</Text>
              <Text style={styles.statGreen}>{totalSaved} kr</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>STREAK</Text>
              <Text style={styles.statWhite}>🔥 {streak}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>MÅL</Text>
              <Text style={styles.statGreen}>{Math.round(goalProgress)}%</Text>
            </View>
          </View>
          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, { width: `${goalProgress}%` }]} />
          </View>
          <Text style={styles.goalText}>{goalName}: {totalSaved}/{parseInt(goalAmount).toLocaleString()} kr</Text>
        </View>

        {/* HUVUDFUNKTION */}
        {!currentComparison && !loading && foundOffers.length === 0 && (
          <View style={styles.mainCard}>
            <Text style={styles.cardTitle}>⚖️ VAD VILL DU KÖPA?</Text>
            
            <TouchableOpacity style={styles.cameraBtn} onPress={() => setCameraVisible(true)}>
              <Text style={styles.cameraBtnText}>📸 FOTA PRISLAPP</Text>
              <Text style={styles.cameraSubtext}>Rikta kameran mot priset</Text>
            </TouchableOpacity>
            
            <Text style={styles.orText}>ELLER</Text>
            
            <TextInput
              style={styles.productInput}
              placeholder="Produktnamn (t.ex. Nike Air Max)"
              placeholderTextColor="#444"
              value={manualProduct}
              onChangeText={setManualProduct}
            />
            
            <TextInput
              style={styles.priceInput}
              keyboardType="numeric"
              placeholder="Pris i butik"
              placeholderTextColor="#444"
              value={manualPrice}
              onChangeText={setManualPrice}
            />
            
            <TouchableOpacity 
              style={[styles.searchBtn, (!manualProduct || !manualPrice) && styles.disabledBtn]}
              onPress={handleManualSearch}
              disabled={!manualProduct || !manualPrice}
            >
              <Text style={styles.searchBtnText}>🔍 JÄMFÖR PRISER ONLINE</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* LADDAR */}
        {loading && (
          <View style={styles.loadingCard}>
            <ActivityIndicator size="large" color="#39FF14" />
            <Text style={styles.loadingText}>Söker bästa priser...</Text>
            <Text style={styles.loadingSub}>Kollar Vinted, Tradera, Prisjakt...</Text>
          </View>
        )}

        {/* RESULTAT */}
        {!loading && foundOffers.length > 0 && !currentComparison && (
          <View style={styles.resultsCard}>
            <Text style={styles.resultsTitle}>🔍 BILLIGASTE ALTERNATIV</Text>
            <Text style={styles.originalProduct}>{scannedProduct}</Text>
            <Text style={styles.originalPrice}>Butik: {scannedPrice} kr ({calculateHours(scannedPrice)} timmar)</Text>
            
            <FlatList
              data={foundOffers}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item, index }) => (
                <TouchableOpacity 
                  style={[styles.offerCard, index === 0 && styles.bestOffer]}
                  onPress={() => {
                    setCurrentComparison({
                      platform: item.platform,
                      price: item.price,
                      sparat: item.savings,
                      hoursSaved: (item.savings / parseFloat(hourlyWage)).toFixed(1),
                      product: scannedProduct
                    });
                  }}
                >
                  <View style={styles.offerHeader}>
                    <Text style={styles.offerPlatform}>{item.platform}</Text>
                    {index === 0 && <Text style={styles.bestBadge}>🏆 BILLIGAST</Text>}
                  </View>
                  <Text style={styles.offerPrice}>{item.price} kr</Text>
                  <Text style={styles.offerCondition}>{item.condition}</Text>
                  <View style={styles.offerSavings}>
                    <Text style={styles.savingsText}>💀 Sparar {item.savings} kr ({(item.savings / parseFloat(hourlyWage)).toFixed(1)} timmar)</Text>
                  </View>
                </TouchableOpacity>
              )}
              scrollEnabled={false}
            />
          </View>
        )}

        {/* BESLUT */}
        {currentComparison && (
          <View style={styles.decisionCard}>
            <Text style={styles.decisionTitle}>⚡️ VÄLJ DITT ÖDE ⚡️</Text>
            
            <View style={styles.comparisonBox}>
              <View style={styles.badOption}>
                <Text style={styles.badLabel}>💀 SLÖSA</Text>
                <Text style={styles.badPrice}>{scannedPrice} kr</Text>
                <Text style={styles.badTime}>{calculateHours(scannedPrice)} timmar</Text>
                <Text style={styles.badStore}>Butik</Text>
              </View>
              
              <View style={styles.vsIcon}>
                <Text style={styles.vsText}>VS</Text>
              </View>
              
              <View style={styles.goodOption}>
                <Text style={styles.goodLabel}>🙏 SPARA</Text>
                <Text style={styles.goodPrice}>{currentComparison.price} kr</Text>
                <Text style={styles.goodTime}>{currentComparison.hoursSaved} timmar sparade</Text>
                <Text style={styles.goodStore}>{currentComparison.platform}</Text>
              </View>
            </View>
            
            <View style={styles.savingsHighlight}>
              <Text style={styles.savingsHighlightText}>
                🎉 Du sparar {currentComparison.sparat} kr ({currentComparison.hoursSaved} timmar)
              </Text>
            </View>
            
            <View style={styles.decisionButtons}>
              <TouchableOpacity 
                style={styles.fralsBtn}
                onPress={() => fralsBelopp(currentComparison.sparat)}
              >
                <Text style={styles.fralsBtnText}>🙏 FRÄLS PENGARNA</Text>
                <Text style={styles.fralsSubtext}>Köp billigare online</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.slosaBtn}
                onPress={() => begravBelopp(currentComparison.sparat, scannedProduct)}
              >
                <Text style={styles.slosaBtnText}>💀 KÖP ÄNDÅ I BUTIK</Text>
                <Text style={styles.slosaSubtext}>Slösa pengar, bryt streak</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* GRAVEYARD */}
        {graveyard.length > 0 && (
          <View style={styles.graveyardSection}>
            <Text style={styles.graveyardTitle}>🪦 GRAVEYARD ({graveyard.length})</Text>
            {graveyard.slice(0, 3).map((item) => (
              <View key={item.id} style={styles.tombstone}>
                <Text style={styles.tombstoneIcon}>🪦</Text>
                <View style={styles.tombstoneContent}>
                  <Text style={styles.tombstoneItem}>{item.item}</Text>
                  <Text style={styles.tombstoneMsg}>{item.message}</Text>
                  <Text style={styles.tombstoneTime}>{item.timestamp}</Text>
                </View>
                <Text style={styles.tombstoneAmount}>-{item.amount} kr</Text>
              </View>
            ))}
          </View>
        )}

        {/* SETTINGS BUTTON */}
        <TouchableOpacity style={styles.settingsBtn} onPress={() => setShowSettings(true)}>
          <Text style={styles.settingsBtnText}>⚙️ {hourlyWage} KR/H • {goalName}</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* KAMERA MODAL */}
      <Modal visible={cameraVisible} animationType="slide">
        <View style={styles.cameraContainer}>
          {hasPermission === null && <Text style={styles.cameraText}>Begär kameraåtkomst...</Text>}
          {hasPermission === false && <Text style={styles.cameraText}>Ingen kameratillgång</Text>}
          {hasPermission && (
            <Camera style={styles.camera} ref={cameraRef} type={Camera.Constants.Type.back}>
              <View style={styles.cameraControls}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setCameraVisible(false)}>
                  <Text style={styles.cancelBtnText}>AVBRYT</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.captureBtn} onPress={takePicture}>
                  <View style={styles.captureCircle} />
                </TouchableOpacity>
              </View>
            </Camera>
          )}
        </View>
      </Modal>

      {/* SETTINGS MODAL */}
      <Modal visible={showSettings} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>⚙️ INSTÄLLNINGAR</Text>
            
            <Text style={styles.modalLabel}>TIMLÖN (KR/H)</Text>
            <TextInput
              style={styles.modalInput}
              keyboardType="numeric"
              value={hourlyWage}
              onChangeText={setHourlyWage}
              placeholder="100"
            />
            <Text style={styles.modalHint}>Standard: 100 kr/h (ungdomar/studenter)</Text>
            
            <Text style={styles.modalLabel}>SPARMÅL</Text>
            <TextInput
              style={styles.modalInput}
              value={goalName}
              onChangeText={setGoalName}
              placeholder="Sparmål"
            />
            
            <Text style={styles.modalLabel}>MÅLBELOPP (KR)</Text>
            <TextInput
              style={styles.modalInput}
              keyboardType="numeric"
              value={goalAmount}
              onChangeText={setGoalAmount}
              placeholder="5000"
            />
            
            <TouchableOpacity style={styles.modalClose} onPress={() => setShowSettings(false)}>
              <Text style={styles.modalCloseText}>SPARA</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  main: { flex: 1, backgroundColor: '#000000' },
  container: { paddingHorizontal: 20, paddingTop: 50, paddingBottom: 40 },
  
  header: { alignItems: 'center', marginBottom: 25 },
  logo: { color: '#39FF14', fontSize: 26, fontWeight: '900', letterSpacing: 2 },
  logoSub: { color: '#ff3333', fontSize: 10, letterSpacing: 3, marginTop: 3 },
  
  statsCard: { backgroundColor: '#111', borderRadius: 20, padding: 20, marginBottom: 25, borderWidth: 1, borderColor: '#222' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 15 },
  statItem: { alignItems: 'center' },
  statLabel: { color: '#555', fontSize: 10, marginBottom: 5 },
  statGreen: { color: '#39FF14', fontSize: 22, fontWeight: '900' },
  statWhite: { color: '#fff', fontSize: 22, fontWeight: '900' },
  progressContainer: { height: 6, backgroundColor: '#1a1a1a', borderRadius: 3, overflow: 'hidden', marginBottom: 8 },
  progressBar: { height: '100%', backgroundColor: '#39FF14', borderRadius: 3 },
  goalText: { color: '#555', fontSize: 10, textAlign: 'center' },
  
  mainCard: { backgroundColor: '#111', borderRadius: 30, padding: 25, borderWidth: 1, borderColor: '#222' },
  cardTitle: { color: '#39FF14', fontSize: 12, textAlign: 'center', marginBottom: 20 },
  cameraBtn: { backgroundColor: '#39FF14', width: '100%', padding: 20, borderRadius: 40, alignItems: 'center', marginBottom: 10 },
  cameraBtnText: { color: '#000', fontWeight: '900', fontSize: 18 },
  cameraSubtext: { color: '#000', fontSize: 10, marginTop: 5, opacity: 0.7 },
  orText: { color: '#444', fontSize: 12, textAlign: 'center', marginVertical: 15 },
  productInput: { width: '100%', backgroundColor: '#0a0a0a', color: '#fff', padding: 15, borderRadius: 15, fontSize: 16, textAlign: 'center', borderWidth: 1, borderColor: '#222', marginBottom: 12 },
  priceInput: { width: '100%', backgroundColor: '#0a0a0a', color: '#fff', padding: 15, borderRadius: 15, fontSize: 24, textAlign: 'center', fontWeight: '900', borderWidth: 1, borderColor: '#222', marginBottom: 12 },
  searchBtn: { backgroundColor: '#39FF14', width: '100%', padding: 18, borderRadius: 40, alignItems: 'center', marginTop: 5 },
  disabledBtn: { backgroundColor: '#1a1a1a' },
  searchBtnText: { color: '#000', fontWeight: '900', fontSize: 16 },
  
  loadingCard: { backgroundColor: '#111', borderRadius: 30, padding: 40, alignItems: 'center', borderWidth: 1, borderColor: '#222' },
  loadingText: { color: '#39FF14', fontSize: 16, marginTop: 15 },
  loadingSub: { color: '#555', fontSize: 12, marginTop: 5 },
  
  resultsCard: { backgroundColor: '#111', borderRadius: 30, padding: 20, borderWidth: 1, borderColor: '#222' },
  resultsTitle: { color: '#39FF14', fontSize: 12, textAlign: 'center', marginBottom: 15 },
  originalProduct: { color: '#fff', fontSize: 20, fontWeight: 'bold', textAlign: 'center' },
  originalPrice: { color: '#888', fontSize: 14, textAlign: 'center', marginBottom: 20 },
  offerCard: { backgroundColor: '#0a0a0a', borderRadius: 20, padding: 15, marginBottom: 10, borderWidth: 1, borderColor: '#222' },
  bestOffer: { borderColor: '#39FF14', borderWidth: 2 },
  offerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  offerPlatform: { color: '#39FF14', fontSize: 16, fontWeight: 'bold' },
  bestBadge: { color: '#39FF14', fontSize: 10, fontWeight: 'bold' },
  offerPrice: { color: '#fff', fontSize: 24, fontWeight: '900' },
  offerCondition: { color: '#666', fontSize: 12, marginTop: 3 },
  offerSavings: { marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#1a1a1a' },
  savingsText: { color: '#ff3333', fontSize: 12, fontWeight: 'bold' },
  
  decisionCard: { backgroundColor: '#111', borderRadius: 30, padding: 20, borderWidth: 2, borderColor: '#ff3333' },
  decisionTitle: { color: '#ff3333', fontSize: 14, textAlign: 'center', marginBottom: 20, fontWeight: 'bold' },
  comparisonBox: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  badOption: { flex: 1, backgroundColor: '#1a0a0a', borderRadius: 20, padding: 15, alignItems: 'center' },
  badLabel: { color: '#ff3333', fontSize: 12, marginBottom: 8 },
  badPrice: { color: '#ff3333', fontSize: 20, fontWeight: '900' },
  badTime: { color: '#555', fontSize: 10, marginTop: 5 },
  badStore: { color: '#444', fontSize: 10, marginTop: 3 },
  goodOption: { flex: 1, backgroundColor: '#0a1a0a', borderRadius: 20, padding: 15, alignItems: 'center' },
  goodLabel: { color: '#39FF14', fontSize: 12, marginBottom: 8 },
  goodPrice: { color: '#39FF14', fontSize: 20, fontWeight: '900' },
  goodTime: { color: '#39FF14', fontSize: 10, marginTop: 5 },
  goodStore: { color: '#39FF14', fontSize: 10, marginTop: 3 },
  vsIcon: { marginHorizontal: 10 },
  vsText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  savingsHighlight: { backgroundColor: '#0a0a0a', borderRadius: 15, padding: 15, alignItems: 'center', marginBottom: 20 },
  savingsHighlightText: { color: '#39FF14', fontSize: 14, fontWeight: 'bold', textAlign: 'center' },
  decisionButtons: { gap: 12 },
  fralsBtn: { backgroundColor: '#39FF14', padding: 18, borderRadius: 40, alignItems: 'center' },
  fralsBtnText: { color: '#000', fontWeight: '900', fontSize: 16 },
  fralsSubtext: { color: '#000', fontSize: 10, marginTop: 3, opacity: 0.7 },
  slosaBtn: { backgroundColor: '#1a1a1a', padding: 18, borderRadius: 40, alignItems: 'center', borderWidth: 1, borderColor: '#ff3333' },
  slosaBtnText: { color: '#ff3333', fontWeight: '900', fontSize: 16 },
  slosaSubtext: { color: '#ff3333', fontSize: 10, marginTop: 3, opacity: 0.7 },
  
  graveyardSection: { marginTop: 25, borderTopWidth: 1, borderTopColor: '#222', paddingTop: 20 },
  graveyardTitle: { color: '#ff3333', fontSize: 12, marginBottom: 12 },
  tombstone: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0d0d0d', borderRadius: 12, padding: 12, marginBottom: 8, borderLeftWidth: 3, borderLeftColor: '#ff3333' },
  tombstoneIcon: { fontSize: 20, marginRight: 10 },
  tombstoneContent: { flex: 1 },
  tombstoneItem: { color: '#fff', fontSize: 13, fontWeight: '600' },
  tombstoneMsg: { color: '#555', fontSize: 10, marginTop: 2 },
  tombstoneTime: { color: '#333', fontSize: 8, marginTop: 2 },
  tombstoneAmount: { color: '#ff3333', fontSize: 13, fontWeight: 'bold' },
  
  settingsBtn: { marginTop: 20, padding: 12, alignItems: 'center' },
  settingsBtnText: { color: '#333', fontSize: 12 },
  
  cameraContainer: { flex: 1, backgroundColor: '#000' },
  camera: { flex: 1 },
  cameraText: { color: '#fff', textAlign: 'center', marginTop: 50 },
  cameraControls: { position: 'absolute', bottom: 30, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: 30 },
  cancelBtn: { backgroundColor: '#333', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 30 },
  cancelBtnText: { color: '#fff', fontWeight: 'bold' },
  captureBtn: { width: 70, height: 70, borderRadius: 35, backgroundColor: 'rgba(255,255,255,0.3)', justifyContent: 'center', alignItems: 'center' },
  captureCircle: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#fff' },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.95)', justifyContent: 'center', padding: 20 },
  modalCard: { backgroundColor: '#111', borderRadius: 30, padding: 25, borderWidth: 1, borderColor: '#222' },
  modalTitle: { color: '#39FF14', fontSize: 20, fontWeight: '900', textAlign: 'center', marginBottom: 20 },
  modalLabel: { color: '#555', fontSize: 12, marginBottom: 8, marginTop: 15 },
  modalInput: { backgroundColor: '#0a0a0a', color: '#fff', padding: 15, borderRadius: 15, fontSize: 18, textAlign: 'center' },
  modalHint: { color: '#333', fontSize: 10, marginTop: 5, textAlign: 'center' },
  modalClose: { backgroundColor: '#39FF14', padding: 16, borderRadius: 30, alignItems: 'center', marginTop: 25 },
  modalCloseText: { color: '#000', fontWeight: '900', fontSize: 16 }
});