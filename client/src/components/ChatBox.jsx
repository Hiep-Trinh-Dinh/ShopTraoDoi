import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Bot, Smile, Paperclip } from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';
import { WEBSITE_DATA } from '../data/websiteData';
import API_BASE_URL from '../utils/apiConfig';

// Thay thế API_KEY bằng key của bạn
const API_KEY = "AIzaSyC-hqlk1hXU6jh-m5J-PnxaPaCSMCb_5hE"; // Thay thế bằng key thật của bạn
const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

// Hệ thống câu trả lời mẫu cho các chức năng
const RESPONSE_TEMPLATES = {
    greeting: {
        keywords: ['xin chào', 'hello', 'hi', 'chào', 'alo'],
        response: `Xin chào! Tôi là trợ lý AI của ShopTraoDoi. Tôi có thể giúp bạn với các chức năng sau:

1. Đăng ký/Đăng nhập tài khoản
2. Xem và quản lý giỏ hàng
3. Thanh toán đơn hàng
4. Tạo và quản lý phòng trao đổi
5. Tìm kiếm và xem sản phẩm
6. Quản lý đơn hàng

Bạn cần hỗ trợ về vấn đề nào?`
    },
    register: {
        keywords: ['đăng ký', 'register', 'tạo tài khoản', 'sign up'],
        response: `Để đăng ký tài khoản ShopTraoDoi, bạn cần thực hiện các bước sau:

1. Truy cập trang Đăng ký
2. Điền đầy đủ thông tin cá nhân:
   - Họ và tên
   - Email
   - Mật khẩu (tối thiểu 6 ký tự)
   - Số điện thoại
3. Xác nhận email
4. Hoàn tất đăng ký

Sau khi đăng ký thành công, bạn có thể đăng nhập và sử dụng tất cả tính năng của ShopTraoDoi.`
    },
    login: {
        keywords: ['đăng nhập', 'login', 'sign in', 'đăng nhập vào'],
        response: `Để đăng nhập vào ShopTraoDoi, bạn cần:

1. Truy cập trang Đăng nhập
2. Nhập email và mật khẩu đã đăng ký
3. Nhấn nút "Đăng nhập"

Nếu quên mật khẩu:
1. Nhấn vào "Quên mật khẩu"
2. Nhập email đăng ký
3. Làm theo hướng dẫn trong email để đặt lại mật khẩu`
    },
    cart: {
        keywords: ['giỏ hàng', 'cart', 'thêm vào giỏ', 'xóa khỏi giỏ'],
        response: `Hướng dẫn sử dụng giỏ hàng:

1. Thêm sản phẩm vào giỏ:
   - Xem chi tiết sản phẩm
   - Chọn số lượng
   - Nhấn "Thêm vào giỏ"

2. Quản lý giỏ hàng:
   - Xem danh sách sản phẩm
   - Thay đổi số lượng
   - Xóa sản phẩm
   - Tiến hành thanh toán

3. Lưu ý:
   - Giỏ hàng sẽ được lưu khi bạn đăng nhập
   - Sản phẩm trong giỏ sẽ được giữ 24 giờ
   - Bạn có thể thêm tối đa 10 sản phẩm vào giỏ`
    },
    checkout: {
        keywords: ['thanh toán', 'checkout', 'đặt hàng', 'mua hàng'],
        response: `Quy trình thanh toán tại ShopTraoDoi:

1. Kiểm tra giỏ hàng:
   - Xem lại danh sách sản phẩm
   - Kiểm tra số lượng
   - Xác nhận tổng tiền

2. Nhập thông tin giao hàng:
   - Địa chỉ nhận hàng
   - Số điện thoại liên hệ
   - Ghi chú (nếu có)

3. Chọn phương thức thanh toán:
   - Thanh toán khi nhận hàng
   - Chuyển khoản ngân hàng
   - Ví điện tử

4. Xác nhận đơn hàng:
   - Kiểm tra lại thông tin
   - Nhấn "Đặt hàng"`
    },
    exchange: {
        keywords: ['trao đổi', 'trade', 'exchange', 'đổi đồ', 'swap'],
        response: `Hướng dẫn quy trình trao đổi trên ShopTraoDoi:

1. CHUẨN BỊ TRAO ĐỔI:
   - Đăng sản phẩm muốn trao đổi lên hệ thống
   - Chụp ảnh rõ nét, đầy đủ các góc
   - Mô tả chi tiết tình trạng sản phẩm
   - Định giá sản phẩm hợp lý
   - Nêu rõ nhu cầu muốn trao đổi

2. TÌM KIẾM ĐỐI TÁC:
   - Tìm sản phẩm phù hợp trên hệ thống
   - Xem thông tin và đánh giá người dùng
   - Liên hệ thông qua chat để trao đổi thông tin
   - Thảo luận về điều kiện trao đổi

3. XÁC NHẬN TRAO ĐỔI:
   - Kiểm tra kỹ thông tin hai bên
   - Thống nhất phương thức giao dịch
   - Chọn địa điểm giao dịch an toàn
   - Xác nhận thời gian trao đổi`
    },
    room: {
        keywords: ['phòng', 'room', 'tạo phòng', 'tham gia phòng', 'phòng trao đổi'],
        response: `Hướng dẫn sử dụng phòng trao đổi trên ShopTraoDoi:

1. TẠO PHÒNG TRAO ĐỔI:
   a) Truy cập trang "Trao đổi":
      - Nhấn nút "+" để tạo phòng mới
      - Hoặc chọn "Tạo phòng trao đổi" từ menu

   b) Thiết lập thông tin phòng:
      - Tên phòng ngắn gọn, dễ hiểu
      - Chọn danh mục sản phẩm
      - Thêm mô tả chi tiết về nhu cầu
      - Đặt thời hạn phòng (tối đa 7 ngày)

   c) Chọn sản phẩm để trao đổi:
      - Chọn từ danh sách sản phẩm đã đăng
      - Hoặc đăng sản phẩm mới ngay lập tức
      - Có thể chọn nhiều sản phẩm

2. QUẢN LÝ PHÒNG TRAO ĐỔI:
   a) Xem yêu cầu tham gia:
      - Kiểm tra sản phẩm được đề xuất
      - Xem thông tin người đề xuất
      - Chat trực tiếp với người đề xuất

   b) Xử lý yêu cầu:
      - Chấp nhận hoặc từ chối đề xuất
      - Đàm phán điều kiện qua chat
      - Chọn phương thức giao dịch

3. THAM GIA PHÒNG TRAO ĐỔI:
   a) Tìm phòng phù hợp:
      - Duyệt danh sách phòng đang mở
      - Lọc theo danh mục/giá trị
      - Xem chi tiết các phòng

   b) Gửi yêu cầu tham gia:
      - Chọn sản phẩm muốn trao đổi
      - Gửi tin nhắn giới thiệu
      - Chờ phản hồi từ chủ phòng

4. HOÀN TẤT GIAO DỊCH:
   a) Xác nhận trao đổi:
      - Kiểm tra sản phẩm trực tiếp
      - Chụp ảnh làm bằng chứng
      - Ký xác nhận giao dịch

   b) Kết thúc:
      - Đánh giá người trao đổi
      - Đóng phòng trao đổi
      - Cập nhật trạng thái sản phẩm

5. LƯU Ý AN TOÀN:
   - Luôn giao dịch tại địa điểm công cộng
   - Kiểm tra kỹ sản phẩm trước khi trao đổi
   - Chụp ảnh/quay video làm bằng chứng
   - Báo cáo ngay hành vi đáng ngờ
   - Không trao đổi các mặt hàng cấm

Bạn cần hỗ trợ thêm về bước nào trong quy trình trao đổi?`
    },
    trading_help: {
        keywords: ['hướng dẫn trao đổi', 'cách trao đổi', 'quy trình trao đổi'],
        response: `Để thực hiện trao đổi trên ShopTraoDoi, bạn có 2 cách:

1. TRAO ĐỔI TRỰC TIẾP:
   - Tìm sản phẩm muốn trao đổi
   - Chat với người bán
   - Thỏa thuận điều kiện
   - Gặp trực tiếp để trao đổi

2. TẠO PHÒNG TRAO ĐỔI:
   - Tạo phòng mới
   - Đăng sản phẩm muốn trao đổi
   - Chờ người khác tham gia
   - Chọn đề xuất phù hợp

Bạn muốn thực hiện theo cách nào? Tôi sẽ hướng dẫn chi tiết từng bước.`
    },
    product: {
        keywords: ['sản phẩm', 'product', 'tìm kiếm', 'xem sản phẩm'],
        response: `Hướng dẫn tìm kiếm và xem sản phẩm:

1. Tìm kiếm sản phẩm:
   - Sử dụng thanh tìm kiếm
   - Lọc theo danh mục
   - Lọc theo giá
   - Lọc theo tình trạng
   - Lọc theo khoảng cách

2. Xem chi tiết sản phẩm:
   - Hình ảnh sản phẩm
   - Mô tả chi tiết
   - Giá và điều kiện trao đổi
   - Thông tin người bán
   - Đánh giá và bình luận

3. Tương tác với sản phẩm:
   - Thêm vào giỏ hàng
   - Lưu vào danh sách yêu thích
   - Chia sẻ sản phẩm
   - Báo cáo sản phẩm vi phạm`
    },
    order: {
        keywords: ['đơn hàng', 'order', 'lịch sử đơn hàng', 'theo dõi đơn hàng'],
        response: `Hướng dẫn quản lý đơn hàng:

1. Xem danh sách đơn hàng:
   - Truy cập trang "Đơn hàng của tôi"
   - Xem trạng thái đơn hàng
   - Chi tiết từng đơn hàng

2. Theo dõi đơn hàng:
   - Mã đơn hàng
   - Thời gian đặt hàng
   - Trạng thái vận chuyển
   - Thông tin người giao hàng

3. Quản lý đơn hàng:
   - Hủy đơn hàng (nếu chưa thanh toán)
   - Đánh giá sản phẩm
   - Báo cáo vấn đề`
    },
    default: {
        response: `Tôi có thể giúp bạn với các chức năng sau:

1. Đăng ký/Đăng nhập tài khoản
2. Xem và quản lý giỏ hàng
3. Thanh toán đơn hàng
4. Tạo và quản lý phòng trao đổi
5. Tìm kiếm và xem sản phẩm
6. Quản lý đơn hàng

Bạn cần hỗ trợ về vấn đề nào? Hãy cho tôi biết để tôi có thể giúp bạn tốt hơn!`
    },
    exchange_room: {
        keywords: ['phòng trao đổi', 'tìm phòng', 'tạo phòng', 'id phòng', 'mã phòng'],
        response: `Hướng dẫn sử dụng phòng trao đổi:

1. TÌM PHÒNG TRAO ĐỔI:
   - Truy cập trang "Tìm Phòng Trao Đổi"
   - Nhập ID phòng được chia sẻ
   - Hệ thống sẽ kiểm tra và đưa bạn vào phòng
   - Nếu không tìm thấy, bạn sẽ nhận thông báo lỗi

2. TẠO PHÒNG MỚI:
   - Nhấn "Tạo Phòng Mới" từ trang tìm kiếm
   - Điền thông tin phòng:
     + ID phòng (tự động tạo)
     + Chi tiết sản phẩm muốn trao đổi
     + Giá trị sản phẩm
   - Phòng sẽ ở trạng thái "pending" chờ người tham gia`
    },
    exchange_process: {
        keywords: ['quy trình trao đổi', 'các bước trao đổi', 'cách trao đổi', 'hướng dẫn trao đổi'],
        response: `Quy trình trao đổi trên hệ thống gồm các bước:

1. KHỞI TẠO GIAO DỊCH:
   - Người bán (Seller):
     + Tạo phòng và cung cấp thông tin sản phẩm
     + Chờ người mua tham gia và đặt cọc
   - Người mua (Buyer):
     + Tìm và tham gia phòng
     + Xem thông tin sản phẩm
     + Đặt cọc để bắt đầu giao dịch

2. QUÁ TRÌNH GIAO DỊCH:
   Trạng thái phòng sẽ thay đổi theo trình tự:
   - pending → info_provided → deposited → buyer_verified → completed
   - Hoặc → failed → refunded (nếu có vấn đề)

3. XÁC NHẬN VÀ HOÀN TẤT:
   - Người mua xác nhận đã nhận và kiểm tra sản phẩm
   - Người bán xác nhận giao dịch thành công
   - Hệ thống chuyển tiền cho người bán
   - Trạng thái phòng chuyển thành "completed"

4. XỬ LÝ VẤN ĐỀ:
   - Nếu có vấn đề, người mua có thể báo cáo
   - Hệ thống sẽ giữ tiền trong 24h
   - Nếu không giải quyết được, tiền sẽ được hoàn trả
   - Trạng thái phòng chuyển thành "refunded"`
    },
    seller_guide: {
        keywords: ['hướng dẫn người bán', 'bên bán', 'seller', 'bán hàng'],
        response: `Hướng dẫn dành cho người bán (Seller):

1. CUNG CẤP THÔNG TIN:
   - Sau khi tạo phòng hoặc tham gia với role "seller"
   - Cung cấp thông tin chi tiết về sản phẩm:
     + Mô tả đầy đủ tình trạng
     + Hình ảnh rõ ràng
     + Điều kiện trao đổi
   - Trạng thái chuyển thành "info_provided"

2. CHỜ NGƯỜI MUA:
   - Theo dõi trạng thái đặt cọc
   - Có thể chat trực tiếp với người mua
   - Trạng thái sẽ chuyển thành "deposited" khi có đặt cọc

3. XÁC NHẬN GIAO DỊCH:
   - Khi người mua xác nhận đã nhận hàng
   - Kiểm tra thông báo "buyer_verified"
   - Xác nhận để hoàn tất giao dịch
   - Nhận thanh toán sau khi hoàn tất

4. LƯU Ý QUAN TRỌNG:
   - Cung cấp thông tin trung thực
   - Giữ liên lạc với người mua
   - Xác nhận kịp thời khi giao dịch thành công
   - Giải quyết khiếu nại nếu có`
    },
    buyer_guide: {
        keywords: ['hướng dẫn người mua', 'bên mua', 'buyer', 'mua hàng'],
        response: `Hướng dẫn dành cho người mua (Buyer):

1. THAM GIA PHÒNG:
   - Tìm phòng bằng ID được chia sẻ
   - Chọn role "buyer" khi tham gia
   - Xem kỹ thông tin sản phẩm
   - Trao đổi với người bán qua chat

2. ĐẶT CỌC:
   - Xác nhận số tiền cần đặt cọc
   - Thực hiện thanh toán
   - Chờ xác nhận từ hệ thống
   - Trạng thái chuyển thành "deposited"

3. KIỂM TRA VÀ XÁC NHẬN:
   - Nhận và kiểm tra sản phẩm
   - Có 2 lựa chọn:
     + Xác nhận thành công: Tiền được chuyển cho người bán
     + Báo cáo vấn đề: Tiền được giữ lại 24h

4. HOÀN TẤT HOẶC HOÀN TIỀN:
   - Nếu thành công: Trạng thái "completed"
   - Nếu có vấn đề:
     + Trạng thái "failed"
     + Chờ 24h để được hoàn tiền
     + Kết thúc với trạng thái "refunded"`
    },
    room_status: {
        keywords: ['trạng thái phòng', 'tình trạng', 'status', 'theo dõi'],
        response: `Giải thích các trạng thái phòng trao đổi:

1. PENDING:
   - Phòng mới được tạo
   - Chờ người bán cung cấp thông tin
   - Chờ người mua tham gia

2. INFO_PROVIDED:
   - Người bán đã cung cấp thông tin
   - Sẵn sàng cho người mua đặt cọc
   - Có thể xem chi tiết sản phẩm

3. DEPOSITED:
   - Người mua đã đặt cọc
   - Tiền được giữ bởi hệ thống
   - Chờ người mua xác nhận

4. BUYER_VERIFIED:
   - Người mua đã xác nhận nhận hàng
   - Chờ người bán xác nhận
   - Tiền sẽ được chuyển cho người bán

5. COMPLETED:
   - Giao dịch hoàn tất
   - Tiền đã chuyển cho người bán
   - Phòng được đóng

6. FAILED:
   - Có vấn đề trong giao dịch
   - Tiền đặt cọc được giữ 24h
   - Chờ giải quyết khiếu nại

7. REFUNDED:
   - Giao dịch thất bại
   - Tiền đã hoàn trả cho người mua
   - Phòng được đóng`
    }
};

