import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export function Component() {
    const navigate = useNavigate()

    useEffect(() => {
        navigate("/")
    }, [])

    return <></>
}
