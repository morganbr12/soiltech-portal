import { signalStore, withState, withMethods, withComputed, patchState } from '@ngrx/signals';
import { inject, computed } from '@angular/core';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap, catchError, finalize, timeout, EMPTY } from 'rxjs';
import { CustomerService } from '../services/customer.service';
import {
  Customer, CustomerStatus,
  CustomerOrder, OrderStatus, DispatchDriverPayload,
  CustomerWallet, WalletStatus,
  CustomerReview, ReviewStatus,
  CustomerChat, ChatStatus,
  ChatMessage, NotificationHistoryItem,
  CustomerDashboardSummary,
  CustomerQueryParams, CustomerOrderQueryParams, CustomerWalletQueryParams,
  CustomerReviewQueryParams, CustomerChatQueryParams,
  SendNotificationRequest,
} from '../domain/customer.model';

type Callbacks = { onSuccess: () => void; onError: (msg: string) => void };
type HttpErr   = { error?: { message?: string }; message?: string };
function errMsg(e: HttpErr, fallback: string) {
  return e?.error?.message ?? e?.message ?? fallback;
}

interface CustomerSummary {
  total: number; active: number; verified: number;
  pending: number; suspended: number; rejected: number;
}
interface OrdersMeta {
  page: number; limit: number; total: number; totalPages: number;
}
interface WalletSummary {
  totalWallets: number; totalBalance: number;
  totalDeposited: number; totalWithdrawn: number; frozen: number;
}
interface ReviewSummary {
  total: number; approved: number; pending: number;
  flagged: number; rejected: number; avgRating: number;
}
interface ChatSummary { open: number; pending: number; resolved: number; escalated: number; }

interface CustomerState {
  // Customers
  customers:       Customer[];
  customerSummary: CustomerSummary;
  isLoadingCustomers: boolean;
  customerError:   string | null;

  // Dashboard
  dashboardSummary:    CustomerDashboardSummary | null;
  isLoadingDashboard:  boolean;

  // Orders
  orders:          CustomerOrder[];
  ordersMeta:      OrdersMeta;
  isLoadingOrders: boolean;

  // Wallets
  wallets:        CustomerWallet[];
  walletSummary:  WalletSummary;
  isLoadingWallets: boolean;

  // Reviews
  reviews:         CustomerReview[];
  reviewSummary:   ReviewSummary;
  isLoadingReviews: boolean;

  // Chats
  chats:           CustomerChat[];
  chatSummary:     ChatSummary;
  isLoadingChats:  boolean;
  activeChatMessages: ChatMessage[];
  isLoadingMessages: boolean;

  // Notifications
  notifHistory:      NotificationHistoryItem[];
  isLoadingNotifs:   boolean;
  isSendingNotif:    boolean;
}

const defaultCustomerSummary: CustomerSummary = { total: 0, active: 0, verified: 0, pending: 0, suspended: 0, rejected: 0 };
const defaultOrdersMeta: OrdersMeta = { page: 1, limit: 20, total: 0, totalPages: 0 };
const defaultWalletSummary: WalletSummary = { totalWallets: 0, totalBalance: 0, totalDeposited: 0, totalWithdrawn: 0, frozen: 0 };
const defaultReviewSummary: ReviewSummary = { total: 0, approved: 0, pending: 0, flagged: 0, rejected: 0, avgRating: 0 };
const defaultChatSummary: ChatSummary = { open: 0, pending: 0, resolved: 0, escalated: 0 };

