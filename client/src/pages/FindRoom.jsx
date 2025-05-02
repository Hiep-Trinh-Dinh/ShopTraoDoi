// client/src/pages/FindRoom.jsx
"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Search } from "lucide-react"
import RoomService from "../services/roomService"

const FindRoom = () => {
    const [roomId, setRoomId] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        if (!roomId.trim()) {
            setError("Vui lòng nhập ID phòng")
            return
        }

        try {
            const response = await fetch(`http://localhost:5000/api/rooms/${roomId.trim()}`);
            
            if (!response.ok) {
                throw new Error('Không tìm thấy phòng hoặc mã không hợp lệ');
            }
            
            const roomData = await response.json();
            
            console.log("Room data structure:", roomData);

            if (roomData.success && roomData.data) {
                const roomDetails = roomData.data;
                console.log("Room details:", roomDetails);
                
                const foundRoomId = roomDetails.id || roomDetails._id || roomDetails.roomId || roomDetails.code;
                
                if (foundRoomId) {
                    navigate(`/room/${foundRoomId}`);
                } else {
                    console.error("Room details has no valid ID field:", roomDetails);
                    throw new Error('Thông tin phòng không có ID hợp lệ');
                }
            } else {
                throw new Error('Dữ liệu phòng không hợp lệ');
            }
            
            setLoading(false);
        } catch (error) {
            console.error('Error finding room:', error);
            setError('Không tìm thấy phòng hoặc mã không hợp lệ');
            setLoading(false);
        }
    }

    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h1 className="text-3xl font-bold mb-8">Tìm Phòng Trao Đổi</h1>

            <div className="bg-white rounded-lg shadow p-6">
                <form onSubmit={handleSubmit}>
                    <div className="mb-6">
                        <label htmlFor="roomId" className="block text-sm font-medium text-gray-700 mb-1">
                            ID Phòng
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                id="roomId"
                                className={`w-full pl-10 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-black ${
                                    error ? "border-red-500" : "border-gray-300"
                                }`}
                                placeholder="Nhập ID phòng"
                                value={roomId}
                                onChange={(e) => setRoomId(e.target.value)}
                            />
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                        </div>
                        {error && (
                            <p className="mt-1 text-sm text-red-600">
                                {error}
                            </p>
                        )}
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading} 
                        className={`btn btn-primary w-full ${
                            loading ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                    >
                        {loading ? "Đang tìm..." : "Tìm Phòng"}
                    </button>
                </form>

                <div className="mt-8 border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-medium mb-4">Chưa có ID phòng?</h3>
                    <p className="text-gray-600 mb-4">
                        Nếu bạn chưa có ID phòng, bạn có thể tạo phòng trao đổi mới và mời người khác tham gia.
                    </p>
                    <button 
                        type="button" 
                        onClick={() => navigate("/create-room")} 
                        className="btn btn-outline w-full"
                    >
                        Tạo Phòng Mới
                    </button>
                </div>
            </div>
        </div>
    )
}

export default FindRoom

