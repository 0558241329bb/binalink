import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  Modal, 
  SafeAreaView,
  Dimensions,
  FlatList,
  I18nManager
} from 'react-native';
import * as Progress from 'react-native-progress';
import { 
  MessageCircle, 
  ChevronLeft, 
  CheckCircle2, 
  Clock, 
  PlayCircle,
  MapPin,
  User,
  Calendar,
  X
} from 'lucide-react-native';

// BinaLink Theme Colors
const COLORS = {
  primary: '#2E7D6F', // Green
  secondary: '#C8963E', // Gold
  background: '#F8F9FA',
  white: '#FFFFFF',
  text: '#1A1A1A',
  textLight: '#666666',
  success: '#4CAF50',
  pending: '#FF9800',
  border: '#EEEEEE'
};

// Mock Data
const PROJECT_DATA = {
  name: "Villa Algiers Modern",
  address: "Hydra, Algiers, Algeria",
  overallProgress: 0.65,
  phases: [
    {
      id: '1',
      name: "Foundation",
      nameAr: "الأساسات",
      status: 'done',
      progress: 1,
      date: "Oct 2025",
      provider: "Sarl Benali Construction",
      notes: "Foundation completed according to seismic standards. Concrete quality verified.",
      photos: [
        'https://picsum.photos/seed/found1/400/400',
        'https://picsum.photos/seed/found2/400/400',
      ]
    },
    {
      id: '2',
      name: "Structure",
      nameAr: "الهيكل",
      status: 'done',
      progress: 1,
      date: "Dec 2025",
      provider: "Sarl Benali Construction",
      notes: "Main structure and pillars completed. Roof slab poured.",
      photos: [
        'https://picsum.photos/seed/struct1/400/400',
        'https://picsum.photos/seed/struct2/400/400',
      ]
    },
    {
      id: '3',
      name: "Plumbing",
      nameAr: "السباكة",
      status: 'active',
      progress: 0.45,
      date: "Jan 2026",
      provider: "Expert Plomberie DZ",
      notes: "Piping installation in progress for the first floor. Water tank connection pending.",
      photos: [
        'https://picsum.photos/seed/plumb1/400/400',
        'https://picsum.photos/seed/plumb2/400/400',
      ]
    },
    {
      id: '4',
      name: "Electrical",
      nameAr: "الكهرباء",
      status: 'pending',
      progress: 0,
      date: "Feb 2026",
      provider: "ElecPro Algeria",
      notes: "Awaiting completion of plumbing for wiring start.",
      photos: []
    },
    {
      id: '5',
      name: "Finishing",
      nameAr: "التشطيبات",
      status: 'pending',
      progress: 0,
      date: "Mar 2026",
      provider: "Design & Build Co.",
      notes: "",
      photos: []
    },
    {
      id: '6',
      name: "Decor",
      nameAr: "الديكور",
      status: 'pending',
      progress: 0,
      date: "Apr 2026",
      provider: "Luxe Interiors",
      notes: "",
      photos: []
    }
  ]
};

