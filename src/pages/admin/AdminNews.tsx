import { useState, useEffect, useCallback } from 'react';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputTextarea } from 'primereact/inputtextarea';
import { FileUpload } from 'primereact/fileupload';
// import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { InputSwitch } from 'primereact/inputswitch';
import { Card } from 'primereact/card';
import axios from 'axios';
import { debounce } from 'lodash';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";

interface NewsEvent {
    _id: string;
    title: string;
    sub_title: string;
    image: string;
    type: 'promotion' | 'tech';
    staff_id: string;
    start_date: Date | null;
    status: string;
    link: string;
    is_external_link: boolean;
    meta: string;
}

interface DecodedToken {
    exp: number;
    role: string;
    id?: string;
    [key: string]: any;
}

const AdminNews = () => {
    const [newsList, setNewsList] = useState<NewsEvent[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredNews, setFilteredNews] = useState<NewsEvent[]>([]);
    const [showDialog, setShowDialog] = useState(false);
    const [selectedType] = useState<'promotion' | 'tech'>('promotion');
    const [newNews, setNewNews] = useState<NewsEvent>({
        _id: '',
        title: '',
        sub_title: '',
        image: '',
        type: 'promotion',
        staff_id: '',
        start_date: new Date(), 
        status: 'true',
        link: '',
        is_external_link: false,
        meta: ''
    });
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [newsToDelete, setNewsToDelete] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const verifyToken = useCallback(() => {
        const token = localStorage.getItem('adminToken');
        if (!token) {
            navigate('/admin/login', { 
                state: { message: 'Vui lòng đăng nhập để thao tác' } 
            });
            return false;
        }

        try {
            const decoded = jwtDecode<DecodedToken>(token);
            if (decoded.exp * 1000 < Date.now()) {
                localStorage.removeItem('adminToken');
                localStorage.removeItem('adminUser');
                navigate('/admin/login', { 
                    state: { message: 'Phiên đăng nhập đã hết hạn' } 
                });
                return false;
            }

            if (decoded.role !== 'admin') {
                navigate('/admin/login', { 
                    state: { message: 'Bạn không có quyền truy cập' } 
                });
                return false;
            }

            return true;
        } catch (error) {
            console.error('Token verification error:', error);
            localStorage.removeItem('adminToken');
            localStorage.removeItem('adminUser');
            navigate('/admin/login', { 
                state: { message: 'Phiên đăng nhập không hợp lệ' } 
            });
            return false;
        }
    }, [navigate]);

    // Add token check on component mount
    useEffect(() => {
        verifyToken();
    }, [verifyToken]);


    const debouncedSearch = useCallback(
        debounce(async (searchValue: string) => {
            if (!verifyToken()) return;
            try {
                setLoading(true);
                const token = localStorage.getItem('adminToken');
                
                if (!searchValue.trim()) {
                    setFilteredNews([]);
                    return;
                }

                const response = await axios.get(
                    `/admin/news/search?query=${searchValue}`,
                    {
                        headers: { Authorization: `Bearer ${token}` }
                    }
                );

                if (response.data.success) {
                    setFilteredNews(response.data.data);
                    setSearchTerm(searchValue);
                }
            } catch (error) {
                if (axios.isAxiosError(error) && error.response?.status === 401) {
                    navigate('/admin/login', { 
                        state: { message: 'Phiên đăng nhập đã hết hạn' } 
                    });
                }
                console.error('Error searching news:', error);
            } finally {
                setLoading(false);
            }
        }, 1000),
        []
    );

    const handleSearch = (value: string) => {
        setSearchTerm(value);
        debouncedSearch(value);
    };

    useEffect(() => {
        fetchNews();
    }, []);

    const fetchNews = async () => {
        if (!verifyToken()) return;
        try {
            setLoading(true);
            const token = localStorage.getItem('adminToken');
            console.log('Fetching news with token:', token);
    
            if (!token) {
                console.error('No token found');
                return;
            }
    
            const response = await axios.get('/admin/news', {
                headers: { 
                    Authorization: `Bearer ${token}`
                }
            });
    
            console.log('Raw response:', response);
            
            if (!response.data) {
                console.error('No data in response');
                return;
            }
    
            console.log('Fetched news data:', response.data);
            
            // Transform dates to Date objects
            const formattedNews = response.data.map((news: NewsEvent) => ({
                ...news,
                start_date: news.start_date ? new Date(news.start_date) : null,
                // end_date: news.end_date ? new Date(news.end_date) : null
            }));
    
            console.log('Formatted news:', formattedNews);
            setNewsList(formattedNews);
    
        } catch (error) {
            if (axios.isAxiosError(error) && error.response?.status === 401) {
                navigate('/admin/login', { 
                    state: { message: 'Phiên đăng nhập đã hết hạn' } 
                });
            }
            console.error('Error fetching news:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (id: string, currentStatus: string) => {
        try {
            const token = localStorage.getItem('adminToken');
            const newStatus = currentStatus === 'true' ? 'false' : 'true';
            
            await axios.put(
                `/admin/news/${id}`,
                { status: newStatus },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
    
            // Refresh news list
            fetchNews();
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    // const handleSearch = () => {
    //     const filtered = newsList.filter(news =>
    //         news.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    //         news.sub_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    //         news.meta.toLowerCase().includes(searchTerm.toLowerCase())
    //     );
    //     setFilteredNews(filtered);
    // };

    const handleAddNews = () => {
        setNewNews({
            _id: '',
            title: '',
            sub_title: '',
            image: '',
            type: selectedType,
            staff_id: '', // Will be set in backend
            start_date: new Date(),
            // end_date: null,
            status: 'true',
            link: '',
            is_external_link: false,
            meta: ''
        });
        setShowDialog(true);
    };

    const handleFileUpload = async (event: any) => {
        if (!verifyToken()) return;
        try {
            const token = localStorage.getItem('adminToken');
            const file = event.files[0];
            const formData = new FormData();
            formData.append('image', file);

            const response = await axios.post('/admin/news/upload', formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            setNewNews({ ...newNews, image: response.data.imagePath });
        } catch (error) {
            console.error('Error uploading image:', error);
        }
    };

    const handleSaveNews = async () => {
        if (!verifyToken()) return;
        try {
            const token = localStorage.getItem('adminToken');
            if (!token) {
                console.error('No token found');
                return;
            }
    
            // Validate required fields
            if (!newNews.title || !newNews.sub_title || !newNews.link) {
                console.error('Missing required fields');
                return;
            }
    
            // Format the data before sending
            const formattedNews = {
                title: newNews.title.trim(),
                sub_title: newNews.sub_title.trim(),
                image: newNews.image,
                type: newNews.type,
                start_date: new Date().toISOString(), // Set to current date
                status: newNews.status,
                link: newNews.link.trim(),
                is_external_link: newNews.is_external_link,
                meta: newNews.meta.trim()
            };
    
            console.log('Sending news data:', formattedNews);
    
            const method = newNews._id ? 'put' : 'post';
            const url = newNews._id 
                ? `/admin/news/${newNews._id}`
                : '/admin/news';
    
            const response = await axios[method](
                url, 
                formattedNews,
                {
                    headers: { 
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
    
            if (response.data.success) {
                fetchNews();
                setShowDialog(false);
                // Show success message
                alert('Lưu tin tức thành công');
            }
        } catch (error) {
            if (axios.isAxiosError(error) && error.response?.status === 401) {
                navigate('/admin/login', { 
                    state: { message: 'Phiên đăng nhập đã hết hạn' } 
                });
            }
            console.error('Error saving news:', error);
        }
    };

    const handleDeleteNews = async (id: string) => {
        if (!verifyToken()) return;
        setNewsToDelete(id);
        setShowDeleteDialog(true);
    };

    const confirmDelete = async () => {
        if (!newsToDelete) return;
        
        try {
            const token = localStorage.getItem('adminToken');
            await axios.delete(`/admin/news/${newsToDelete}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchNews();
            setShowDeleteDialog(false);
            setNewsToDelete(null);
        } catch (error) {
            console.error('Error deleting news:', error);
        }
    };

    return (
        <div style={{ padding: '1rem' }}>
            <Helmet>
                <title>Quản lí tin tức và sự kiện</title>
                <link rel="icon" href="../../src/assets/img/phone.ico" />
            </Helmet>
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-4">
                    <InputText 
                        value={searchTerm} 
                        onChange={(e) => handleSearch(e.target.value)} 
                        placeholder="Tìm kiếm tin tức..." 
                        className="w-96 px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors duration-200"
                    />
                </div>
                <Button 
                    label="Thêm tin tức" 
                    icon="pi pi-plus"
                    onClick={handleAddNews} 
                    className="px-4 py-2 bg-blue-600 text-white border border-blue-600 rounded-lg hover:bg-blue-700 hover:border-blue-700 transition-colors duration-200"
                />
            </div>

            <Card style={{ boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}>
                <DataTable 
                    value={searchTerm.trim().length > 0 ? filteredNews : newsList} 
                    responsiveLayout="scroll" 
                    loading={loading} 
                    emptyMessage="Không tìm thấy tin tức nào"
                    className="p-datatable-lg"
                >
                    <Column 
                        header="Hình ảnh" 
                        body={(rowData) => (
                            <img 
                                src={`${import.meta.env.VITE_IMAGE_URL}${rowData.image}`} 
                                alt={rowData.title}
                                style={{ width: '100px', height: '60px', objectFit: 'cover' }}
                            />
                        )} 
                    />
                    <Column field="title" header="Tiêu đề" style={{ width: '25%' }} />
                    <Column field="sub_title" header="Mô tả" style={{ width: '30%' }} />
                    <Column 
                        field="type" 
                        header="Loại" 
                        body={(rowData) => rowData.type === 'promotion' ? 'Khuyến mãi' : 'Công nghệ'} 
                    />
                    <Column 
                        field="start_date" 
                        header="Ngày cập nhật" 
                        body={(rowData) => rowData.start_date ? 
                            new Date(rowData.updated_at).toLocaleDateString('vi-VN') : 'N/A'
                        } 
                    />
                    <Column 
                        field="status" 
                        header="Trạng thái" 
                        body={(rowData) => (
                            <InputSwitch 
                                checked={rowData.status === 'true'} 
                                onChange={() => handleStatusChange(rowData._id, rowData.status)} 
                            />
                        )} 
                    />
                    <Column 
                        header="Thao tác" 
                        body={(rowData) => (
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <Button 
                                    icon="pi pi-pencil" 
                                    className="p-button-rounded p-button-text shadow-md hover:text-blue-600 hover:bg-blue-50    " 
                                    onClick={() => {
                                        setNewNews(rowData);
                                        setShowDialog(true);
                                    }} 
                                    tooltip='Sửa'
                                />
                                <Button 
                                    icon="pi pi-trash" 
                                    className="p-button-rounded p-button-danger p-button-text shadow-md hover:text-red-600 hover:bg-red-50 text-red-500" 
                                    onClick={() => handleDeleteNews(rowData._id)} 
                                    tooltip='Xóa'
                                />
                            </div>
                        )} 
                    />
                </DataTable>
            </Card>

            <Dialog 
                header={newNews._id ? "Sửa tin tức" : "Thêm tin tức"} 
                visible={showDialog} 
                onHide={() => setShowDialog(false)} 
                className="w-[90vw] max-w-3xl rounded-lg shadow-lg border border-gray-200"
                pt={{
                    root: { className: 'border rounded-lg shadow-lg' },
                    header: { className: 'text-xl font-semibold text-gray-800 p-4 border-b bg-gray-50' },
                    content: { className: 'p-6' },
                    footer: { className: 'flex gap-2 justify-end p-4 bg-gray-50 border-t' }
                }}
            >
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                        <label className="font-medium text-gray-700">Tiêu đề</label>
                        <InputText 
                            value={newNews.title} 
                            onChange={(e) => setNewNews({ ...newNews, title: e.target.value })} 
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors duration-200"
                        />
                    </div>
                    <div>
                        <label htmlFor="sub_title" style={{ display: 'block', paddingBottom: '0.25rem' }}>Mô tả ngắn</label>
                        <InputTextarea 
                            id="sub_title" 
                            value={newNews.sub_title} 
                            onChange={(e) => setNewNews({ ...newNews, sub_title: e.target.value })} 
                            style={{ width: '100%', border: '1px solid #e2e8f0', padding: '0.5rem' }}
                            className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors duration-200'
                        />
                    </div>
                    <div>
                        <label htmlFor="type" style={{ display: 'block', paddingBottom: '0.25rem' }}>Loại tin tức</label>
                        <Dropdown
                            id="type"
                            value={newNews.type}
                            options={[
                                { label: 'Khuyến mãi', value: 'promotion' },
                                { label: 'Công nghệ', value: 'tech' }
                            ]}
                            onChange={(e) => setNewNews({ ...newNews, type: e.value })}
                            style={{ width: '100%', border: '1px solid #e2e8f0' }}
                        />
                    </div>
                    <div>
                        <label htmlFor="link" style={{ display: 'block', paddingBottom: '0.25rem' }}>Link bài viết</label>
                        <InputText 
                            id="link" 
                            value={newNews.link} 
                            onChange={(e) => setNewNews({ ...newNews, link: e.target.value })} 
                            style={{ width: '100%', border: '1px solid #e2e8f0', padding: '0.5rem' }}
                            className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors duration-200'
                        />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <InputSwitch
                            checked={newNews.is_external_link}
                            onChange={(e) => setNewNews({ ...newNews, is_external_link: e.value })}
                        />
                        <label>Link ngoài</label>
                    </div>
                    <div>
                        <label htmlFor="meta" style={{ display: 'block', paddingBottom: '0.25rem' }}>Meta tags</label>
                        <InputText 
                            id="meta" 
                            value={newNews.meta} 
                            onChange={(e) => setNewNews({ ...newNews, meta: e.target.value })} 
                            style={{ width: '100%', border: '1px solid #e2e8f0', padding: '0.5rem' }}
                            placeholder="Các tag cách nhau bởi dấu phẩy"
                            className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors duration-200'
                        />
                    </div>
                    <div>
                        <label htmlFor="image" style={{ display: 'block', paddingBottom: '0.25rem' }}>Hình ảnh</label>
                        <FileUpload
                            name="image"
                            url={`/admin/news/upload`}
                            accept="image/*"
                            maxFileSize={1000000}
                            customUpload
                            uploadHandler={handleFileUpload}
                            chooseLabel="Chọn ảnh"
                            pt={{
                                content: { className: 'border border-gray-300 rounded-lg' },
                                chooseButton: { 
                                    className: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100 transition-colors duration-200 rounded-lg px-4 py-2' 
                                }
                            }}
                        />
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <Button
                            label="Lưu"
                            onClick={handleSaveNews}
                            style={{ backgroundColor: '#4CAF50', color: '#fff', padding: '0.5rem 2rem', border: '1px solid #4CAF50' }}
                        />
                    </div>
                </div>
            </Dialog>

            <Dialog 
                header="Xác nhận xóa" 
                visible={showDeleteDialog} 
                onHide={() => setShowDeleteDialog(false)}
                className="w-[90vw] max-w-md rounded-lg shadow-lg border border-gray-200"
                pt={{
                    root: { className: 'border rounded-lg shadow-lg' },
                    header: { className: 'text-xl font-semibold text-gray-800 p-4 border-b bg-gray-50' },
                    content: { className: 'p-6 flex flex-col items-center gap-4' },
                    footer: { className: 'flex justify-end gap-3 p-4 bg-gray-50 border-t' }
                }}
            >
                <div className="flex flex-col items-center gap-4">
                    <i className="pi pi-exclamation-triangle text-5xl text-yellow-500" />
                    <p className="text-center text-gray-600">
                        Bạn có chắc chắn muốn xóa tin tức này?
                    </p>
                </div>
                <div className="flex justify-end gap-3">
                    <Button 
                        label="Hủy" 
                        icon="pi pi-times" 
                        onClick={() => setShowDeleteDialog(false)} 
                        className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 transition-colors duration-200"
                    /> 
                    <Button 
                        label="Xóa" 
                        icon="pi pi-trash" 
                        onClick={confirmDelete} 
                        className="px-4 py-2 bg-white text-red-600 border border-red-300 rounded-lg hover:bg-red-50 hover:border-red-400 transition-colors duration-200"
                    />
                </div>
            </Dialog>
        </div>
    );
};

export default AdminNews;