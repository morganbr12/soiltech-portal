import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { API_ENDPOINTS } from '../../../core/constants/api.constants';
import {
  Customer, CustomerOrder, CustomerWallet, WalletTransaction,
  CustomerReview, CustomerChat, ChatMessage, NotificationHistoryItem,
  CustomerDashboardSummary,
  CustomerListResponse, CustomerOrderListResponse, CustomerWalletListResponse,
  CustomerReviewListResponse, CustomerChatListResponse, ChatMessageListResponse,
  NotifHistoryListResponse, ApiResponse,
  CustomerQueryParams, CustomerOrderQueryParams, CustomerWalletQueryParams,
  CustomerReviewQueryParams, CustomerChatQueryParams,
  CreateCustomerRequest, CreateOrderRequest, SendNotificationRequest,
  DispatchDriverPayload,
} from '../domain/customer.model';

function toHttpParams(obj: Record<string, unknown>): HttpParams {
  let p = new HttpParams();
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined && v !== null && v !== '') p = p.set(k, String(v));
  }
  return p;
}

function lowerStatus<T extends { status: string }>(item: T): T {
  return { ...item, status: item.status.toLowerCase() as T['status'] };
}

@Injectable({ providedIn: 'root' })
export class CustomerService {
  private readonly http = inject(HttpClient);
  private readonly base = API_ENDPOINTS.CUSTOMERS;

  // ── Dashboard ──────────────────────────────────────────────────────────

  getDashboardSummary(): Observable<CustomerDashboardSummary> {
    return this.http
      .get<{ status: string; data: CustomerDashboardSummary }>(`${this.base}/dashboard`)
      .pipe(map(r => r.data));
  }

  // ── Customers ──────────────────────────────────────────────────────────

  list(params: CustomerQueryParams = {}): Observable<CustomerListResponse> {
    return this.http
      .get<CustomerListResponse>(this.base, { params: toHttpParams(params as Record<string, unknown>) })
      .pipe(map(res => ({
        ...res,
        data: res.data.map(c => lowerStatus(c) as Customer),
      })));
  }

  getById(id: string): Observable<Customer> {
    return this.http
      .get<ApiResponse<Customer>>(`${this.base}/${id}`)
      .pipe(map(r => lowerStatus(r.data) as Customer));
  }

  create(payload: CreateCustomerRequest): Observable<Customer> {
    return this.http
      .post<ApiResponse<Customer>>(this.base, payload)
      .pipe(map(r => r.data));
  }

  update(id: string, payload: Partial<CreateCustomerRequest>): Observable<Customer> {
    return this.http
      .put<ApiResponse<Customer>>(`${this.base}/${id}`, payload)
      .pipe(map(r => r.data));
  }

  delete(id: string): Observable<void> {
    return this.http
      .delete<ApiResponse<void>>(`${this.base}/${id}`)
      .pipe(map(() => void 0));
  }

  verify(id: string): Observable<Customer> {
    return this.http
      .patch<ApiResponse<Customer>>(`${this.base}/${id}/verify`, {})
      .pipe(map(r => r.data));
  }

  reject(id: string, reason?: string): Observable<Customer> {
    return this.http
      .patch<ApiResponse<Customer>>(`${this.base}/${id}/reject`, { reason: reason ?? '' })
      .pipe(map(r => r.data));
  }

  suspend(id: string, reason?: string): Observable<Customer> {
    return this.http
      .patch<ApiResponse<Customer>>(`${this.base}/${id}/suspend`, { reason: reason ?? '' })
      .pipe(map(r => r.data));
  }

  activate(id: string): Observable<Customer> {
    return this.http
      .patch<ApiResponse<Customer>>(`${this.base}/${id}/activate`, {})
      .pipe(map(r => r.data));
  }

  // ── Orders ─────────────────────────────────────────────────────────────

  listOrders(params: CustomerOrderQueryParams = {}): Observable<CustomerOrderListResponse> {
    return this.http
      .get<CustomerOrderListResponse>(`${this.base}/orders`, { params: toHttpParams(params as Record<string, unknown>) });
  }

  createOrder(payload: CreateOrderRequest): Observable<CustomerOrder> {
    return this.http
      .post<ApiResponse<CustomerOrder>>(`${this.base}/orders`, payload)
      .pipe(map(r => r.data));
  }

  confirmOrder(id: string): Observable<CustomerOrder> {
    return this.http
      .patch<ApiResponse<CustomerOrder>>(`${this.base}/orders/${id}/confirm`, {})
      .pipe(map(r => r.data));
  }

  cancelOrder(id: string, reason?: string): Observable<CustomerOrder> {
    return this.http
      .patch<ApiResponse<CustomerOrder>>(`${this.base}/orders/${id}/cancel`, { reason: reason ?? '' })
      .pipe(map(r => r.data));
  }

  deliverOrder(id: string): Observable<CustomerOrder> {
    return this.http
      .patch<ApiResponse<CustomerOrder>>(`${this.base}/orders/${id}/deliver`, {})
      .pipe(map(r => r.data));
  }

  dispatchDriver(orderId: string, payload: DispatchDriverPayload): Observable<{ id: string; [key: string]: unknown }> {
    return this.http
      .post<ApiResponse<{ id: string; [key: string]: unknown }>>(`${this.base}/orders/${orderId}/dispatch-driver`, payload)
      .pipe(map(r => r.data));
  }

