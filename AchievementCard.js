import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
} from 'react-native';
import { Svg, Path, Circle } from 'react-native-svg';

const TrophyIcon = (props) => (
  <Svg
    width={24}
    height={24}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <Path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
    <Path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
    <Path d="M4 22h16" />
    <Path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
    <Path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
    <Path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
  </Svg>
);

const LockIcon = (props) => (
  <Svg
    width={24}
    height={24}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <Path d="M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2Z" />
    <Path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </Svg>
);

const AchievementCard = ({ achievement }) => (
  <View style={styles.achievementCard}>
    <View style={styles.achievementIconContainer}>
      {achievement.unlocked ? (
        <Image source={{ uri: achievement.icon }} style={styles.achievementIcon} />
      ) : (
        <View style={styles.lockedIconContainer}>
          <LockIcon style={styles.lockedIcon} />
        </View>
      )}
    </View>
    <View style={styles.achievementInfo}>
      <Text style={styles.achievementTitle}>{achievement.title}</Text>
      <Text style={styles.achievementDescription}>{achievement.description}</Text>
      {achievement.progress !== undefined && (
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { width: `${achievement.progress}%` }]} />
          <Text style={styles.progressText}>{`${achievement.progress}%`}</Text>
        </View>
      )}
    </View>
  </View>
);

const AchievementsPage = () => {
  const [achievements, setAchievements] = useState([]);

  useEffect(() => {
    // Mock data - replace with actual data fetching logic
    const mockAchievements = [
      {
        id: 1,
        title: 'Century Rider',
        description: 'Complete a 100 km ride',
        icon: 'https://example.com/century-rider-icon.png',
        unlocked: true,
        progress: 100,
      },
      {
        id: 2,
        title: 'Speed Demon',
        description: 'Achieve an average speed of 30 km/h on a 20 km ride',
        icon: 'https://example.com/speed-demon-icon.png',
        unlocked: true,
        progress: 100,
      },
      {
        id: 3,
        title: 'Early Bird',
        description: 'Complete 5 rides before 7 AM',
        icon: 'https://example.com/early-bird-icon.png',
        unlocked: false,
        progress: 60,
      },
      {
        id: 4,
        title: 'Mountain Goat',
        description: 'Climb 1000 meters in a single ride',
        icon: 'https://example.com/mountain-goat-icon.png',
        unlocked: false,
        progress: 30,
      },
      {
        id: 5,
        title: 'Iron Butt',
        description: 'Ride for 6 hours in a single session',
        icon: 'https://example.com/iron-butt-icon.png',
        unlocked: false,
      },
    ];
    setAchievements(mockAchievements);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <TrophyIcon style={styles.headerIcon} />
          <Text style={styles.headerTitle}>Achievements</Text>
        </View>
        <Text style={styles.subtitle}>Track your milestones and earn badges!</Text>
        {achievements.map((achievement) => (
          <AchievementCard key={achievement.id} achievement={achievement} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  headerIcon: {
    marginRight: 10,
    color: '#ff6b6b',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  achievementCard: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  achievementIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  achievementIcon: {
    width: 40,
    height: 40,
  },
  lockedIconContainer: {
    backgroundColor: '#e0e0e0',
    borderRadius: 30,
    padding: 10,
  },
  lockedIcon: {
    color: '#999',
  },
  achievementInfo: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  achievementDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  progressContainer: {
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
    overflow: 'hidden',
    marginTop: 5,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#4ecdc4',
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
});

export default AchievementsPage;

