import React, { useState, useEffect } from "react";
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  doc, 
  updateDoc, 
  deleteDoc,
  where
} from "firebase/firestore";
import { db } from "../../lib/firebase";
import { UserProfile } from "../../types";
import { 
  Users, 
  Search, 
  UserX, 
  UserCheck, 
  Trash2, 
  Shield, 
  Calendar, 
  LogIn,
  MoreVertical,
  Mail,
  Phone,
  Filter,
  Bell
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { format } from "date-fns";

interface UserManagementProps {
  onSendNotification?: (user: UserProfile) => void;
}

export const UserManagement: React.FC<UserManagementProps> = ({ onSendNotification }) => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'blocked'>('all');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    const q = query(collection(db, "users"), orderBy("createdAt", "desc"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const usersData: UserProfile[] = [];
      snapshot.forEach((doc) => {
        usersData.push({ id: doc.id, ...doc.data() } as UserProfile);
      });
      setUsers(usersData);
      setLoading(false);
    }, (error) => {
      console.warn("User management listener notice:", error.message);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleToggleBlock = async (user: UserProfile) => {
    if (!window.confirm(`আপনি কি নিশ্চিতভাবে এই ইউজারকে ${user.status === 'blocked' ? 'আনব্লক' : 'ব্লক'} করতে চান?`)) {
      return;
    }

    const newStatus = user.status === 'blocked' ? 'active' : 'blocked';
    setActionLoading(user.id);
    
    try {
      await updateDoc(doc(db, "users", user.id), {
        status: newStatus,
        updatedAt: Date.now()
      });
    } catch (error) {
      console.error("Error updating user status:", error);
      alert("ইউজার স্ট্যাটাস পরিবর্তন করতে সমস্যা হয়েছে।");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteUser = async (user: UserProfile) => {
    if (!window.confirm("আপনি কি নিশ্চিতভাবে এই ইউজারকে ডিলিট করতে চান? এটি আর ফিরিয়ে আনা সম্ভব হবে না।")) {
      return;
    }

    setActionLoading(user.id);
    
    try {
      await deleteDoc(doc(db, "users", user.id));
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("ইউজার ডিলিট করতে সমস্যা হয়েছে।");
    } finally {
      setActionLoading(null);
    }
  };

  const safeFormat = (dateValue: any, formatStr: string) => {
    if (!dateValue) return "N/A";
    
    try {
      let date: Date;
      
      // Handle Firestore Timestamp objects
      if (dateValue && typeof dateValue === 'object' && 'seconds' in dateValue) {
        date = new Date(dateValue.seconds * 1000);
      } 
      // Handle numbers (milliseconds)
      else if (typeof dateValue === 'number') {
        date = new Date(dateValue);
      }
      // Handle Date objects
      else if (dateValue instanceof Date) {
        date = dateValue;
      }
      else {
        return "N/A";
      }

      // Final check for valid date
      if (isNaN(date.getTime())) return "N/A";
      
      return format(date, formatStr);
    } catch (error) {
      console.error("Date formatting error:", error, dateValue);
      return "N/A";
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phoneNumber?.includes(searchTerm);
    
    const matchesFilter = filterStatus === 'all' || user.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header & Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Users className="w-8 h-8 text-orange-600" />
            ইউজার ম্যানেজমেন্ট
          </h2>
          <p className="text-gray-500">আপনার অ্যাপের সকল গ্রাহকদের এখান থেকে নিয়ন্ত্রণ করুন।</p>
        </div>
        
        <div className="flex gap-4">
          <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3">
            <div className="p-2 bg-green-50 text-green-600 rounded-lg">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-gray-500">সক্রিয় ইউজার</p>
              <p className="text-lg font-bold text-gray-800">{users.filter(u => u.status === 'active').length}</p>
            </div>
          </div>
          <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3">
            <div className="p-2 bg-red-50 text-red-600 rounded-lg">
              <UserX className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-gray-500">ব্লকড ইউজার</p>
              <p className="text-lg font-bold text-gray-800">{users.filter(u => u.status === 'blocked').length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="নাম, ইমেইল বা ফোন নম্বর দিয়ে খুঁজুন..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="text-gray-400 w-5 h-5 hidden md:block" />
          <select
            className="px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
          >
            <option value="all">সকল ইউজার</option>
            <option value="active">সক্রিয়</option>
            <option value="blocked">ব্লকড</option>
          </select>
        </div>
      </div>

      {/* Users List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-20 flex flex-col items-center justify-center gap-4">
            <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-500 animate-pulse">ইউজার ডাটা লোড হচ্ছে...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-20 text-center">
            <Users className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">কোনো ইউজার পাওয়া যায়নি।</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-sm uppercase">
                  <th className="px-6 py-4 font-semibold">ইউজার</th>
                  <th className="px-6 py-4 font-semibold">যোগাযোগ</th>
                  <th className="px-6 py-4 font-semibold">স্ট্যাটাস</th>
                  <th className="px-6 py-4 font-semibold">মেটাডাটা</th>
                  <th className="px-6 py-4 font-semibold text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <AnimatePresence>
                  {filteredUsers.map((user) => (
                    <motion.tr
                      key={user.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="hover:bg-gray-50/50 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center overflow-hidden border-2 border-white shadow-sm">
                            {user.photoURL ? (
                              <img src={user.photoURL} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <Users className="w-5 h-5 text-orange-600" />
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-gray-800">{user.displayName}</p>
                            <div className="flex items-center gap-1 mt-0.5">
                              {user.role === 'admin' ? (
                                <span className="flex items-center gap-1 text-[10px] bg-purple-100 text-purple-600 px-1.5 py-0.5 rounded-full font-bold uppercase">
                                  <Shield className="w-2.5 h-2.5" /> Admin
                                </span>
                              ) : (
                                <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full font-bold uppercase">
                                  Customer
                                </span>
                              )}
                              <span className="text-[10px] text-gray-400 font-mono">UID: {user.id.substring(0, 8)}...</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Mail className="w-3.5 h-3.5 text-gray-400" />
                            {user.email}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Phone className="w-3.5 h-3.5 text-gray-400" />
                            {user.phoneNumber || 'N/A'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                          user.status === 'blocked' 
                            ? 'bg-red-100 text-red-600' 
                            : 'bg-green-100 text-green-600'
                        }`}>
                          {user.status === 'blocked' ? (
                            <><UserX className="w-3.5 h-3.5" /> ব্লকড</>
                          ) : (
                            <><UserCheck className="w-3.5 h-3.5" /> সক্রিয়</>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-500 space-y-1">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3 h-3" />
                          জয়েন: {safeFormat(user.createdAt, 'MMM d, yyyy')}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <LogIn className="w-3 h-3" />
                          লাস্ট: {safeFormat(user.lastLoginAt, 'MMM d, h:mm a')}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {onSendNotification && (
                            <button
                              onClick={() => onSendNotification(user)}
                              className="p-2 bg-orange-50 text-orange-600 hover:bg-orange-100 rounded-lg transition-all"
                              title="নোটিফিকেশন পাঠান"
                            >
                              <Bell className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleToggleBlock(user)}
                            disabled={actionLoading === user.id}
                            className={`p-2 rounded-lg transition-all ${
                              user.status === 'blocked'
                                ? 'bg-green-50 text-green-600 hover:bg-green-100'
                                : 'bg-red-50 text-red-600 hover:bg-red-100'
                            }`}
                            title={user.status === 'blocked' ? "আনব্লক করুন" : "ব্লক করুন"}
                          >
                            {actionLoading === user.id ? (
                              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                            ) : user.status === 'blocked' ? (
                              <UserCheck className="w-4 h-4" />
                            ) : (
                              <UserX className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user)}
                            disabled={actionLoading === user.id}
                            className="p-2 bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-600 rounded-lg transition-all"
                            title="ডিলিট করুন"
                          >
                            {actionLoading === user.id ? (
                              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
