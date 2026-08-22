// =====================================================================
// AuditLog.js — AUDIT LOG (HARKAT KA RECORD) KA MODEL
// ---------------------------------------------------------------------
// Model = batata hai ki database me audit entry kaise dikhegi.
// Audit Log = har important kaam ka hisaab-raksha (record).
// Kaunse user ne kab kya kiya — sab yahan save hota hai.
// Jaise: "admin ne customer banaya", "teller ne deposit kiya".
// =====================================================================

import mongoose from 'mongoose';

// 'auditLogSchema' banate hain = audit log ki shape/form.
const auditLogSchema = new mongoose.Schema(
  {
    // user = yeh kaam kis user ne kiya (User collection ka id).
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },

    // userName = user ka naam direct save (taaki user delete ho jaye toh bhi pata rahe).
    userName: { type: String, trim: true },

    // role = us user ka role (admin/manager/teller/auditor).
    role: { type: String },

    // action = kya kaam hua. Jaise "CREATE_CUSTOMER", "LOGIN", "VIEW_DASHBOARD".
    action: { type: String, required: true },

    // module = kaunse section me kaam hua. Jaise "Customers", "Transactions".
    module: { type: String, required: true },

    // entityId = jis cheez par kaam hua uski ID (jaise customer ka id).
    entityId: { type: String, trim: true },

    // description = kaam ki ek line mein jaankari (jaise "Created customer Rahul Sharma").
    description: { type: String, trim: true },

    // ip = kaam kis computer/network se hua (security ke liye).
    ip: { type: String },

    // details = extra jaankari kisi bhi format me (Mixed = kuch bhi ho sakta hai).
    details: { type: mongoose.Schema.Types.Mixed },

    // timestamp = yeh kaam kab hua. Default abhi ki date/time.
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true } // timestamps = createdAt aur updatedAt khud add ho jayenge
);

// Indexes — logs jaldi dhundhne ke liye
auditLogSchema.index({ module: 1, timestamp: -1 }); // module ke hisaab se naye pehle
auditLogSchema.index({ user: 1, timestamp: -1 }); // user ke hisaab se naye pehle
auditLogSchema.index({ timestamp: 1 }); // date ke hisaab se

// Is schema ko 'AuditLog' naam se database me register karo.
export default mongoose.model('AuditLog', auditLogSchema);