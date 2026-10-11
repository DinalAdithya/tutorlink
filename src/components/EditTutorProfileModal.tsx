/**
 * EditTutorProfileModal
 * Allows tutors to update their headline, subjects, bio, qualifications, and experience
 * so their profile displays accurately on student search and profile cards.
 */
import React, { useState, useEffect } from 'react';
import { X, Check, BookOpen, Award, User, Sparkles } from 'lucide-react';
import { TutorProfile } from '../types';
import { upsertTutorProfile, getTutorById } from '../services/tutors';

const POPULAR_SUBJECTS = [
  'Combined Maths',
  'Physics',
  'Chemistry',
  'Biology',
  'English Lit',
  'ICT',
  'Calculus',
  'Algebra',
  'A/L Science',
  'Essay Writing',
];

interface EditTutorProfileModalProps {
  isOpen: boolean;
  userUid: string;
  userName: string;
  userAvatar?: string;
  onClose: () => void;
  onSaved: (updated: TutorProfile) => void;
}

export const EditTutorProfileModal: React.FC<EditTutorProfileModalProps> = ({
  isOpen,
  userUid,
  userName,
  userAvatar,
  onClose,
  onSaved,
}) => {
  const [headline, setHeadline] = useState('');
  const [bio, setBio] = useState('');
  const [qualifications, setQualifications] = useState('');
  const [experience, setExperience] = useState('');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(['Combined Maths', 'Physics']);
  const [customSubject, setCustomSubject] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const fetchCurrent = async () => {
      const existing = await getTutorById(userUid);
      if (existing) {
        setHeadline(existing.headline || `${userName} • Peer Tutor`);
        setBio(existing.bio || '');
        setQualifications(existing.qualifications || '');
        setExperience(existing.experience || '');
        if (existing.subjects && existing.subjects.length > 0) {
          setSelectedSubjects(existing.subjects);
        }
      } else {
        setHeadline(`${userName} • Peer Tutor & Mentor`);
        setBio('Dedicated peer tutor ready to help students master core syllabus concepts and build confidence.');
        setQualifications('Undergraduate Peer Mentor • Top A/L Achievement');
        setExperience('1+ years peer mentoring & study groups');
        setSelectedSubjects(['Combined Maths', 'Physics']);
      }
    };
    fetchCurrent();
  }, [isOpen, userUid, userName]);

  if (!isOpen) return null;

  const toggleSubject = (subj: string) => {
    if (selectedSubjects.includes(subj)) {
      if (selectedSubjects.length > 1) {
        setSelectedSubjects(selectedSubjects.filter((s) => s !== subj));
      }
    } else {
      setSelectedSubjects([...selectedSubjects, subj]);
    }
  };

  const handleAddCustomSubject = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = customSubject.trim();
    if (clean && !selectedSubjects.includes(clean)) {
      setSelectedSubjects([...selectedSubjects, clean]);
      setCustomSubject('');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!headline.trim()) {
      setError('Please provide a profile headline.');
      return;
    }
    if (selectedSubjects.length === 0) {
      setError('Please select at least one tutoring subject.');
      return;
    }

    setSaving(true);
    try {
      const updated = await upsertTutorProfile({
        uid: userUid,
        name: userName,
        avatarUrl: userAvatar,
        headline: headline.trim(),
        bio: bio.trim(),
        qualifications: qualifications.trim(),
        experience: experience.trim(),
        subjects: selectedSubjects,
      });
      onSaved(updated);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to save tutor profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-5 max-w-md w-full max-h-[90vh] shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-teal-600" />
              <span>Edit Tutor Profile</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Visible to students in search & recommendations
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-700 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="mt-3 p-2.5 rounded-xl bg-rose-50 text-rose-700 text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSave} className="overflow-y-auto py-3 space-y-4 flex-1 pr-1">
          {/* Headline */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Headline
            </label>
            <input
              type="text"
              required
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              placeholder="e.g. Combined Maths mentor • University of Moratuwa Eng"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            />
          </div>

          {/* Subjects Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Subjects You Teach ({selectedSubjects.length} selected)
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {POPULAR_SUBJECTS.map((sub) => {
                const isSelected = selectedSubjects.includes(sub);
                return (
                  <button
                    key={sub}
                    type="button"
                    onClick={() => toggleSubject(sub)}
                    className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1 ${
                      isSelected
                        ? 'bg-teal-600 text-white shadow-xs'
                        : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3" />}
                    <span>{sub}</span>
                  </button>
                );
              })}
            </div>

            {/* Custom Subject Input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={customSubject}
                onChange={(e) => setCustomSubject(e.target.value)}
                placeholder="Add other subject..."
                className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              />
              <button
                type="button"
                onClick={handleAddCustomSubject}
                disabled={!customSubject.trim()}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition disabled:opacity-50"
              >
                + Add
              </button>
            </div>
          </div>

          {/* Bio */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              About You / Bio
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell students about your tutoring style, approaches, and how you help them understand concepts..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            />
          </div>

          {/* Qualifications */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Qualifications & Credentials
            </label>
            <input
              type="text"
              value={qualifications}
              onChange={(e) => setQualifications(e.target.value)}
              placeholder="e.g. Moratuwa Engineering Undergraduate, Island Top 50 A/L"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            />
          </div>

          {/* Experience */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Teaching Experience
            </label>
            <input
              type="text"
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              placeholder="e.g. 2 years peer tutoring, 150+ sessions completed"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            />
          </div>

          <div className="pt-2 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-2xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-xs transition cursor-pointer disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save & Publish Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