export const CustomerStore = signalStore(
  { providedIn: 'root' },
  withState<CustomerState>({
    customers:          [],
    customerSummary:    defaultCustomerSummary,
    isLoadingCustomers: false,
    customerError:      null,

    dashboardSummary:   null,
    isLoadingDashboard: false,

    orders:          [],
    ordersMeta:      defaultOrdersMeta,
    isLoadingOrders: false,

    wallets:          [],
    walletSummary:    defaultWalletSummary,
    isLoadingWallets: false,

    reviews:          [],
    reviewSummary:    defaultReviewSummary,
    isLoadingReviews: false,

    chats:              [],
    chatSummary:        defaultChatSummary,
    isLoadingChats:     false,
    activeChatMessages: [],
    isLoadingMessages:  false,

    notifHistory:    [],
    isLoadingNotifs: false,
    isSendingNotif:  false,
  }),

  withComputed((store) => ({
    regions:      computed(() => [...new Set(store.customers().map(c => c.region))].sort()),
    openChats:    computed(() => store.chatSummary().open + store.chatSummary().escalated),
    pendingReviews: computed(() => store.reviewSummary().pending),
  })),

  withMethods((store, svc = inject(CustomerService)) => ({

    // ── Dashboard ──────────────────────────────────────────────────────

    loadDashboard: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { isLoadingDashboard: true })),
        switchMap(() =>
          svc.getDashboardSummary().pipe(
            timeout(20000),
            tap(data => patchState(store, { dashboardSummary: data })),
            catchError(() => EMPTY),
            finalize(() => patchState(store, { isLoadingDashboard: false }))
          )
        )
      )
    ),

    // ── Customers ──────────────────────────────────────────────────────

    loadCustomers: rxMethod<CustomerQueryParams>(
      pipe(
        tap(() => patchState(store, { isLoadingCustomers: true, customerError: null })),
        switchMap(params =>
          svc.list(params).pipe(
            timeout(20000),
            tap(res => patchState(store, {
              customers:       res.data ?? [],
              customerSummary: res.summary ?? defaultCustomerSummary,
            })),
            catchError((e: HttpErr) => {
              patchState(store, { customerError: errMsg(e, 'Failed to load customers') });
              return EMPTY;
            }),
            finalize(() => patchState(store, { isLoadingCustomers: false }))
          )
        )
      )
    ),

    verifyCustomer(id: string, callbacks: Callbacks): void {
      svc.verify(id).subscribe({
        next: updated => {
          patchState(store, { customers: store.customers().map(c => c.id === id ? { ...c, ...updated } : c) });
          callbacks.onSuccess();
        },
        error: (e: HttpErr) => callbacks.onError(errMsg(e, 'Verification failed')),
      });
    },

    rejectCustomer(id: string, reason: string, callbacks: Callbacks): void {
      svc.reject(id, reason).subscribe({
        next: updated => {
          patchState(store, { customers: store.customers().map(c => c.id === id ? { ...c, ...updated } : c) });
          callbacks.onSuccess();
        },
        error: (e: HttpErr) => callbacks.onError(errMsg(e, 'Rejection failed')),
      });
    },

    suspendCustomer(id: string, reason: string, callbacks: Callbacks): void {
      svc.suspend(id, reason).subscribe({
        next: updated => {
          patchState(store, { customers: store.customers().map(c => c.id === id ? { ...c, ...updated } : c) });
          callbacks.onSuccess();
        },
        error: (e: HttpErr) => callbacks.onError(errMsg(e, 'Suspend failed')),
      });
    },

    activateCustomer(id: string, callbacks: Callbacks): void {
      svc.activate(id).subscribe({
        next: updated => {
          patchState(store, { customers: store.customers().map(c => c.id === id ? { ...c, ...updated } : c) });
          callbacks.onSuccess();
        },
        error: (e: HttpErr) => callbacks.onError(errMsg(e, 'Activation failed')),
      });
    },

    deleteCustomer(id: string, callbacks: Callbacks): void {
      svc.delete(id).subscribe({
        next: () => {
          patchState(store, { customers: store.customers().filter(c => c.id !== id) });
          callbacks.onSuccess();
        },
        error: (e: HttpErr) => callbacks.onError(errMsg(e, 'Delete failed')),
      });
    },

    // ── Orders ─────────────────────────────────────────────────────────

    loadOrders: rxMethod<CustomerOrderQueryParams>(
      pipe(
        tap(() => patchState(store, { isLoadingOrders: true })),
        switchMap(params =>
          svc.listOrders(params).pipe(
            timeout(20000),
            tap(res => {
              console.log('[customers/orders] response:', res);
              const orders = (res.data ?? []).map(o => ({
                ...o,
                status:        o.status.toUpperCase()        as CustomerOrder['status'],
                paymentStatus: o.paymentStatus.toUpperCase() as CustomerOrder['paymentStatus'],
              }));
              patchState(store, {
                orders,
                ordersMeta: res.meta ?? defaultOrdersMeta,
              });
            }),
            catchError(() => EMPTY),
            finalize(() => patchState(store, { isLoadingOrders: false }))
          )
        )
      )
    ),

    confirmOrder(id: string, callbacks: Callbacks): void {
      svc.confirmOrder(id).subscribe({
        next: updated => {
          patchState(store, { orders: store.orders().map(o => o.id === id ? { ...o, ...updated } : o) });
          callbacks.onSuccess();
        },
        error: (e: HttpErr) => callbacks.onError(errMsg(e, 'Confirm failed')),
      });
    },

    cancelOrder(id: string, reason: string, callbacks: Callbacks): void {
      svc.cancelOrder(id, reason).subscribe({
        next: updated => {
          patchState(store, { orders: store.orders().map(o => o.id === id ? { ...o, ...updated } : o) });
          callbacks.onSuccess();
        },
        error: (e: HttpErr) => callbacks.onError(errMsg(e, 'Cancel failed')),
      });
    },

    deliverOrder(id: string, callbacks: Callbacks): void {
      svc.deliverOrder(id).subscribe({
        next: updated => {
          patchState(store, { orders: store.orders().map(o => o.id === id ? { ...o, ...updated } : o) });
          callbacks.onSuccess();
        },
        error: (e: HttpErr) => callbacks.onError(errMsg(e, 'Deliver failed')),
      });
    },

    dispatchDriver(orderId: string, payload: DispatchDriverPayload, callbacks: Callbacks): void {
      svc.dispatchDriver(orderId, payload).subscribe({
        next: () => {
          patchState(store, {
            orders: store.orders().map(o =>
              o.id === orderId ? { ...o, status: OrderStatus.DRIVER_DISPATCHED } : o
            ),
          });
          callbacks.onSuccess();
        },
        error: (e: HttpErr) => callbacks.onError(errMsg(e, 'Failed to dispatch driver')),
      });
    },


    // ── Wallets ────────────────────────────────────────────────────────

    loadWallets: rxMethod<CustomerWalletQueryParams>(
      pipe(
        tap(() => patchState(store, { isLoadingWallets: true })),
        switchMap(params =>
          svc.listWallets(params).pipe(
            timeout(20000),
            tap(res => patchState(store, {
              wallets:       res.data ?? [],
              walletSummary: res.summary ?? defaultWalletSummary,
            })),
            catchError(() => EMPTY),
            finalize(() => patchState(store, { isLoadingWallets: false }))
          )
        )
      )
    ),

    freezeWallet(id: string, callbacks: Callbacks): void {
      svc.freezeWallet(id).subscribe({
        next: updated => {
          patchState(store, { wallets: store.wallets().map(w => w.id === id ? { ...w, ...updated } : w) });
          callbacks.onSuccess();
        },
        error: (e: HttpErr) => callbacks.onError(errMsg(e, 'Freeze failed')),
      });
    },

    unfreezeWallet(id: string, callbacks: Callbacks): void {
      svc.unfreezeWallet(id).subscribe({
        next: updated => {
          patchState(store, { wallets: store.wallets().map(w => w.id === id ? { ...w, ...updated } : w) });
          callbacks.onSuccess();
        },
        error: (e: HttpErr) => callbacks.onError(errMsg(e, 'Unfreeze failed')),
      });
    },

    // ── Reviews ────────────────────────────────────────────────────────

    loadReviews: rxMethod<CustomerReviewQueryParams>(
      pipe(
        tap(() => patchState(store, { isLoadingReviews: true })),
        switchMap(params =>
          svc.listReviews(params).pipe(
            timeout(20000),
            tap(res => patchState(store, {
              reviews:       res.data ?? [],
              reviewSummary: res.summary ?? defaultReviewSummary,
            })),
            catchError(() => EMPTY),
            finalize(() => patchState(store, { isLoadingReviews: false }))
          )
        )
      )
    ),

    approveReview(id: string, callbacks: Callbacks): void {
      svc.approveReview(id).subscribe({
        next: updated => {
          patchState(store, { reviews: store.reviews().map(r => r.id === id ? { ...r, ...updated } : r) });
          callbacks.onSuccess();
        },
        error: (e: HttpErr) => callbacks.onError(errMsg(e, 'Approve failed')),
      });
    },

    flagReview(id: string, callbacks: Callbacks): void {
      svc.flagReview(id).subscribe({
        next: updated => {
          patchState(store, { reviews: store.reviews().map(r => r.id === id ? { ...r, ...updated } : r) });
          callbacks.onSuccess();
        },
        error: (e: HttpErr) => callbacks.onError(errMsg(e, 'Flag failed')),
      });
    },

    deleteReview(id: string, callbacks: Callbacks): void {
      svc.deleteReview(id).subscribe({
        next: () => {
          patchState(store, { reviews: store.reviews().filter(r => r.id !== id) });
          callbacks.onSuccess();
        },
        error: (e: HttpErr) => callbacks.onError(errMsg(e, 'Delete failed')),
      });
    },

    // ── Chats ──────────────────────────────────────────────────────────

    loadChats: rxMethod<CustomerChatQueryParams>(
      pipe(
        tap(() => patchState(store, { isLoadingChats: true })),
        switchMap(params =>
          svc.listChats(params).pipe(
            timeout(20000),
            tap(res => patchState(store, {
              chats:       res.data ?? [],
              chatSummary: res.summary ?? defaultChatSummary,
            })),
            catchError(() => EMPTY),
            finalize(() => patchState(store, { isLoadingChats: false }))
          )
        )
      )
    ),

    loadMessages(chatId: string): void {
      patchState(store, { isLoadingMessages: true, activeChatMessages: [] });
      svc.getChatMessages(chatId).subscribe({
        next: msgs => patchState(store, { activeChatMessages: msgs, isLoadingMessages: false }),
        error: () => patchState(store, { isLoadingMessages: false }),
      });
    },

    sendChatMessage(chatId: string, message: string, onDone: (msg: ChatMessage) => void): void {
      svc.sendChatMessage(chatId, message).subscribe({
        next: msg => {
          patchState(store, { activeChatMessages: [...store.activeChatMessages(), msg] });
          onDone(msg);
        },
      });
    },

    resolveChat(id: string, callbacks: Callbacks): void {
      svc.resolveChat(id).subscribe({
        next: updated => {
          patchState(store, { chats: store.chats().map(c => c.id === id ? { ...c, ...updated } : c) });
          callbacks.onSuccess();
        },
        error: (e: HttpErr) => callbacks.onError(errMsg(e, 'Resolve failed')),
      });
    },

    escalateChat(id: string, callbacks: Callbacks): void {
      svc.escalateChat(id).subscribe({
        next: updated => {
          patchState(store, { chats: store.chats().map(c => c.id === id ? { ...c, ...updated } : c) });
          callbacks.onSuccess();
        },
        error: (e: HttpErr) => callbacks.onError(errMsg(e, 'Escalate failed')),
      });
    },

    // ── Notifications ──────────────────────────────────────────────────

    loadNotifHistory: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { isLoadingNotifs: true })),
        switchMap(() =>
          svc.listNotifHistory().pipe(
            timeout(20000),
            tap(res => patchState(store, { notifHistory: res.data ?? [] })),
            catchError(() => EMPTY),
            finalize(() => patchState(store, { isLoadingNotifs: false }))
          )
        )
      )
    ),

    sendNotification(payload: SendNotificationRequest, callbacks: Callbacks): void {
      patchState(store, { isSendingNotif: true });
      svc.sendNotification(payload).subscribe({
        next: () => { patchState(store, { isSendingNotif: false }); callbacks.onSuccess(); },
        error: (e: HttpErr) => { patchState(store, { isSendingNotif: false }); callbacks.onError(errMsg(e, 'Send failed')); },
      });
    },
  }))
);
