import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  SafeAreaView,
  Dimensions,
  I18nManager,
  FlatList
} from 'react-native';
import { 
  ChevronRight, 
  ChevronLeft, 
  MapPin, 
  Check, 
  Upload, 
  Info,
  Home,
  Hammer,
  Armchair,
  CheckCircle2,
  Search
} from 'lucide-react-native';

// BinaLink Theme
const COLORS = {
  primary: '#2E7D6F',
  secondary: '#C8963E',
  background: '#F8F9FA',
  white: '#FFFFFF',
  text: '#1A1A1A',
  textLight: '#666666',
  border: '#EEEEEE',
  success: '#4CAF50'
};

const WILAYAS = ['Algiers', 'Oran', 'Constantine', 'Annaba', 'Blida', 'Setif', 'Tlemcen', 'Bejaia'];

const SERVICES = [
  { id: 'foundation', label: 'Foundation', labelAr: 'الأساسات' },
  { id: 'structure', label: 'Structure', labelAr: 'الهيكل' },
  { id: 'plumbing', label: 'Plumbing', labelAr: 'السباكة' },
  { id: 'electrical', label: 'Electrical', labelAr: 'الكهرباء' },
  { id: 'tiling', label: 'Tiling', labelAr: 'التبليط' },
  { id: 'painting', label: 'Painting', labelAr: 'الدهان' },
  { id: 'decoration', label: 'Decoration', labelAr: 'الديكور' },
  { id: 'security', label: 'Security Cameras', labelAr: 'كاميرات المراقبة' },
  { id: 'furniture', label: 'Furniture', labelAr: 'الأثاث' },
];

const PROJECT_TYPES = [
  { id: 'new', label: 'New Build', labelAr: 'بناء جديد', icon: Home },
  { id: 'renovation', label: 'Renovation', labelAr: 'ترميم', icon: Hammer },
  { id: 'furnishing', label: 'Furnishing Only', labelAr: 'تأثيث فقط', icon: Armchair },
];

