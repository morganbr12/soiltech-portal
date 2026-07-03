import { signalStore, withState, withMethods, withComputed, patchState } from '@ngrx/signals';
import { computed } from '@angular/core';
import {
  Customer, CustomerStatus,
  CustomerOrder, CustomerWallet,
  CustomerReview, CustomerChat,
} from '../domain/customer.model';
import {
  MOCK_CUSTOMERS, MOCK_CUSTOMER_ORDERS,
  MOCK_CUSTOMER_WALLETS, MOCK_CUSTOMER_REVIEWS,
  MOCK_CUSTOMER_CHATS,
} from '../data/customer.mock';

interface CustomerState {
  customers: Customer[];
  orders: CustomerOrder[];
  wallets: CustomerWallet[];
  reviews: CustomerReview[];
  chats: CustomerChat[];
  selectedCustomerId: string | null;
  isLoading: boolean;
}

export const CustomerStore = signalStore(
  { providedIn: 'root' },
  withState<CustomerState>({
    customers: MOCK_CUSTOMERS,
    orders: MOCK_CUSTOMER_ORDERS,
    wallets: MOCK_CUSTOMER_WALLETS,
    reviews: MOCK_CUSTOMER_REVIEWS,
    chats: MOCK_CUSTOMER_CHATS,
    selectedCustomerId: null,
    isLoading: false,
  }),
  withComputed((store) => ({
    totalCustomers: computed(() => store.customers().length),
    activeCustomers: computed(() => store.customers().filter(c => c.status === CustomerStatus.ACTIVE || c.status === CustomerStatus.VERIFIED).length),
    pendingVerification: computed(() => store.customers().filter(c => c.status === CustomerStatus.PENDING).length),
    totalRevenue: computed(() => store.customers().reduce((sum, c) => sum + c.totalSpent, 0)),
    totalWalletBalance: computed(() => store.wallets().reduce((sum, w) => sum + w.balance, 0)),
    openChats: computed(() => store.chats().filter(c => c.status === 'open' || c.status === 'escalated').length),
    pendingReviews: computed(() => store.reviews().filter(r => r.status === 'pending').length),
    selectedCustomer: computed(() =>
      store.customers().find(c => c.id === store.selectedCustomerId()) ?? null
    ),
  })),
  withMethods((store) => ({
    setLoading(val: boolean): void { patchState(store, { isLoading: val }); },
    selectCustomer(id: string | null): void { patchState(store, { selectedCustomerId: id }); },
    updateCustomerStatus(id: string, status: CustomerStatus): void {
      patchState(store, {
        customers: store.customers().map(c => c.id === id ? { ...c, status, isVerified: status === CustomerStatus.VERIFIED || status === CustomerStatus.ACTIVE } : c),
      });
    },
  })),
);
