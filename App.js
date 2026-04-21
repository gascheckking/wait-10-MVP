// App.js
// STREAK MASTER - Dagliga utmaningar, verifierade via Snap/TikTok 🔥📸

import React, { useState, useEffect } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity,
  ScrollView, Modal, TextInput, Alert, Share, FlatList
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Clipboard from 'expo-clipboard';

export default function App() {
  // Användare
  const [username, setUsername] = useState('');
  const [streak, setStreak] = useState(0);
  const [totalChecks, setTotalChecks] = useState(0);
  const [lastCheckDate, setLastCheckDate] = useState(null);
  const [showSetup, setShowSetup] = useState(false);
  
  // Dagens utmaning
  const [todayChallenge, setTodayChallenge] = useState(null);
  const [challengeCompleted, setChallengeCompleted] = useState(false);
  
  // Leaderboard (lokal mock)
  const [leaderboard, setLeaderboard] = useState([
    { name: 'Ella', streak: 47, avatar: '👑' },
    { name: 'Max', streak: 32, avatar: '🔥' },
    { name: 'Clara', streak: 28, avatar: '⚡' },
    { name: 'Du', streak: 0, avatar: '🌱' }
  ]);
  
  // Utmaningar (roterar)
  const challenges = [
    { id: 1, title: "📸 Filma dig själv göra 10 armhävningar", hashtag: "#streakpushup", difficulty: "medium" },
    { id: 2, title: "📸 Filma dig själv dricka ett glas vatten", hashtag: "#streakwater", difficulty: "easy" },
    { id: 3, title: "📸 Filma dig själv läsa i 5 minuter", hashtag: "#streakread", difficulty: "easy" },
    { id: 4, title: "📸 Filma dig själv gå ut på en promenad", hashtag: "#streakwalk", difficulty: "easy" },
    { id: 5, title: "📸 Filma dig själv laga en ny rätt", hashtag: "#streakcook", difficulty: "hard" },
    { id: 6, title: "📸 Filma dig själv ringa en vän", hashtag: "#streakcall", difficulty: "easy" },
    { id: 7, title: "📸 Filma dig själv städa i 10 minuter", hashtag: "#streakclean", difficulty: "medium" },
    { id: 8, title: "📸 Filma dig själv göra en god gärning", hashtag: "#streakgood", difficulty: "hard" },
    { id: 9, title: "📸 Filma dig själv träna i 15 minuter", hashtag: "#streakworkout", difficulty: "hard" },
    { id: 10, title: "📸 Filma dig själv lära dig något nytt", hashtag: "#streaklearn", difficulty: "medium" },
  ];

  // Ladda data
  useEffect(() => {
    loadData();
    selectDailyChallenge();
  }, []);

  const loadData = async () => {
    try {
      const savedUsername = await AsyncStorage.getItem('@username');
      const savedStreak = await AsyncStorage.getItem('@streak');
      const savedChecks = await AsyncStorage.getItem('@total_checks');
      const savedLastDate = await AsyncStorage.getItem('@last_check');
      const savedCompleted = await AsyncStorage.getItem('@challenge_completed');
      
      if (savedUsername) setUsername(savedUsername);
      if (savedStreak) setStreak(parseInt(savedStreak));
      if (savedChecks) setTotalChecks(parseInt(savedChecks));
      if (savedLastDate) setLastCheckDate(savedLastDate);
      if (savedCompleted) setChallengeCompleted(savedCompleted === 'true');
      
      // Uppdatera leaderboard med din streak
      if (savedStreak) {
        setLeaderboard(prev => prev.map(p => 
          p.name === 'Du' ? { ...p, streak: parseInt(savedStreak) } : p
        ));
      }
      
      // Kolla om streak ska brytas (missad dag)
      if (savedLastDate) {
        const lastDate = new Date(savedLastDate);
        const today = new Date();
        const diffDays = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));
        if (diffDays > 1 && parseInt(savedStreak) > 0) {
          Alert.alert(
            "💀 STREAK BRUTEN!",
            `Du missade igår. Din streak på ${savedStreak} dagar är borta. Börja om idag!`,
            [{ text: "😭 Jag börjar om" }]
          );
          setStreak(0);
          setChallengeCompleted(false);
        }
      }
    } catch (e) {}
  };

  const saveData = async () => {
    try {
      if (username) await AsyncStorage.setItem('@username', username);
      await AsyncStorage.setItem('@streak', streak.toString());
      await AsyncStorage.setItem('@total_checks', totalChecks.toString());
      await AsyncStorage.setItem('@last_check', lastCheckDate || new Date().toISOString());
      await AsyncStorage.setItem('@challenge_completed', challengeCompleted.toString());
    } catch (e) {}
  };

  useEffect(() => {
    saveData();
  }, [streak, totalChecks, lastCheckDate, username, challengeCompleted]);

  // Välj dagens utmaning baserat på streak-längd
  const selectDailyChallenge = () => {
    const today = new Date().toDateString();
    const storedDate = lastCheckDate ? new Date(lastCheckDate).toDateString() : null;
    
    if (storedDate === today && challengeCompleted) {
      // Använd redan klar utmaning
      return;
    }
    
    // Välj ny utmaning baserat på streak
    let difficulty = 'easy';
    if (streak >= 30) difficulty = 'hard';
    else if (streak >= 14) difficulty = 'medium';
    
    const availableChallenges = challenges.filter(c => c.difficulty === difficulty);
    const randomIndex = Math.floor(Math.random() * availableChallenges.length);
    setTodayChallenge(availableChallenges[randomIndex]);
    setChallengeCompleted(false);
  };

  // Bekräfta att man postat på Snap/TikTok
  const confirmPost = async () => {
    if (!todayChallenge) return;
    
    Alert.alert(
      "✅ Har du postat på Snap/TikTok?",
      `Använd hashtag: ${todayChallenge.hashtag}\n\nPosta din video och tryck sedan JA.`,
      [
        { text: "Nej, inte än", style: "cancel" },
        { 
          text: "JA, JAG HAR POSTAT!", 
          onPress: async () => {
            // Öka streak
            const newStreak = streak + 1;
            const newTotal = totalChecks + 1;
            
            setStreak(newStreak);
            setTotalChecks(newTotal);
            setLastCheckDate(new Date().toISOString());
            setChallengeCompleted(true);
            
            // Uppdatera leaderboard
            setLeaderboard(prev => prev.map(p => 
              p.name === 'Du' ? { ...p, streak: newStreak } : p
            ));
            
            // Välj morgondagens utmaning
            selectDailyChallenge();
            
            Alert.alert(
              "🔥 STREAK ÖKAD!",
              `Din streak är nu ${newStreak} dagar!\n\nDelade du på Snap/TikTok? Grymt! 💀`,
              [{ text: "🎉 Yes!" }]
            );
          }
        }
      ]
    );
  };

  // Dela streak till Snap/TikTok
  const shareStreak = async () => {
    const shareMessage = `🔥 Min streak är ${streak} dagar i Streak Master!\n\nDagens utmaning: ${todayChallenge?.title}\n${todayChallenge?.hashtag}\n\nLadda ner Streak Master och utmana mig!`;
    
    try {
      await Share.share({
        message: shareMessage,
        title: 'Streak Master'
      });
    } catch (e) {}
  };

  // Kopiera hashtag
  const copyHashtag = async () => {
    if (todayChallenge) {
      await Clipboard.setStringAsync(todayChallenge.hashtag);
      Alert.alert('📋 Kopierad!', `Hashtag ${todayChallenge.hashtag} är kopierad. Klistra in på Snap/TikTok.`);
    }
  };

  const getStreakEmoji = () => {
    if (streak >= 100) return '👑 LEGEND';
    if (streak >= 50) return '⭐️ MASTER';
    if (streak >= 30) return '🔥🔥🔥';
    if (streak >= 14) return '🔥🔥';
    if (streak >= 7) return '🔥';
    if (streak >= 3) return '🌱';
    if (streak > 0) return '💪';
    return '💀';
  };

  // Sortera leaderboard
  const sortedLeaderboard = [...leaderboard].sort((a, b) => b.streak - a.streak);

  return (
    <View style={styles.main}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.logo}>🔥 STREAK</Text>
          <Text style={styles.logoSub}>MASTER</Text>
        </View>

        {/* HUVUDSTREAK */}
        <View style={styles.streakCard}>
          <Text style={styles.streakEmoji}>{getStreakEmoji()}</Text>
          <Text style={styles.streakNumber}>{streak}</Text>
          <Text style={styles.streakLabel}>DAGAR I RAD</Text>
          <Text style={styles.streakSub}>Totalt: {totalChecks} check-ins</Text>
        </View>

        {/* DAGENS UTMANING */}
        {todayChallenge && (
          <View style={styles.challengeCard}>
            <Text style={styles.challengeTitle}>⚡️ DAGENS UTMANING ⚡️</Text>
            <Text style={styles.challengeText}>{todayChallenge.title}</Text>
            
            <TouchableOpacity style={styles.hashtagBtn} onPress={copyHashtag}>
              <Text style={styles.hashtagText}>{todayChallenge.hashtag}</Text>
              <Text style={styles.copyIcon}>📋</Text>
            </TouchableOpacity>
            
            {!challengeCompleted ? (
              <TouchableOpacity style={styles.completeBtn} onPress={confirmPost}>
                <Text style={styles.completeBtnText}>✅ JAG HAR POSTAT PÅ SNAP/TIKTOK</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.completedBadge}>
                <Text style={styles.completedText}>✅ KLAR FÖR IDAG!</Text>
                <Text style={styles.completedSub}>Kom tillbaka imorgon för nästa utmaning</Text>
              </View>
            )}
          </View>
        )}

        {/* DELA KNAPP */}
        <TouchableOpacity style={styles.shareBtn} onPress={shareStreak}>
          <Text style={styles.shareBtnText}>📤 DELA STREAK PÅ SNAP/TIKTOK</Text>
        </TouchableOpacity>

        {/* LEADERBOARD */}
        <View style={styles.leaderboardCard}>
          <Text style={styles.leaderboardTitle}>🏆 TOPPLISTA 🏆</Text>
          {sortedLeaderboard.map((person, index) => (
            <View key={index} style={styles.leaderboardRow}>
              <Text style={styles.leaderboardRank}>{index + 1}</Text>
              <Text style={styles.leaderboardAvatar}>{person.avatar}</Text>
              <Text style={[styles.leaderboardName, person.name === 'Du' && styles.isYou]}>
                {person.name} {person.name === 'Du' && '(du)'}
              </Text>
              <Text style={styles.leaderboardStreak}>{person.streak} dagar</Text>
            </View>
          ))}
        </View>

        {/* INSTÄLLNINGAR */}
        <TouchableOpacity style={styles.settingsBtn} onPress={() => setShowSetup(true)}>
          <Text style={styles.settingsBtnText}>⚙️ Ändra användarnamn</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* SETUP MODAL */}
      <Modal visible={showSetup} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>⚙️ DIN PROFIL</Text>
            
            <Text style={styles.modalLabel}>DITT NAMN (SYNS PÅ TOPPLISTAN)</Text>
            <TextInput
              style={styles.modalInput}
              value={username}
              onChangeText={setUsername}
              placeholder="t.ex. Ella"
              placeholderTextColor="#444"
            />
            
            <Text style={styles.modalHint}>Välj ett namn som dina kompisar känner igen!</Text>
            
            <TouchableOpacity style={styles.modalClose} onPress={() => setShowSetup(false)}>
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
  
  header: { alignItems: 'center', marginBottom: 30 },
  logo: { color: '#39FF14', fontSize: 34, fontWeight: '900', letterSpacing: 4 },
  logoSub: { color: '#ff3333', fontSize: 12, letterSpacing: 6, marginTop: -5 },
  
  streakCard: { backgroundColor: '#111', borderRadius: 40, padding: 30, alignItems: 'center', marginBottom: 25, borderWidth: 2, borderColor: '#39FF14' },
  streakEmoji: { fontSize: 50, marginBottom: 10 },
  streakNumber: { color: '#39FF14', fontSize: 70, fontWeight: '900' },
  streakLabel: { color: '#fff', fontSize: 12, letterSpacing: 2, marginTop: 5 },
  streakSub: { color: '#555', fontSize: 10, marginTop: 8 },
  
  challengeCard: { backgroundColor: '#111', borderRadius: 30, padding: 25, marginBottom: 20, borderWidth: 1, borderColor: '#222' },
  challengeTitle: { color: '#39FF14', fontSize: 10, letterSpacing: 2, textAlign: 'center', marginBottom: 15 },
  challengeText: { color: '#fff', fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  
  hashtagBtn: { flexDirection: 'row', backgroundColor: '#0a0a0a', padding: 12, borderRadius: 30, alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 20, borderWidth: 1, borderColor: '#222' },
  hashtagText: { color: '#39FF14', fontSize: 14, fontWeight: 'bold' },
  copyIcon: { fontSize: 16 },
  
  completeBtn: { backgroundColor: '#39FF14', padding: 18, borderRadius: 40, alignItems: 'center' },
  completeBtnText: { color: '#000', fontWeight: '900', fontSize: 14 },
  
  completedBadge: { alignItems: 'center', padding: 15, backgroundColor: '#0a1a0a', borderRadius: 20, borderWidth: 1, borderColor: '#39FF14' },
  completedText: { color: '#39FF14', fontWeight: '900', fontSize: 14 },
  completedSub: { color: '#555', fontSize: 10, marginTop: 5 },
  
  shareBtn: { backgroundColor: '#1a1a1a', padding: 16, borderRadius: 30, alignItems: 'center', marginBottom: 20, borderWidth: 1, borderColor: '#39FF14' },
  shareBtnText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  
  leaderboardCard: { backgroundColor: '#111', borderRadius: 25, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: '#222' },
  leaderboardTitle: { color: '#39FF14', fontSize: 12, textAlign: 'center', marginBottom: 15 },
  leaderboardRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#1a1a1a' },
  leaderboardRank: { color: '#555', width: 30, fontSize: 14, fontWeight: 'bold' },
  leaderboardAvatar: { fontSize: 18, width: 35 },
  leaderboardName: { flex: 1, color: '#fff', fontSize: 14 },
  isYou: { color: '#39FF14', fontWeight: 'bold' },
  leaderboardStreak: { color: '#39FF14', fontSize: 12, fontWeight: 'bold' },
  
  settingsBtn: { padding: 12, alignItems: 'center' },
  settingsBtnText: { color: '#333', fontSize: 12 },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.95)', justifyContent: 'center', padding: 20 },
  modalCard: { backgroundColor: '#111', borderRadius: 30, padding: 25, borderWidth: 1, borderColor: '#222' },
  modalTitle: { color: '#39FF14', fontSize: 20, fontWeight: '900', textAlign: 'center', marginBottom: 20 },
  modalLabel: { color: '#555', fontSize: 12, marginBottom: 8 },
  modalInput: { backgroundColor: '#0a0a0a', color: '#fff', padding: 15, borderRadius: 15, fontSize: 18, textAlign: 'center' },
  modalHint: { color: '#333', fontSize: 10, marginTop: 8, textAlign: 'center' },
  modalClose: { backgroundColor: '#39FF14', padding: 16, borderRadius: 30, alignItems: 'center', marginTop: 20 },
  modalCloseText: { color: '#000', fontWeight: '900', fontSize: 16 }
});