"use client"

import { createContext, useContext, useState, useEffect } from "react"

const AuthContext = createContext()

export const useAuth = () => {
    return useContext(AuthContext)
}

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem("user")
        try {
            return savedUser ? JSON.parse(savedUser) : null
        } catch (error) {
            console.error("Error parsing user data:", error)
            localStorage.removeItem("user")
            return null
        }
    })

    const login = (userData) => {
        setUser(userData)
        localStorage.setItem("user", JSON.stringify(userData))
        return userData.role
    }

    const logout = () => {
        setUser(null)
        localStorage.removeItem("user")
    }

    const updateUser = (newUserData) => {
        setUser(newUserData)
        localStorage.setItem("user", JSON.stringify(newUserData))
    }

    const value = {
        user,
        login,
        logout,
        updateUser,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin'
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export default AuthContext

