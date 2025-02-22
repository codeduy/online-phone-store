const Address = require('../models/addressModel');

exports.getProvinces = async (req, res) => {
    try {
        const provinces = await Address.find({}, 'name code'); // Only get name and code
        console.log('Provinces data:', provinces);
        res.json({
            success: true,
            data: provinces.map(province => ({
                label: province.name,
                value: province.code,
                code: province.code // Add this for consistency
            }))
        });
    } catch (error) {
        console.error('Error in getProvinces:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getDistricts = async (req, res) => {
    try {
        const { provinceCode } = req.params;
        console.log('Request params:', req.params);
        console.log('Received province code:', provinceCode);

        if (!provinceCode) {
            return res.status(400).json({
                success: false,
                message: 'Province code is required'
            });
        }

        const province = await Address.findOne({ code: provinceCode });
        console.log('Found province:', province);

        if (!province) {
            return res.status(404).json({
                success: false,
                message: `Province with code ${provinceCode} not found`
            });
        }

        const districts = province.districts || [];
        res.json({
            success: true,
            data: districts.map(district => ({
                label: district.name,
                value: district.code,
                code: district.code
            }))
        });
    } catch (error) {
        console.error('Error in getDistricts:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Lấy danh sách phường/xã dựa trên quận/huyện
exports.getWards = async (req, res) => {
    try {
        const { districtCode } = req.params;
        console.log('Fetching wards for district code:', districtCode);

        // Tìm province chứa district code này
        const province = await Address.findOne(
            { "districts.code": districtCode.toLowerCase() }
        );
        
        console.log('Found province:', province);

        if (!province) {
            return res.status(404).json({ 
                success: false, 
                message: `No province found containing district with code ${districtCode}` 
            });
        }

        // Tìm district trong province
        const district = province.districts.find(d => 
            d.code.toLowerCase() === districtCode.toLowerCase()
        );

        console.log('Found district:', district);

        if (!district) {
            return res.status(404).json({ 
                success: false, 
                message: `District with code ${districtCode} not found` 
            });
        }

        // Map wards data to required format
        const formattedWards = district.wards.map(ward => ({
            label: ward.name,
            value: ward.code,
            code: ward.code
        }));

        console.log('Formatted wards:', formattedWards);

        return res.json({
            success: true,
            data: formattedWards
        });

    } catch (error) {
        console.error('Error in getWards:', error);
        return res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};