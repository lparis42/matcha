import { useSocket } from "@/api/Socket"
import { toast } from "@/components/ui/use-toast"
import { useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"

export function Component() {
    const navigate = useNavigate()
    const location = useLocation()
    const { eventLocationPathnamePW } = useSocket()

    useEffect(() => {
        if (location.search.includes('activation_key')) {
            const activation_key = new URLSearchParams(location.search).get('activation_key');
            eventLocationPathnamePW(activation_key)
            toast({title: 'Password reset successfully, see your email for further instructions'})
        }
        navigate("/")
    }, [])

    return <div>Confirming...</div>
}
