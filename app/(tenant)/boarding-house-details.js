// PASTE THIS INTO app/(tenant)/boarding-house-details.js

import React, { useState, useRef, useEffect } from 'react';
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
  Modal,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { boardingHouses as mockData } from '../../data/mockData'; 
import AsyncStorage from '@react-native-async-storage/async-storage'; 

const { width: screenWidth } = Dimensions.get('window');
const LISTINGS_STORAGE_KEY = '@landlord_listings'; 

export default function BoardingHouseDetails() {
  const { id } = useLocalSearchParams();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showInquiryModal, setShowInquiryModal] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [inquiryMessage, setInquiryMessage] = useState('');
  const [bookingDate, setBookingDate] = useState('');
  const [bookingGuests, setBookingGuests] = useState('1');
  const scrollViewRef = useRef(null);
    
  const [house, setHouse] = useState(null); 
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadHouseFromStorage = async () => {
      if (!id) {
        setIsLoading(false);
        return;
      }
      
      try {
        const jsonValue = await AsyncStorage.getItem(LISTINGS_STORAGE_KEY);
        const allListings = jsonValue != null ? JSON.parse(jsonValue) : mockData;
        
        const foundHouse = allListings.find(h => String(h.id) === String(id)); 
        
        setHouse(foundHouse); 
      } catch (e) {
        console.error("Failed to load house details", e);
        setHouse(mockData.find(h => String(h.id) === String(id)));
      } finally {
        setIsLoading(false);
      }
    };

    loadHouseFromStorage();
  }, [id]); 


  if (isLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#667eea" />
      </View>
    );
  }

  if (!house) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
        </View>
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <Text style={{fontSize: 18, color: '#666'}}>House not found</Text>
          <Text style={{fontSize: 14, color: '#999', marginTop: 8}}>The listing may have been removed.</Text>
        </View>
      </View>
    );
  }

  // ... (All other functions from your original file go here)
  // handleCallLandlord, handleMessageLandlord, handleImageScroll, etc.

  const handleCallLandlord = () => {
    Linking.openURL(`tel:${house.landlord.phone}`);
  };

  const handleMessageLandlord = () => {
    router.push({
      pathname: '/(tenant)/chat',
      params: { 
        landlordId: house.landlord.id,
        landlordName: house.landlord.name,
        landlordImage: house.landlord.image,
        houseName: house.name
      }
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
      const shareMessage = `Check out ${house.name} - ₱${house.price}/month at ${house.location}. ${house.description.substring(0, 100)}...`;
      Alert.alert('Share', shareMessage);
    } catch (error) {
      console.log('Share error:', error);
    }
  };

  const handleExpressInterest = () => {
    setShowInquiryModal(true);
  };

  const handleReadyToBook = () => {
    setShowBookingModal(true);
  };

  const submitInquiry = () => {
    const inquiryData = {
      houseId: house.id,
      houseName: house.name,
      landlordId: house.landlord.id,
      message: inquiryMessage || `I'm interested in ${house.name}. Can you provide more details?`,
      timestamp: new Date().toISOString(),
      type: 'inquiry'
    };
    
    console.log('Inquiry submitted:', inquiryData);
    Alert.alert(
      'Inquiry Sent!',
      `Your interest in ${house.name} has been sent to ${house.landlord.name}. They will contact you soon.`
    );
    setShowInquiryModal(false);
    setInquiryMessage('');
    
    
    router.push({
      pathname: '/(tenant)/inquiries',
      params: { inquirySubmitted: true }
    });
  };

  const submitBooking = () => {
    
    const bookingData = {
      houseId: house.id,
      houseName: house.name,
      landlordId: house.landlord.id,
      checkInDate: bookingDate,
      numberOfGuests: parseInt(bookingGuests),
      timestamp: new Date().toISOString(),
      status: 'pending'
    };
    
    console.log('Booking submitted:', bookingData);
    Alert.alert(
      'Booking Request Sent!',
      `Your booking request for ${house.name} has been sent to ${house.landlord.name}. They will confirm shortly.`
    );
    setShowBookingModal(false);
    setBookingDate('');
    setBookingGuests('1');
    
    
    router.push({
      pathname: '/(tenant)/bookings',
      params: { bookingSubmitted: true }
    });
  };

  const handleViewLandlordProfile = () => {
    router.push({
      pathname: '/(tenant)/landlord-profile',
      params: { landlordId: house.landlord.id }
    });
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

       
        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={styles.quickActionButton}
            onPress={handleExpressInterest}
          >
            <Ionicons name="heart-outline" size={20} color="#667eea" />
            <Text style={styles.quickActionText}>Interested</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.quickActionButton}
            onPress={handleReadyToBook}
          >
            <Ionicons name="calendar-outline" size={20} color="#667eea" />
            <Text style={styles.quickActionText}>Book Now</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.quickActionButton}
            onPress={handleViewLandlordProfile}
          >
            <Ionicons name="business-outline" size={20} color="#667eea" />
            <Text style={styles.quickActionText}>Landlord</Text>
          </TouchableOpacity>
        </View>

        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Landlord Information</Text>
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
                <Text style={styles.landlordEmail}>{house.landlord.email}</Text>
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
            <View style={styles.landlordActions}>
              <TouchableOpacity 
                style={styles.messageLandlordButton}
                onPress={handleMessageLandlord}
              >
                <Ionicons name="chatbubble-ellipses-outline" size={16} color="#667eea" />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.viewProfileButton}
                onPress={handleViewLandlordProfile}
              >
                <Text style={styles.viewProfileText}>View Profile</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.descriptionText}>{house.description}</Text>
        </View>

        
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

        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>House Rules</Text>
          <View style={styles.rulesList}>
            {house.rules?.map((rule, index) => (
              <View key={index} style={styles.ruleItem}>
                <Ionicons name="information-circle" size={18} color="#667eea" />
                <Text style={styles.ruleText}>{rule}</Text>
              </View>
            )) || (
              <>
                <View style={styles.ruleItem}>
                  <Ionicons name="information-circle" size={18} color="#667eea" />
                  <Text style={styles.ruleText}>No smoking inside the rooms</Text>
                </View>
                <View style={styles.ruleItem}>
                  <Ionicons name="information-circle" size={18} color="#667eea" />
                  <Text style={styles.ruleText}>No pets allowed</Text>
                </View>
                <View style={styles.ruleItem}>
                  <Ionicons name="information-circle" size={18} color="#667eea" />
                  <Text style={styles.ruleText}>Quiet hours from 10 PM to 6 AM</Text>
                </View>
              </>
            )}
          </View>
        </View>

        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Availability</Text>
          <View style={styles.availabilityInfo}>
            <Ionicons name="calendar" size={20} color="#10b981" />
            <Text style={styles.availabilityText}>
              {house.available ? 'Available Now' : 'Currently Occupied'}
            </Text>
          </View>
          {house.availableFrom && (
            <Text style={styles.availableFromText}>
              Available from: {house.availableFrom}
            </Text>
          )}
        </View>

        
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

      
      <Modal
        visible={showInquiryModal}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Express Interest</Text>
            <Text style={styles.modalSubtitle}>
              Send a message to {house.landlord.name} about {house.name}
            </Text>
            
            <TextInput
              style={styles.messageInput}
              multiline
              numberOfLines={4}
              placeholder="Tell the landlord why you're interested... (optional)"
              value={inquiryMessage}
              onChangeText={setInquiryMessage}
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowInquiryModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.submitButton]}
                onPress={submitInquiry}
              >
                <Text style={styles.submitButtonText}>Send Interest</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      
      <Modal
        visible={showBookingModal}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Ready to Book</Text>
            <Text style={styles.modalSubtitle}>
              Send booking request for {house.name}
            </Text>
            
            <View style={styles.bookingForm}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Preferred Move-in Date</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="YYYY-MM-DD"
                  value={bookingDate}
                  onChangeText={setBookingDate}
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Number of Guests</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="1"
                  keyboardType="numeric"
                  value={bookingGuests}
                  onChangeText={setBookingGuests}
                />
              </View>
            </View>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowBookingModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.submitButton]}
                onPress={submitBooking}
              >
                <Text style={styles.submitButtonText}>Request Booking</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      
      <View style={styles.bottomActionBar}>
        <TouchableOpacity 
          style={styles.callButton}
          onPress={handleCallLandlord}
        >
          <Ionicons name="call" size={20} color="#667eea" />
          <Text style={styles.callButtonText}>Call</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.interestButton}
          onPress={handleExpressInterest}
        >
          <Ionicons name="heart-outline" size={20} color="white" />
          <Text style={styles.interestButtonText}>Interested</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.bookButton}
          onPress={handleReadyToBook}
        >
          <Ionicons name="calendar" size={20} color="white" />
          <Text style={styles.bookButtonText}>Book Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ... (all the styles are exactly the same)
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
  // Quick Actions
  quickActions: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  quickActionButton: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  quickActionText: {
    marginTop: 4,
    fontSize: 12,
    color: '#667eea',
    fontWeight: '500',
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
    marginBottom: 12,
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
    marginBottom: 4,
  },
  landlordEmail: {
    fontSize: 14,
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
  landlordActions: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  messageLandlordButton: {
    padding: 10,
    backgroundColor: '#e0e7ff',
    borderRadius: 20,
  },
  viewProfileButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#667eea',
    borderRadius: 8,
  },
  viewProfileText: {
    color: 'white',
    fontWeight: '600',
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
  // Rules
  rulesList: {
    gap: 12,
  },
  ruleItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  ruleText: {
    fontSize: 16,
    color: '#666',
    flex: 1,
    lineHeight: 22,
  },
  // Availability
  availabilityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  availabilityText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  availableFromText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 28,
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
  // Modals
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    margin: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    lineHeight: 22,
  },
  messageInput: {
    borderWidth: 1,
    borderColor: '#e5e5e5',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  bookingForm: {
    gap: 16,
    marginBottom: 20,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#e5e5e5',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: '600',
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: '#667eea',
  },
  submitButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  
  bottomActionBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    paddingVertical: 14,
    marginRight: 8,
  },
  callButtonText: {
    color: '#667eea',
    fontSize: 16,
    fontWeight: '600',
  },
  interestButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f59e0b',
    borderRadius: 12,
    paddingVertical: 14,
    marginHorizontal: 8,
  },
  interestButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  bookButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10b981',
    borderRadius: 12,
    paddingVertical: 14,
    marginLeft: 8,
  },
  bookButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});