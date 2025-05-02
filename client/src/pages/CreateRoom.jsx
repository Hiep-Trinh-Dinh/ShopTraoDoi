// client/src/pages/CreateRoom.jsx
"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Copy } from "lucide-react"
import RoomService from "../services/roomService"

const CreateRoom = () => {
    const [roomType, setRoomType] = useState("seller")
    const [productDetails, setProductDetails] = useState("")
    const [price, setPrice] = useState("")
    const [loading, setLoading] = useState(false)
    const [roomId, setRoomId] = useState("")
    const [copied, setCopied] = useState(false)
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        try {
            // Generate a random room ID
            const generatedRoomId = Math.random().toString(36).substring(2, 10).toUpperCase()

            const roomData = {
                id: generatedRoomId,
                productDetails: productDetails,
                price: parseFloat(price),
                status: 'pending',
                role: roomType
            }

            const response = await RoomService.createRoom(roomData)
            
            if (response.success) {
                setRoomId(generatedRoomId)
            } else {
                console.error('Failed to create room')
            }
        } catch (error) {
            console.error('Error creating room:', error)
        } finally {
            setLoading(false)
        }
    }

    const copyToClipboard = () => {
        navigator.clipboard.writeText(roomId)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const enterRoom = () => {
        navigate(`/room/${roomId}`)
    }

    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h1 className="text-3xl font-bold mb-8">Create Exchange Room</h1>

            {!roomId ? (
                <div className="bg-white rounded-lg shadow p-6">
                    <form onSubmit={handleSubmit}>
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">I am a:</label>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    type="button"
                                    className={`p-4 border rounded-lg text-center ${roomType === "seller" ? "border-black bg-black text-white" : "border-gray-300 hover:border-gray-400"
                                        }`}
                                    onClick={() => setRoomType("seller")}
                                >
                                    Seller
                                </button>
                                <button
                                    type="button"
                                    className={`p-4 border rounded-lg text-center ${roomType === "buyer" ? "border-black bg-black text-white" : "border-gray-300 hover:border-gray-400"
                                        }`}
                                    onClick={() => setRoomType("buyer")}
                                >
                                    Buyer
                                </button>
                            </div>
                        </div>

                        <div className="mb-6">
                            <label htmlFor="productDetails" className="block text-sm font-medium text-gray-700 mb-1">
                                Product Description
                            </label>
                            <textarea
                                id="productDetails"
                                rows={4}
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                                placeholder="Describe the product you want to sell or buy..."
                                value={productDetails}
                                onChange={(e) => setProductDetails(e.target.value)}
                                required
                            />
                        </div>

                        <div className="mb-6">
                            <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                                Price (USD)
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span className="text-gray-500">$</span>
                                </div>
                                <input
                                    type="number"
                                    id="price"
                                    className="w-full pl-8 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                                    placeholder="0.00"
                                    min="0.01"
                                    step="0.01"
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <button type="submit" disabled={loading} className="btn btn-primary w-full">
                            {loading ? "Creating Room..." : "Create Room"}
                        </button>
                    </form>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow p-6 text-center">
                    <div className="mb-6">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                            <svg
                                className="w-8 h-8 text-green-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold mb-2">Room Created Successfully!</h2>
                        <p className="text-gray-600 mb-4">Share this room ID with the other party to start the exchange.</p>
                    </div>

                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Room ID</label>
                        <div className="flex">
                            <input
                                type="text"
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-black"
                                value={roomId}
                                readOnly
                            />
                            <button
                                type="button"
                                onClick={copyToClipboard}
                                className="px-4 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-md hover:bg-gray-200"
                            >
                                <Copy className="h-5 w-5" />
                            </button>
                        </div>
                        {copied && <p className="text-green-600 text-sm mt-1">Copied to clipboard!</p>}
                    </div>

                    <button type="button" onClick={enterRoom} className="btn btn-primary w-full">
                        Enter Room
                    </button>
                </div>
            )}
        </div>
    )
}

export default CreateRoom

