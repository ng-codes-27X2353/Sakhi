import React, { useState } from 'react';
import { 
  Phone, PhoneCall, Shield, AlertTriangle, 
  UserPlus, Plus, Trash2, Edit2, CheckCircle2, 
  Send, Users, ShieldAlert, HeartHandshake, PhoneForwarded 
} from 'lucide-react';
import { UserProfile, EmergencyContact } from '../types';
import { upsertProfile } from '../utils/api';

interface EmergencyContactsViewProps {
  profile: UserProfile;
  onProfileUpdated: (updated: UserProfile) => void;
}

export const EmergencyContactsView: React.FC<EmergencyContactsViewProps> = ({
  profile,
  onProfileUpdated,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingContact, setEditingContact] = useState<EmergencyContact | null>(null);
  const [name, setName] = useState('');
  const [relation, setRelation] = useState('');
  const [phone, setPhone] = useState('');
  const [simulatedAlertSent, setSimulatedAlertSent] = useState(false);

  const contacts = profile.emergencyContacts || [];

  const handleOpenAdd = () => {
    setEditingContact(null);
    setName('');
    setRelation('Family');
    setPhone('');
    setShowAddModal(true);
  };

  const handleOpenEdit = (contact: EmergencyContact) => {
    setEditingContact(contact);
    setName(contact.name);
    setRelation(contact.relation);
    setPhone(contact.phone);
    setShowAddModal(true);
  };

  const handleSaveContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    let updatedContacts: EmergencyContact[];
    if (editingContact) {
      updatedContacts = contacts.map((c) =>
        c.id === editingContact.id ? { ...c, name: name.trim(), relation: relation.trim(), phone: phone.trim() } : c
      );
    } else {
      const newContact: EmergencyContact = {
        id: `contact_${Date.now()}`,
        name: name.trim(),
        relation: relation.trim() || 'Emergency Contact',
        phone: phone.trim(),
        isCustom: true,
      };
      updatedContacts = [...contacts, newContact];
    }

    const updatedProfile: UserProfile = {
      ...profile,
      emergencyContacts: updatedContacts,
      updatedAt: new Date().toISOString(),
    };

    upsertProfile(updatedProfile);
    onProfileUpdated(updatedProfile);
    setShowAddModal(false);
  };

  const handleDeleteContact = (id: string) => {
    const updatedContacts = contacts.filter((c) => c.id !== id);
    const updatedProfile: UserProfile = {
      ...profile,
      emergencyContacts: updatedContacts,
      updatedAt: new Date().toISOString(),
    };
    upsertProfile(updatedProfile);
    onProfileUpdated(updatedProfile);
  };

  const handleNotifyAll = () => {
    setSimulatedAlertSent(true);
    setTimeout(() => setSimulatedAlertSent(false), 4000);
  };

  return (
    <div className="space-y-4 text-white">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400 block">
            Sakhi Safety Network
          </span>
          <h2 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
            Emergency Contacts
          </h2>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-bold text-xs shadow-md transition cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Contact</span>
        </button>
      </div>

      {simulatedAlertSent && (
        <div className="p-3.5 rounded-2xl bg-emerald-950/70 border border-emerald-800 text-emerald-200 text-xs flex items-center gap-2.5 animate-fade-in shadow-lg">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <div>
            <span className="font-bold block">Emergency Alert Dispatched!</span>
            <span className="text-[11px] text-emerald-300">
              Your live satellite location was sent to Police (100), Ambulance (102), and {contacts.length} emergency contacts.
            </span>
          </div>
        </div>
      )}

      {/* Instant SOS Broadcast Trigger */}
      <div className="p-4 rounded-3xl bg-gradient-to-br from-slate-900 to-[#131c2e] border border-blue-900/40 shadow-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/30">
            <Send className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-black text-white">Broadcast Emergency Alert</div>
            <div className="text-[11px] text-slate-400">
              Sends your live location via Satellite / GSM
            </div>
          </div>
        </div>

        <button
          onClick={handleNotifyAll}
          className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-rose-900/40 transition active:scale-95 cursor-pointer"
        >
          Notify All
        </button>
      </div>

      {/* Redesigned Contact List as in Image 2 */}
      <div className="space-y-2.5">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block px-1">
          Registered Responders ({contacts.length})
        </span>

        {contacts.map((contact) => (
          <div
            key={contact.id}
            className="p-4 rounded-2xl bg-[#131c2e] border border-blue-900/30 hover:border-blue-700/50 transition flex items-center justify-between shadow-md"
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-blue-950/70 border border-blue-800/40 flex items-center justify-center text-cyan-400 font-bold">
                {contact.phone === '100' ? (
                  <Shield className="w-5 h-5 text-blue-400" />
                ) : contact.phone === '102' ? (
                  <PhoneCall className="w-5 h-5 text-rose-400" />
                ) : (
                  <Users className="w-5 h-5 text-cyan-400" />
                )}
              </div>

              <div>
                <div className="text-sm font-black text-white flex items-center gap-1.5">
                  {contact.name}
                  <span className="text-[10px] font-semibold text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-full">
                    {contact.relation}
                  </span>
                </div>
                <div className="text-xs text-cyan-300 font-mono font-medium mt-0.5">
                  {contact.phone}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <a
                href={`tel:${contact.phone}`}
                className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs transition shadow-md flex items-center gap-1"
                title={`Call ${contact.name}`}
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call</span>
              </a>

              <button
                onClick={() => handleOpenEdit(contact)}
                className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
                title="Edit Contact"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>

              {contact.isCustom && (
                <button
                  onClick={() => handleDeleteContact(contact.id)}
                  className="p-2 rounded-xl bg-slate-800/80 hover:bg-rose-950 text-slate-400 hover:text-rose-400 transition cursor-pointer"
                  title="Delete Contact"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Contact Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <form
            onSubmit={handleSaveContact}
            className="w-full max-w-sm bg-[#0f172a] border border-blue-900/60 rounded-3xl p-5 text-white shadow-2xl space-y-3.5"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-cyan-400" />
                {editingContact ? 'Edit Emergency Contact' : 'Add Emergency Contact'}
              </h3>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                Contact Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Sister, Mom, Friend, Police"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                Relationship
              </label>
              <input
                type="text"
                placeholder="e.g. Family, Doctor, Neighbor"
                value={relation}
                onChange={(e) => setRelation(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                required
                placeholder="e.g. +91 9876543210 or 100"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-rose-600 hover:from-blue-500 hover:to-rose-500 font-bold text-xs text-white shadow cursor-pointer"
              >
                Save Contact
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
