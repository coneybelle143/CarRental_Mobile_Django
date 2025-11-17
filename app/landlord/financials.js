import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { Ionicons, Feather } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BOOKINGS_STORAGE_KEY = '@bookings_data';
const PAYMENTS_STORAGE_KEY = '@payments_data';
const LANDLORD_INQUIRIES_KEY = '@landlord_inquiries';
const LISTINGS_STORAGE_KEY = '@landlord_listings';

export default function FinancialsScreen() {
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [refreshing, setRefreshing] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [payments, setPayments] = useState([]);
  const [listings, setListings] = useState([]);

  const currentLandlord = {
    id: 'landlord_walter_white_01',
    name: 'Walter White',
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load bookings
      const bookingsJson = await AsyncStorage.getItem(BOOKINGS_STORAGE_KEY);
      const allBookings = bookingsJson ? JSON.parse(bookingsJson) : [];
      const landlordBookings = allBookings.filter(booking => booking.landlordId === currentLandlord.id);
      setBookings(landlordBookings);

      // Load payments
      const paymentsJson = await AsyncStorage.getItem(PAYMENTS_STORAGE_KEY);
      const allPayments = paymentsJson ? JSON.parse(paymentsJson) : [];
      const landlordPayments = allPayments.filter(payment => payment.landlordId === currentLandlord.id);
      setPayments(landlordPayments);

      // Load listings
      const listingsJson = await AsyncStorage.getItem(LISTINGS_STORAGE_KEY);
      const allListings = listingsJson ? JSON.parse(listingsJson) : [];
      const landlordListings = allListings.filter(listing => listing.landlord?.id === currentLandlord.id);
      setListings(landlordListings);

    } catch (error) {
      console.error('Failed to load data', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  // Calculate financial data from actual data
  const calculateFinancialData = () => {
    const completedPayments = payments.filter(p => p.status === 'completed');
    const pendingPayments = payments.filter(p => p.status === 'pending');
    
    const totalEarnings = completedPayments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
    const pendingAmount = pendingPayments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
    const totalProperties = listings.length;
    
    // Calculate occupancy rate
    const occupiedProperties = bookings.filter(b => 
      b.status === 'approved' || b.status === 'pending'
    ).length;
    const occupancyRate = totalProperties > 0 ? Math.round((occupiedProperties / totalProperties) * 100) : 0;

    // Calculate average rent from completed payments
    const rentPayments = completedPayments.filter(p => p.type === 'rent');
    const averageRent = rentPayments.length > 0 
      ? rentPayments.reduce((sum, payment) => sum + payment.amount, 0) / rentPayments.length 
      : 0;

    return {
      totalEarnings,
      pendingPayments: pendingAmount,
      totalProperties,
      occupancyRate,
      averageRent: Math.round(averageRent),
    };
  };

  const financialData = calculateFinancialData();

  // Generate payment history from actual payments
  const paymentHistory = payments.map(payment => ({
    id: payment.id,
    tenant: payment.tenantName || 'Tenant',
    property: payment.property,
    amount: payment.amount,
    date: payment.paidDate || payment.date,
    status: payment.status,
    type: payment.type || 'rent'
  }));

  const handleRequestPayment = async (tenantName, paymentId) => {
    Alert.alert(
      'Request Payment',
      `Send payment reminder to ${tenantName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Send Request', 
          onPress: async () => {
            try {
              // Send message to tenant
              const reminderMessage = {
                id: `msg_${Date.now()}`,
                sender: currentLandlord.id,
                text: `💰 Payment Reminder\n\nThis is a friendly reminder about your pending payment. Please complete the payment at your earliest convenience.`,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                type: 'payment_reminder',
              };

              // Update landlord inquiries
              const landlordJson = await AsyncStorage.getItem(LANDLORD_INQUIRIES_KEY);
              let landlordInquiries = landlordJson ? JSON.parse(landlordJson) : [];

              const convoIndex = landlordInquiries.findIndex(
                conv => conv.tenant?.name === tenantName
              );

              if (convoIndex > -1) {
                if (!landlordInquiries[convoIndex].history) {
                  landlordInquiries[convoIndex].history = [];
                }
                landlordInquiries[convoIndex].history.unshift(reminderMessage);
                landlordInquiries[convoIndex].lastMessage = reminderMessage.text;
                landlordInquiries[convoIndex].time = 'Just now';
              }

              await AsyncStorage.setItem(LANDLORD_INQUIRIES_KEY, JSON.stringify(landlordInquiries));

              Alert.alert('Success', `Payment reminder sent to ${tenantName}`);
            } catch (error) {
              console.error('Failed to send payment reminder', error);
              Alert.alert('Error', 'Failed to send payment reminder.');
            }
          }
        }
      ]
    );
  };

  const handleRecordPayment = () => {
    Alert.alert(
      'Record Payment',
      'This would open a form to manually record a payment from a tenant.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Continue', 
          onPress: async () => {
            try {
              // Create a sample payment record
              const newPayment = {
                id: `payment_${Date.now()}`,
                landlordId: currentLandlord.id,
                tenantId: 'tenant_sample_01',
                tenantName: 'Sample Tenant',
                property: listings[0]?.name || 'Sample Property',
                amount: 3500,
                type: 'rent',
                status: 'completed',
                date: new Date().toISOString().split('T')[0],
                paidDate: new Date().toISOString().split('T')[0],
                recordedManually: true
              };

              const paymentsJson = await AsyncStorage.getItem(PAYMENTS_STORAGE_KEY);
              const allPayments = paymentsJson ? JSON.parse(paymentsJson) : [];
              allPayments.push(newPayment);
              await AsyncStorage.setItem(PAYMENTS_STORAGE_KEY, JSON.stringify(allPayments));

              await loadData(); // Reload data
              Alert.alert('Success', 'Payment recorded successfully!');
            } catch (error) {
              console.error('Failed to record payment', error);
              Alert.alert('Error', 'Failed to record payment.');
            }
          }
        }
      ]
    );
  };

  const handleGenerateReport = () => {
    if (payments.length === 0) {
      Alert.alert('No Data', 'You have no payment data to generate a report.');
      return;
    }
    Alert.alert('Generate Report', 'Your financial report will be prepared for download.');
  };

  const handleExportData = () => {
    if (payments.length === 0 && bookings.length === 0) {
      Alert.alert('No Data', 'You have no data to export.');
      return;
    }
    Alert.alert('Export Data', 'Your financial data will be prepared for export.');
  };

  const getStatusColor = (status) => {
    return status === 'completed' ? '#10b981' : '#f59e0b';
  };

  const getStatusText = (status) => {
    return status === 'completed' ? 'Paid' : 'Pending';
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Financials & Payments',
          headerShown: true,
          headerStyle: {
            backgroundColor: Colors.primary,
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={{ paddingLeft: 16 }}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView 
        style={styles.container} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        
        <View style={styles.periodSelector}>
          <TouchableOpacity
            style={[styles.periodButton, selectedPeriod === 'monthly' && styles.periodButtonActive]}
            onPress={() => setSelectedPeriod('monthly')}
          >
            <Text style={[styles.periodText, selectedPeriod === 'monthly' && styles.periodTextActive]}>
              Monthly
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.periodButton, selectedPeriod === 'quarterly' && styles.periodButtonActive]}
            onPress={() => setSelectedPeriod('quarterly')}
          >
            <Text style={[styles.periodText, selectedPeriod === 'quarterly' && styles.periodTextActive]}>
              Quarterly
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.periodButton, selectedPeriod === 'yearly' && styles.periodButtonActive]}
            onPress={() => setSelectedPeriod('yearly')}
          >
            <Text style={[styles.periodText, selectedPeriod === 'yearly' && styles.periodTextActive]}>
              Yearly
            </Text>
          </TouchableOpacity>
        </View>

       
        <View style={styles.overviewSection}>
          <Text style={styles.sectionTitle}>Financial Overview</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: '#e0f2fe' }]}>
                <Ionicons name="wallet" size={24} color={Colors.primary} />
              </View>
              <Text style={styles.statValue}>₱{financialData.totalEarnings.toLocaleString()}</Text>
              <Text style={styles.statLabel}>Total Earnings</Text>
            </View>
            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: '#fef3c7' }]}>
                <Ionicons name="time" size={24} color="#f59e0b" />
              </View>
              <Text style={styles.statValue}>₱{financialData.pendingPayments.toLocaleString()}</Text>
              <Text style={styles.statLabel}>Pending Payments</Text>
            </View>
            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: '#dcfce7' }]}>
                <Ionicons name="business" size={24} color="#10b981" />
              </View>
              <Text style={styles.statValue}>{financialData.totalProperties}</Text>
              <Text style={styles.statLabel}>Properties</Text>
            </View>
            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: '#f0f4ff' }]}>
                <Ionicons name="trending-up" size={24} color={Colors.primary} />
              </View>
              <Text style={styles.statValue}>{financialData.occupancyRate}%</Text>
              <Text style={styles.statLabel}>Occupancy Rate</Text>
            </View>
          </View>
        </View>

        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.actionButton} onPress={handleRecordPayment}>
              <Ionicons name="add-circle" size={24} color={Colors.primary} />
              <Text style={styles.actionText}>Record Payment</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={handleGenerateReport}>
              <Ionicons name="document-text" size={24} color={Colors.primary} />
              <Text style={styles.actionText}>Generate Report</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={handleExportData}>
              <Ionicons name="download" size={24} color={Colors.primary} />
              <Text style={styles.actionText}>Export Data</Text>
            </TouchableOpacity>
          </View>
        </View>

        
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Payments</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.paymentsList}>
            {paymentHistory.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="receipt-outline" size={32} color="#ccc" />
                <Text style={styles.emptyStateText}>No payments yet</Text>
                <Text style={styles.emptyStateSubtext}>Payments will appear here when tenants make payments</Text>
              </View>
            ) : (
              paymentHistory.map((payment) => (
                <View key={payment.id} style={styles.paymentItem}>
                  <View style={styles.paymentInfo}>
                    <View style={styles.paymentHeader}>
                      <Text style={styles.tenantName}>{payment.tenant}</Text>
                      <Text style={styles.paymentAmount}>₱{payment.amount.toLocaleString()}</Text>
                    </View>
                    <Text style={styles.propertyName}>{payment.property}</Text>
                    <View style={styles.paymentDetails}>
                      <Text style={styles.paymentDate}>{payment.date}</Text>
                      <View style={[styles.statusBadge, { backgroundColor: getStatusColor(payment.status) + '20' }]}>
                        <View style={[styles.statusDot, { backgroundColor: getStatusColor(payment.status) }]} />
                        <Text style={[styles.statusText, { color: getStatusColor(payment.status) }]}>
                          {getStatusText(payment.status)}
                        </Text>
                      </View>
                    </View>
                  </View>
                  {payment.status === 'pending' && (
                    <TouchableOpacity 
                      style={styles.requestButton}
                      onPress={() => handleRequestPayment(payment.tenant, payment.id)}
                    >
                      <Feather name="send" size={16} color={Colors.primary} />
                    </TouchableOpacity>
                  )}
                </View>
              ))
            )}
          </View>
        </View>

        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Financial Summary</Text>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Total Collected</Text>
              <Text style={styles.summaryValue}>₱{(financialData.totalEarnings - financialData.pendingPayments).toLocaleString()}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Average Rent</Text>
              <Text style={styles.summaryValue}>₱{financialData.averageRent.toLocaleString()}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Properties Occupied</Text>
              <Text style={styles.summaryValue}>
                {Math.round((financialData.occupancyRate / 100) * financialData.totalProperties)}/{financialData.totalProperties}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f7fb',
    padding: 16,
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  periodButtonActive: {
    backgroundColor: Colors.primary,
  },
  periodText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  periodTextActive: {
    color: 'white',
  },
  overviewSection: {
    marginBottom: 20,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  seeAllText: {
    color: Colors.primary,
    fontWeight: '600',
    fontSize: 14,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    width: '48%',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    gap: 8,
  },
  actionText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '500',
    textAlign: 'center',
  },
  paymentsList: {
    gap: 12,
  },
  paymentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  tenantName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  paymentAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  propertyName: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  paymentDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paymentDate: {
    fontSize: 12,
    color: '#999',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  requestButton: {
    padding: 8,
    backgroundColor: '#e0f2fe',
    borderRadius: 8,
    marginLeft: 12,
  },
  summaryGrid: {
    gap: 12,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#999',
    marginTop: 8,
    fontWeight: '600',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#ccc',
    textAlign: 'center',
    marginTop: 4,
  },
});