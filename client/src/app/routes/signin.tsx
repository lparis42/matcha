import React, {useState} from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { useSocket, Login } from "@/api/Socket"

export function Component() {

  const { eventLogin } = useSocket();

  const [data, setData] = useState<Login>({
    password: "",
    email: ""
  });

  const handleChange = (e) => {
    setData({
      ...data,
      [e.target.id]: e.target.value
    });
  }

  const handleSubmit = () => {
    console.log(data);
    eventLogin(data);
  }

  return (
    <div className="flex items-center justify-center h-screen">
            <Card className="mx-auto max-w-sm">
                <CardHeader>
                <CardTitle className="text-2xl">Login</CardTitle>
                <CardDescription>
                    Enter your email below to login to your account
                </CardDescription>
                </CardHeader>
                <CardContent>
                <div className="grid gap-4">
                    <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                        id="email"
                        type="email"
                        placeholder=""
                        value={data.email} onChange={(e) => handleChange(e)}
                        required
                    />
                    </div>
                    <div className="grid gap-2">
                    <div className="flex items-center">
                        <Label htmlFor="password">Password</Label>
                        <Link to="#" className="ml-auto inline-block text-sm underline">
                        Forgot your password?
                        </Link>
                    </div>
                    <Input id="password" type="password" value={data.password} onChange={(e) => handleChange(e)} required />
                    </div>
                    <Button type="submit" className="w-full" onClick={() => {handleSubmit()}}>
                    Login
                    </Button>
                </div>
                <div className="mt-4 text-center text-sm">
                    Don&apos;t have an account?{" "}
                    <Link to="/signup" className="underline">
                    Sign up
                    </Link>
                </div>
                </CardContent>
            </Card>
        </div>
  )
}
