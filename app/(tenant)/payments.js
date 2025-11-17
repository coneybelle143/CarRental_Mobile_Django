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

export default function FinancialsScreen() {
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [refreshing, setRefreshing] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [payments, setPayments] = useState([]);

  const currentUser = {
    id: 'tenant_jesse_pinkman_01',
    name: 'Jesse Pinkman',
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load bookings
      const bookingsJson = await AsyncStorage.getItem(BOOKINGS_STORAGE_KEY);
      const allBookings = bookingsJson ? JSON.parse(bookingsJson) : [];
      const userBookings = allBookings.filter(booking => booking.tenantId === currentUser.id);
      setBookings(userBookings);

      // Load payments
      const paymentsJson = await AsyncStorage.getItem(PAYMENTS_STORAGE_KEY);
      const allPayments = paymentsJson ? JSON.parse(paymentsJson) : [];
      const userPayments = allPayments.filter(payment => payment.tenantId === currentUser.id);
      setPayments(userPayments);
    } catch (error) {
      console.error('Failed to load data', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  // Calculate financial data from actual bookings and payments
  const calculateFinancialData = () => {
    const completedPayments = payments.filter(p => p.status === 'completed');
    const pendingPayments = payments.filter(p => p.status === 'pending');
    
    const totalSpent = completedPayments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
    const pendingAmount = pendingPayments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
    const activeBookings = bookings.filter(b => b.status === 'approved' || b.status === 'pending').length;
    
    // Calculate average rent from completed payments
    const rentPayments = completedPayments.filter(p => p.type === 'rent');
    const averageRent = rentPayments.length > 0 
      ? rentPayments.reduce((sum, payment) => sum + payment.amount, 0) / rentPayments.length 
      : 0;

    return {
      totalSpent,
      pendingPayments: pendingAmount,
      activeBookings,
      savedProperties: 8, // This could be connected to favorites if you have that data
      averageRent: Math.round(averageRent),
    };
  };

  const financialData = calculateFinancialData();

  // Generate payment history from actual payments
  const paymentHistory = payments
    .filter(payment => payment.status === 'completed')
    .map(payment => ({
      id: payment.id,
      landlord: payment.landlordName,
      property: payment.property,
      amount: payment.amount,
      date: payment.paidDate || payment.date,
      status: 'completed',
      type: payment.type || 'rent'
    }));

  // Generate upcoming payments from pending payments and upcoming bookings
  const upcomingPayments = [
    ...payments
      .filter(payment => payment.status === 'pending')
      .map(payment => ({
        id: payment.id,
        landlord: payment.landlordName,
        property: payment.property,
        amount: payment.amount,
        dueDate: payment.dueDate,
        type: payment.type || 'rent'
      })),
    ...bookings
      .filter(booking => booking.status === 'approved')
      .map(booking => ({
        id: `upcoming_${booking.id}`,
        landlord: booking.landlordName,
        property: booking.property,
        amount: booking.amount || 0,
        dueDate: booking.moveInDate,
        type: 'rent'
      }))
  ];

  const handlePayNow = async (payment) => {
    Alert.alert(
      'Make Payment',
      `Pay ₱${payment.amount.toLocaleString()} to ${payment.landlord}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Pay Now', 
          onPress: async () => {
            try {
              // Update payment status to completed
              const paymentsJson = await AsyncStorage.getItem(PAYMENTS_STORAGE_KEY);
              const allPayments = paymentsJson ? JSON.parse(paymentsJson) : [];
              
              const updatedPayments = allPayments.map(p => 
                p.id === payment.id 
                  ? { 
                      ...p, 
                      status: 'completed',
                      paidDate: new Date().toISOString().split('T')[0]
                    }
                  : p
              );

              await AsyncStorage.setItem(PAYMENTS_STORAGE_KEY, JSON.stringify(updatedPayments));
              
              // Reload data
              await loadData();
              
              Alert.alert('Success', `Payment of ₱${payment.amount.toLocaleString()} completed!`);
            } catch (error) {
              console.error('Failed to process payment', error);
              Alert.alert('Error', 'Failed to process payment. Please try again.');
            }
          }
        }
      ]
    );
  };

  const getStatusColor = (status) => {
    return status === 'completed' ? '#10b981' : '#f59e0b';
  };

  const getStatusText = (status) => {
    return status === 'completed' ? 'Paid' : 'Pending';
  };

  const getPaymentType = (type) => {
    return type === 'rent' ? 'Monthly Rent' : 
           type === 'security_deposit' ? 'Security Deposit' : 
           type || 'Payment';
  };

  const handleAddPaymentMethod = () => {
    Alert.alert('Add Payment Method', 'This would open payment method setup screen.');
  };

  const handleViewReceipts = () => {
    const completedPayments = payments.filter(p => p.status === 'completed');
    if (completedPayments.length === 0) {
      Alert.alert('No Receipts', 'You have no completed payments yet.');
      return;
    }
    Alert.alert('View Receipts', 'This would show all your payment receipts.');
  };

  const handleExportHistory = () => {
    if (payments.length === 0) {
      Alert.alert('No Data', 'You have no payment history to export.');
      return;
    }
    Alert.alert('Export History', 'Your payment history will be prepared for download.');
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Payments & Financials',
          headerShown: true,
          headerStyle: {
            backgroundColor: Colors.primary,
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.push('/(tenant)/menu')} style={{ paddingLeft: 16 }}>
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
              <Text style={styles.statValue}>₱{financialData.totalSpent.toLocaleString()}</Text>
              <Text style={styles.statLabel}>Total Spent</Text>
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
                <Ionicons name="calendar" size={24} color="#10b981" />
              </View>
              <Text style={styles.statValue}>{financialData.activeBookings}</Text>
              <Text style={styles.statLabel}>Active Bookings</Text>
            </View>
            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: '#f0f4ff' }]}>
                <Ionicons name="heart" size={24} color={Colors.primary} />
              </View>
              <Text style={styles.statValue}>{financialData.savedProperties}</Text>
              <Text style={styles.statLabel}>Saved Properties</Text>
            </View>
          </View>
        </View>

        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.actionButton} onPress={handleAddPaymentMethod}>
              <Ionicons name="card" size={24} color={Colors.primary} />
              <Text style={styles.actionText}>Add Payment Method</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={handleViewReceipts}>
              <Ionicons name="receipt" size={24} color={Colors.primary} />
              <Text style={styles.actionText}>View Receipts</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={handleExportHistory}>
              <Ionicons name="download" size={24} color={Colors.primary} />
              <Text style={styles.actionText}>Export History</Text>
            </TouchableOpacity>
          </View>
        </View>

        
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Upcoming Payments</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.paymentsList}>
            {upcomingPayments.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="card-outline" size={32} color="#ccc" />
                <Text style={styles.emptyStateText}>No upcoming payments</Text>
              </View>
            ) : (
              upcomingPayments.map((payment) => (
                <View key={payment.id} style={styles.paymentItem}>
                  <View style={styles.paymentInfo}>
                    <View style={styles.paymentHeader}>
                      <Text style={styles.landlordName}>{payment.landlord}</Text>
                      <Text style={styles.paymentAmount}>₱{payment.amount.toLocaleString()}</Text>
                    </View>
                    <Text style={styles.propertyName}>{payment.property}</Text>
                    <View style={styles.paymentDetails}>
                      <Text style={styles.paymentDate}>Due: {payment.dueDate}</Text>
                      <Text style={styles.paymentType}>{getPaymentType(payment.type)}</Text>
                    </View>
                  </View>
                  <TouchableOpacity 
                    style={styles.payButton}
                    onPress={() => handlePayNow(payment)}
                  >
                    <Feather name="credit-card" size={16} color="white" />
                    <Text style={styles.payButtonText}>Pay Now</Text>
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>
        </View>

        
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Payment History</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.paymentsList}>
            {paymentHistory.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="receipt-outline" size={32} color="#ccc" />
                <Text style={styles.emptyStateText}>No payment history yet</Text>
              </View>
            ) : (
              paymentHistory.map((payment) => (
                <View key={payment.id} style={styles.paymentItem}>
                  <View style={styles.paymentInfo}>
                    <View style={styles.paymentHeader}>
                      <Text style={styles.landlordName}>{payment.landlord}</Text>
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
                  {payment.status === 'completed' && (
                    <TouchableOpacity style={styles.receiptButton}>
                      <Ionicons name="receipt" size={16} color={Colors.primary} />
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
              <Text style={styles.summaryLabel}>Monthly Average</Text>
              <Text style={styles.summaryValue}>₱{financialData.averageRent.toLocaleString()}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Active Bookings</Text>
              <Text style={styles.summaryValue}>{financialData.activeBookings}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Properties Saved</Text>
              <Text style={styles.summaryValue}>{financialData.savedProperties}</Text>
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
  landlordName: {
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
  paymentType: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
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
  payButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: Colors.primary,
    borderRadius: 8,
    marginLeft: 12,
    gap: 4,
  },
  payButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  receiptButton: {
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
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
});