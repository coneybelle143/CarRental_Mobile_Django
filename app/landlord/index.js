import React, { useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { GlobalListingContext } from './_layout';

export default function LandlordPortal() {
  const { listings, deleteListing } = useContext(GlobalListingContext);

  const handleDeleteListing = (id) => {
    Alert.alert(
      "Delete Property",
      "Are you sure you want to delete this property? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        { 
          text: "Delete", 
          onPress: () => deleteListing(id),
          style: "destructive" 
        }
      ]
    );
  };
  
  const handleEditListing = (id) => {
    router.push(`/landlord/create-listing?id=${id}`);
  };

  const handleViewAllListings = () => {
    router.push('/landlord/all-listings');
  };

  const handleViewListingDetails = (id) => {
    router.push(`/landlord/listing-details?id=${id}`);
  };

  
  const previewListings = listings.slice(0, 3);

  return (
    <View style={styles.page}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Dashboard</Text>
          <Text style={styles.subtitle}>Manage your properties and inquiries</Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Feather name="list" size={22} color={Colors.primary} />
            <Text style={styles.statValue}>{listings.length}</Text> 
            <Text style={styles.statLabel}>Listings</Text>
          </View>
          <View style={styles.statCard}>
            <Feather name="message-square" size={22} color={Colors.primary} />
            <Text style={styles.statValue}>12</Text>
            <Text style={styles.statLabel}>Inquiries</Text>
          </View>
          <View style={styles.statCard}>
            <Feather name="home" size={22} color={Colors.primary} />
            <Text style={styles.statValue}>89%</Text>
            <Text style={styles.statLabel}>Occupancy</Text>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Your Listings</Text>
          {listings.length > 3 && (
            <TouchableOpacity onPress={handleViewAllListings}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.listingsRow}>
          {previewListings.map((listing) => (
            <View key={listing.id} style={styles.card}>
              <TouchableOpacity 
                style={styles.cardClickable}
                onPress={() => handleViewListingDetails(listing.id)}
              >
                <Image source={{ uri: listing.images[0] }} style={styles.cardImage} />
                <View style={styles.cardBody}>
                  <Text style={styles.cardTitle} numberOfLines={1}>{listing.name}</Text>
                  <Text style={styles.cardSub} numberOfLines={1}>{listing.location}</Text>
                  <Text style={styles.cardPrice}>₱{listing.price.toLocaleString()}/month</Text>
                  <View style={styles.ratingContainer}>
                    <Feather name="star" size={14} color="#FFD700" />
                    <Text style={styles.ratingText}>{listing.rating || 'New'}</Text>
                  </View>
                </View>
              </TouchableOpacity>
              <View style={styles.cardActions}>
                <TouchableOpacity style={styles.editButton} onPress={() => handleEditListing(listing.id)}>
                  <Feather name="edit" size={20} color={Colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteListing(listing.id)}>
                  <Feather name="trash-2" size={20} color="#ef4444" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
          
          {listings.length === 0 && (
            <View style={styles.emptyState}>
              <Feather name="home" size={48} color="#ccc" />
              <Text style={styles.emptyStateTitle}>No Listings Yet</Text>
              <Text style={styles.emptyStateText}>
                Start by creating your first property listing to attract tenants.
              </Text>
            </View>
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      
      <TouchableOpacity 
        style={styles.fab}
        onPress={() => router.push('/landlord/create-listing')}
      >
        <Feather name="plus" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#f6f7fb' },
  container: { padding: 16 },
  header: { 
    marginBottom: 24, 
    paddingTop: 30
  },
  title: { 
    fontSize: 26, 
    fontWeight: 'bold', 
    color: '#1a202c' 
  },
  subtitle: { color: '#666', marginTop: 4, fontSize: 16 },
  statsRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginBottom: 24,
    gap: 12,
  },
  statCard: { 
    flex: 1, 
    backgroundColor: '#fff', 
    padding: 16, 
    borderRadius: 16, 
    shadowColor: '#000', 
    shadowOpacity: 0.05, 
    shadowOffset: { width: 0, height: 4 }, 
    elevation: 2,
    alignItems: 'center',
    gap: 8,
  },
  statValue: { fontSize: 20, fontWeight: 'bold', color: Colors.primary },
  statLabel: { color: '#666', fontSize: 12, fontWeight: '500' },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#1a202c' },
  seeAllText: { 
    color: Colors.primary, 
    fontWeight: '600',
    fontSize: 14,
  },
  listingsRow: { },
  card: { 
    backgroundColor: '#fff', 
    borderRadius: 16, 
    overflow: 'hidden', 
    marginBottom: 16,
    flexDirection: 'row',
    shadowColor: '#000', 
    shadowOpacity: 0.05, 
    shadowOffset: { width: 0, height: 4 }, 
    elevation: 2,
  },
  cardClickable: {
    flexDirection: 'row',
    flex: 1,
  },
  cardImage: { width: 100, height: 100 },
  cardBody: { flex: 1, padding: 12, justifyContent: 'center' },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#1a202c' },
  cardSub: { color: '#777', marginTop: 4, fontSize: 12 },
  cardPrice: { marginTop: 4, color: Colors.primary, fontWeight: 'bold', fontSize: 16 },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  cardActions: {
    justifyContent: 'space-around', 
    paddingHorizontal: 12,
    borderLeftWidth: 1, 
    borderColor: '#f0f0f0',
  },
  editButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#e0f2fe', 
    marginBottom: 4, 
  },
  deleteButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#fee2e2',
  },
  emptyState: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    lineHeight: 20,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
});