const moment = require('moment');
const querystring = require('qs');
const crypto = require('crypto');
const Order = require('../models/orderModel');

const config = {
    vnp_TmnCode: "V1NZAH7F",
    vnp_HashSecret: "NSFN5F18QP69E778WY7PLUT2X59X6QLO",
    vnp_Url: "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html",
    vnp_ReturnUrl: "http://localhost:3000/api/vnpay/payment/return",
    vnp_ApiUrl: "http://sandbox.vnpayment.vn/merchant_webapi/merchant.html"
};

function sortObject(obj) {
    let sorted = {};
    const str = [];
    
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            str.push(encodeURIComponent(key));
        }
    }
    
    str.sort();
    
    for (key = 0; key < str.length; key++) {
        sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
    }
    
    return sorted;
}

const vnpayController = {
    createPaymentUrl: async (req, res) => {
        try {
            const { amount, orderId } = req.body;

            // Kiểm tra trạng thái đơn hàng
            const order = await Order.findById(orderId);
            if (!order) {
                return res.status(404).json({
                    code: '99',
                    message: 'Không tìm thấy đơn hàng'
                });
            }

            if (order.status !== 'pending') {
                return res.status(400).json({
                    code: '99',
                    message: 'Đơn hàng không thể thanh toán lại'
                });
            }
            
            let date = new Date();
            let createDate = moment(date).format('YYYYMMDDHHmmss');

            // const amountInt = Math.round(amount);
            
            let vnp_Params = {};
            vnp_Params['vnp_Version'] = '2.1.0';
            vnp_Params['vnp_Command'] = 'pay';
            vnp_Params['vnp_TmnCode'] = config.vnp_TmnCode;
            vnp_Params['vnp_Locale'] = 'vn';
            vnp_Params['vnp_CurrCode'] = 'VND';
            vnp_Params['vnp_TxnRef'] = moment(date).format('HHmmss');
            vnp_Params['vnp_OrderInfo'] = `order_${orderId}`;
            vnp_Params['vnp_OrderType'] = 'billpayment';
            vnp_Params['vnp_Amount'] = parseInt(amount) * 100; 
            vnp_Params['vnp_ReturnUrl'] = config.vnp_ReturnUrl;
            vnp_Params['vnp_IpAddr'] = req.ip || '127.0.0.1';
            vnp_Params['vnp_CreateDate'] = createDate;
            
            vnp_Params = sortObject(vnp_Params);
            
            const signData = querystring.stringify(vnp_Params, { encode: false });
            const hmac = crypto.createHmac("sha512", config.vnp_HashSecret);
            const signed = hmac.update(new Buffer.from(signData, 'utf-8')).digest("hex"); 
            
            vnp_Params['vnp_SecureHash'] = signed;

            const vnpUrl = config.vnp_Url + "?" + querystring.stringify(vnp_Params, { encode: false });

            return res.json({
                code: '00',
                data: vnpUrl
            });

        } catch (error) {
            console.error('VNPay URL creation error:', error);
            return res.status(500).json({
                code: '99',
                message: 'Không thể tạo URL thanh toán'
            });
        }
    },

    vnpayReturn: async (req, res) => {
        try {
            let vnp_Params = req.query;
            const secureHash = vnp_Params['vnp_SecureHash'];
            
            delete vnp_Params['vnp_SecureHash'];
            delete vnp_Params['vnp_SecureHashType'];

            vnp_Params = sortObject(vnp_Params);
            
            const signData = querystring.stringify(vnp_Params, { encode: false });
            const hmac = crypto.createHmac("sha512", config.vnp_HashSecret);
            const signed = hmac.update(new Buffer.from(signData, 'utf-8')).digest("hex");

            if (secureHash === signed) {
                const responseCode = vnp_Params['vnp_ResponseCode'];
                const orderInfo = vnp_Params['vnp_OrderInfo'];
                // Safely extract orderId - handle cases where orderInfo might be undefined
                let orderId;
                if (orderInfo && orderInfo.includes('order_')) {
                    orderId = orderInfo.split('order_')[1];
                } else if (orderInfo) {
                    orderId = orderInfo; // Use the whole string if it doesn't contain 'order_'
                } else {
                    throw new Error('Invalid order information');
                }

                const amount = parseInt(vnp_Params['vnp_Amount']) / 100;

                try {
                    if (responseCode === '00') {
                        // Cập nhật trạng thái đơn hàng thành công
                        await Order.findByIdAndUpdate(orderId, {
                            status: 'paid',
                            payment_status: 'paid',
                            payment_method: 'vnpay',
                            paid_amount: amount,
                            vnpay_transaction_no: vnp_Params['vnp_TransactionNo']
                        });

                        return res.redirect(`http://localhost:5173/payment-result?status=success&amount=${amount}`);
                    } else {
                        // Cập nhật trạng thái đơn hàng thất bại
                        await Order.findByIdAndUpdate(orderId, {
                            status: 'pending',
                            payment_status: 'failed',
                            payment_method: 'vnpay'
                        });

                        return res.redirect('http://localhost:5173/payment-result?status=failed');
                    }
                } catch (dbError) {
                    console.error('Database update error:', dbError);
                    return res.redirect('http://localhost:5173/payment-result?status=error&message=database_error');
                }
            } else {
                return res.redirect('http://localhost:5173/payment-result?status=error&message=invalid_signature');
            }
        } catch (error) {
            console.error('VNPay return error:', error);
            return res.redirect('http://localhost:5173/payment-result?status=error&message=server_error');
        }
    },

    vnpayIPN: async (req, res) => {
        let vnp_Params = req.query;
        let secureHash = vnp_Params['vnp_SecureHash'];
        
        delete vnp_Params['vnp_SecureHash'];
        delete vnp_Params['vnp_SecureHashType'];
    
        vnp_Params = sortObject(vnp_Params);
        
        let secretKey = config.vnp_HashSecret;
        let signData = querystring.stringify(vnp_Params, { encode: false });
        let hmac = crypto.createHmac("sha512", secretKey);
        let signed = hmac.update(new Buffer.from(signData, 'utf-8')).digest("hex");
        
        if(secureHash === signed){
            let orderId = vnp_Params['vnp_TxnRef'];
            let rspCode = vnp_Params['vnp_ResponseCode'];
            
            // Kiểm tra payment status
            if(rspCode === '00') {
                // Payment success
                res.status(200).json({RspCode: '00', Message: 'Success'});
            } else {
                // Payment failed
                res.status(200).json({RspCode: '99', Message: 'Payment failed'});
            }
        } else {
            res.status(200).json({RspCode: '97', Message: 'Invalid signature'});
        }
    }
};



module.exports = vnpayController;