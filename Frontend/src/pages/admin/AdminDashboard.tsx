import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import API from '../../Api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { FilePreviewModal } from '../../components/FilePreviewModal';
import { Loader2, CheckCircle, XCircle, Eye, Users, UserCheck, UserX } from 'lucide-react';

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
            alert('Failed to fetch doctors');
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
                alert('Doctor approved successfully');
                fetchDoctors();
                fetchStats();
            }
        } catch (error) {
            console.error('Error approving doctor:', error);
            alert('Failed to approve doctor');
        } finally {
            setActionLoading(null);
        }
    };

    const handleRejectDoctor = async (doctorId: string) => {
        const reason = prompt('Please provide a reason for rejection:');
        if (!reason) return;

        try {
            setActionLoading(doctorId);
            const response = await API.post(`/api/v1/admin/doctors/${doctorId}/reject`, { reason });

            if (response.data.success) {
                alert('Doctor rejected successfully');
                fetchDoctors();
                fetchStats();
            }
        } catch (error) {
            console.error('Error rejecting doctor:', error);
            alert('Failed to reject doctor');
        } finally {
            setActionLoading(null);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return <Badge variant="warning">Pending</Badge>;
            case 'approved':
                return <Badge variant="success">Approved</Badge>;
            case 'rejected':
                return <Badge variant="danger">Rejected</Badge>;
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
                        onClick={() => openPreview(doctor.profileImage!, 'Profile Image')}
                        className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                    >
                        <Eye className="w-3 h-3" />
                        View Profile Image
                    </button>
                )}
                {doctor.medicalProof && (
                    <button
                        onClick={() => openPreview(doctor.medicalProof!, 'Medical Proof')}
                        className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                    >
                        <Eye className="w-3 h-3" />
                        View Medical Proof
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
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                    <p className="text-gray-600">Manage doctors and system administration</p>
                </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <Card className="p-6">
                    <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <h3 className="text-sm font-medium">Total Doctors</h3>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="pt-2">
                        <div className="text-2xl font-bold">{stats.totalDoctors}</div>
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <h3 className="text-sm font-medium">Pending Approval</h3>
                        <UserCheck className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="pt-2">
                        <div className="text-2xl font-bold text-yellow-600">{stats.pendingDoctors}</div>
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <h3 className="text-sm font-medium">Approved</h3>
                        <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="pt-2">
                        <div className="text-2xl font-bold text-green-600">{stats.approvedDoctors}</div>
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <h3 className="text-sm font-medium">Rejected</h3>
                        <UserX className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="pt-2">
                        <div className="text-2xl font-bold text-red-600">{stats.rejectedDoctors}</div>
                    </div>
                </Card>
            </div>

            {/* Pending Doctors Section */}
            <Card className="mb-8 p-6">
                <div className="mb-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <UserCheck className="h-5 w-5" />
                        Pending Doctor Approvals
                    </h3>
                </div>
                <div>
                    {pendingDoctors.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">No pending doctors to review</p>
                    ) : (
                        <div className="space-y-4">
                            {pendingDoctors.map((doctor) => (
                                <div key={doctor._id} className="flex items-center justify-between p-4 border rounded-lg">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3">
                                            <div>
                                                <h3 className="font-semibold">{doctor.fullName}</h3>
                                                <p className="text-sm text-gray-600">{doctor.email}</p>
                                                {doctor.specialization && (
                                                    <p className="text-sm text-gray-500">Specialization: {doctor.specialization}</p>
                                                )}
                                                {doctor.licenseNumber && (
                                                    <p className="text-sm text-gray-500">License: {doctor.licenseNumber}</p>
                                                )}
                                                {renderDocumentActions(doctor)}
                                                {doctor.status === 'rejected' && doctor.rejectionReason && (
                                                    <p className="text-sm text-red-600 mt-1">
                                                        Rejection Reason: {doctor.rejectionReason}
                                                    </p>
                                                )}
                                            </div>
                                            {getStatusBadge(doctor.status)}
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {/* TODO: View doctor details */ }}
                                        >
                                            <Eye className="h-4 w-4 mr-1" />
                                            View
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
                                            Approve
                                        </Button>
                                        <Button
                                            variant="primary"
                                            size="sm"
                                            onClick={() => handleRejectDoctor(doctor._id)}
                                            disabled={actionLoading === doctor._id}
                                            className="bg-red-600 hover:bg-red-700"
                                        >
                                            {actionLoading === doctor._id ? (
                                                <Loader2 className="h-4 w-4 animate-spin mr-1" />
                                            ) : (
                                                <XCircle className="h-4 w-4 mr-1" />
                                            )}
                                            Reject
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </Card>

            {/* All Doctors Section */}
            <Card className="p-6">
                <div className="mb-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        All Doctors
                    </h3>
                </div>
                <div>
                    {allDoctors.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">No doctors found</p>
                    ) : (
                        <div className="space-y-4">
                            {allDoctors.map((doctor) => (
                                <div key={doctor._id} className="flex items-center justify-between p-4 border rounded-lg">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3">
                                            <div>
                                                <h3 className="font-semibold">{doctor.fullName}</h3>
                                                <p className="text-sm text-gray-600">{doctor.email}</p>
                                                {doctor.specialization && (
                                                    <p className="text-sm text-gray-500">Specialization: {doctor.specialization}</p>
                                                )}
                                                {doctor.licenseNumber && (
                                                    <p className="text-sm text-gray-500">License: {doctor.licenseNumber}</p>
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
                                    >
                                        <Eye className="h-4 w-4 mr-1" />
                                        View Details
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
