// App.js
// PET SOCIAL - The Ultimate Social Platform 🔥🐉
// OVER 9000 LINES OF PURE FIRE

import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity, ScrollView,
  Modal, TextInput, FlatList, Image, Animated, PanResponder,
  Dimensions, Share, Alert, Vibration, StatusBar, SafeAreaView,
  RefreshControl, ActivityIndicator, Switch, Platform
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Camera } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';

const { width, height } = Dimensions.get('window');

// ============ MOCK DATA FOR MVP ============
const MOCK_PETS = {
  dragon: { name: 'Eldragon', emoji: '🐉', baseHp: 100, abilities: ['Fire Breath', 'Fly'] },
  wolf: { name: 'Skuggvarg', emoji: '🐺', baseHp: 80, abilities: ['Howl', 'Hunt'] },
  fox: { name: 'MagiRäv', emoji: '🦊', baseHp: 70, abilities: ['Charm', 'Dash'] },
  cat: { name: 'Nattkatt', emoji: '🐱', baseHp: 60, abilities: ['Stealth', 'Climb'] },
  phoenix: { name: 'Fenix', emoji: '🔥', baseHp: 120, abilities: ['Rebirth', 'Blaze'] }
};

const MOCK_USERS = [
  { id: '1', name: 'Ella', avatar: '👩‍🎤', pet: 'dragon', petLevel: 47, streak: 47, distance: '500m' },
  { id: '2', name: 'Max', avatar: '🧑‍🚀', pet: 'wolf', petLevel: 32, streak: 32, distance: '1.2km' },
  { id: '3', name: 'Clara', avatar: '👩‍💻', pet: 'fox', petLevel: 28, streak: 28, distance: '800m' },
  { id: '4', name: 'Leo', avatar: '🧑‍🎤', pet: 'cat', petLevel: 15, streak: 15, distance: '2.1km' },
  { id: '5', name: 'Nova', avatar: '👩‍🍳', pet: 'phoenix', petLevel: 52, streak: 52, distance: '300m' }
];

const MOCK_POSTS = [
  { id: '1', userId: '1', userName: 'Ella', userAvatar: '👩‍🎤', petEmoji: '🐉', content: 'Träffade Max idag! 🔥', likes: 47, comments: 12, timeAgo: '10 min', image: null },
  { id: '2', userId: '2', userName: 'Max', userAvatar: '🧑‍🚀', petEmoji: '🐺', content: 'Level up! Min varg är nu level 33 💀', likes: 32, comments: 8, timeAgo: '1 tim', image: null },
  { id: '3', userId: '3', userName: 'Clara', userAvatar: '👩‍💻', petEmoji: '🦊', content: 'Hittade en legendary skin idag! ✨', likes: 89, comments: 23, timeAgo: '3 tim', image: null }
];

const BADGES = [
  { id: 'social', name: 'Social Butterfly', emoji: '🦋', requirement: 'Möt 10 kompisar' },
  { id: 'night', name: 'Night Owl', emoji: '🦉', requirement: 'Möte efter 22:00' },
  { id: 'legend', name: 'Legend', emoji: '👑', requirement: '100 dagars streak' },
  { id: 'explorer', name: 'Explorer', emoji: '🗺️', requirement: 'Möt i 5 olika platser' }
];

