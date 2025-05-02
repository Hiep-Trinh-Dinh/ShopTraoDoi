export const WEBSITE_DATA = {
    name: "ShopTraoDoi",
    description: "Nền tảng trao đổi sản phẩm trực tuyến an toàn và uy tín",
    
    // Thông tin chung về website
    general: {
        slogan: "Trao đổi sản phẩm dễ dàng, an toàn và nhanh chóng",
        features: [
            "Mua bán trực tuyến đơn giản",
            "Hệ thống phòng trao đổi an toàn",
            "Chat realtime giữa người mua và bán",
            "Đặt cọc và xác minh sản phẩm",
            "Thanh toán trực tuyến bảo mật",
            "Hỗ trợ AI thông minh 24/7"
        ],
        benefits: [
            "Tiết kiệm chi phí mua sắm",
            "Giao dịch tài khoản game/số an toàn",
            "Đảm bảo tiền của người mua",
            "Xác thực danh tính người dùng",
            "Hỗ trợ xử lý tranh chấp"
        ]
    },

    // Hướng dẫn sử dụng chi tiết
    guides: {
        registration: {
            title: "Đăng ký tài khoản",
            steps: [
                "Truy cập trang chủ và nhấn nút 'Đăng ký'",
                "Điền thông tin cá nhân (họ tên, email, số điện thoại)",
                "Tạo mật khẩu mạnh (ít nhất 8 ký tự)",
                "Xác nhận email qua link được gửi đến hộp thư của bạn",
                "Hoàn tất đăng ký và đăng nhập vào hệ thống"
            ],
            tips: [
                "Sử dụng email thật để dễ dàng xác minh và khôi phục tài khoản",
                "Lưu ý bảo mật mật khẩu, không chia sẻ với người khác",
                "Kiểm tra spam/junk nếu không nhận được email xác nhận"
            ]
        },
        productListing: {
            title: "Đăng sản phẩm",
            steps: [
                "Đăng nhập vào tài khoản",
                "Vào trang quản lý sản phẩm",
                "Nhấn nút 'Thêm sản phẩm mới'",
                "Upload ảnh sản phẩm (tối đa 5 ảnh)",
                "Điền thông tin chi tiết sản phẩm",
                "Chọn danh mục phù hợp",
                "Đặt giá và điều kiện trao đổi",
                "Nhấn 'Đăng sản phẩm'"
            ],
            tips: [
                "Chụp ảnh rõ ràng, đủ ánh sáng, hiển thị đầy đủ sản phẩm",
                "Mô tả chi tiết tình trạng sản phẩm và các đặc điểm quan trọng",
                "Đặt giá hợp lý để tăng khả năng bán hoặc trao đổi"
            ]
        },
        trading: {
            title: "Quy trình phòng trao đổi",
            steps: [
                "Người bán tạo phòng trao đổi (Nhấn 'Tạo phòng')",
                "Hệ thống tạo mã phòng ngẫu nhiên",
                "Người bán chia sẻ mã phòng cho người mua",
                "Người mua tìm phòng bằng mã phòng (Nhấn 'Tìm phòng')",
                "Người mua đặt cọc số tiền theo yêu cầu",
                "Người bán cung cấp thông tin sản phẩm/tài khoản",
                "Người mua xác nhận đã nhận được sản phẩm/tài khoản",
                "Giao dịch hoàn tất, tiền được chuyển cho người bán",
                "Nếu có vấn đề, người mua có thể từ chối và được hoàn tiền"
            ],
            tips: [
                "Sử dụng phòng chat để trao đổi thông tin chi tiết",
                "Đọc kỹ thông tin sản phẩm trước khi xác nhận",
                "Báo cáo ngay nếu phát hiện dấu hiệu lừa đảo"
            ]
        },
        shopping: {
            title: "Mua sắm online",
            steps: [
                "Duyệt sản phẩm trên trang chủ hoặc tìm kiếm theo danh mục",
                "Xem chi tiết sản phẩm và thông tin người bán",
                "Thêm sản phẩm vào giỏ hàng",
                "Thanh toán và điền thông tin giao hàng",
                "Theo dõi trạng thái đơn hàng",
                "Nhận sản phẩm và đánh giá"
            ],
            tips: [
                "Kiểm tra đánh giá của người bán trước khi mua",
                "Lưu ý thông tin giao hàng và phí vận chuyển",
                "Liên hệ hỗ trợ nếu có vấn đề với đơn hàng"
            ]
        }
    },

    // Hệ thống trao đổi
    exchange: {
        title: "Hệ thống trao đổi an toàn",
        description: "Nền tảng trung gian giúp giao dịch tài khoản, mã thẻ và sản phẩm số an toàn, minh bạch",
        steps: {
            seller: [
                "Tạo phòng trao đổi và nhận mã phòng duy nhất",
                "Gửi mã phòng cho người mua",
                "Chờ người mua đặt cọc",
                "Cung cấp thông tin sản phẩm chi tiết",
                "Chờ người mua xác nhận",
                "Nhận tiền sau khi giao dịch thành công"
            ],
            buyer: [
                "Tìm phòng bằng mã phòng",
                "Đặt cọc để đảm bảo giao dịch",
                "Nhận thông tin sản phẩm từ người bán",
                "Kiểm tra thông tin và sử dụng sản phẩm",
                "Xác nhận giao dịch thành công hoặc từ chối",
                "Hoàn tất giao dịch hoặc được hoàn tiền nếu có vấn đề"
            ]
        },
        benefits: [
            "Giảm thiểu rủi ro bị lừa đảo",
            "Xác minh danh tính người mua và bán",
            "Hệ thống đặt cọc bảo vệ người mua",
            "Chat realtime để trao đổi thông tin",
            "Hỗ trợ xử lý tranh chấp nhanh chóng"
        ]
    },

    // Câu hỏi thường gặp
    faq: [
        {
            question: "Làm sao để đăng ký tài khoản?",
            answer: "Truy cập trang chủ, nhấn nút Đăng ký và làm theo hướng dẫn. Bạn cần cung cấp email, số điện thoại và tạo mật khẩu. Sau khi xác nhận email, tài khoản sẽ được kích hoạt."
        },
        {
            question: "Quy trình trao đổi sản phẩm như thế nào?",
            answer: "Quy trình gồm 4 bước: (1) Người bán tạo phòng và gửi mã phòng cho người mua, (2) Người mua đặt cọc, (3) Người bán cung cấp thông tin sản phẩm, (4) Người mua xác nhận để hoàn tất hoặc từ chối để được hoàn tiền."
        },
        {
            question: "Nếu tôi nhận được sản phẩm không đúng mô tả thì sao?",
            answer: "Trong phòng trao đổi, sau khi nhận thông tin sản phẩm, bạn có thể chọn 'Từ chối xác nhận' để báo cáo vấn đề. Hệ thống sẽ giữ lại tiền đặt cọc và xem xét trường hợp của bạn để hoàn tiền."
        },
        {
            question: "Làm sao để tạo phòng trao đổi?",
            answer: "Sau khi đăng nhập, vào trang 'Tạo phòng' hoặc nhấn nút 'Tạo phòng trao đổi'. Điền thông tin về sản phẩm, giá cả và hệ thống sẽ tạo mã phòng. Chia sẻ mã này với người mua để họ tìm thấy phòng của bạn."
        },
        {
            question: "Tôi đã đặt cọc nhưng không nhận được thông tin sản phẩm?",
            answer: "Sử dụng phòng chat để liên hệ với người bán. Nếu không có phản hồi trong 24 giờ, bạn có thể báo cáo với admin và yêu cầu hoàn tiền đặt cọc."
        },
        {
            question: "Làm sao để bảo vệ tài khoản?",
            answer: "Sử dụng mật khẩu mạnh, bật xác thực 2 lớp, không chia sẻ thông tin đăng nhập và thường xuyên kiểm tra hoạt động tài khoản."
        }
    ],

    // Chính sách và quy định
    policies: {
        trading: [
            "Không trao đổi hàng cấm theo quy định pháp luật",
            "Mô tả sản phẩm phải chính xác, đầy đủ",
            "Không được lừa đảo hoặc gian lận trong giao dịch",
            "Người bán phải cung cấp thông tin đúng sau khi người mua đặt cọc",
            "Người mua phải xác nhận trung thực sau khi nhận sản phẩm"
        ],
        refund: [
            "Hoàn tiền 100% nếu người mua từ chối xác nhận và báo cáo vấn đề hợp lý",
            "Thời gian xử lý hoàn tiền trong vòng 24-48 giờ",
            "Tiền đặt cọc sẽ được giữ lại nếu có tranh chấp"
        ],
        privacy: [
            "Bảo mật thông tin cá nhân người dùng",
            "Không chia sẻ thông tin với bên thứ ba",
            "Quyền truy cập và chỉnh sửa thông tin cá nhân",
            "Lưu trữ mã hóa cho thông tin thanh toán"
        ],
        security: [
            "Mã hóa dữ liệu end-to-end",
            "Xác thực 2 lớp cho tài khoản",
            "Giám sát hoạt động bất thường 24/7",
            "Kiểm tra định kỳ và cập nhật hệ thống bảo mật"
        ]
    },

    // Hỗ trợ và liên hệ
    support: {
        contact: {
            email: "support@shoptraodoi.com",
            phone: "0977309945",
            hours: "8:00 - 22:00 (Thứ 2 - Chủ nhật)"
        },
        channels: [
            "ChatBot AI hỗ trợ 24/7",
            "Chat trực tuyến với nhân viên hỗ trợ",
            "Email hỗ trợ",
            "Hotline",
            "FAQ"
        ],
        chatbotGuide: {
            intro: "Chào mừng bạn đến với ChatBot AI của ShopTraoDoi. Tôi có thể giúp gì cho bạn?",
            commands: [
                "Hướng dẫn tạo phòng",
                "Hướng dẫn đặt cọc",
                "Cách xác nhận sản phẩm",
                "Báo cáo vấn đề",
                "Liên hệ hỗ trợ viên"
            ],
            tips: [
                "Hỏi càng cụ thể càng nhận được câu trả lời chính xác",
                "Sử dụng từ khóa liên quan đến vấn đề bạn gặp phải",
                "Chatbot hoạt động 24/7, không ngại giờ giấc"
            ]
        }
    },

    // Tính năng đặc biệt
    specialFeatures: {
        exchangeRooms: {
            title: "Phòng trao đổi an toàn",
            description: "Hệ thống phòng trao đổi trung gian bảo vệ cả người mua và bán",
            benefits: [
                "Mã phòng duy nhất cho mỗi giao dịch",
                "Hệ thống đặt cọc bảo vệ người mua",
                "Chat realtime trong phòng",
                "Cơ chế xác nhận hai bước",
                "Giải quyết tranh chấp nhanh chóng"
            ]
        },
        chat: {
            title: "Chat tích hợp",
            description: "Hệ thống chat realtime trong phòng trao đổi",
            features: [
                "Gửi tin nhắn nhanh chóng",
                "Hiển thị trạng thái online/offline",
                "Thông báo tin nhắn mới",
                "Lưu trữ lịch sử chat",
                "Chức năng báo cáo người dùng"
            ]
        },
        aiSupport: {
            title: "Hỗ trợ bằng AI",
            description: "ChatBot AI thông minh hỗ trợ người dùng 24/7",
            capabilities: [
                "Trả lời câu hỏi thường gặp",
                "Hướng dẫn sử dụng website",
                "Giải thích quy trình trao đổi",
                "Hỗ trợ xử lý vấn đề cơ bản",
                "Chuyển tiếp đến nhân viên hỗ trợ khi cần"
            ]
        },
        security: {
            title: "Bảo mật cao cấp",
            description: "Hệ thống bảo mật đa lớp bảo vệ thông tin và giao dịch",
            methods: [
                "Xác thực email và số điện thoại",
                "Mã hóa thông tin người dùng",
                "Bảo vệ thông tin thanh toán",
                "Giám sát hoạt động đáng ngờ"
            ]
        }
    }
};

// Export các phần riêng lẻ để dễ sử dụng
export const {
    general,
    guides,
    exchange,
    faq,
    policies,
    support,
    specialFeatures
} = WEBSITE_DATA;

export default WEBSITE_DATA; 