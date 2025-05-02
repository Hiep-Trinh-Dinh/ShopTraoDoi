import { Link } from "react-router-dom"

const Footer = () => {
    return (
        <footer className="bg-black text-white">
            <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div>
                        <h3 className="text-lg font-bold mb-4">ExchangeHub</h3>
                        <p className="text-gray-300 text-sm">
                            A secure platform for buying, selling, and exchanging digital products.
                        </p>
                    </div>
                    <div>
                        <h3 className="text-lg font-bold mb-4">Quick Links</h3>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link to="/" className="text-gray-300 hover:text-white">
                                    Home
                                </Link>
                            </li>
                            <li>
                                <Link to="/products" className="text-gray-300 hover:text-white">
                                    Products
                                </Link>
                            </li>
                            <li>
                                <Link to="/create-room" className="text-gray-300 hover:text-white">
                                    Create Exchange Room
                                </Link>
                            </li>
                            <li>
                                <Link to="/find-room" className="text-gray-300 hover:text-white">
                                    Find Exchange Room
                                </Link>
                            </li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-lg font-bold mb-4">Contact</h3>
                        <ul className="space-y-2 text-sm">
                            <li className="text-gray-300">Email: support@exchangehub.com</li>
                            <li className="text-gray-300">Phone: +1 (555) 123-4567</li>
                        </ul>
                    </div>
                </div>
                <div className="mt-8 pt-8 border-t border-gray-700 text-center text-sm text-gray-300">
                    <p>&copy; {new Date().getFullYear()} ExchangeHub. All rights reserved.</p>
                </div>
            </div>
        </footer>
    )
}

export default Footer