const KEYWORD_HANDLERS = {
    'đăng ký': () => {
        const feature = WEBSITE_DATA.features.find(f => f.name === 'Đăng ký/Đăng nhập');
        return `Để đăng ký tài khoản ${WEBSITE_DATA.name}, bạn cần:\n${feature.steps.join('\n')}`;
    },
    'sản phẩm': () => {
        const feature = WEBSITE_DATA.features.find(f => f.name === 'Quản lý sản phẩm');
        return `Để quản lý sản phẩm trên ${WEBSITE_DATA.name}:\n${feature.steps.join('\n')}`;
    },
    'trao đổi': () => {
        const feature = WEBSITE_DATA.features.find(f => f.name === 'Trao đổi sản phẩm');
        return `Để trao đổi sản phẩm trên ${WEBSITE_DATA.name}:\n${feature.steps.join('\n')}`;
    },
    'thanh toán': () => {
        const feature = WEBSITE_DATA.features.find(f => f.name === 'Thanh toán');
        return `${WEBSITE_DATA.name} hỗ trợ các phương thức thanh toán sau:\n${feature.methods.join('\n')}`;
    }
};

const generateUniqueId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

const ChatBox = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            type: 'bot',
            text: RESPONSE_TEMPLATES.greeting.response,
            timestamp: new Date()
        }
    ]);
    const [inputMessage, setInputMessage] = useState('');
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [isThinking, setIsThinking] = useState(false);
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);
    const [conversationId, setConversationId] = useState(() => generateUniqueId());
    const [feedbackMode, setFeedbackMode] = useState(false);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const generateBotResponse = (userMessage) => {
        const lowerMessage = userMessage.toLowerCase();
        
        // Kiểm tra từng template để tìm câu trả lời phù hợp
        for (const [key, template] of Object.entries(RESPONSE_TEMPLATES)) {
            if (key === 'default') continue;
            
            if (template.keywords.some(keyword => lowerMessage.includes(keyword))) {
                return template.response;
            }
        }
        
        // Nếu không tìm thấy câu trả lời phù hợp, sử dụng câu trả lời mẫu
        return RESPONSE_TEMPLATES.default.response;
    };

    // Lưu trữ cuộc hội thoại
    const saveConversation = async (message, isUserMessage, responseSource = null) => {
        try {
            const conversationData = {
                conversationId,
                timestamp: new Date().toISOString(),
                message: message.text || message,
                isUserMessage,
                responseSource, // 'api', 'template', 'fallback'
                userId: localStorage.getItem('userId') || 'anonymous' // Thêm userId nếu đã đăng nhập
            };
            
            // Gọi API để lưu vào database
            const response = await fetch(`${API_BASE_URL}/api/chat/conversation`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}` 
                },
                body: JSON.stringify(conversationData)
            });
            
            if (!response.ok) {
                throw new Error('Failed to save conversation');
            }
        } catch (error) {
            console.error('Error saving conversation:', error);
            // Fallback về localStorage nếu API lỗi
            const savedConversations = JSON.parse(localStorage.getItem('chatConversations') || '[]');
            savedConversations.push({
                conversationId,
                timestamp: new Date().toISOString(),
                message: message.text || message,
                isUserMessage,
                responseSource
            });
            localStorage.setItem('chatConversations', JSON.stringify(savedConversations));
        }
    };

    // Thêm chức năng đánh giá 
    const recordFeedback = async (messageIndex, isHelpful) => {
        try {
            // Lấy nội dung tin nhắn từ state messages
            const message = messages[messageIndex];
            
            const feedback = {
                conversationId,
                messageContent: message.text,
                isHelpful,
                timestamp: new Date().toISOString(),
                userId: localStorage.getItem('userId') || 'anonymous'
            };
            
            // Gọi API để lưu vào database
            const response = await fetch(`${API_BASE_URL}/api/chat/feedback`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}` 
                },
                body: JSON.stringify(feedback)
            });
            
            if (!response.ok) {
                throw new Error('Failed to save feedback');
            }
            
            setFeedbackMode(false);
        } catch (error) {
            console.error('Error saving feedback:', error);
            // Fallback về localStorage nếu API lỗi
            const savedFeedback = JSON.parse(localStorage.getItem('chatFeedback') || '[]');
            savedFeedback.push({
                conversationId,
                messageIndex,
                isHelpful,
                timestamp: new Date().toISOString()
            });
            localStorage.setItem('chatFeedback', JSON.stringify(savedFeedback));
        }
    };

    // Hàm tạo prompt thông minh cho AI
    const generateSmartPrompt = (userMessage) => {
        // Chuyển đổi dữ liệu website thành văn bản có cấu trúc
        const websiteContext = `
        Bạn là trợ lý AI của ${WEBSITE_DATA.name}. 
        Website này là nền tảng trao đổi sản phẩm với các thông tin sau:

        1. Tổng quan:
        ${WEBSITE_DATA.general.slogan}
        Các tính năng chính: ${WEBSITE_DATA.general.features.join(', ')}
        Lợi ích: ${WEBSITE_DATA.general.benefits.join(', ')}

        2. Hướng dẫn sử dụng:
        ${Object.entries(WEBSITE_DATA.guides).map(([key, guide]) => `
        ${guide.title}:
        ${guide.steps.join('\n')}
        Lưu ý: ${guide.tips.join('\n')}
        `).join('\n')}

        3. FAQ:
        ${WEBSITE_DATA.faq.map(qa => `
        Q: ${qa.question}
        A: ${qa.answer}
        `).join('\n')}

        4. Chính sách:
        ${Object.entries(WEBSITE_DATA.policies).map(([key, policies]) => `
        ${key.charAt(0).toUpperCase() + key.slice(1)}:
        ${policies.join('\n')}
        `).join('\n')}

        5. Hỗ trợ:
        ${Object.entries(WEBSITE_DATA.support).map(([key, value]) => `
        ${key.charAt(0).toUpperCase() + key.slice(1)}:
        ${typeof value === 'object' ? Object.entries(value).map(([k, v]) => `${k}: ${v}`).join('\n') : value}
        `).join('\n')}

        6. Tính năng đặc biệt:
        ${Object.entries(WEBSITE_DATA.specialFeatures).map(([key, feature]) => `
        ${feature.title}:
        ${feature.description}
        ${Array.isArray(feature.benefits) ? feature.benefits.join('\n') : ''}
        ${Array.isArray(feature.features) ? feature.features.join('\n') : ''}
        ${Array.isArray(feature.methods) ? feature.methods.join('\n') : ''}
        `).join('\n')}
        `;

        // Tạo prompt cuối cùng
        return `
        ${websiteContext}

        Dựa trên thông tin trên, hãy trả lời câu hỏi sau của người dùng một cách ngắn gọn, chính xác và hữu ích:
        "${userMessage}"

        Lưu ý:
        1. Trả lời dựa trên thông tin có sẵn
        2. Nếu không có thông tin, hãy nói rõ
        3. Sử dụng ngôn ngữ thân thiện
        4. Đưa ra ví dụ cụ thể khi cần
        5. Hướng dẫn từng bước nếu câu hỏi liên quan đến quy trình
        `;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!inputMessage.trim() && !selectedFile) return;

        const userMessage = inputMessage;
        setInputMessage('');
        setSelectedFile(null);

        // Tạo đối tượng message
        const newUserMessage = {
            type: 'user',
            text: userMessage,
            file: selectedFile,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, newUserMessage]);
        
        // Lưu tin nhắn người dùng
        saveConversation(userMessage, true);
        
        setIsThinking(true);

        try {
            const response = await fetchWithTimeout(`${API_URL}?key=${API_KEY}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: generateSmartPrompt(userMessage)
                        }]
                    }]
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            if (data.candidates && data.candidates[0].content.parts[0].text) {
                const botResponse = data.candidates[0].content.parts[0].text;
                
                // Thêm tin nhắn bot
                setMessages(prev => [...prev, {
                    type: 'bot',
                    text: botResponse,
                    timestamp: new Date(),
                    showFeedback: true
                }]);
                
                // Lưu câu trả lời của bot
                saveConversation(botResponse, false, 'api');
            } else {
                throw new Error('Invalid response from AI');
            }
        } catch (error) {
            console.error('AI Error:', error);
            
            // Fallback với template có sẵn
            const botResponse = generateBotResponse(userMessage);
            
            setMessages(prev => [...prev, {
                type: 'bot',
                text: botResponse,
                timestamp: new Date(),
                showFeedback: true
            }]);
            
            // Lưu với nguồn là fallback
            saveConversation(botResponse, false, 'fallback');
        } finally {
            setIsThinking(false);
        }
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            setSelectedFile({
                data: e.target.result.split(',')[1],
                type: file.type,
                preview: e.target.result
            });
        };
        reader.readAsDataURL(file);
    };

    const handleEmojiSelect = (emojiObject) => {
        setInputMessage(prev => prev + emojiObject.emoji);
        setShowEmojiPicker(false);
    };

    // Hàm gọi API với timeout
    const fetchWithTimeout = async (url, options, timeout = 10000) => {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), timeout);
        
        try {
            const response = await fetch(url, {
                ...options,
                signal: controller.signal
            });
            clearTimeout(id);
            return response;
        } catch (error) {
            clearTimeout(id);
            throw error;
        }
    };

    // Thêm component đánh giá cho tin nhắn
    const MessageFeedback = ({ messageIndex }) => (
        <div className="flex items-center mt-1 text-xs text-gray-500">
            <div>Phản hồi này có hữu ích không?</div>
            <button 
                onClick={() => recordFeedback(messageIndex, true)}
                className="ml-2 px-2 py-1 bg-green-100 text-green-800 rounded hover:bg-green-200"
            >
                Có
            </button>
            <button 
                onClick={() => recordFeedback(messageIndex, false)}
                className="ml-1 px-2 py-1 bg-red-100 text-red-800 rounded hover:bg-red-200"
            >
                Không
            </button>
        </div>
    );

    // Thêm chức năng phân tích dữ liệu từ database thông qua API
    const fetchAnalytics = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/chat/analytics`, {
                headers: { 
                    'Authorization': `Bearer ${localStorage.getItem('token')}` 
                }
            });
            
            if (!response.ok) {
                throw new Error('Failed to fetch analytics');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error fetching analytics:', error);
            return null;
        }
    };

    return (
        <div className="fixed bottom-4 right-4 z-50">
            {!isOpen ? (
                <button
                    onClick={() => setIsOpen(true)}
                    className="w-14 h-14 bg-[#5350C4] rounded-full flex items-center justify-center shadow-lg hover:bg-[#3d39ac] transition-colors"
                >
                    <MessageCircle className="text-white w-6 h-6" />
                </button>
            ) : (
                <div className="w-[420px] h-[600px] bg-white rounded-lg shadow-xl flex flex-col">
                    <div className="p-4 bg-[#5350C4] flex justify-between items-center rounded-t-lg">
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                                <Bot className="text-[#5350C4] w-5 h-5" />
                            </div>
                            <h2 className="font-semibold text-white">Trợ lý ShopTraoDoi</h2>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-white hover:bg-[#3d39ac] p-2 rounded-full transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {messages.map((message, index) => (
                            <div
                                key={index}
                                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                {message.type === 'bot' && !message.isThinking && (
                                    <div className="w-10 h-10 bg-[#5350C4] rounded-full flex items-center justify-center mr-2">
                                        <Bot className="text-white w-5 h-5" />
                                    </div>
                                )}
                                <div className="flex flex-col max-w-[80%]">
                                    {message.file?.preview && (
                                        <img 
                                            src={message.file.preview} 
                                            alt="attachment" 
                                            className="rounded-lg mb-2 max-w-full"
                                        />
                                    )}
                                    {message.isThinking ? (
                                        <div className="bg-[#F2F2FF] p-3 rounded-lg">
                                            <div className="flex gap-1">
                                                <div className="w-2 h-2 bg-[#6F6BC2] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                                <div className="w-2 h-2 bg-[#6F6BC2] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                                <div className="w-2 h-2 bg-[#6F6BC2] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                            </div>
                                        </div>
                                    ) : (
                                        <div
                                            className={`p-3 rounded-lg ${
                                                message.type === 'user'
                                                    ? 'bg-[#5350C4] text-white'
                                                    : 'bg-[#F2F2FF] text-gray-800'
                                            }`}
                                        >
                                            {message.text}
                                        </div>
                                    )}
                                    {message.showFeedback && !message.isThinking && message.type === 'bot' && (
                                        <MessageFeedback messageIndex={index} />
                                    )}
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    <form onSubmit={handleSubmit} className="p-4 border-t">
                        <div className="relative">
                            <div className="flex items-center bg-white border rounded-full px-4 py-2 focus-within:border-[#5350C4] focus-within:ring-2 focus-within:ring-[#5350C4]">
                                <textarea
                                    value={inputMessage}
                                    onChange={(e) => setInputMessage(e.target.value)}
                                    placeholder="Nhập tin nhắn..."
                                    className="flex-1 bg-transparent border-none focus:outline-none resize-none max-h-32"
                                    rows="1"
                                />
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                        className="text-gray-500 hover:text-[#5350C4] p-2 rounded-full hover:bg-[#F2F2FF]"
                                    >
                                        <Smile className="w-5 h-5" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="text-gray-500 hover:text-[#5350C4] p-2 rounded-full hover:bg-[#F2F2FF]"
                                    >
                                        <Paperclip className="w-5 h-5" />
                                    </button>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileSelect}
                                        accept="image/*"
                                        className="hidden"
                                    />
                                    <button
                                        type="submit"
                                        className="bg-[#5350C4] text-white p-2 rounded-full hover:bg-[#3d39ac] transition-colors"
                                    >
                                        <Send className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                            {selectedFile && (
                                <div className="mt-2 flex items-center gap-2">
                                    <img 
                                        src={selectedFile.preview} 
                                        alt="preview" 
                                        className="w-20 h-20 object-cover rounded-lg"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setSelectedFile(null)}
                                        className="text-red-500 hover:text-red-600"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            )}
                            {showEmojiPicker && (
                                <div className="absolute bottom-full right-0 mb-2">
                                    <EmojiPicker 
                                        onEmojiClick={handleEmojiSelect}
                                        theme="light"
                                        width={350}
                                        height={400}
                                        searchPlaceholder="Tìm emoji..."
                                        previewConfig={{
                                            showPreview: false
                                        }}
                                    />
                                </div>
                            )}
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default ChatBox; 