  updateDispatchStatus(dispatchId: string, status: string): Observable<unknown> {
    return this.http
      .patch<ApiResponse<unknown>>(`${API_ENDPOINTS.DISPATCHES}/${dispatchId}/status`, { status })
      .pipe(map(r => r.data));
  }

  // ── Wallets ────────────────────────────────────────────────────────────

  listWallets(params: CustomerWalletQueryParams = {}): Observable<CustomerWalletListResponse> {
    return this.http
      .get<CustomerWalletListResponse>(`${this.base}/wallets`, { params: toHttpParams(params as Record<string, unknown>) })
      .pipe(map(res => ({
        ...res,
        data: res.data.map(w => lowerStatus(w) as CustomerWallet),
      })));
  }

  getWalletTransactions(walletId: string, page = 1, limit = 20): Observable<WalletTransaction[]> {
    const params = toHttpParams({ page, limit } as Record<string, unknown>);
    return this.http
      .get<ApiResponse<WalletTransaction[]>>(`${this.base}/wallets/${walletId}/transactions`, { params })
      .pipe(map(r => r.data));
  }

  topUpWallet(walletId: string, amount: number, description = ''): Observable<CustomerWallet> {
    return this.http
      .post<ApiResponse<CustomerWallet>>(`${this.base}/wallets/${walletId}/topup`, { amount, description })
      .pipe(map(r => r.data));
  }

  freezeWallet(walletId: string): Observable<CustomerWallet> {
    return this.http
      .patch<ApiResponse<CustomerWallet>>(`${this.base}/wallets/${walletId}/freeze`, {})
      .pipe(map(r => r.data));
  }

  unfreezeWallet(walletId: string): Observable<CustomerWallet> {
    return this.http
      .patch<ApiResponse<CustomerWallet>>(`${this.base}/wallets/${walletId}/unfreeze`, {})
      .pipe(map(r => r.data));
  }

  // ── Reviews ────────────────────────────────────────────────────────────

  listReviews(params: CustomerReviewQueryParams = {}): Observable<CustomerReviewListResponse> {
    return this.http
      .get<CustomerReviewListResponse>(`${this.base}/reviews`, { params: toHttpParams(params as Record<string, unknown>) })
      .pipe(map(res => ({
        ...res,
        data: res.data.map(r => lowerStatus(r) as CustomerReview),
      })));
  }

  approveReview(id: string): Observable<CustomerReview> {
    return this.http
      .patch<ApiResponse<CustomerReview>>(`${this.base}/reviews/${id}/approve`, {})
      .pipe(map(r => r.data));
  }

  flagReview(id: string, reason?: string): Observable<CustomerReview> {
    return this.http
      .patch<ApiResponse<CustomerReview>>(`${this.base}/reviews/${id}/flag`, { reason: reason ?? '' })
      .pipe(map(r => r.data));
  }

  deleteReview(id: string): Observable<void> {
    return this.http
      .delete<ApiResponse<void>>(`${this.base}/reviews/${id}`)
      .pipe(map(() => void 0));
  }

  // ── Chats ──────────────────────────────────────────────────────────────

  listChats(params: CustomerChatQueryParams = {}): Observable<CustomerChatListResponse> {
    return this.http
      .get<CustomerChatListResponse>(`${this.base}/chats`, { params: toHttpParams(params as Record<string, unknown>) })
      .pipe(map(res => ({
        ...res,
        data: res.data.map(c => lowerStatus(c) as CustomerChat),
      })));
  }

  getChatMessages(chatId: string, page = 1, limit = 50): Observable<ChatMessage[]> {
    const params = toHttpParams({ page, limit } as Record<string, unknown>);
    return this.http
      .get<ChatMessageListResponse>(`${this.base}/chats/${chatId}/messages`, { params })
      .pipe(map(r => r.data));
  }

  sendChatMessage(chatId: string, message: string): Observable<ChatMessage> {
    return this.http
      .post<ApiResponse<ChatMessage>>(`${this.base}/chats/${chatId}/messages`, { message })
      .pipe(map(r => r.data));
  }

  resolveChat(chatId: string): Observable<CustomerChat> {
    return this.http
      .patch<ApiResponse<CustomerChat>>(`${this.base}/chats/${chatId}/resolve`, {})
      .pipe(map(r => r.data));
  }

  escalateChat(chatId: string, reason?: string): Observable<CustomerChat> {
    return this.http
      .patch<ApiResponse<CustomerChat>>(`${this.base}/chats/${chatId}/escalate`, { reason: reason ?? '' })
      .pipe(map(r => r.data));
  }

  assignChat(chatId: string, agentId: string): Observable<CustomerChat> {
    return this.http
      .patch<ApiResponse<CustomerChat>>(`${this.base}/chats/${chatId}/assign`, { agentId })
      .pipe(map(r => r.data));
  }

  // ── Notifications ──────────────────────────────────────────────────────

  sendNotification(payload: SendNotificationRequest): Observable<{ sent: number; failed: number }> {
    return this.http
      .post<ApiResponse<{ sent: number; failed: number }>>(`${this.base}/notifications/send`, payload)
      .pipe(map(r => r.data));
  }

  listNotifHistory(page = 1, limit = 20): Observable<NotifHistoryListResponse> {
    const params = toHttpParams({ page, limit } as Record<string, unknown>);
    return this.http
      .get<NotifHistoryListResponse>(`${this.base}/notifications/history`, { params })
      .pipe(map(res => res));
  }
}
