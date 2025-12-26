# WhatsApp Ordering System (Backend-Focused)

A backend-driven WhatsApp ordering system that allows customers to browse products, build carts, place orders, and receive real-time updates - entirely through WhatsApp messages.

This project focuses on **conversational state management**, **webhook-driven workflows**, and **order lifecycle control**, rather than UI complexity or payments.

---

## Overview

Most ordering systems require users to install apps or navigate complex interfaces.

This project explores an alternative approach:

> Can a reliable ordering workflow be built using a stateless messaging channel like WhatsApp?

The result is an event-driven backend that maintains session state across messages, enforces valid order transitions, and supports both customer and admin interactions.

---

## Core Features

### Customer (WhatsApp Bot)
- Greet and guide users on first contact
- View available products
- Add, delete, and review cart items
- Cancel actions mid-flow
- Confirm orders
- Check order status by Order ID
- View order history
- Start a new order after completion

### Admin (API)
- View incoming orders
- Update order status
- Trigger automatic WhatsApp notifications to customers
- Enforce valid order state transitions

---

## Supported Commands (Customer)

| Command | Description |
|------|------------|
| `hi` / `hello` / `hey` | Start interaction |
| `menu` | View available products |
| `add <item> <qty>` | Add item to cart |
| `delete <item>` | Remove item from cart |
| `view cart` | View current cart |
| `done` | Finish adding items |
| `confirm` | Place order |
| `cancel` | Cancel current flow |
| `status <orderId>` | Check order status |
| `order history` | View past orders |
| `cancel order <orderId>` | Cancel pending order |
| `new order` | Start a new order |

---

## Order Lifecycle

Orders follow a strict lifecycle to prevent invalid transitions:

- `PENDING CONFIRMATION`
- `CONFIRMED`
- `PROCESSING`
- `OUT FOR DELIVERY`
- `DELIVERED`
- `CANCELLED`

Customers can only cancel orders **before admin confirmation**.

---

## Technical Architecture

### Backend
- Node.js
- Express
- MongoDB
- JWT-secured admin routes
- Webhook-driven message processing

### Messaging
- WhatsApp Cloud API (Meta)
- Incoming webhooks
- Outbound messaging via Graph API

### Core Components
- Deterministic message parser (no NLP)
- Conversation state machine
- Idempotent webhook handling
- Session expiry and recovery
- Admin-triggered side effects

---

## Design Decisions & Tradeoffs

- No payments (keeps focus on backend workflows)
- No NLP/AI parsing (predictable, testable commands)
- Minimal admin interface (API-first)
- Single server entry file for clarity

---

## What This Project Demonstrates

- Event-driven backend design
- Third-party webhook integration
- Conversational state management
- Order lifecycle enforcement
- Real-world debugging and edge-case handling
- Clear separation of concerns

---

## Out of Scope (Intentional)

- Online payments
- Advanced analytics
- Customer authentication
- Product images or media
- Multi-business support

These were excluded to maintain focus and keep the project defensible.

---

## Status

- WhatsApp Cloud API integrated
- Real-time messaging confirmed
- Production-style error handling

---

## Demo

A short walkthrough video is available on request.

---

## Author

Built as a backend-focused portfolio project to demonstrate real-world system design and webhook-based architectures.
