// server/controllers/roomController.js
const Room = require('../models/Room');

exports.createRoom = async (req, res) => {
  try {
    console.log("Creating room with data:", req.body); // Debug log
    
    const room = new Room({
      id: req.body.id,
      productDetails: req.body.productDetails,
      price: req.body.price,
      status: 'pending'
    });

    await room.save();
    
    console.log("Created room:", room); // Debug log

    res.status(201).json({
      success: true,
      data: room
    });
  } catch (error) {
    console.error("Error creating room:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.findRoom = async (req, res) => {
  try {
    const room = await Room.findOne({ id: req.params.roomId });
    
    console.log("Found room:", room); // Debug log

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy phòng với ID này'
      });
    }

    res.json({
      success: true,
      data: {
        id: room.id,
        productDetails: room.productDetails,
        productInfo: room.productInfo,
        price: room.price,
        status: room.status,
        depositAmount: room.depositAmount,
        createdAt: room.createdAt,
        sellerId: room.sellerId,
        buyerId: room.buyerId
      }
    });
  } catch (error) {
    console.error("Error finding room:", error);
    res.status(500).json({
      success: false,
      message: 'Đã xảy ra lỗi khi tìm phòng'
    });
  }
};

exports.updateProductInfo = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { productInfo } = req.body;
    
    if (!productInfo) {
      return res.status(400).json({
        success: false,
        message: 'Không có thông tin sản phẩm'
      });
    }
    
    const room = await Room.findOne({ id: roomId });
    
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy phòng'
      });
    }
    
    room.productInfo = productInfo;
    room.status = 'info_provided';
    await room.save();
    
    return res.status(200).json({
      success: true,
      data: room
    });
  } catch (error) {
    console.error('Error updating product info:', error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.depositPayment = async (req, res) => {
  try {
    const room = await Room.findOneAndUpdate(
      { id: req.params.roomId },
      { 
        depositAmount: req.body.amount,
        status: 'deposited'
      },
      { new: true }
    );
    res.json(room);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.verifyProduct = async (req, res) => {
    try {
        const { status } = req.body;
        const roomId = req.params.roomId;

        // Kiểm tra status từ request
        const newStatus = status === 'rejected' ? 'rejected' : 'buyer_verified';
        const buyerVerified = status !== 'rejected';
        
        const room = await Room.findOneAndUpdate(
            { id: roomId },
            { 
                status: newStatus,
                buyerVerified
            },
            { new: true }
        );

        if (!room) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy phòng'
            });
        }

        res.json({
            success: true,
            data: room,
            message: buyerVerified 
                ? 'Người mua đã xác nhận thành công, đang chờ người bán xác nhận' 
                : 'Người mua đã từ chối xác nhận giao dịch'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Đã xảy ra lỗi khi xác nhận sản phẩm'
        });
    }
};

exports.confirmTransaction = async (req, res) => {
    try {
        const roomId = req.params.roomId;
        const room = await Room.findOne({ id: roomId });

        if (!room) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy phòng'
            });
        }

        // Cập nhật trạng thái và lưu thời gian xác nhận
        room.status = 'completed';
        room.sellerConfirmedAt = new Date();
        await room.save();

        res.json({
            success: true,
            data: room,
            message: 'Giao dịch đã hoàn tất thành công'
        });
    } catch (error) {
        console.error('Confirmation error:', error);
        res.status(500).json({
            success: false,
            message: 'Đã xảy ra lỗi khi xác nhận giao dịch'
        });
    }
};

exports.updateRole = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { role } = req.body;
    
    if (!role) {
      return res.status(400).json({
        success: false,
        message: 'Role is required'
      });
    }
    
    const room = await Room.findOne({ id: roomId });
    
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }
    
    // Cập nhật vai trò của người dùng trong phòng
    if (role === 'buyer') {
      room.buyerId = req.user.id;
    } else if (role === 'seller') {
      room.sellerId = req.user.id;
    }
    
    await room.save();
    
    return res.status(200).json({
      success: true,
      data: room
    });
  } catch (error) {
    console.error('Error updating role:', error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.updateRoomStatus = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { status, depositAmount } = req.body;
    
    const room = await Room.findOne({ id: roomId });
    
    if (!room) {
      return res.status(404).json({ 
        success: false, 
        message: 'Room not found' 
      });
    }
    
    // Cập nhật trạng thái
    room.status = status;
    if (depositAmount) {
      room.depositAmount = depositAmount;
    }
    
    await room.save();
    
    return res.status(200).json({
      success: true,
      data: room
    });
  } catch (error) {
    console.error('Error updating room status:', error);
    return res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
}; 