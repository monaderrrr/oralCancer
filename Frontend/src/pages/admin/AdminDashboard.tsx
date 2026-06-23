import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import API from '../../Api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { FilePreviewModal } from '../../components/FilePreviewModal';
import { Loader2, CheckCircle, XCircle, Eye, Users, UserCheck, UserX } from 'lucide-react';
import { useTranslation } from 'react-i18next'; 

interface Doctor {
    _id: string;
    fullName: string;
    email: string;
    status: 'pending' | 'approved' | 'rejected';
    createdAt: string;
    specialization?: string;
    licenseNumber?: string;
    profileImage?: string;
    medicalProof?: string;
    rejectionReason?: string;
}

interface DoctorsResponse {
    success: boolean;
    data: {
        doctors: Doctor[];
        pagination: {
            total: number;
            page: number;
            limit: number;
            pages: number;
        };
    };
}

export function AdminDashboard() {
    const { t } = useTranslation(); 
    const { user } = useAuth();
    const [pendingDoctors, setPendingDoctors] = useState<Doctor[]>([]);
    const [allDoctors, setAllDoctors] = useState<Doctor[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [stats, setStats] = useState({
        totalDoctors: 0,
        pendingDoctors: 0,
        approvedDoctors: 0,
        rejectedDoctors: 0,
    });

    // File preview modal state
    const [previewModal, setPreviewModal] = useState({
        isOpen: false,
        filePath: '',
        fileName: '',
    });

    useEffect(() => {
        fetchDoctors();
        fetchStats();
    }, []);

    const fetchDoctors = async () => {
        try {
            setLoading(true);
            const [pendingRes, allRes] = await Promise.all([
                API.get('/api/v1/admin/doctors/pending'),
                API.get('/api/v1/admin/doctors')
            ]);

            if (pendingRes.data.success) {
                setPendingDoctors(pendingRes.data.data.doctors);
            }

            if (allRes.data.success) {
                setAllDoctors(allRes.data.data.doctors);
            }
        } catch (error) {
            console.error('Error fetching doctors:', error);
            alert(t('admin.alerts.fetchFailed', 'Failed to fetch doctors'));
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const [pendingRes, approvedRes, rejectedRes, allRes] = await Promise.all([
                API.get('/api/v1/admin/doctors/pending'),
                API.get('/api/v1/admin/doctors?status=approved'),
                API.get('/api/v1/admin/doctors?status=rejected'),
                API.get('/api/v1/admin/doctors')
            ]);

            setStats({
                totalDoctors: allRes.data.data.pagination.total,
                pendingDoctors: pendingRes.data.data.pagination.total,
                approvedDoctors: approvedRes.data.data.pagination.total,
                rejectedDoctors: rejectedRes.data.data.pagination.total,
            });
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const handleApproveDoctor = async (doctorId: string) => {
        try {
            setActionLoading(doctorId);
            const response = await API.post(`/api/v1/admin/doctors/${doctorId}/approve`);

            if (response.data.success) {
                alert(t('admin.alerts.approveSuccess', 'Doctor approved successfully'));
                fetchDoctors();
                fetchStats();
            }
        } catch (error) {
            console.error('Error approving doctor:', error);
            alert(t('admin.alerts.approveFailed', 'Failed to approve doctor'));
        } finally {
            setOriginalStatus(null);
            setActionLoading(null);
        }
    };

    const handleOriginalStatus = (status: string) => {};
    const [originalStatus, setOriginalStatus] = useState<string | null>(null);

    const handleRejectDoctor = async (doctorId: string) => {
        const reason = prompt(t('admin.prompts.rejectReason', 'Please provide a reason for rejection:'));
        if (!reason) return;

        try {
            setActionLoading(doctorId);
            const response = await API.post(`/api/v1/admin/doctors/${doctorId}/reject`, { reason });

            if (response.data.success) {
                alert(t('admin.alerts.rejectSuccess', 'Doctor rejected successfully'));
                fetchDoctors();
                fetchStats();
            }
        } catch (error) {
            console.error('Error rejecting doctor:', error);
            alert(t('admin.alerts.rejectFailed', 'Failed to reject doctor'));
        } finally {
            setActionLoading(null);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return <Badge variant="warning">{t('appointment.status.pending', 'Pending')}</Badge>;
            case 'approved':
                return <Badge variant="success">{t('appointment.status.confirmed', 'Approved')}</Badge>;
            case 'rejected':
                return <Badge variant="danger">{t('appointment.status.cancelled', 'Rejected')}</Badge>;
            default:
                return <Badge variant="default">{status}</Badge>;
        }
    };

    // File preview functions
    const openPreview = (filePath: string, fileName: string) => {
        setPreviewModal({
            isOpen: true,
            filePath,
            fileName,
        });
    };

    const closePreview = () => {
        setPreviewModal({
            isOpen: false,
            filePath: '',
            fileName: '',
        });
    };

    const renderDocumentActions = (doctor: Doctor) => {
        if (!doctor.profileImage && !doctor.medicalProof) return null;

        return (
            <div className="mt-2 flex flex-wrap gap-3">
                {doctor.profileImage && (
                    <button
                        onClick={() => openPreview(doctor.profileImage!, t('admin.documents.profileImage', 'Profile Image'))}
                        className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                    >
                        <Eye className="w-3 h-3" />
                        {t('admin.buttons.viewProfileImage', 'View Profile Image')}
                    </button>
                )}
                {doctor.medicalProof && (
                    <button
                        onClick={() => openPreview(doctor.medicalProof!, t('admin.documents.medicalProof', 'Medical Proof'))}
                        className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                    >
                        <Eye className="w-3 h-3" />
                        {t('admin.buttons.viewMedicalProof', 'View Medical Proof')}
                    </button>
                )}
            </div>
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin" />
            </div>
        );
    }

    return (
        <>
            <div className="container mx-auto px-4 py-8">
                <div className="mb-8 text-left">
                    <h1 className="text-3xl font-bold text-gray-900">{t('admin.title', 'Admin Dashboard')}</h1>
                    <p className="text-gray-600">{t('admin.subtitle', 'Manage doctors and system administration')}</p>
                </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 text-left">
                <Card className="p-6">
                    <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <h3 className="text-sm font-medium">{t('admin.stats.totalDoctors', 'Total Doctors')}</h3>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="pt-2">
                        <div className="text-2xl font-bold">{stats.totalDoctors}</div>
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <h3 className="text-sm font-medium">{t('admin.stats.pendingApproval', 'Pending Approval')}</h3>
                        <UserCheck className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="pt-2">
                        <div className="text-2xl font-bold text-yellow-600">{stats.pendingDoctors}</div>
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <h3 className="text-sm font-medium">{t('admin.stats.approved', 'Approved')}</h3>
                        <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="pt-2">
                        <div className="text-2xl font-bold text-green-600">{stats.approvedDoctors}</div>
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <h3 className="text-sm font-medium">{t('admin.stats.rejected', 'Rejected')}</h3>
                        <UserX className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="pt-2">
                        <div className="text-2xl font-bold text-red-600">{stats.rejectedDoctors}</div>
                    </div>
                </Card>
            </div>

            {/* Pending Doctors Section */}
            <Card className="mb-8 p-6 text-left">
                <div className="mb-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <UserCheck className="h-5 w-5" />
                        {t('admin.sections.pendingApprovals', 'Pending Doctor Approvals')}
                    </h3>
                </div>
                <div>
                    {pendingDoctors.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">{t('admin.sections.noPending', 'No pending doctors to review')}</p>
                    ) : (
                        <div className="space-y-4">
                            {pendingDoctors.map((doctor) => (
                                <div key={doctor._id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <h3 className="font-semibold text-slate-900">{doctor.fullName}</h3>
                                                <p className="text-sm text-gray-600">{doctor.email}</p>
                                                {doctor.specialization && (
                                                    <p className="text-sm text-gray-500">{t('doctorCard.specialist', 'Specialization')}: {doctor.specialization}</p>
                                                )}
                                                {doctor.licenseNumber && (
                                                    <p className="text-sm text-gray-500">{t('onboarding.inputs.mapsUrl', 'License')}: {doctor.licenseNumber}</p>
                                                )}
                                                {renderDocumentActions(doctor)}
                                                {doctor.status === 'rejected' && doctor.rejectionReason && (
                                                    <p className="text-sm text-red-600 mt-1">
                                                        {t('admin.labels.rejectionReason', 'Rejection Reason')}: {doctor.rejectionReason}
                                                    </p>
                                                )}
                                            </div>
                                            {getStatusBadge(doctor.status)}
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-2 shrink-0">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {/* TODO: View doctor details */ }}
                                        >
                                          <Eye className="h-4 w-4 mr-1" />
                                          {t('actions.viewDetails', 'View')}
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleApproveDoctor(doctor._id)}
                                            disabled={actionLoading === doctor._id}
                                        >
                                            {actionLoading === doctor._id ? (
                                                <Loader2 className="h-4 w-4 animate-spin mr-1" />
                                            ) : (
                                                <CheckCircle className="h-4 w-4 mr-1" />
                                            )}
                                            {t('appointment.actions.approve', 'Approve')}
                                        </Button>
                                        <Button
                                            variant="primary"
                                            size="sm"
                                            onClick={() => handleRejectDoctor(doctor._id)}
                                            disabled={actionLoading === doctor._id}
                                            className="bg-red-600 hover:bg-red-700 text-white"
                                        >
                                            {actionLoading === doctor._id ? (
                                                <Loader2 className="h-4 w-4 animate-spin mr-1" />
                                            ) : (
                                                <XCircle className="h-4 w-4 mr-1" />
                                            )}
                                            {t('appointment.actions.cancel', 'Reject')}
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </Card>

            {/* All Doctors Section */}
            <Card className="p-6 text-left">
                <div className="mb-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        {t('sidebar.doctors', 'All Doctors')}
                    </h3>
                </div>
                <div>
                    {allDoctors.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">{t('admin.sections.noDoctors', 'No doctors found')}</p>
                    ) : (
                        <div className="space-y-4">
                            {allDoctors.map((doctor) => (
                                <div key={doctor._id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <h3 className="font-semibold text-slate-900">{doctor.fullName}</h3>
                                                <p className="text-sm text-gray-600">{doctor.email}</p>
                                                {doctor.specialization && (
                                                    <p className="text-sm text-gray-500">{t('doctorCard.specialist', 'Specialization')}: {doctor.specialization}</p>
                                                )}
                                                {doctor.licenseNumber && (
                                                    <p className="text-sm text-gray-500">{t('onboarding.inputs.mapsUrl', 'License')}: {doctor.licenseNumber}</p>
                                                )}
                                                {renderDocumentActions(doctor)}
                                            </div>
                                            {getStatusBadge(doctor.status)}
                                        </div>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {/* TODO: View doctor details */ }}
                                        className="shrink-0"
                                    >
                                        <Eye className="h-4 w-4 mr-1" />
                                        {t('actions.viewDetails', 'View Details')}
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </Card>
        </div>

        {/* File Preview Modal */}
        <FilePreviewModal
            isOpen={previewModal.isOpen}
            onClose={closePreview}
            filePath={previewModal.filePath}
            fileName={previewModal.fileName}
        />
        </>
    );
}