
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { Ionicons, Feather } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';

export default function FinancialsScreen() {
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');

  const financialData = {
    totalEarnings: 125400,
    pendingPayments: 28500,
    totalProperties: 5,
    occupancyRate: 89,
    averageRent: 3500,
  };

  const paymentHistory = [
    {
      id: '1',
      tenant: 'Jesse Pinkman',
      property: 'Sunrise Boarding House',
      amount: 3500,
      date: '2024-01-15',
      status: 'completed',
      type: 'rent'
    },
    {
      id: '2',
      tenant: 'Mike Ehrmantraut',
      property: 'CDO Student Dorm',
      amount: 2800,
      date: '2024-01-14',
      status: 'completed',
      type: 'rent'
    },
    {
      id: '3',
      tenant: 'Walter White',
      property: 'Green Valley Apartelle',
      amount: 4500,
      date: '2024-01-12',
      status: 'pending',
      type: 'rent'
    },
    {
      id: '4',
      tenant: 'Saul Goodman',
      property: 'XU Area Boarding',
      amount: 3200,
      date: '2024-01-10',
      status: 'completed',
      type: 'rent'
    },
  ];

  const handleRequestPayment = (tenantName) => {
    Alert.alert(
      'Request Payment',
      `Send payment request to ${tenantName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Send Request', onPress: () => {
          Alert.alert('Success', `Payment request sent to ${tenantName}`);
        }}
      ]
    );
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

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        
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
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="add-circle" size={24} color={Colors.primary} />
              <Text style={styles.actionText}>Record Payment</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="document-text" size={24} color={Colors.primary} />
              <Text style={styles.actionText}>Generate Report</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
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
            {paymentHistory.map((payment) => (
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
                    onPress={() => handleRequestPayment(payment.tenant)}
                  >
                    <Feather name="send" size={16} color={Colors.primary} />
                  </TouchableOpacity>
                )}
              </View>
            ))}
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
});