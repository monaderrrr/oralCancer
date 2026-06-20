import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Plus, Shield, ChevronRight, X, UserPlus } from 'lucide-react';
import { TopNavigation } from '../../components/timeline/TopNavigation';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';

export function FamilyPage() {
  const [familyMembers, setFamilyMembers] = useState([
    { id: 1, name: 'Sarah Johnson', relation: 'Spouse', age: 42, lastScan: '2 weeks ago', status: 'Healthy' },
    { id: 2, name: 'Mike Johnson', relation: 'Son', age: 16, lastScan: '3 months ago', status: 'Due for scan' }
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newRelation, setNewRelation] = useState('');

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newRelation) return;

    const newMember = {
      id: Date.now(),
      name: newName,
      relation: newRelation,
      age: 0, 
      lastScan: 'Never',
      status: 'Healthy'
    };

    setFamilyMembers([...familyMembers, newMember]);
    setIsModalOpen(false); 
    setNewName(''); 
    setNewRelation('');
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      <TopNavigation />

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Family Health Hub</h1>
            <p className="text-slate-600">Manage health profiles for your loved ones.</p>
          </div>
          <Button 
            leftIcon={<Plus className="w-4 h-4" />} 
            onClick={() => setIsModalOpen(true)}
          >
            Add Member
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {familyMembers.map((member) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ y: -4 }}
              >
                <Card className="p-6 h-full flex flex-col border-slate-200 hover:border-teal-200 transition-colors">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-full bg-teal-50 border border-teal-100 flex items-center justify-center text-lg font-bold text-teal-700">
                      {member.name.charAt(0)}
                    </div>
                    <Badge variant={member.status === 'Healthy' ? 'success' : 'warning'}>
                      {member.status}
                    </Badge>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900">{member.name}</h3>
                  <p className="text-sm text-slate-500 mb-4">{member.relation} • {member.age} years old</p>

                  <div className="mt-auto pt-4 border-t border-slate-100">
                    <div className="flex justify-between items-center text-sm text-slate-600 mb-4">
                      <span>Last Scan:</span>
                      <span className="font-medium">{member.lastScan}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Button variant="outline" size="sm">View Profile</Button>
                      <Button variant="ghost" size="sm">Settings</Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>

          <button 
            onClick={() => setIsModalOpen(true)}
            className="h-full min-h-[250px] border-2 border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center text-slate-500 hover:border-teal-500 hover:text-teal-600 hover:bg-teal-50/50 transition-all group"
          >
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-4 group-hover:bg-teal-100 transition-colors">
              <Plus className="w-6 h-6" />
            </div>
            <span className="font-medium">Add Family Member</span>
          </button>
        </div>

        <div className="mt-12 bg-blue-50 rounded-2xl p-6 flex items-start gap-4">
          <Shield className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-bold text-blue-900 mb-1">Privacy & Consent</h3>
            <p className="text-sm text-blue-800 mb-3">
              Adult members (18+) must accept an invitation to join your family hub.
            </p>
            <button className="text-sm font-bold text-blue-700 hover:underline flex items-center gap-1">
              Learn more about family privacy <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
          >
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-900">Add Family Member</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddMember} className="p-6 space-y-4">
              <Input 
                label="Full Name" 
                placeholder="e.g. John Doe" 
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                required
              />
              <Input 
                label="Relation" 
                placeholder="e.g. Brother, Daughter" 
                value={newRelation}
                onChange={(e) => setNewRelation(e.target.value)}
                required
              />
              <div className="pt-4 flex gap-3">
                <Button variant="outline" fullWidth onClick={() => setIsModalOpen(false)} type="button">Cancel</Button>
                <Button fullWidth type="submit">Confirm Add</Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}