const PhaseItem = ({ phase, onPress }) => {
  const isRTL = I18nManager.isRTL;
  
  const getStatusIcon = () => {
    if (phase.status === 'done') return <CheckCircle2 size={24} color={COLORS.success} />;
    if (phase.status === 'active') return <PlayCircle size={24} color={COLORS.primary} />;
    return <Clock size={24} color={COLORS.textLight} />;
  };

  return (
    <TouchableOpacity style={styles.phaseCard} onPress={() => onPress(phase)}>
      <View style={[styles.phaseIndicator, { backgroundColor: phase.status === 'done' ? COLORS.success : (phase.status === 'active' ? COLORS.primary : COLORS.border) }]} />
      
      <View style={styles.phaseContent}>
        <View style={styles.phaseHeader}>
          <View>
            <Text style={styles.phaseName}>{isRTL ? phase.nameAr : phase.name}</Text>
            <Text style={styles.phaseProvider}>{phase.provider}</Text>
          </View>
          {getStatusIcon()}
        </View>

        <View style={styles.phaseMeta}>
          <View style={styles.metaItem}>
            <Calendar size={14} color={COLORS.textLight} />
            <Text style={styles.metaText}>{phase.date}</Text>
          </View>
          <Text style={[styles.progressText, { color: phase.status === 'active' ? COLORS.primary : COLORS.textLight }]}>
            {Math.round(phase.progress * 100)}%
          </Text>
        </View>

        {phase.photos.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photoStrip}>
            {phase.photos.map((photo, idx) => (
              <Image key={idx} source={{ uri: photo }} style={styles.thumbnail} />
            ))}
          </ScrollView>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default function ProjectTracker() {
  const [selectedPhase, setSelectedPhase] = useState(null);
  const isRTL = I18nManager.isRTL;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <ChevronLeft size={28} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isRTL ? 'تتبع المشروع' : 'Project Tracker'}</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Project Overview Card */}
        <View style={styles.overviewCard}>
          <View style={styles.overviewInfo}>
            <Text style={styles.projectName}>{PROJECT_DATA.name}</Text>
            <View style={styles.addressRow}>
              <MapPin size={16} color={COLORS.secondary} />
              <Text style={styles.projectAddress}>{PROJECT_DATA.address}</Text>
            </View>
          </View>
          
          <View style={styles.progressContainer}>
            <Progress.Circle 
              size={80} 
              progress={PROJECT_DATA.overallProgress} 
              showsText 
              color={COLORS.primary} 
              thickness={6}
              unfilledColor="#E0E0E0"
              borderWidth={0}
              formatText={() => `${Math.round(PROJECT_DATA.overallProgress * 100)}%`}
              textStyle={{ fontWeight: 'bold', fontSize: 18 }}
            />
            <Text style={styles.progressLabel}>{isRTL ? 'الإنجاز الكلي' : 'Overall'}</Text>
          </View>
        </View>

        {/* Timeline Section */}
        <View style={styles.timelineSection}>
          <Text style={styles.sectionTitle}>{isRTL ? 'مراحل العمل' : 'Project Phases'}</Text>
          <View style={styles.timelineContainer}>
            {PROJECT_DATA.phases.map((phase, index) => (
              <PhaseItem 
                key={phase.id} 
                phase={phase} 
                onPress={setSelectedPhase} 
              />
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fab}>
        <MessageCircle color={COLORS.white} size={24} />
        <Text style={styles.fabText}>{isRTL ? 'تواصل مع المقاول' : 'Message Provider'}</Text>
      </TouchableOpacity>

      {/* Phase Detail Modal */}
      <Modal
        visible={!!selectedPhase}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSelectedPhase(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{selectedPhase?.name}</Text>
              <TouchableOpacity onPress={() => setSelectedPhase(null)}>
                <X size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.modalInfoRow}>
                <User size={18} color={COLORS.primary} />
                <Text style={styles.modalInfoText}>{selectedPhase?.provider}</Text>
              </View>
              
              <Text style={styles.modalSectionTitle}>{isRTL ? 'ملاحظات' : 'Notes'}</Text>
              <Text style={styles.modalNotes}>
                {selectedPhase?.notes || (isRTL ? 'لا توجد ملاحظات حالياً' : 'No notes available yet.')}
              </Text>

              <Text style={styles.modalSectionTitle}>{isRTL ? 'الصور والوسائط' : 'Media Gallery'}</Text>
              <View style={styles.galleryGrid}>
                {selectedPhase?.photos.map((photo, idx) => (
                  <Image key={idx} source={{ uri: photo }} style={styles.galleryImage} />
                ))}
                {selectedPhase?.photos.length === 0 && (
                  <View style={styles.emptyGallery}>
                    <Text style={styles.emptyText}>{isRTL ? 'لا توجد صور بعد' : 'No media uploaded yet'}</Text>
                  </View>
                )}
              </View>
            </ScrollView>
            
            <Button 
              title={isRTL ? 'إغلاق' : 'Close'} 
              onPress={() => setSelectedPhase(null)}
              color={COLORS.primary}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: COLORS.white,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  overviewCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    marginBottom: 25,
  },
  overviewInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  projectName: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 8,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  projectAddress: {
    fontSize: 14,
    color: COLORS.textLight,
    marginLeft: 5,
  },
  progressContainer: {
    alignItems: 'center',
    marginLeft: 15,
  },
  progressLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textLight,
    marginTop: 5,
  },
  timelineSection: {
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 15,
  },
  phaseCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    marginBottom: 15,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  phaseIndicator: {
    width: 6,
  },
  phaseContent: {
    flex: 1,
    padding: 15,
  },
  phaseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  phaseName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  phaseProvider: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
    marginTop: 2,
  },
  phaseMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 12,
    color: COLORS.textLight,
    marginLeft: 5,
  },
  progressText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  photoStrip: {
    marginTop: 12,
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 10,
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    left: 20,
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 30,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  fabText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    height: '80%',
    padding: 25,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  modalBody: {
    flex: 1,
  },
  modalInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalInfoText: {
    fontSize: 16,
    color: COLORS.text,
    marginLeft: 10,
    fontWeight: '500',
  },
  modalSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  modalNotes: {
    fontSize: 15,
    color: COLORS.textLight,
    lineHeight: 22,
  },
  galleryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 10,
  },
  galleryImage: {
    width: (Dimensions.get('window').width - 70) / 2,
    height: 150,
    borderRadius: 12,
  },
  emptyGallery: {
    width: '100%',
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 12,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  emptyText: {
    color: COLORS.textLight,
  }
});
