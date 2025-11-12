// app/(tenant)/boarding-house-details.js
import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  Dimensions,
  Linking,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { boardingHouses } from '../../data/mockData';

const { width: screenWidth } = Dimensions.get('window');

export default function BoardingHouseDetails() {
  const { id } = useLocalSearchParams();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const scrollViewRef = useRef(null);
    
  // Find the boarding house by ID
  const house = boardingHouses.find(h => h.id === id);

  if (!house) {
    return (
      <View style={styles.container}>
        <Text>House not found</Text>
      </View>
    );
  }

  const handleCallLandlord = () => {
    Linking.openURL(`tel:${house.landlord.phone}`);
  };

  const handleMessageLandlord = () => {
    router.push({
      pathname: '/(tenant)/messages',
      params: { landlordName: house.landlord.name }
    });
  };

  const handleImageScroll = (event) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / screenWidth);
    setActiveImageIndex(index);
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    
  };

  const handleShare = async () => {
    try {
      
      Alert.alert('Share', `Share ${house.name} with others`);
    } catch (error) {
      console.log('Share error:', error);
    }
  };
  
  
  
  const reviews = [
    {
      id: '1',
      user: 'Todd Alquist',
      rating: 5,
      date: '2 weeks ago',
      comment: 'Great place! The landlord is very responsive and the amenities are exactly as described. Highly recommend!',
      userImage: 'https://i.insider.com/5f246e67a6f0e13561350605?width=800&format=jpeg&auto=webp'
    },
    {
      id: '2',
      user: 'Steve Gomez',
      rating: 4,
      date: '1 month ago',
      comment: 'Good value for money. Location is perfect for students. The room was clean and well-maintained.',
      userImage: 'https://static.wikia.nocookie.net/breakingbad/images/2/23/Gomez_2009.png/revision/latest?cb=20200528094509'
    },
    {
      id: '3',
      user: 'Hank Schrader',
      rating: 5,
      date: '2 months ago',
      comment: 'Loved my stay here! The landlord was very helpful and the minerals are amazing.',
      userImage: 'https://static.wikia.nocookie.net/breakingbad/images/4/4f/Season_2_-_Hank.jpg/revision/latest/scale-to-width/360?cb=20250728070712'
    }
  ];

  const renderReview = ({ item }) => (
    <View style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <Image source={{ uri: item.userImage }} style={styles.reviewerImage} />
        <View style={styles.reviewerInfo}>
          <Text style={styles.reviewerName}>{item.user}</Text>
          <View style={styles.reviewRating}>
            {[...Array(5)].map((_, index) => (
              <Ionicons
                key={index}
                name={index < item.rating ? "star" : "star-outline"}
                size={16}
                color="#FFD700"
              />
            ))}
          </View>
        </View>
        <Text style={styles.reviewDate}>{item.date}</Text>
      </View>
      <Text style={styles.reviewComment}>{item.comment}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Details</Text>
        <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
          <Ionicons name="share-outline" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Image Carousel */}
        <View style={styles.imageSection}>
          <ScrollView
            ref={scrollViewRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleImageScroll}
            scrollEventThrottle={16}
          >
            {house.images.map((image, index) => (
              <Image
                key={index}
                source={{ uri: image }}
                style={styles.houseImage}
              />
            ))}
          </ScrollView>
          
          {/* Image Indicators */}
          {house.images.length > 1 && (
            <View style={styles.imageIndicators}>
              {house.images.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.imageIndicator,
                    index === activeImageIndex && styles.imageIndicatorActive
                  ]}
                />
              ))}
            </View>
          )}

          {/* Favorite Button */}
          <TouchableOpacity 
            style={styles.favoriteButton}
            onPress={toggleFavorite}
          >
            <Ionicons 
              name={isFavorite ? "heart" : "heart-outline"} 
              size={24} 
              color={isFavorite ? "#ef4444" : "white"} 
            />
          </TouchableOpacity>
        </View>

        {/* Basic Info */}
        <View style={styles.section}>
          <View style={styles.titleSection}>
            <Text style={styles.houseName}>{house.name}</Text>
            <Text style={styles.housePrice}>₱{house.price}/month</Text>
          </View>

          <View style={styles.locationSection}>
            <Ionicons name="location" size={16} color="#666" />
            <Text style={styles.locationText}>{house.location}</Text>
            <Text style={styles.distanceText}>{house.distance}</Text>
          </View>

          <View style={styles.ratingSection}>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={20} color="#FFD700" />
              <Text style={styles.rating}>{house.rating}</Text>
              <Text style={styles.reviewsCount}>({house.reviews} reviews)</Text>
            </View>
            <Text style={styles.houseType}>{house.type}</Text>
          </View>
        </View>

        {/* Landlord Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Landlord</Text>
          <View style={styles.landlordCard}>
            <View style={styles.landlordInfo}>
              <Ionicons 
                name={house.landlord.verified ? "checkmark-circle" : "person-circle"} 
                size={40} 
                color={house.landlord.verified ? "#10b981" : "#667eea"} 
              />
              <View style={styles.landlordDetails}>
                <Text style={styles.landlordName}>{house.landlord.name}</Text>
                <Text style={styles.landlordPhone}>{house.landlord.phone}</Text>
                <View style={styles.verificationBadge}>
                  <Ionicons 
                    name={house.landlord.verified ? "shield-checkmark" : "time"} 
                    size={14} 
                    color={house.landlord.verified ? "#10b981" : "#666"} 
                  />
                  <Text style={[
                    styles.verificationText,
                    { color: house.landlord.verified ? "#10b981" : "#666" }
                  ]}>
                    {house.landlord.verified ? 'Verified Landlord' : 'Pending Verification'}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.descriptionText}>{house.description}</Text>
        </View>

        {/* Amenities */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Amenities</Text>
          <View style={styles.amenitiesGrid}>
            {house.amenities.map((amenity, index) => (
              <View key={index} style={styles.amenityItem}>
                <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                <Text style={styles.amenityText}>{amenity}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Reviews */}
        <View style={styles.section}>
          <View style={styles.reviewsHeader}>
            <Text style={styles.sectionTitle}>Reviews</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllReviews}>See All</Text>
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={reviews}
            renderItem={renderReview}
            keyExtractor={item => item.id}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </ScrollView>

      {/* Fixed Bottom Action Bar */}
      <View style={styles.bottomActionBar}>
        <TouchableOpacity 
          style={styles.callButton}
          onPress={handleCallLandlord}
        >
          <Ionicons name="call" size={20} color="#667eea" />
          <Text style={styles.callButtonText}>Call</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.messageButton}
          onPress={handleMessageLandlord}
        >
          <Ionicons name="chatbubble" size={20} color="white" />
          <Text style={styles.messageButtonText}>Message</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  shareButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  imageSection: {
    position: 'relative',
  },
  houseImage: {
    width: screenWidth,
    height: 300,
  },
  imageIndicators: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 16,
    alignSelf: 'center',
    gap: 6,
  },
  imageIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  imageIndicatorActive: {
    backgroundColor: 'white',
    width: 20,
  },
  favoriteButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  titleSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  houseName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginRight: 16,
  },
  housePrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#667eea',
  },
  locationSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 6,
  },
  locationText: {
    fontSize: 16,
    color: '#666',
    flex: 1,
  },
  distanceText: {
    fontSize: 14,
    color: '#667eea',
    fontWeight: '500',
  },
  ratingSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rating: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  reviewsCount: {
    fontSize: 14,
    color: '#666',
  },
  houseType: {
    fontSize: 16,
    color: '#667eea',
    fontWeight: '500',
    backgroundColor: '#f0f4ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  landlordCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
  },
  landlordInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  landlordDetails: {
    flex: 1,
  },
  landlordName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  landlordPhone: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  verificationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  verificationText: {
    fontSize: 14,
    fontWeight: '500',
  },
  descriptionText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  amenityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    width: '48%',
    marginBottom: 12,
  },
  amenityText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  reviewsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  seeAllReviews: {
    color: '#667eea',
    fontWeight: '600',
  },
  reviewCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewerImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  reviewerInfo: {
    flex: 1,
  },
  reviewerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  reviewRating: {
    flexDirection: 'row',
  },
  reviewDate: {
    fontSize: 12,
    color: '#999',
  },
  reviewComment: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  bottomActionBar: {
    flexDirection: 'row',
    backgroundColor: 'white',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
    gap: 12,
  },
  callButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#667eea',
    borderRadius: 12,
    paddingVertical: 16,
    gap: 8,
  },
  callButtonText: {
    color: '#667eea',
    fontSize: 16,
    fontWeight: '600',
  },
  messageButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#667eea',
    borderRadius: 12,
    paddingVertical: 16,
    gap: 8,
  },
  messageButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});