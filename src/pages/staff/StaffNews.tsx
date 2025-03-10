import { useState } from 'react';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputTextarea } from 'primereact/inputtextarea';
import { FileUpload } from 'primereact/fileupload';
import { InputSwitch } from 'primereact/inputswitch';
import { Card } from 'primereact/card';

interface NewsItem {
    id: number;
    title: string;
    subtitle: string;
    content: string;
    banner: string;
    isEnabled: boolean;
}

const StaffNews = () => {
    const [newsList, setNewsList] = useState<NewsItem[]>([
        { id: 1, title: 'Event 1', subtitle: 'Subtitle 1', content: 'Content 1', banner: 'https://via.placeholder.com/100', isEnabled: true },
        { id: 2, title: 'Event 2', subtitle: 'Subtitle 2', content: 'Content 2', banner: 'https://via.placeholder.com/100', isEnabled: false },
        // Add more sample news items...
    ]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredNews, ] = useState<NewsItem[]>([]);
    const [showDialog, setShowDialog] = useState(false);
    const [newNews, setNewNews] = useState<NewsItem>({
        id: 0,
        title: '',
        subtitle: '',
        content: '',
        banner: '',
        isEnabled: true
    });

    // const handleSearch = () => {
    //     const filtered = newsList.filter(news =>
    //         news.title.includes(searchTerm) ||
    //         news.subtitle.includes(searchTerm) ||
    //         news.content.includes(searchTerm)
    //     );
    //     setFilteredNews(filtered);
    // };

    const handleAddNews = () => {
        setNewNews({
            id: newsList.length + 1,
            title: '',
            subtitle: '',
            content: '',
            banner: '',
            isEnabled: true
        });
        setShowDialog(true);
    };

    const handleSaveNews = () => {
        const updatedNewsList = newsList.map(news => news.id === newNews.id ? newNews : news);
        if (!updatedNewsList.includes(newNews)) {
            updatedNewsList.push(newNews);
        }
        setNewsList(updatedNewsList);
        setShowDialog(false);
    };

    const handleSwitchChange = (id: number) => {
        setNewsList(newsList.map(news => ({
            ...news,
            isEnabled: news.id === id ? !news.isEnabled : news.isEnabled
        })));
    };

    const handleDeleteNews = (id: number) => {
        setNewsList(newsList.filter(news => news.id !== id));
    };

    const handleFileUpload = (e: any) => {
        if (e.files.length > 1) {
            alert('Chỉ được upload tối đa 1 ảnh');
            return;
        }
        const file = e.files[0];
        const reader = new FileReader();
        reader.onload = (e: any) => {
            setNewNews({ ...newNews, banner: e.target.result });
            setNewsList(newsList.map(news => news.id === newNews.id ? { ...news, banner: e.target.result } : news));
        };
        reader.readAsDataURL(file);
    };

    const truncateText = (text: string, maxLength: number) => {
        if (text.length <= maxLength) {
            return text;
        }
        return text.substring(0, maxLength) + '...';
    };

    return (
        <div className="p-4">
            {/* First Row */}
            <div className="flex justify-between mb-4">
                <InputText 
                    value={searchTerm} 
                    onChange={(e) => setSearchTerm(e.target.value)} 
                    placeholder="Tìm kiếm tin tức" 
                    className="mr-2 p-2 border"
                />
                <Button label="Thêm tin tức" onClick={handleAddNews} className='p-2 border'/>
            </div>

            {/* Second Row */}
            <Card className="shadow-lg">
                <DataTable value={filteredNews.length > 0 ? filteredNews : newsList} responsiveLayout="scroll">
                    <Column field="id" header="Mã sự kiện" />
                    <Column 
                        field="title" 
                        header="Tiêu đề sự kiện" 
                        body={(rowData) => truncateText(rowData.title, 50)}
                    />
                    <Column 
                        field="content" 
                        header="Nội dung sự kiện" 
                        body={(rowData) => truncateText(rowData.content, 100)}
                    />
                    <Column field="banner" header="Hình ảnh banner" body={(rowData) => <img src={rowData.banner} alt="Banner" style={{ width: '100px' }} />} />
                    <Column 
                        header="Trạng thái" 
                        body={(rowData) => (
                            <InputSwitch 
                                checked={rowData.isEnabled} 
                                onChange={() => handleSwitchChange(rowData.id)} 
                            />
                        )} 
                    />
                    <Column 
                        header="Thao tác" 
                        body={(rowData) => (
                            <div className="flex gap-2">
                                <Button 
                                    icon="pi pi-pencil" 
                                    className="p-button-rounded p-button-text" 
                                    onClick={() => {
                                        setNewNews(rowData);
                                        setShowDialog(true);
                                    }} 
                                />
                                <Button 
                                    icon="pi pi-trash" 
                                    className="p-button-rounded p-button-danger p-button-text" 
                                    onClick={() => handleDeleteNews(rowData.id)} 
                                />
                            </div>
                        )} 
                    />
                </DataTable>
            </Card>

            {/* Dialog for adding/editing news */}
            <Dialog header="Thêm tin tức" visible={showDialog} onHide={() => setShowDialog(false)} style={{ width: '50vw' }}>
                <div className="flex flex-col gap-4">
                    <div>
                        <label htmlFor="title" className="block pb-1">Tiêu đề tin tức</label>
                        <InputText 
                            id="title" 
                            value={newNews.title} 
                            onChange={(e) => setNewNews({ ...newNews, title: e.target.value })} 
                            className="p-inputtext-sm w-full border p-2"
                        />
                    </div>
                    <div>
                        <label htmlFor="subtitle" className="block pb-1">Chú thích tiêu đề</label>
                        <InputText 
                            id="subtitle" 
                            value={newNews.subtitle} 
                            onChange={(e) => setNewNews({ ...newNews, subtitle: e.target.value })} 
                            className="p-inputtext-sm w-full border p-2"
                        />
                    </div>
                    <div>
                        <label htmlFor="content" className="block pb-1">Nội dung</label>
                        <InputTextarea 
                            id="content" 
                            value={newNews.content} 
                            onChange={(e) => setNewNews({ ...newNews, content: e.target.value })} 
                            className="p-inputtext-sm w-full border p-2"
                        />
                    </div>
                    <div>
                        <label htmlFor="banner" className="block pb-1">Hình ảnh banner</label>
                        <FileUpload 
                            name="banner" 
                            customUpload 
                            uploadHandler={handleFileUpload} 
                            accept="image/*" 
                            maxFileSize={1000000} 
                            mode="advanced" 
                            auto 
                            chooseLabel="Chọn ảnh"
                        />
                    </div>
                    <Button label="Lưu" onClick={handleSaveNews} className="p-button-secondary border p-2 hover:bg-green-500 hover:text-white mt-0" />
                </div>
            </Dialog>
        </div>
    );
};

export default StaffNews;