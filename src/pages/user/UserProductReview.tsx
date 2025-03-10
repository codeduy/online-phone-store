import React, { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Rating } from 'primereact/rating';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { Paginator } from 'primereact/paginator';
import axios from 'axios';
import { Helmet } from 'react-helmet';
import { FileUpload } from 'primereact/fileupload';
import { InputTextarea } from 'primereact/inputtextarea';

const API_URL = `${import.meta.env.VITE_API_URL}`;

interface Review {
    _id: string;
    product_id: string;
    user_id: {
        _id: string;
        name: string;
    };
    rating: number;
    comment: string;
    images?: string[];
    is_verified_purchase: boolean;
    createdAt: string;
}

interface ReviewStats {
    average: number;
    total: number;
    five: number;
    four: number;
    three: number;
    two: number;
    one: number;
}

const UserProductReview = () => {
    const { productId } = useParams();
    const toast = useRef<Toast>(null);

    // States
    const [reviews, setReviews] = useState<Review[]>([]);
    const [stats, setStats] = useState<ReviewStats>({
        average: 0,
        total: 0,
        five: 0,
        four: 0,
        three: 0,
        two: 0,
        one: 0
    });
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [showImageDialog, setShowImageDialog] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [reviewToDelete, setReviewToDelete] = useState<string | null>(null);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalReviews: 0,
        limit: 10
    });
    const [showReviewDialog, setShowReviewDialog] = useState(false);
    const [rating, setRating] = useState(0);
    const [reviewComment, setReviewComment] = useState('');
    const [files, setFiles] = useState<File[]>([]);
    const fileUploadRef = useRef<FileUpload>(null);
    const [canReview, setCanReview] = useState(false);

    useEffect(() => {
        const checkReviewPermission = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return;
    
                const response = await axios.get(
                    `${API_URL}/reviews/product/${productId}/can-review`,
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );
                setCanReview(response.data.canReview);
            } catch (error) {
                console.error('Error checking review permission:', error);
                setCanReview(false);
            }
        };
    
        checkReviewPermission();
    }, [productId]);

    const handleFileSelect = (e: { files: File[] }) => {
        const maxImages = 3;
        const currentFiles = e.files;
    
        if (currentFiles.length > maxImages) {
            // Show toast message
            toast.current?.show({
                severity: 'warn',
                summary: 'Giới hạn ảnh',
                detail: `Chỉ được phép tải lên tối đa ${maxImages} ảnh.`,
                life: 3000
            });
    
            // Keep only first 3 images
            const limitedFiles = currentFiles.slice(0, maxImages);
            if (fileUploadRef.current) {
                fileUploadRef.current.clear();
                // Re-add only the first 3 images
                limitedFiles.forEach(file => {
                    fileUploadRef.current?.upload([file]);
                });
            }
            setFiles(limitedFiles);
        } else {
            setFiles(currentFiles);
        }
    };
    
    // Add this new handler
    const handleSubmitReview = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                toast.current?.show({
                    severity: 'error',
                    summary: 'Lỗi',
                    detail: 'Vui lòng đăng nhập để đánh giá'
                });
                return;
            }
    
            if (!rating || !reviewComment.trim()) {
                toast.current?.show({
                    severity: 'error',
                    summary: 'Lỗi',
                    detail: 'Vui lòng chọn số sao và nhập nội dung đánh giá'
                });
                return;
            }
    
            const formData = new FormData();
            formData.append('rating', rating.toString());
            formData.append('comment', reviewComment);
            files.forEach(file => {
                formData.append('images', file);
            });
    
            const response = await axios.post(
                `${API_URL}/reviews/product/${productId}`,
                formData,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
    
            if (response.data.success) {
                toast.current?.show({
                    severity: 'success',
                    summary: 'Thành công',
                    detail: 'Đã gửi đánh giá thành công'
                });
                
                // Reset form
                setRating(0);
                setReviewComment('');
                setFiles([]);
                if (fileUploadRef.current) {
                    fileUploadRef.current.clear();
                }
                
                // Close dialog
                setShowReviewDialog(false);
                
                // Refresh reviews
                await fetchReviews(1);
            }
        } catch (error) {
            console.error('Error submitting review:', error);
            toast.current?.show({
                severity: 'error',
                summary: 'Lỗi',
                detail: 'Không thể gửi đánh giá'
            });
        }
    };

    // Fetch reviews function
    const fetchReviews = async (page = 1) => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}/reviews/product/${productId}`, {
                params: { page, limit: pagination.limit }
            });

            if (response.data.success) {
                const { reviews, stats, pagination: paginationData } = response.data.data;
                setReviews(reviews);
                setStats(stats);
                setPagination(paginationData);
            }
        } catch (error) {
            console.error('Error fetching reviews:', error);
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Không thể tải đánh giá'
            });
        } finally {
            setLoading(false);
        }
    };

    // Initial load
    useEffect(() => {
        if (productId) {
            fetchReviews(1);
        }
    }, [productId]);

    // Delete review handler
    const handleDeleteReview = async (reviewId: string) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                toast.current?.show({
                    severity: 'error',
                    summary: 'Lỗi',
                    detail: 'Vui lòng đăng nhập để thực hiện chức năng này'
                });
                return;
            }

            const response = await axios.delete(
                `${API_URL}/reviews/product/${productId}/review/${reviewId}`,
                {
                    headers: { 'Authorization': `Bearer ${token}` }
                }
            );

            if (response.data.success) {
                await fetchReviews(pagination.currentPage);
                setShowDeleteConfirm(false);
                toast.current?.show({
                    severity: 'success',
                    summary: 'Thành công',
                    detail: 'Đã xóa đánh giá'
                });
                window.location.reload();
            }
        } catch (error) {
            console.error('Error deleting review:', error);
            toast.current?.show({
                severity: 'error',
                summary: 'Lỗi',
                detail: 'Không thể xóa đánh giá'
            });
        }
    };

    // Loading state
    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <i className="pi pi-spinner pi-spin" style={{ fontSize: '2rem' }}></i>
            </div>
        );
    }

    return (
        <div className="p-4">
            <Toast ref={toast} />
            <Helmet>
                <title>Đánh giá sản phẩm</title>
            </Helmet>

            {/* Rating Overview */}
            <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-white rounded-lg border">
                <div className="flex flex-col items-center">
                    <div className="text-4xl font-bold text-yellow-500">
                        {stats.average.toFixed(1)}
                    </div>
                    <Rating value={stats.average} readOnly cancel={false} className="my-2" />
                    <div className="text-gray-600">
                        {stats.total} đánh giá
                    </div>
                    {canReview && (
                        <Button
                            label="Viết đánh giá"
                            icon="pi pi-pencil"
                            className="p-button-primary mt-3"
                            onClick={() => setShowReviewDialog(true)}
                        />
                    )}
                </div>
                <div>
                    {[5, 4, 3, 2, 1].map(star => (
                        <div key={star} className="flex items-center gap-2 mb-2">
                            <span className="w-12 text-sm">{star} sao</span>
                            <div className="flex-1 h-2 bg-gray-200 rounded overflow-hidden">
                                <div 
                                    className="h-full bg-yellow-400"
                                    style={{
                                        width: `${stats.total ? (stats[star as keyof typeof stats.five]/stats.total)*100 : 0}%`
                                    }}
                                />
                            </div>
                            <span className="w-12 text-sm text-right">
                                {stats[star as keyof typeof stats.five]}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Reviews List */}
            <div className="bg-white rounded-lg border p-4">
                {reviews.map((review) => {
                    const userId = localStorage.getItem('userId');
                    const isUserReview = userId === review.user_id._id;

                    return (
                        <div 
                            key={review._id}
                            className={`border-b pb-4 last:border-0 ${
                                isUserReview ? 'bg-blue-50 p-3 rounded-lg border border-blue-100 mb-3' : ''
                            }`}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex flex-col">
                                    <div className="flex items-center gap-2">
                                        <div className="font-semibold">{review.user_id.name}</div>
                                        {isUserReview && (
                                            <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                                                Đánh giá của bạn
                                            </span>
                                        )}
                                        {review.is_verified_purchase && (
                                            <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                                                Đã mua hàng
                                            </span>
                                        )}
                                        {isUserReview && (
                                            <Button
                                                icon="pi pi-trash"
                                                className="p-button-danger p-button-text"
                                                onClick={() => {
                                                    setReviewToDelete(review._id);
                                                    setShowDeleteConfirm(true);
                                                }}
                                                tooltip="Xóa đánh giá"
                                            />
                                        )}
                                    </div>
                                    <Rating value={review.rating} readOnly cancel={false} />
                                </div>
                                <div className="text-gray-500 text-sm">
                                    {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                                </div>
                            </div>
                            <p className="text-gray-700 mb-2">{review.comment}</p>
                            {review.images && review.images.length > 0 && (
                                <div className="flex gap-2 mt-2">
                                    {review.images.map((image, index) => (
                                        <img 
                                            key={index}
                                            src={`${API_URL.replace('/api', '')}${image}`}
                                            alt={`Review image ${index + 1}`}
                                            className="w-16 h-16 object-cover rounded cursor-pointer"
                                            onClick={() => {
                                                setSelectedImage(image);
                                                setShowImageDialog(true);
                                            }}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Pagination */}
            <div className="flex justify-center mt-4">
                <Paginator
                    first={(pagination.currentPage - 1) * pagination.limit}
                    rows={pagination.limit}
                    totalRecords={pagination.totalReviews}
                    onPageChange={(e) => fetchReviews(e.page + 1)}
                />
            </div>

            {/* Image Dialog */}
            <Dialog
                visible={showImageDialog}
                onHide={() => {
                    setShowImageDialog(false);
                    setSelectedImage(null);
                }}
                header="Xem ảnh"
                style={{ width: '90vw', maxWidth: '1200px' }}
            >
                {selectedImage && (
                    <div className="flex justify-center items-center">
                        <img
                            src={`${API_URL.replace('/api', '')}${selectedImage}`}
                            alt="Review image preview"
                            className="max-w-full max-h-[80vh] object-contain"
                        />
                    </div>
                )}
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog
                visible={showDeleteConfirm}
                onHide={() => setShowDeleteConfirm(false)}
                header="Xác nhận xóa"
                footer={(
                    <div>
                        <Button
                            label="Hủy"
                            icon="pi pi-times"
                            className="mr-2 p-button-text bg-white text-gray-700 border border-gray-300 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 rounded-md p-2"
                            onClick={() => setShowDeleteConfirm(false)}
                        />
                        <Button
                            label="Xóa"
                            icon="pi pi-trash"
                            className="p-button-danger text-red-500 border border-red-300 bg-white hover:bg-red-50 hover:text-red-600 transition-all duration-200 rounded-md p-2"
                            onClick={() => {
                                if (reviewToDelete) {
                                    handleDeleteReview(reviewToDelete);
                                }
                            }}
                        />
                    </div>
                )}
            >
                <p>Bạn có chắc chắn muốn xóa đánh giá này?</p>
            </Dialog>

            <Dialog 
                header="Viết đánh giá" 
                visible={showReviewDialog} 
                style={{ width: '90vw', maxWidth: '600px' }}
                onHide={() => setShowReviewDialog(false)}
                className="rounded-lg shadow-lg border border-gray-200"
                pt={{
                    root: { className: 'border rounded-lg shadow-lg' },
                    header: { className: 'text-xl font-semibold text-gray-800 p-4 border-b bg-gray-50' },
                    content: { className: 'p-6' },
                    footer: { className: 'flex gap-2 justify-end p-4 bg-gray-50 border-t' }
                }}
            >
                <div className="flex flex-col gap-4">
                    <div className="text-center">
                        <Rating 
                            value={rating} 
                            onChange={(e) => setRating(e.value ?? 0)} 
                            stars={5} 
                            cancel={false} 
                            className="flex justify-center"
                            pt={{
                                onIcon: { className: 'text-yellow-400 text-2xl' },
                                offIcon: { className: 'text-gray-300 text-2xl' }
                            }}
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="font-medium text-gray-700">Nhận xét của bạn</label>
                        <InputTextarea 
                            value={reviewComment} 
                            onChange={(e) => setReviewComment(e.target.value)} 
                            rows={5} 
                            placeholder="Chia sẻ cảm nhận của bạn về sản phẩm..." 
                            className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-400 focus:outline-none"
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="font-medium text-gray-700">Hình ảnh thực tế (tối đa 3 ảnh)</label>
                        <FileUpload
                            ref={fileUploadRef}
                            mode="advanced"
                            multiple
                            accept="image/*"
                            maxFileSize={1000000}
                            customUpload
                            auto={false}
                            chooseLabel="Chọn ảnh"
                            cancelLabel="Hủy"
                            className="w-full border border-gray-300 rounded-lg overflow-hidden"
                            chooseOptions={{
                                className: "px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 transition-colors duration-200"
                            }}
                            cancelOptions={{
                                className: "px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 transition-colors duration-200"
                            }}
                            onSelect={handleFileSelect}
                            onClear={() => setFiles([])}
                            emptyTemplate={
                                <p className="text-center text-gray-500 py-8">
                                    Kéo thả hoặc click để chọn ảnh (tối đa 3 ảnh)
                                </p>
                            }
                            onError={(e) => {
                                toast.current?.show({
                                    severity: 'error',
                                    summary: 'Lỗi',
                                    detail: 'Không thể tải ảnh. Vui lòng thử lại.'
                                });
                            }}
                        />
                    </div>

                    <Button 
                        label="Gửi đánh giá" 
                        icon="pi pi-send"
                        iconPos="left"
                        className={`w-full px-4 py-3 mt-4 rounded-lg flex items-center justify-center gap-2 transition-colors duration-200 ${
                            !rating || !reviewComment.trim()
                                ? 'bg-gray-400 text-white cursor-not-allowed'
                                : 'bg-blue-600 text-white border border-blue-600 hover:bg-blue-700 hover:border-blue-700'
                        }`}
                        disabled={!rating || !reviewComment.trim()}
                        onClick={handleSubmitReview}
                    />
                </div>
            </Dialog>
        </div>
    );
};

export default UserProductReview;