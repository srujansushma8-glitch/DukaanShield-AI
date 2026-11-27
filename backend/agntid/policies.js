/**
 * Deterministic policy rules for tools and resources in DukaanShield AI.
 * "Having access to a tool is not permission to use it for any purpose."
 */

export const POLICIES = {
  SALES_TOOL: {
    name: "Sales & POS Ledger",
    allowedOperations: ["get_daily_summary", "get_revenue_trend", "get_best_sellers", "count_transactions"],
    restrictedOperations: ["export_raw_transactions", "dump_upi_vpa_list", "wipe_sales_history"],
    rules: [
      {
        id: "RULE_SALES_AGGREGATE_READ",
        check: (action, intent) => {
          if (["get_daily_summary", "get_revenue_trend", "get_best_sellers"].includes(action.operation)) {
            // Must have legitimate sales or business intent
            const validIntents = ["sales", "revenue", "daily_summary", "analytics", "shop_tasks", "overview"];
            const isMatch = validIntents.some(k => intent.toLowerCase().includes(k));
            if (isMatch) {
              return { decision: "ALLOWED", reason: "Read-only sales analytics matches declared sales intent.", riskLevel: "LOW" };
            }
          }
          return null;
        }
      },
      {
        id: "RULE_SALES_PII_MISMATCH",
        check: (action, intent) => {
          if (action.operation.includes("customer_pii") || action.targetResource?.includes("customer")) {
            return { decision: "BLOCKED", reason: "Sales summary tasks do not require individual customer PII.", riskLevel: "HIGH" };
          }
          return null;
        }
      }
    ]
  },

  INVENTORY_TOOL: {
    name: "Inventory & Stock Catalog",
    allowedOperations: ["query_stock", "query_low_stock", "suggest_restock"],
    restrictedOperations: ["overwrite_catalog_prices", "delete_all_inventory"],
    rules: [
      {
        id: "RULE_STOCK_READ_ALLOW",
        check: (action, intent) => {
          if (["query_stock", "query_low_stock", "suggest_restock"].includes(action.operation)) {
            return { decision: "ALLOWED", reason: "Inventory read access matches stock management task.", riskLevel: "LOW" };
          }
          return null;
        }
      }
    ]
  },

  CUSTOMER_TOOL: {
    name: "Customer Ledger (Khata)",
    allowedOperations: ["read_due_balance", "read_sanitized_contact", "list_overdue_names"],
    restrictedOperations: ["export_customer_database", "read_full_purchase_history", "dump_pii"],
    rules: [
      {
        id: "RULE_CUSTOMER_EXFIL_BLOCK",
        check: (action, intent) => {
          if (action.operation === "export_customer_database" || action.operation === "dump_all_contacts") {
            return { decision: "BLOCKED", reason: "Bulk customer database export is strictly prohibited for autonomous agents.", riskLevel: "CRITICAL" };
          }
          return null;
        }
      },
      {
        id: "RULE_CUSTOMER_REMINDER_ALLOW",
        check: (action, intent) => {
          if (["read_due_balance", "list_overdue_names"].includes(action.operation)) {
            const valid = ["reminder", "payment", "dues", "khata", "shop_tasks"].some(k => intent.toLowerCase().includes(k));
            if (valid) {
              return { decision: "ALLOWED", reason: "Least-privilege dues access permitted for payment reminder preparation.", riskLevel: "LOW" };
            }
          }
          return null;
        }
      },
      {
        id: "RULE_CUSTOMER_PHONE_INTENT_CHECK",
        check: (action, intent) => {
          if (action.operation === "read_customer_phone") {
            const forReminders = ["reminder", "payment", "overdue", "shop_tasks"].some(k => intent.toLowerCase().includes(k));
            if (forReminders) {
              return { decision: "ALLOWED", reason: "Phone number access permitted exclusively for overdue customer outreach.", riskLevel: "MEDIUM" };
            }
            return { decision: "BLOCKED", reason: "Customer phone number access denied: declared intent has no need for customer contact details.", riskLevel: "HIGH" };
          }
          return null;
        }
      },
      {
        id: "RULE_CUSTOMER_HISTORY_BLOCK",
        check: (action, intent) => {
          if (action.operation === "read_purchase_history") {
            return { decision: "BLOCKED", reason: "Customer purchase history is restricted; only outstanding dues balance is permitted.", riskLevel: "HIGH" };
          }
          return null;
        }
      }
    ]
  },

  SUPPLIER_TOOL: {
    name: "Supplier & Purchase Orders",
    allowedOperations: ["read_supplier_catalog", "read_price_list", "draft_purchase_order"],
    restrictedOperations: ["update_bank_details", "change_ifsc", "override_beneficiary"],
    rules: [
      {
        id: "RULE_SUPPLIER_BANK_LOCK",
        check: (action) => {
          if (["update_bank_details", "change_beneficiary", "update_payout_account"].includes(action.operation) ||
              action.targetResource?.includes("bank") || action.targetResource?.includes("account")) {
            return { decision: "BLOCKED", reason: "AgntID Rule #14: Modifying supplier bank/beneficiary details is permanently prohibited autonomously.", riskLevel: "CRITICAL" };
          }
          return null;
        }
      },
      {
        id: "RULE_SUPPLIER_DRAFT_ORDER",
        check: (action, intent) => {
          if (["read_supplier_catalog", "draft_purchase_order", "calculate_estimate"].includes(action.operation)) {
            return { decision: "ALLOWED", reason: "Purchase order draft generation permitted under verified supplier catalog.", riskLevel: "LOW" };
          }
          return null;
        }
      }
    ]
  },

  REFUND_TOOL: {
    name: "Customer Refund Processing",
    allowedOperations: ["check_refund_eligibility", "process_verified_refund"],
    restrictedOperations: ["bypass_order_verification", "unauthorized_batch_refund"],
    rules: [
      {
        id: "RULE_REFUND_CAP_CHECK",
        check: (action, intent, sessionState, settings) => {
          const cap = settings?.individualRefundCap || 2000;
          const cumulativeThreshold = settings?.cumulativeRefundThreshold || 5000;
          const amount = action.params?.amount || 0;

          // Check cumulative session limit first
          if ((sessionState?.cumulativeRefunds || 0) + amount > cumulativeThreshold) {
            return { 
              decision: "BLOCKED", 
              reason: `Cumulative refund ceiling of ₹${cumulativeThreshold.toLocaleString('en-IN')} exceeded (Session total: ₹${((sessionState?.cumulativeRefunds || 0) + amount).toLocaleString('en-IN')}). Potential refund abuse velocity detected.`, 
              riskLevel: "CRITICAL" 
            };
          }

          // Check single order cap
          if (amount > cap) {
            return { 
              decision: "CHALLENGED", 
              reason: `Refund amount ₹${amount.toLocaleString('en-IN')} exceeds autonomous threshold of ₹${cap.toLocaleString('en-IN')}. Requires authenticated owner approval.`, 
              riskLevel: "HIGH",
              approvalRequired: true 
            };
          }

          // Must have valid order ID
          if (!action.params?.orderId) {
            return { decision: "BLOCKED", reason: "Refund rejected: Missing valid verified Order ID reference.", riskLevel: "HIGH" };
          }

          return { decision: "ALLOWED", reason: `Valid refund of ₹${amount.toLocaleString('en-IN')} within autonomous cap.`, riskLevel: "MEDIUM" };
        }
      }
    ]
  },

  WHATSAPP_TOOL: {
    name: "Customer WhatsApp Communications",
    allowedOperations: ["draft_payment_reminder", "send_approved_reminder"],
    restrictedOperations: ["send_bulk_unapproved_broadcast", "send_external_document", "exfiltrate_file"],
    rules: [
      {
        id: "RULE_WHATSAPP_OUTBOUND_CHALLENGE",
        check: (action) => {
          if (action.operation === "send_payment_reminder" || action.operation === "send_whatsapp_message") {
            return { 
              decision: "CHALLENGED", 
              reason: "External messaging with financial balance claims requires human confirmation before dispatch.", 
              riskLevel: "MEDIUM",
              approvalRequired: true 
            };
          }
          return null;
        }
      },
      {
        id: "RULE_WHATSAPP_EXFIL_BLOCK",
        check: (action) => {
          if (action.operation === "send_document" || action.operation === "send_file" || action.params?.file) {
            return { decision: "BLOCKED", reason: "Untrusted data transmission: Sending database files to external recipients is prohibited.", riskLevel: "CRITICAL" };
          }
          return null;
        }
      }
    ]
  }
};
