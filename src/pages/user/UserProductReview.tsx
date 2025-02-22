import React, { useState, useEffect } from 'react';
import { Rating } from 'primereact/rating';
import { Button } from 'primereact/button';
import { OverlayPanel } from 'primereact/overlaypanel';
import { InputText } from 'primereact/inputtext';
import { useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { Dialog } from 'primereact/dialog';
import { InputTextarea } from 'primereact/inputtextarea';
import { FileUpload, FileUploadHandlerEvent, FileUploadSelectEvent } from 'primereact/fileupload';
import { Galleria } from 'primereact/galleria';
import { Helmet } from 'react-helmet';

const UserProductReview = () => {
    const { slug } = useParams();
    const [selectedStars, setSelectedStars] = useState<number | null>(null);
    const [showImageOnly, setShowImageOnly] = useState(false);
    const [sortBy, setSortBy] = useState('newest');
    const op = useRef<OverlayPanel>(null);
    const fileUploadRef = useRef<FileUpload>(null);
    const [visible, setVisible] = useState(false);
    const [showUploadError, setShowUploadError] = useState(false);
    const [uploadError, setUploadError] = useState('');
    const [rating, setRating] = useState(0);
    const [review, setReview] = useState('');
    const [showImageDialog, setShowImageDialog] = useState(false);
    const [selectedReview, setSelectedReview] = useState<Review | null>(null);
    const [newReview, setNewReview] = useState<Review>({
        id: 0,
        name: '',
        rating: 0,
        comment: '',
        date: '',
        phone: '',
        images: [],
        hasImages: false
    });
    const [phone, setPhone] = useState('');
    const [name, setName] = useState('');
    const [showDialog, setShowDialog] = useState(false);

    interface Review {
        id: number;
        name: string;
        rating: number;
        comment: string;
        date: string;
        phone: string;
        images: string[];
        hasImages: boolean;
    }    

    const itemTemplate = (item: string) => {
        return <img src={item} alt="Review" style={{ width: '100%', display: 'block' }} />;
    };
    
    const thumbnailTemplate = (item: string) => {
        return <img src={item} alt="Review Thumbnail" style={{ width: '50px', display: 'block' }} />;
    };

    const handleSubmitReview = (event: FileUploadSelectEvent) => {       

        if (!newReview.rating || !newReview.name.trim() || !newReview.phone.trim()) {
            return;
        }

        const files = event.files;
        let imageUrls: string[] = [];

        if (files && files.length > 0) {
            if (files.length > 3) {
                setShowUploadError(true);
                setUploadError('Chỉ được tải lên tối đa 3 ảnh');
                if (fileUploadRef.current) {
                    fileUploadRef.current.clear();
                }
                return;
            }
            imageUrls = Array.from(files).map(file => URL.createObjectURL(file));
        }
    
        const reviewWithDate: Review = {
            id: Date.now(),
            name: newReview.name,
            rating: newReview.rating,
            comment: newReview.comment,
            date: new Date().toISOString().split('T')[0],
            phone: newReview.phone,
            images: imageUrls,
            hasImages: newReview.images.length > 0
        };
    
        setFilteredReviews([reviewWithDate, ...filteredReviews]);
        setVisible(false);
    
        // Reset form
        setNewReview({
            id: 0,
            name: '',
            rating: 0,
            comment: '',
            date: '',
            phone: '',
            images: [],
            hasImages: false
        });
    
        if (fileUploadRef.current) {
            fileUploadRef.current.clear();
        }
    };

    const handleSubmitClick = () => {
        if (fileUploadRef.current) {
            const files = fileUploadRef.current.getFiles();
            handleSubmitReview({ files } as FileUploadSelectEvent);
        } else {
            handleSubmitReview({ 
                files: [], 
                originalEvent: new Event('change') as unknown as React.ChangeEvent<HTMLInputElement>
            } as FileUploadSelectEvent);
        }
    };
    
    const handleUpload = async (event: FileUploadHandlerEvent) => {
        const files = event.files;
        if (files && files.length > 0) {
            if (files.length > 3) {
                setShowUploadError(true);
                setUploadError('Chỉ được tải lên tối đa 3 ảnh');
                if (fileUploadRef.current) {
                    fileUploadRef.current.clear();
                }
                return;
            }
            const imageUrls = Array.from(files).map(file => URL.createObjectURL(file));
            setNewReview(prev => ({
                ...prev,
                images: imageUrls,
                hasImages: true
            }));
        }
        event.options.clear();
    };

    const handleSort = (type: string) => {
        setSortBy(type);
        op.current?.hide();
    };  

    // Mock data - replace with actual data
    const mockReviews = [
        { 
        id: 1, 
        name: 'Nguyễn Văn A', 
        rating: 5, 
        comment: 'Sản phẩm rất tốt, đóng gói cẩn thận, pin trâu, camera đẹp!', 
        date: '2024-03-15', 
        phone: '0123456789',
            images: [] as string[],
        hasImages: true 
        },
        { 
        id: 2, 
        name: 'Trần Thị B', 
        rating: 4, 
        comment: 'Máy chạy mượt, pin tốt, chỉ có điều hơi nóng khi chơi game', 
        date: '2024-03-14', 
        phone: '0123456789',
        images: [] as string[],
        hasImages: false 
        },
        { 
        id: 3, 
        name: 'Lê Văn C', 
        rating: 3, 
        comment: 'Sản phẩm tạm ổn, chưa có gì đặc biệt', 
        date: '2024-03-13', 
        phone: '0123456789',
        images: [] as string[],
        hasImages: true 
        },
        { 
        id: 4, 
        name: 'Phạm Thị D', 
        rating: 5, 
        comment: 'Quá xuất sắc, đáng đồng tiền!', 
        date: '2024-03-12', 
        phone: '0123456789',
        images: [] as string[],
        hasImages: true 
        },
        { 
        id: 5, 
        name: 'Hoàng Văn E', 
        rating: 2, 
        comment: 'Pin không được tốt như quảng cáo', 
        date: '2024-03-11', 
        phone: '0123456789',
        images: [] as string[],
        hasImages: false 
        },
        { 
        id: 6, 
        name: 'Đỗ Thị F', 
        rating: 5, 
        comment: 'Camera chụp đẹp, màn hình sắc nét', 
        date: '2024-03-10', 
        phone: '0123456789',
        images: [] as string[],
        hasImages: true 
        },
        { 
        id: 7, 
        name: 'Vũ Văn G', 
        rating: 1, 
        comment: 'Sản phẩm kém chất lượng, hay bị đơ', 
        date: '2024-03-09', 
        phone: '0123456789',
        images: [] as string[],
        hasImages: false 
        },
        { 
        id: 8, 
        name: 'Ngô Thị H', 
        rating: 4, 
        comment: 'Tốt, đáng mua trong tầm giá', 
        date: '2024-03-08', 
        phone: '0123456789',
        images: [] as string[],
        hasImages: true 
        },
        { 
        id: 9, 
        name: 'Đinh Văn I', 
        rating: 5, 
        comment: 'Thiết kế đẹp, cầm vừa tay', 
        date: '2024-03-07', 
        phone: '0123456789',
        images: [] as string[],
        hasImages: false 
        },
        { 
        id: 10, 
        name: 'Bùi Thị K', 
        rating: 3, 
        comment: 'Tạm được, chưa thực sự ấn tượng', 
        date: '2024-03-06', 
        phone: '0123456789',
        images: [] as string[],
        hasImages: true 
        },
        { 
        id: 11, 
        name: 'Lý Văn L', 
        rating: 5, 
        comment: 'Rất hài lòng với sản phẩm', 
        date: '2024-03-05', 
        phone: '0123456789',
        images: [] as string[],
        hasImages: true 
        },
        { 
        id: 12, 
        name: 'Trương Thị M', 
        rating: 4, 
        comment: 'Máy chạy mượt, camera ok', 
        date: '2024-03-04', 
        phone: '0123456789',
        images: [] as string[],
        hasImages: false 
        },
        { 
        id: 13, 
        name: 'Đặng Văn N', 
        rating: 2, 
        comment: 'Chưa được như mong đợi', 
        date: '2024-03-03', 
        phone: '0123456789',
        images: [] as string[],
        hasImages: true 
        },
        { 
        id: 14, 
        name: 'Mai Thị P', 
        rating: 5, 
        comment: 'Tuyệt vời, đáng mua!', 
        date: '2024-03-02', 
        phone: '0123456789',
        images: [] as string[],
        hasImages: false 
        },
        { 
        id: 15, 
        name: 'Hồ Văn Q', 
        rating: 4, 
        comment: 'Pin trâu, chơi game tốt', 
        date: '2024-03-01', 
        phone: '0123456789',
        images: [] as string[],
        hasImages: true 
        },
        { 
        id: 16, 
        name: 'Dương Thị R', 
        rating: 1, 
        comment: 'Sản phẩm không như quảng cáo', 
        date: '2024-02-29', 
        phone: '0123456789',
        images: [] as string[],
        hasImages: false 
        },
        { 
        id: 17, 
        name: 'Phan Văn S', 
        rating: 5, 
        comment: 'Đáng đồng tiền bát gạo', 
        date: '2024-02-28', 
        phone: '0123456789',
        images: [] as string[],
        hasImages: true 
        },
        { 
        id: 18, 
        name: 'Võ Thị T', 
        rating: 3, 
        comment: 'Bình thường, không có gì đặc sắc', 
        date: '2024-02-27', 
        phone: '0123456789',
        images: [] as string[],
        hasImages: false 
        },
        { 
        id: 19, 
        name: 'Tống Văn U', 
        rating: 4, 
        comment: 'Khá tốt trong tầm giá', 
        date: '2024-02-26', 
        phone: '0123456789',
        images: [] as string[],
        hasImages: true 
        },
        { 
        id: 20, 
        name: 'Lại Thị V', 
        rating: 5, 
        comment: 'Rất ưng ý, sẽ giới thiệu cho bạn bè', 
        date: '2024-02-25', 
        phone: '0123456789',
        images: [] as string[],
        hasImages: true 
        }
    ];

    const [filteredReviews, setFilteredReviews] = useState(mockReviews);

    const [reviews, setReviews] = useState(mockReviews);
    useEffect(() => {
        let result = [...mockReviews];
        
        // Filter by stars
        if (selectedStars) {
            result = result.filter(review => review.rating === selectedStars);
        }

        // Filter by images
        if (showImageOnly) {
            result = result.filter(review => review.hasImages);
        }

        // Sort reviews
        switch (sortBy) {
            case 'newest':
                result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                break;
            case 'highest':
                result.sort((a, b) => b.rating - a.rating);
                break;
            case 'lowest':
                result.sort((a, b) => a.rating - b.rating);
                break;
        }

        setFilteredReviews(result);
    }, [selectedStars, showImageOnly, sortBy]);

    useEffect(() => {
        let result = [...mockReviews];

        // Apply sorting
        switch (sortBy) {
            case 'newest':
                result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                break;
            case 'highest':
                result.sort((a, b) => b.rating - a.rating);
                break;
            case 'lowest':
                result.sort((a, b) => a.rating - b.rating);
                break;
        }

        setFilteredReviews(result);
    }, [sortBy]);

    const averageRating = 4.5;
    const totalReviews = reviews.length;
  
    const ratingCounts = [5, 4, 3, 2, 1].map(star => ({
        star,
        count: reviews.filter(review => review.rating === star).length,
        percentage: (reviews.filter(review => review.rating === star).length / totalReviews) * 100,
    }));

    return (
        <div className="p-4">
            <Helmet>
                <title>Đánh giá sản phẩm</title>
                <link rel="icon" href="../../src/assets/img/phone.ico" />
            </Helmet>

            {/* Row 1: Rating Overview */}
            <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-white rounded-lg border">
                <div className="flex flex-col items-center">
                    <Rating value={averageRating} readOnly stars={5} cancel={false} />
                    <span className="mt-2 text-2xl font-bold">{averageRating.toFixed(1)}/5</span>
                    <span className="mt-2">{totalReviews} người dùng đã đánh giá</span>
                    <Button 
                        label="Viết đánh giá" 
                        icon="pi pi-pencil"
                        className="p-button-primary mt-4 border p-2 bg-gray-200"
                        onClick={() => setVisible(true)}
                    />
                </div>
                <div>
                    {ratingCounts.map(({ star, percentage }) => (
                        <div key={star} className="flex items-center mb-1">
                            <Rating value={star} readOnly stars={5} cancel={false} className="mr-2" />
                            <div className="w-full bg-gray-200 rounded h-2">
                                <div 
                                    className="bg-yellow-400 h-2 rounded" 
                                    style={{ width: `${percentage}%` }}
                                />
                            </div>
                            <span className="ml-2">{percentage.toFixed(1)}%</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Row 2: Filters and Sort */}
            <div className="flex justify-between items-center mb-6 p-4 bg-white rounded-lg border">
                <div className="flex gap-2">
                    <Button 
                        label="Tất cả" 
                        className={`p-button-outlined border p-1 rounded-lg ${!selectedStars ? 'p-button-primary' : ''}`}
                        onClick={() => setSelectedStars(null)}
                    />
                    {[5, 4, 3, 2, 1].map(star => (
                        <Button
                            key={star}
                            label={`${star}`}
                            iconPos="right"
                            className={`p-button-outlined border p-1 rounded-lg ${selectedStars === star ? 'p-button-primary' : ''}`}
                            onClick={() => setSelectedStars(star)}
                        >
                            <i className="pi pi-star-fill text-yellow-400 ml-1" />
                        </Button>
                    ))}
                    <Button
                        icon="pi pi-image"
                        className={`p-button-outlined ${showImageOnly ? 'p-button-primary' : ''}`}
                        onClick={() => setShowImageOnly(!showImageOnly)}
                        tooltip="Hiển thị đánh giá có hình ảnh"
                    />
                </div>

                <OverlayPanel ref={op}>
                    <div className="flex flex-col gap-2">
                        <Link
                            to="#"
                            className={`${sortBy === 'newest' ? 'text-primary' : 'text-gray-700'} cursor-pointer hover:text-primary`}
                            onClick={() => handleSort('newest')}
                        >
                            Mới nhất
                        </Link>
                        <hr className="border-gray-200 my-1" />
                        <Link
                            to="#"
                            className={`${sortBy === 'highest' ? 'text-primary' : 'text-gray-700'} cursor-pointer hover:text-primary`}
                            onClick={() => handleSort('highest')}
                        >
                            Đánh giá cao
                        </Link>
                        <hr className="border-gray-200 my-1" />
                        <Link
                            to="#"
                            className={`${sortBy === 'lowest' ? 'text-primary' : 'text-gray-700'} cursor-pointer hover:text-primary`}
                            onClick={() => handleSort('lowest')}
                        >
                            Đánh giá thấp
                        </Link>
                    </div>
                </OverlayPanel>
                <Button
                    label="Sắp xếp"
                    icon="pi pi-sort-alt"
                    className="p-button-outlined"
                    onClick={(e) => op.current?.toggle(e)}
                />
            </div>

            {/* Row 3: Reviews List */}
            <div className="bg-white rounded-lg border p-4">
                {filteredReviews.map((review, index) => (
                    <div key={review.id} className="mb-4">
                        <div className="flex justify-between">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <strong>{review.name}</strong>
                                    <Rating value={review.rating} readOnly stars={5} cancel={false} />
                                    <span className="text-gray-500">{review.date}</span>
                                </div>
                                <p className="text-gray-700 mb-3">{review.comment}</p>
                            </div>
                            {review.images && review.images.length > 0 && (
                                <div className="flex gap-2 ml-4">
                                    {review.images.map((image, imgIndex) => (
                                        <img 
                                            key={imgIndex}
                                            src={image}
                                            alt={`Review image ${imgIndex + 1}`}
                                            className="w-20 h-20 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                                            onClick={() => {
                                                setSelectedReview(review);
                                                setShowImageDialog(true);
                                            }}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                        {index < filteredReviews.length - 1 && <hr className="border-gray-200 mt-4" />}
                    </div>
                ))}
            </div>

            {/* Review Dialog */}
            <Dialog header="Viết đánh giá" visible={visible} style={{ width: '50vw' }} onHide={() => setVisible(false)}>
                <div className="flex flex-col gap-4">
                    <Rating value={newReview.rating} onChange={(e) => setNewReview({...newReview, rating: e.value ?? 0})} stars={5} cancel={false} className='justify-center'/>
                    <InputTextarea 
                        value={newReview.comment} 
                        onChange={(e) => setNewReview({...newReview, comment: e.target.value})} 
                        rows={5} 
                        placeholder="Chia sẻ cảm nhận của bạn..." 
                        className='border'
                    />
                    
                    {showUploadError && (
                        <div className="p-3 bg-red-100 text-red-700 rounded">
                            {uploadError}
                        </div>
                    )}
                    
                    <label className="font-bold mb-2">Gửi ảnh thực tế (Tối đa 3 ảnh)</label>
                    <FileUpload
                        ref={fileUploadRef}
                        mode="advanced"
                        name="demo[]" 
                        url="./upload"
                        accept="image/*"
                        maxFileSize={1000000}
                        multiple
                        auto={false}
                        customUpload
                        chooseLabel="Chọn ảnh"
                        cancelLabel="Hủy"
                        uploadHandler={handleUpload}
                        uploadOptions={{ style: { display: 'none' } }}
                    />
                    <InputText value={newReview.name}  onChange={(e) => setNewReview({...newReview, name: e.target.value})}  placeholder="Họ và tên" required className='border p-2'/>
                    <InputText 
                        value={newReview.phone} 
                        onChange={(e) => setNewReview({...newReview, phone: e.target.value.replace(/\D/, '')})} 
                        placeholder="Số điện thoại" 
                        required 
                        type="tel" 
                        pattern="[0-9]*" 
                        inputMode="numeric"
                        className='border p-2'
                    />
                    <Button label="Gửi đánh giá" className="p-button-primary border p-2" onClick={handleSubmitClick} disabled={!newReview.rating || !newReview.name.trim() || !newReview.phone.trim()} />
                </div>
            </Dialog>

            {/* Image Dialog */}
            <Dialog 
                visible={showImageDialog} 
                onHide={() => setShowImageDialog(false)}
                header="Chi tiết đánh giá"
                maximizable
                style={{ width: '90vw' }}
            >
            <div className="grid grid-cols-2 gap-4">
                {/* Column 1: Image Galleria */}
                <div className="col-span-1">
                    {selectedReview && (
                        <Galleria 
                            value={selectedReview.images} 
                            item={itemTemplate} 
                            thumbnail={thumbnailTemplate}
                            numVisible={5}
                            style={{ maxWidth: '100%' }}
                            showThumbnails
                            showIndicators
                        />
                    )}
                </div>

                {/* Column 2: Review Details */}
                <div className="col-span-1 p-4">
                    {selectedReview && (
                        <>
                            <div className="flex items-center gap-2 mb-4">
                                <strong>{selectedReview.name}</strong>
                                <Rating value={selectedReview.rating} readOnly stars={5} cancel={false} />
                                <span className="text-gray-500">{selectedReview.date}</span>
                            </div>
                            <p className="text-gray-700">{selectedReview.comment}</p>
                        </>
                    )}
                </div>
            </div>
            </Dialog>            

        </div>
    );
};

export default UserProductReview;