// ============ HUVUDAPP ============
export default function App() {
  // Navigation state
  const [activeTab, setActiveTab] = useState('feed'); // feed, camera, map, profile
  
  // User state
  const [user, setUser] = useState({
    name: '',
    pet: 'dragon',
    petLevel: 1,
    petExp: 0,
    streak: 0,
    totalMeetings: 0,
    badges: [],
    friends: []
  });
  
  const [showSetup, setShowSetup] = useState(true);
  const [username, setUsername] = useState('');
  const [selectedPet, setSelectedPet] = useState('dragon');
  
  // Feed state
  const [posts, setPosts] = useState(MOCK_POSTS);
  const [refreshing, setRefreshing] = useState(false);
  
  // Camera state
  const [hasCameraPermission, setHasCameraPermission] = useState(null);
  const [cameraVisible, setCameraVisible] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const cameraRef = useRef(null);
  
  // Map state (nearby friends)
  const [nearbyFriends, setNearbyFriends] = useState(MOCK_USERS);
  
  // Challenge state
  const [dailyChallenge, setDailyChallenge] = useState({
    title: 'Träffa 2 kompisar idag',
    reward: '🔥 Fire Wings (ny ability)',
    progress: 0,
    required: 2
  });
  
  // Animation values
  const scrollY = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // Load saved data
  useEffect(() => {
    loadUserData();
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    setHasCameraPermission(status === 'granted');
  };

  const loadUserData = async () => {
    try {
      const savedUser = await AsyncStorage.getItem('@pet_user');
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        setUser(parsed);
        setShowSetup(false);
      }
    } catch (e) {}
  };

  const saveUserData = async () => {
    try {
      await AsyncStorage.setItem('@pet_user', JSON.stringify(user));
    } catch (e) {}
  };

  useEffect(() => {
    if (!showSetup) saveUserData();
  }, [user, showSetup]);

  // Create new user
  const createUser = () => {
    if (!username.trim()) return;
    
    const newUser = {
      name: username,
      pet: selectedPet,
      petLevel: 1,
      petExp: 0,
      streak: 1,
      totalMeetings: 0,
      badges: [],
      friends: ['Ella', 'Max', 'Clara']
    };
    
    setUser(newUser);
    setShowSetup(false);
    
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  // Record a meeting (IRL)
  const recordMeeting = (friendName) => {
    const newExp = user.petExp + 10;
    const newTotal = user.totalMeetings + 1;
    let newLevel = user.petLevel;
    let newBadges = [...user.badges];
    
    // Level up every 100 exp
    if (newExp >= 100) {
      newLevel = user.petLevel + 1;
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('🎉 LEVEL UP!', `Din ${MOCK_PETS[user.pet].name} är nu level ${newLevel}!`);
    }
    
    // Check for badges
    if (newTotal >= 10 && !newBadges.includes('social')) {
      newBadges.push('social');
      Alert.alert('🏆 NY BADGE!', 'Social Butterfly - 10 IRL-möten!');
    }
    
    // Update daily challenge
    const newProgress = Math.min(dailyChallenge.progress + 1, dailyChallenge.required);
    
    if (newProgress >= dailyChallenge.required && dailyChallenge.progress < dailyChallenge.required) {
      Alert.alert('🔥 UTMANING KLAR!', `Du fick: ${dailyChallenge.reward}`);
    }
    
    setUser({
      ...user,
      petExp: newExp % 100,
      petLevel: newLevel,
      totalMeetings: newTotal,
      badges: newBadges,
      streak: user.streak + 1
    });
    
    setDailyChallenge({ ...dailyChallenge, progress: newProgress });
    
    Vibration.vibrate(100);
  };

  // Share pet card to Snap/TikTok
  const sharePetCard = async () => {
    const petData = MOCK_PETS[user.pet];
    const shareMessage = `🔥 Min ${petData.name} är level ${user.petLevel} i PET SOCIAL!\nStreak: ${user.streak} dagar\n${user.totalMeetings} IRL-möten\n\nLadda ner PET SOCIAL och utmana mig!`;
    
    try {
      await Share.share({ message: shareMessage, title: 'PET SOCIAL' });
    } catch (e) {}
  };

  // Like post
  const likePost = (postId) => {
    setPosts(posts.map(post => 
      post.id === postId ? { ...post, likes: post.likes + 1 } : post
    ));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  // Refresh feed
  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  // Take picture
  const takePicture = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync();
      setCapturedImage(photo.uri);
      
      Alert.alert(
        '📸 Posta?',
        'Vill du dela detta med dina vänner?',
        [
          { text: 'Avbryt', style: 'cancel', onPress: () => setCapturedImage(null) },
          { 
            text: 'Posta!', 
            onPress: () => {
              const newPost = {
                id: Date.now().toString(),
                userId: user.name,
                userName: user.name,
                userAvatar: '👤',
                petEmoji: MOCK_PETS[user.pet].emoji,
                content: 'Kolla in mitt äventyr! 🔥',
                likes: 0,
                comments: 0,
                timeAgo: 'just nu',
                image: photo.uri
              };
              setPosts([newPost, ...posts]);
              setCapturedImage(null);
              setCameraVisible(false);
              setActiveTab('feed');
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
          }
        ]
      );
    }
  };

  // Render feed item
  const renderFeedItem = ({ item }) => (
    <View style={styles.feedItem}>
      <View style={styles.feedHeader}>
        <View style={styles.feedUserInfo}>
          <Text style={styles.feedAvatar}>{item.userAvatar}</Text>
          <View>
            <Text style={styles.feedUserName}>{item.userName}</Text>
            <Text style={styles.feedPetInfo}>{item.petEmoji} {item.timeAgo}</Text>
          </View>
        </View>
        <TouchableOpacity>
          <Text style={styles.feedMore}>•••</Text>
        </TouchableOpacity>
      </View>
      
      <Text style={styles.feedContent}>{item.content}</Text>
      
      {item.image && (
        <Image source={{ uri: item.image }} style={styles.feedImage} />
      )}
      
      <View style={styles.feedActions}>
        <TouchableOpacity onPress={() => likePost(item.id)} style={styles.feedAction}>
          <Text style={styles.feedActionEmoji}>❤️</Text>
          <Text style={styles.feedActionCount}>{item.likes}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.feedAction}>
          <Text style={styles.feedActionEmoji}>💬</Text>
          <Text style={styles.feedActionCount}>{item.comments}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.feedAction}>
          <Text style={styles.feedActionEmoji}>📤</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Render friend item (for map tab)
  const renderFriendItem = ({ item }) => (
    <TouchableOpacity style={styles.friendCard} onPress={() => recordMeeting(item.name)}>
      <View style={styles.friendAvatarContainer}>
        <Text style={styles.friendAvatar}>{item.avatar}</Text>
        <View style={[styles.onlineDot, item.distance === '300m' && styles.onlineDotActive]} />
      </View>
      <Text style={styles.friendName}>{item.name}</Text>
      <View style={styles.friendPetContainer}>
        <Text style={styles.friendPetEmoji}>{MOCK_PETS[item.pet].emoji}</Text>
        <Text style={styles.friendPetLevel}>L{item.petLevel}</Text>
      </View>
      <Text style={styles.friendDistance}>{item.distance}</Text>
      <TouchableOpacity style={styles.meetButton} onPress={() => recordMeeting(item.name)}>
        <Text style={styles.meetButtonText}>MÖT</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  // Setup screen
  if (showSetup) {
    return (
      <SafeAreaView style={styles.setupContainer}>
        <StatusBar barStyle="light-content" />
        <ScrollView contentContainerStyle={styles.setupContent}>
          <Text style={styles.setupLogo}>🔥 PET</Text>
          <Text style={styles.setupLogoSub}>SOCIAL</Text>
          
          <View style={styles.setupCard}>
            <Text style={styles.setupTitle}>Välkommen till framtiden</Text>
            <Text style={styles.setupSubtitle}>Skapa din AI-pet och börja äventyret</Text>
            
            <TextInput
              style={styles.setupInput}
              placeholder="Ditt namn"
              placeholderTextColor="#444"
              value={username}
              onChangeText={setUsername}
            />
            
            <Text style={styles.setupLabel}>Välj din följeslagare</Text>
            <View style={styles.petSelector}>
              {Object.entries(MOCK_PETS).map(([key, pet]) => (
                <TouchableOpacity
                  key={key}
                  style={[styles.petOption, selectedPet === key && styles.petOptionSelected]}
                  onPress={() => setSelectedPet(key)}
                >
                  <Text style={styles.petOptionEmoji}>{pet.emoji}</Text>
                  <Text style={styles.petOptionName}>{pet.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <TouchableOpacity style={styles.setupButton} onPress={createUser}>
              <Text style={styles.setupButtonText}>🚀 BÖRJA ÄVENTYRET</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Main app
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* CAMERA MODAL */}
      <Modal visible={cameraVisible} animationType="slide">
        <View style={styles.cameraContainer}>
          {hasCameraPermission && (
            <Camera style={styles.camera} ref={cameraRef} type={Camera.Constants.Type.back}>
              <View style={styles.cameraControls}>
                <TouchableOpacity style={styles.cameraCancel} onPress={() => setCameraVisible(false)}>
                  <Text style={styles.cameraCancelText}>AVBRYT</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.cameraCapture} onPress={takePicture}>
                  <View style={styles.cameraCaptureCircle} />
                </TouchableOpacity>
              </View>
            </Camera>
          )}
        </View>
      </Modal>
      
      {/* MAIN CONTENT */}
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {activeTab === 'feed' && (
          <FlatList
            data={posts}
            keyExtractor={item => item.id}
            renderItem={renderFeedItem}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#39FF14" />
            }
            ListHeaderComponent={
              <View style={styles.feedHeader}>
                <Text style={styles.feedTitle}>🔥 SENASTE</Text>
                <TouchableOpacity onPress={sharePetCard}>
                  <Text style={styles.feedShare}>📤 Dela</Text>
                </TouchableOpacity>
              </View>
            }
            showsVerticalScrollIndicator={false}
          />
        )}
        
        {activeTab === 'camera' && (
          <View style={styles.cameraTab}>
            <TouchableOpacity style={styles.cameraTabButton} onPress={() => setCameraVisible(true)}>
              <Text style={styles.cameraTabEmoji}>📸</Text>
              <Text style={styles.cameraTabText}>Fota och dela</Text>
            </TouchableOpacity>
            
            {capturedImage && (
              <View style={styles.previewContainer}>
                <Image source={{ uri: capturedImage }} style={styles.previewImage} />
                <TouchableOpacity style={styles.postButton} onPress={() => {
                  const newPost = {
                    id: Date.now().toString(),
                    userId: user.name,
                    userName: user.name,
                    userAvatar: '👤',
                    petEmoji: MOCK_PETS[user.pet].emoji,
                    content: 'Kolla in mitt äventyr! 🔥',
                    likes: 0,
                    comments: 0,
                    timeAgo: 'just nu',
                    image: capturedImage
                  };
                  setPosts([newPost, ...posts]);
                  setCapturedImage(null);
                  setActiveTab('feed');
                }}>
                  <Text style={styles.postButtonText}>📤 POSTA</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
        
        {activeTab === 'map' && (
          <FlatList
            data={nearbyFriends}
            keyExtractor={item => item.id}
            renderItem={renderFriendItem}
            numColumns={2}
            columnWrapperStyle={styles.friendsGrid}
            ListHeaderComponent={
              <View style={styles.mapHeader}>
                <Text style={styles.mapTitle}>📍 NÄRA DIG</Text>
                <Text style={styles.mapSubtitle}>{nearbyFriends.length} vänner i närheten</Text>
                <View style={styles.dailyChallenge}>
                  <Text style={styles.challengeTitle}>⚡️ DAGENS UTMANING</Text>
                  <Text style={styles.challengeText}>{dailyChallenge.title}</Text>
                  <View style={styles.challengeProgress}>
                    <View style={[styles.challengeBar, { width: `${(dailyChallenge.progress / dailyChallenge.required) * 100}%` }]} />
                  </View>
                  <Text style={styles.challengeReward}>Belöning: {dailyChallenge.reward}</Text>
                </View>
              </View>
            }
            showsVerticalScrollIndicator={false}
          />
        )}
        
        {activeTab === 'profile' && (
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.profileHeader}>
              <View style={styles.profileAvatarContainer}>
                <Text style={styles.profileAvatar}>👤</Text>
                <View style={styles.profileLevelBadge}>
                  <Text style={styles.profileLevelText}>L{user.petLevel}</Text>
                </View>
              </View>
              <Text style={styles.profileName}>{user.name}</Text>
              <View style={styles.profileStats}>
                <View style={styles.profileStat}>
                  <Text style={styles.profileStatValue}>{user.streak}</Text>
                  <Text style={styles.profileStatLabel}>Streak</Text>
                </View>
                <View style={styles.profileStat}>
                  <Text style={styles.profileStatValue}>{user.totalMeetings}</Text>
                  <Text style={styles.profileStatLabel}>Möten</Text>
                </View>
                <View style={styles.profileStat}>
                  <Text style={styles.profileStatValue}>{user.badges.length}</Text>
                  <Text style={styles.profileStatLabel}>Badges</Text>
                </View>
              </View>
            </View>
            
            <View style={styles.petCard}>
              <Text style={styles.petCardEmoji}>{MOCK_PETS[user.pet].emoji}</Text>
              <Text style={styles.petCardName}>{MOCK_PETS[user.pet].name}</Text>
              <View style={styles.expBar}>
                <View style={[styles.expFill, { width: `${user.petExp}%` }]} />
              </View>
              <Text style={styles.expText}>{user.petExp}/100 XP till level {user.petLevel + 1}</Text>
              
              <View style={styles.abilitiesContainer}>
                <Text style={styles.abilitiesTitle}>✨ Abilities</Text>
                <View style={styles.abilitiesList}>
                  {MOCK_PETS[user.pet].abilities.map((ability, idx) => (
                    <View key={idx} style={styles.abilityBadge}>
                      <Text style={styles.abilityText}>{ability}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
            
            <View style={styles.badgesSection}>
              <Text style={styles.sectionTitle}>🏆 Badges</Text>
              <View style={styles.badgesGrid}>
                {BADGES.map(badge => (
                  <View key={badge.id} style={[styles.badgeCard, user.badges.includes(badge.id) && styles.badgeCardUnlocked]}>
                    <Text style={styles.badgeEmoji}>{badge.emoji}</Text>
                    <Text style={styles.badgeName}>{badge.name}</Text>
                    {user.badges.includes(badge.id) && <Text style={styles.badgeUnlocked}>✅</Text>}
                  </View>
                ))}
              </View>
            </View>
            
            <TouchableOpacity style={styles.shareProfileBtn} onPress={sharePetCard}>
              <Text style={styles.shareProfileText}>📤 DELA PROFIL</Text>
            </TouchableOpacity>
          </ScrollView>
        )}
      </Animated.View>
      
      {/* BOTTOM NAVIGATION */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => setActiveTab('feed')}>
          <Text style={[styles.navEmoji, activeTab === 'feed' && styles.navEmojiActive]}>🔥</Text>
          <Text style={[styles.navLabel, activeTab === 'feed' && styles.navLabelActive]}>Feed</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem} onPress={() => setActiveTab('camera')}>
          <View style={styles.navCamera}>
            <Text style={styles.navCameraEmoji}>📸</Text>
          </View>
          <Text style={[styles.navLabel, activeTab === 'camera' && styles.navLabelActive]}>Posta</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem} onPress={() => setActiveTab('map')}>
          <Text style={[styles.navEmoji, activeTab === 'map' && styles.navEmojiActive]}>📍</Text>
          <Text style={[styles.navLabel, activeTab === 'map' && styles.navLabelActive]}>Nära</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem} onPress={() => setActiveTab('profile')}>
          <Text style={[styles.navEmoji, activeTab === 'profile' && styles.navEmojiActive]}>👤</Text>
          <Text style={[styles.navLabel, activeTab === 'profile' && styles.navLabelActive]}>Min</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// ============ STYLES ============
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  content: { flex: 1 },
  
  // Setup styles
  setupContainer: { flex: 1, backgroundColor: '#000000' },
  setupContent: { flexGrow: 1, justifyContent: 'center', padding: 20 },
  setupLogo: { color: '#39FF14', fontSize: 48, fontWeight: '900', textAlign: 'center', letterSpacing: 4 },
  setupLogoSub: { color: '#ff3333', fontSize: 14, letterSpacing: 6, textAlign: 'center', marginBottom: 40 },
  setupCard: { backgroundColor: '#111', borderRadius: 40, padding: 25, borderWidth: 1, borderColor: '#222' },
  setupTitle: { color: '#fff', fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 8 },
  setupSubtitle: { color: '#555', fontSize: 14, textAlign: 'center', marginBottom: 25 },
  setupInput: { backgroundColor: '#0a0a0a', color: '#fff', padding: 15, borderRadius: 20, fontSize: 16, textAlign: 'center', marginBottom: 20, borderWidth: 1, borderColor: '#222' },
  setupLabel: { color: '#39FF14', fontSize: 12, marginBottom: 12 },
  petSelector: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 12, marginBottom: 30 },
  petOption: { backgroundColor: '#0a0a0a', padding: 15, borderRadius: 20, alignItems: 'center', minWidth: 80, borderWidth: 1, borderColor: '#222' },
  petOptionSelected: { borderColor: '#39FF14', backgroundColor: '#1a2a1a' },
  petOptionEmoji: { fontSize: 30, marginBottom: 5 },
  petOptionName: { color: '#fff', fontSize: 12 },
  setupButton: { backgroundColor: '#39FF14', padding: 18, borderRadius: 40, alignItems: 'center' },
  setupButtonText: { color: '#000', fontWeight: '900', fontSize: 16 },
  
  // Feed styles
  feedHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 15 },
  feedTitle: { color: '#39FF14', fontSize: 14, fontWeight: 'bold' },
  feedShare: { color: '#555', fontSize: 12 },
  feedItem: { backgroundColor: '#111', marginHorizontal: 15, marginBottom: 15, borderRadius: 25, padding: 15, borderWidth: 1, borderColor: '#222' },
  feedHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  feedUserInfo: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  feedAvatar: { fontSize: 40 },
  feedUserName: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  feedPetInfo: { color: '#555', fontSize: 11 },
  feedMore: { color: '#555', fontSize: 18 },
  feedContent: { color: '#fff', fontSize: 15, marginBottom: 12, lineHeight: 20 },
  feedImage: { width: '100%', height: 200, borderRadius: 20, marginBottom: 12 },
  feedActions: { flexDirection: 'row', gap: 20, borderTopWidth: 1, borderTopColor: '#1a1a1a', paddingTop: 12 },
  feedAction: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  feedActionEmoji: { fontSize: 18 },
  feedActionCount: { color: '#555', fontSize: 12 },
  
  // Camera tab
  cameraTab: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  cameraTabButton: { backgroundColor: '#111', padding: 40, borderRadius: 100, alignItems: 'center', borderWidth: 2, borderColor: '#39FF14' },
  cameraTabEmoji: { fontSize: 60, marginBottom: 10 },
  cameraTabText: { color: '#fff', fontSize: 16 },
  previewContainer: { marginTop: 20, alignItems: 'center' },
  previewImage: { width: width - 40, height: 400, borderRadius: 30, marginBottom: 15 },
  postButton: { backgroundColor: '#39FF14', padding: 15, borderRadius: 30, width: '100%', alignItems: 'center' },
  postButtonText: { color: '#000', fontWeight: '900', fontSize: 16 },
  
  // Camera modal
  cameraContainer: { flex: 1, backgroundColor: '#000' },
  camera: { flex: 1 },
  cameraControls: { position: 'absolute', bottom: 30, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: 30 },
  cameraCancel: { backgroundColor: '#333', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 30 },
  cameraCancelText: { color: '#fff', fontWeight: 'bold' },
  cameraCapture: { width: 70, height: 70, borderRadius: 35, backgroundColor: 'rgba(255,255,255,0.3)', justifyContent: 'center', alignItems: 'center' },
  cameraCaptureCircle: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#fff' },
  
  // Map/Friends styles
  mapHeader: { padding: 20 },
  mapTitle: { color: '#39FF14', fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  mapSubtitle: { color: '#555', fontSize: 12, marginBottom: 20 },
  dailyChallenge: { backgroundColor: '#111', borderRadius: 25, padding: 18, borderWidth: 1, borderColor: '#222', marginBottom: 20 },
  challengeTitle: { color: '#39FF14', fontSize: 10, letterSpacing: 1, marginBottom: 8 },
  challengeText: { color: '#fff', fontSize: 14, fontWeight: 'bold', marginBottom: 12 },
  challengeProgress: { height: 6, backgroundColor: '#1a1a1a', borderRadius: 3, overflow: 'hidden', marginBottom: 8 },
  challengeBar: { height: '100%', backgroundColor: '#39FF14', borderRadius: 3 },
  challengeReward: { color: '#ff3333', fontSize: 10 },
  friendsGrid: { justifyContent: 'space-between', paddingHorizontal: 15, gap: 12 },
  friendCard: { backgroundColor: '#111', borderRadius: 25, padding: 15, width: (width - 54) / 2, alignItems: 'center', borderWidth: 1, borderColor: '#222', marginBottom: 12 },
  friendAvatarContainer: { position: 'relative', marginBottom: 10 },
  friendAvatar: { fontSize: 50 },
  onlineDot: { position: 'absolute', bottom: 0, right: 0, width: 12, height: 12, borderRadius: 6, backgroundColor: '#333', borderWidth: 2, borderColor: '#000' },
  onlineDotActive: { backgroundColor: '#39FF14' },
  friendName: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginBottom: 5 },
  friendPetContainer: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 5 },
  friendPetEmoji: { fontSize: 14 },
  friendPetLevel: { color: '#39FF14', fontSize: 10 },
  friendDistance: { color: '#555', fontSize: 10, marginBottom: 10 },
  meetButton: { backgroundColor: '#39FF14', paddingVertical: 8, paddingHorizontal: 20, borderRadius: 20 },
  meetButtonText: { color: '#000', fontWeight: '900', fontSize: 12 },
  
  // Profile styles
  profileHeader: { alignItems: 'center', paddingVertical: 30, borderBottomWidth: 1, borderBottomColor: '#111' },
  profileAvatarContainer: { position: 'relative', marginBottom: 12 },
  profileAvatar: { fontSize: 80 },
  profileLevelBadge: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#39FF14', borderRadius: 20, paddingHorizontal: 8, paddingVertical: 4 },
  profileLevelText: { color: '#000', fontWeight: '900', fontSize: 12 },
  profileName: { color: '#fff', fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  profileStats: { flexDirection: 'row', gap: 30 },
  profileStat: { alignItems: 'center' },
  profileStatValue: { color: '#39FF14', fontSize: 24, fontWeight: '900' },
  profileStatLabel: { color: '#555', fontSize: 10, marginTop: 4 },
  
  petCard: { backgroundColor: '#111', margin: 20, borderRadius: 30, padding: 20, borderWidth: 1, borderColor: '#222', alignItems: 'center' },
  petCardEmoji: { fontSize: 80, marginBottom: 10 },
  petCardName: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginBottom: 15 },
  expBar: { width: '100%', height: 8, backgroundColor: '#1a1a1a', borderRadius: 4, overflow: 'hidden', marginBottom: 8 },
  expFill: { height: '100%', backgroundColor: '#39FF14', borderRadius: 4 },
  expText: { color: '#555', fontSize: 10, marginBottom: 20 },
  abilitiesContainer: { width: '100%' },
  abilitiesTitle: { color: '#39FF14', fontSize: 12, marginBottom: 10 },
  abilitiesList: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  abilityBadge: { backgroundColor: '#1a1a1a', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  abilityText: { color: '#fff', fontSize: 12 },
  
  badgesSection: { marginHorizontal: 20, marginBottom: 20 },
  sectionTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginBottom: 15 },
  badgesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  badgeCard: { backgroundColor: '#111', borderRadius: 20, padding: 15, alignItems: 'center', minWidth: 100, borderWidth: 1, borderColor: '#222' },
  badgeCardUnlocked: { borderColor: '#39FF14', backgroundColor: '#1a2a1a' },
  badgeEmoji: { fontSize: 30, marginBottom: 8 },
  badgeName: { color: '#fff', fontSize: 12, textAlign: 'center' },
  badgeUnlocked: { color: '#39FF14', fontSize: 12, marginTop: 5 },
  
  shareProfileBtn: { backgroundColor: '#1a1a1a', margin: 20, padding: 16, borderRadius: 30, alignItems: 'center', borderWidth: 1, borderColor: '#222' },
  shareProfileText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  
  // Bottom navigation
  bottomNav: { flexDirection: 'row', backgroundColor: '#0a0a0a', paddingVertical: 10, paddingHorizontal: 20, borderTopWidth: 1, borderTopColor: '#1a1a1a' },
  navItem: { flex: 1, alignItems: 'center', gap: 4 },
  navEmoji: { fontSize: 24, opacity: 0.5 },
  navEmojiActive: { opacity: 1, transform: [{ scale: 1.1 }] },
  navCamera: { backgroundColor: '#39FF14', width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginTop: -15, marginBottom: 5 },
  navCameraEmoji: { fontSize: 24 },
  navLabel: { color: '#555', fontSize: 10 },
  navLabelActive: { color: '#39FF14' }
});