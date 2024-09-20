import { useSocket } from "@/api/Socket"
import { useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"

export function Component() {
    const navigate = useNavigate()
    const location = useLocation()
    const { eventLocationPathname } = useSocket()

    useEffect(() => {
        if (location.search.includes('activation_key')) {
            const activation_key = new URLSearchParams(location.search).get('activation_key');
            eventLocationPathname(activation_key)
        }
        navigate("/")
    }, [])

    return <div>Confirming...</div>
}