export default function ProjectRequestWizard() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    type: '',
    wilaya: 'Algiers',
    city: '',
    address: '',
    services: [] as string[],
    budget: 5000000,
    timeline: 6,
    images: [] as string[],
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const isRTL = I18nManager.isRTL;

  const nextStep = () => setStep(s => Math.min(s + 1, 6));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  const toggleService = (id: string) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.includes(id) 
        ? prev.services.filter(s => s !== id) 
        : [...prev.services, id]
    }));
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicatorContainer}>
      {[1, 2, 3, 4, 5, 6].map(i => (
        <View 
          key={i} 
          style={[
            styles.stepDot, 
            step >= i ? styles.stepDotActive : styles.stepDotInactive,
            { width: step === i ? 24 : 8 }
          ]} 
        />
      ))}
    </View>
  );

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>{isRTL ? 'ما نوع مشروعك؟' : 'What is your project type?'}</Text>
            <View style={styles.typeGrid}>
              {PROJECT_TYPES.map(type => {
                const Icon = type.icon;
                const isSelected = formData.type === type.id;
                return (
                  <TouchableOpacity 
                    key={type.id} 
                    style={[styles.typeCard, isSelected && styles.typeCardActive]}
                    onPress={() => setFormData({ ...formData, type: type.id })}
                  >
                    <Icon color={isSelected ? COLORS.white : COLORS.primary} size={32} />
                    <Text style={[styles.typeLabel, isSelected && styles.typeLabelActive]}>
                      {isRTL ? type.labelAr : type.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        );
      case 2:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>{isRTL ? 'أين يقع المشروع؟' : 'Where is the project located?'}</Text>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>{isRTL ? 'الولاية' : 'Wilaya'}</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.wilayaList}>
                {WILAYAS.map(w => (
                  <TouchableOpacity 
                    key={w} 
                    style={[styles.wilayaChip, formData.wilaya === w && styles.wilayaChipActive]}
                    onPress={() => setFormData({ ...formData, wilaya: w })}
                  >
                    <Text style={[styles.wilayaText, formData.wilaya === w && styles.wilayaTextActive]}>{w}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </div>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>{isRTL ? 'المدينة' : 'City'}</Text>
              <TextInput 
                style={styles.input} 
                placeholder="e.g. Hydra" 
                value={formData.city}
                onChangeText={t => setFormData({ ...formData, city: t })}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>{isRTL ? 'العنوان بالتفصيل' : 'Full Address'}</Text>
              <TextInput 
                style={[styles.input, styles.textArea]} 
                multiline 
                placeholder="Street name, building number..." 
                value={formData.address}
                onChangeText={t => setFormData({ ...formData, address: t })}
              />
            </View>
            <TouchableOpacity style={styles.mapPlaceholder}>
              <MapPin color={COLORS.secondary} size={24} />
              <Text style={styles.mapText}>{isRTL ? 'تحديد الموقع على الخريطة' : 'Set location on map'}</Text>
            </TouchableOpacity>
          </View>
        );
      case 3:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>{isRTL ? 'ما هي الخدمات المطلوبة؟' : 'What services do you need?'}</Text>
            <View style={styles.serviceGrid}>
              {SERVICES.map(service => {
                const isSelected = formData.services.includes(service.id);
                return (
                  <TouchableOpacity 
                    key={service.id} 
                    style={[styles.serviceItem, isSelected && styles.serviceItemActive]}
                    onPress={() => toggleService(service.id)}
                  >
                    <Text style={[styles.serviceLabel, isSelected && styles.serviceLabelActive]}>
                      {isRTL ? service.labelAr : service.label}
                    </Text>
                    {isSelected && <Check color={COLORS.white} size={16} />}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        );
      case 4:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>{isRTL ? 'الميزانية والجدول الزمني' : 'Budget & Timeline'}</Text>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>{isRTL ? 'الميزانية المتوقعة (دج)' : 'Estimated Budget (DZD)'}</Text>
              <View style={styles.budgetDisplay}>
                <Text style={styles.budgetValue}>{formData.budget.toLocaleString()} DA</Text>
              </View>
              {/* Slider would go here - using simple input for mock */}
              <TextInput 
                style={styles.input} 
                keyboardType="numeric"
                value={formData.budget.toString()}
                onChangeText={t => setFormData({ ...formData, budget: parseInt(t) || 0 })}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>{isRTL ? 'المدة المتوقعة (أشهر)' : 'Estimated Timeline (Months)'}</Text>
              <View style={styles.timelineContainer}>
                {[3, 6, 12, 18, 24].map(m => (
                  <TouchableOpacity 
                    key={m} 
                    style={[styles.timelineOption, formData.timeline === m && styles.timelineOptionActive]}
                    onPress={() => setFormData({ ...formData, timeline: m })}
                  >
                    <Text style={[styles.timelineText, formData.timeline === m && styles.timelineTextActive]}>{m}m</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        );
      case 5:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>{isRTL ? 'صور مرجعية أو مخططات' : 'Reference Images or Plans'}</Text>
            <Text style={styles.stepSubTitle}>{isRTL ? 'اختياري: ساعدنا في فهم رؤيتك بشكل أفضل' : 'Optional: Help us understand your vision better'}</Text>
            <TouchableOpacity style={styles.uploadBox}>
              <Upload color={COLORS.textLight} size={40} />
              <Text style={styles.uploadText}>{isRTL ? 'اضغط لرفع الصور' : 'Tap to upload images'}</Text>
            </TouchableOpacity>
          </View>
        );
      case 6:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>{isRTL ? 'مراجعة الطلب' : 'Review Request'}</Text>
            <View style={styles.reviewCard}>
              <View style={styles.reviewRow}>
                <Text style={styles.reviewLabel}>{isRTL ? 'النوع:' : 'Type:'}</Text>
                <Text style={styles.reviewValue}>{formData.type}</Text>
              </View>
              <View style={styles.reviewRow}>
                <Text style={styles.reviewLabel}>{isRTL ? 'الموقع:' : 'Location:'}</Text>
                <Text style={styles.reviewValue}>{formData.wilaya}, {formData.city}</Text>
              </View>
              <View style={styles.reviewRow}>
                <Text style={styles.reviewLabel}>{isRTL ? 'الخدمات:' : 'Services:'}</Text>
                <Text style={styles.reviewValue}>{formData.services.length} selected</Text>
              </View>
              <View style={styles.reviewRow}>
                <Text style={styles.reviewLabel}>{isRTL ? 'الميزانية:' : 'Budget:'}</Text>
                <Text style={styles.reviewValue}>{formData.budget.toLocaleString()} DA</Text>
              </View>
            </View>
          </View>
        );
      default:
        return null;
    }
  };

  if (isSubmitted) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.successContainer}>
          <CheckCircle2 color={COLORS.success} size={80} />
          <Text style={styles.successTitle}>{isRTL ? 'تم إرسال طلبك بنجاح!' : 'Request Submitted!'}</Text>
          <Text style={styles.successSubTitle}>
            {isRTL ? 'لقد وجدنا لك أفضل المحترفين في ولايتك' : 'We found the best professionals in your wilaya'}
          </Text>
          
          <View style={styles.matchesSection}>
            <Text style={styles.matchesTitle}>{isRTL ? 'المحترفون المقترحون' : 'Suggested Professionals'}</Text>
            {[1, 2, 3].map(i => (
              <View key={i} style={styles.matchCard}>
                <Image source={{ uri: `https://i.pravatar.cc/150?u=${i}` }} style={styles.matchAvatar} />
                <View style={styles.matchInfo}>
                  <Text style={styles.matchName}>Ahmed Benali</Text>
                  <Text style={styles.matchTrade}>Master Contractor</Text>
                  <View style={styles.matchMeta}>
                    <MapPin size={12} color={COLORS.textLight} />
                    <Text style={styles.matchLocation}>{formData.wilaya}</Text>
                  </View>
                </View>
                <TouchableOpacity style={styles.matchButton}>
                  <ChevronRight color={COLORS.primary} size={20} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
          
          <TouchableOpacity style={styles.primaryButton} onPress={() => setIsSubmitted(false)}>
            <Text style={styles.primaryButtonText}>{isRTL ? 'العودة للرئيسية' : 'Back to Home'}</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={prevStep} disabled={step === 1}>
          <ChevronLeft color={step === 1 ? COLORS.border : COLORS.text} size={28} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isRTL ? 'طلب مشروع جديد' : 'New Project Request'}</Text>
        <View style={{ width: 28 }} />
      </View>

      {renderStepIndicator()}

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {renderStepContent()}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.primaryButton, (!formData.type && step === 1) && styles.buttonDisabled]} 
          onPress={() => step === 6 ? setIsSubmitted(true) : nextStep()}
          disabled={!formData.type && step === 1}
        >
          <Text style={styles.primaryButtonText}>
            {step === 6 ? (isRTL ? 'تأكيد وإرسال' : 'Confirm & Submit') : (isRTL ? 'التالي' : 'Next Step')}
          </Text>
        </TouchableOpacity>
      </View>
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
    padding: 20,
    backgroundColor: COLORS.white,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  stepIndicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    backgroundColor: COLORS.white,
  },
  stepDot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  stepDotActive: {
    backgroundColor: COLORS.primary,
  },
  stepDotInactive: {
    backgroundColor: COLORS.border,
  },
  scrollContent: {
    padding: 20,
  },
  stepContainer: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 20,
  },
  stepSubTitle: {
    fontSize: 14,
    color: COLORS.textLight,
    marginBottom: 20,
  },
  typeGrid: {
    gap: 15,
  },
  typeCard: {
    backgroundColor: COLORS.white,
    padding: 20,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  typeCardActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  typeLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 15,
    color: COLORS.text,
  },
  typeLabelActive: {
    color: COLORS.white,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  wilayaList: {
    flexDirection: 'row',
  },
  wilayaChip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: 10,
  },
  wilayaChipActive: {
    backgroundColor: COLORS.secondary,
    borderColor: COLORS.secondary,
  },
  wilayaText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  wilayaTextActive: {
    color: COLORS.white,
  },
  mapPlaceholder: {
    height: 150,
    backgroundColor: '#E8F5E9',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
  },
  mapText: {
    marginTop: 10,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  serviceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  serviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  serviceItemActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  serviceLabel: {
    fontSize: 14,
    color: COLORS.text,
    marginRight: 5,
  },
  serviceLabelActive: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
  budgetDisplay: {
    backgroundColor: COLORS.white,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  budgetValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.secondary,
  },
  timelineContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timelineOption: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginHorizontal: 4,
    borderRadius: 10,
  },
  timelineOptionActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  timelineText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  timelineTextActive: {
    color: COLORS.white,
  },
  uploadBox: {
    height: 200,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadText: {
    marginTop: 10,
    color: COLORS.textLight,
  },
  reviewCard: {
    backgroundColor: COLORS.white,
    padding: 20,
    borderRadius: 16,
    gap: 15,
  },
  reviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  reviewLabel: {
    color: COLORS.textLight,
  },
  reviewValue: {
    fontWeight: 'bold',
    color: COLORS.text,
  },
  footer: {
    padding: 20,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  successContainer: {
    padding: 30,
    alignItems: 'center',
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '800',
    marginTop: 20,
    textAlign: 'center',
  },
  successSubTitle: {
    fontSize: 16,
    color: COLORS.textLight,
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 30,
  },
  matchesSection: {
    width: '100%',
    marginBottom: 30,
  },
  matchesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  matchCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 15,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  matchAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  matchInfo: {
    flex: 1,
    marginLeft: 15,
  },
  matchName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  matchTrade: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
  },
  matchMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  matchLocation: {
    fontSize: 11,
    color: COLORS.textLight,
    marginLeft: 4,
  },
  matchButton: {
    padding: 10,
  }
});
