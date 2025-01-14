import { useSocket } from "@/api/Socket"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/use-toast"
import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { useNavigate, useLocation } from "react-router-dom"
import { z } from "zod"

export const newpw = z.object({
    new_password: z.string().min(8).max(20)
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,20}$/,
      "Password must contain at least one digit, one uppercase letter, and one lowercase letter"),
})

export function Component() {
    const navigate = useNavigate()
    const location = useLocation()
    const { eventLocationPathnamePW } = useSocket()

    const form = useForm<z.infer<typeof newpw>>({
        resolver: zodResolver(newpw),
        defaultValues: {new_password: ""}
    })

    useEffect(() => {
        if (!location.search.includes('activation_key')) {
            navigate("/")
        }
    }, [])

    function onSubmit(values: z.infer<typeof newpw>) {
        const activation_key = new URLSearchParams(location.search).get('activation_key');
        eventLocationPathnamePW(activation_key, values.new_password)
        toast({title: 'Password reset successfully'})
        navigate("/")
    }

    if (!location.search.includes('activation_key')) {
        return <></>
    }

    return (
        <main className="flex items-center justify-center p-6">
        <div className="grid gap-8">
        <Card>
        <CardHeader>
            <CardTitle>Reset Password</CardTitle>
            <CardDescription>Enter new password</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                <FormField
                    name="new_password"
                    control={form.control}
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>New password</FormLabel>
                        <FormControl>
                            <Input placeholder="new password" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                <CardFooter>
                    <Button type="submit">Save Changes</Button>
                </CardFooter>
                </form>
            </Form>
        </CardContent>
        </Card>
        </div>
        </main>
    )
}
